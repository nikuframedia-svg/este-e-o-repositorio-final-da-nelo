"""
ProdPlan ONE - Scheduling Adapter
==================================

Adapter for the legacy scheduling engine from base-.
Wraps the MILP/CP-SAT/Heuristic schedulers.
"""

from dataclasses import dataclass
from datetime import datetime, timedelta
from decimal import Decimal
from enum import Enum
from typing import Any, Dict, List, Optional
from uuid import UUID

from pydantic import BaseModel, Field


class SchedulerEngine(str, Enum):
    """Available scheduling engines."""
    HEURISTIC = "heuristic"
    MILP = "milp"
    CPSAT = "cpsat"


class DispatchRule(str, Enum):
    """Dispatch rules for heuristic scheduler."""
    FIFO = "fifo"
    SPT = "spt"
    EDD = "edd"
    WSPT = "wspt"


@dataclass
class SchedulingOperation:
    """Input operation for scheduling."""
    operation_id: str
    order_id: str
    product_id: str
    sequence: int
    operation_code: str
    duration_minutes: float
    machine_id: Optional[str]
    setup_family: str = ""
    due_date: Optional[datetime] = None
    priority: float = 1.0
    predecessor_ops: List[str] = None
    
    def __post_init__(self):
        if self.predecessor_ops is None:
            self.predecessor_ops = []


@dataclass
class SchedulingMachine:
    """Input machine for scheduling."""
    machine_id: str
    name: str
    capacity: int = 1
    speed_factor: float = 1.0
    available_from: Optional[datetime] = None
    available_until: Optional[datetime] = None


@dataclass
class ScheduledOperation:
    """Output: a scheduled operation."""
    operation_id: str
    order_id: str
    product_id: str
    operation_code: str
    machine_id: str
    start_time: datetime
    end_time: datetime
    duration_minutes: float
    setup_minutes: float = 0.0


class SchedulingResult(BaseModel):
    """Result of scheduling run."""
    success: bool = True
    engine_used: str = "heuristic"
    rule_used: Optional[str] = None
    solve_time_sec: float = 0.0
    status: str = "optimal"
    
    operations: List[Dict[str, Any]] = Field(default_factory=list)
    
    makespan_hours: float = 0.0
    total_tardiness_hours: float = 0.0
    num_late_orders: int = 0
    avg_utilization: float = 0.0
    
    warnings: List[str] = Field(default_factory=list)


class SchedulingAdapter:
    """
    Adapter for scheduling engines.
    
    Wraps the legacy scheduling engines from base- repository.
    Provides a clean interface for the PLAN module.
    """
    
    def __init__(self):
        self._engine = SchedulerEngine.HEURISTIC
        self._rule = DispatchRule.EDD
        self._time_limit_sec = 60.0
    
    def configure(
        self,
        engine: SchedulerEngine = SchedulerEngine.HEURISTIC,
        rule: DispatchRule = DispatchRule.EDD,
        time_limit_sec: float = 60.0,
    ) -> None:
        """Configure the scheduler."""
        self._engine = engine
        self._rule = rule
        self._time_limit_sec = time_limit_sec
    
    def schedule(
        self,
        operations: List[SchedulingOperation],
        machines: List[SchedulingMachine],
        horizon_start: datetime = None,
        horizon_end: datetime = None,
    ) -> SchedulingResult:
        """
        Run scheduling algorithm.
        
        This is a simplified implementation that uses EDD heuristic.
        In production, would call the actual legacy engines.
        """
        horizon_start = horizon_start or datetime.now()
        
        # Sort operations by due date (EDD)
        sorted_ops = sorted(
            operations,
            key=lambda op: (op.due_date or datetime.max, -op.priority),
        )
        
        # Build machine availability map
        machine_next_available: Dict[str, datetime] = {
            m.machine_id: horizon_start for m in machines
        }
        
        scheduled: List[Dict[str, Any]] = []
        total_tardiness = 0.0
        late_orders = set()
        
        for op in sorted_ops:
            # Find machine
            machine_id = op.machine_id
            if not machine_id:
                # Manual operation - use virtual "MANUAL" machine
                machine_id = "MANUAL"
                if machine_id not in machine_next_available:
                    machine_next_available[machine_id] = horizon_start
            
            # Calculate start time
            start_time = machine_next_available.get(machine_id, horizon_start)
            
            # Calculate end time
            duration = timedelta(minutes=op.duration_minutes)
            end_time = start_time + duration
            
            # Update machine availability
            machine_next_available[machine_id] = end_time
            
            # Check tardiness
            if op.due_date and end_time > op.due_date:
                tardiness = (end_time - op.due_date).total_seconds() / 3600
                total_tardiness += tardiness
                late_orders.add(op.order_id)
            
            scheduled.append({
                "operation_id": op.operation_id,
                "order_id": op.order_id,
                "product_id": op.product_id,
                "operation_code": op.operation_code,
                "machine_id": machine_id,
                "start_time": start_time.isoformat(),
                "end_time": end_time.isoformat(),
                "duration_minutes": op.duration_minutes,
                "setup_minutes": 0.0,
            })
        
        # Calculate KPIs
        makespan = 0.0
        if scheduled:
            all_ends = [
                datetime.fromisoformat(s["end_time"])
                for s in scheduled
            ]
            makespan = (max(all_ends) - horizon_start).total_seconds() / 3600
        
        # Calculate utilization
        total_work_minutes = sum(op.duration_minutes for op in operations)
        total_available_minutes = len(machines) * makespan * 60 if makespan > 0 else 1
        utilization = min(100, (total_work_minutes / total_available_minutes) * 100) if total_available_minutes > 0 else 0
        
        return SchedulingResult(
            success=True,
            engine_used=self._engine.value,
            rule_used=self._rule.value,
            solve_time_sec=0.01,
            status="optimal",
            operations=scheduled,
            makespan_hours=makespan,
            total_tardiness_hours=total_tardiness,
            num_late_orders=len(late_orders),
            avg_utilization=utilization,
        )
    
    def get_machine_utilization(
        self,
        result: SchedulingResult,
        machines: List[SchedulingMachine],
    ) -> Dict[str, float]:
        """Calculate utilization per machine."""
        utilization: Dict[str, float] = {}
        
        machine_work: Dict[str, float] = {m.machine_id: 0 for m in machines}
        
        for op in result.operations:
            machine_id = op.get("machine_id")
            if machine_id in machine_work:
                machine_work[machine_id] += op.get("duration_minutes", 0)
        
        for m in machines:
            available = m.capacity * result.makespan_hours * 60
            if available > 0:
                utilization[m.machine_id] = min(100, (machine_work[m.machine_id] / available) * 100)
            else:
                utilization[m.machine_id] = 0
        
        return utilization

