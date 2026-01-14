"""
ProdPlan ONE - Kafka Client
============================

Async Kafka producer and consumer wrappers.
Event-driven architecture for module communication.
"""

import asyncio
import json
import logging
from datetime import datetime
from typing import Any, Callable, Dict, List, Optional, Type, TypeVar
from uuid import UUID, uuid4

from aiokafka import AIOKafkaConsumer, AIOKafkaProducer
from aiokafka.errors import KafkaError
from pydantic import BaseModel, Field

from .config import settings

logger = logging.getLogger(__name__)


# Event Topics
class Topics:
    """Kafka topic names."""
    
    # CORE events
    MASTER_DATA_LOADED = "prodplan.core.master_data_loaded"
    CONFIG_UPDATED = "prodplan.core.config_updated"
    TENANT_CONFIGURED = "prodplan.core.tenant_configured"
    
    # PLAN events
    SCHEDULE_CREATED = "prodplan.plan.schedule_created"
    SCHEDULE_UPDATED = "prodplan.plan.schedule_updated"
    MRP_CALCULATED = "prodplan.plan.mrp_calculated"
    MATERIAL_REQUIREMENT_PLANNED = "prodplan.plan.material_planned"
    PURCHASE_ORDER_CREATED = "prodplan.plan.po_created"
    CAPACITY_CONSTRAINT_DETECTED = "prodplan.plan.capacity_constraint"
    
    # PROFIT events
    COGS_CALCULATED = "prodplan.profit.cogs_calculated"
    PRICING_RECOMMENDED = "prodplan.profit.pricing_recommended"
    SCENARIO_SIMULATED = "prodplan.profit.scenario_simulated"
    COST_VARIANCE_CALCULATED = "prodplan.profit.cost_variance"
    
    # HR events
    EMPLOYEE_ALLOCATED = "prodplan.hr.employee_allocated"
    LABOR_COST_COMMITTED = "prodplan.hr.labor_cost_committed"
    SHIFT_SCHEDULED = "prodplan.hr.shift_scheduled"
    PRODUCTIVITY_RECORDED = "prodplan.hr.productivity_recorded"
    MONTHLY_PAYROLL_CALCULATED = "prodplan.hr.payroll_calculated"
    CERTIFICATION_EXPIRY_ALERT = "prodplan.hr.certification_expiry"
    
    # Dead letter queue
    DLQ = "prodplan.dlq"


class EventBase(BaseModel):
    """Base class for all events."""
    
    event_id: UUID = Field(default_factory=uuid4)
    event_type: str
    tenant_id: UUID
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    correlation_id: Optional[UUID] = None
    source_module: str
    payload: Dict[str, Any] = Field(default_factory=dict)
    
    class Config:
        json_encoders = {
            UUID: str,
            datetime: lambda v: v.isoformat(),
        }


class EventEnvelope(BaseModel):
    """Wrapper for event serialization."""
    
    event_id: str
    event_type: str
    tenant_id: str
    timestamp: str
    correlation_id: Optional[str] = None
    source_module: str
    payload: Dict[str, Any]
    
    @classmethod
    def from_event(cls, event: EventBase) -> "EventEnvelope":
        """Create envelope from event."""
        return cls(
            event_id=str(event.event_id),
            event_type=event.event_type,
            tenant_id=str(event.tenant_id),
            timestamp=event.timestamp.isoformat(),
            correlation_id=str(event.correlation_id) if event.correlation_id else None,
            source_module=event.source_module,
            payload=event.payload,
        )


T = TypeVar("T", bound=EventBase)


class KafkaProducerClient:
    """
    Async Kafka producer for publishing events.
    
    Usage:
        producer = KafkaProducerClient()
        await producer.start()
        await producer.publish(Topics.SCHEDULE_CREATED, event)
        await producer.stop()
    """
    
    def __init__(self):
        self._producer: Optional[AIOKafkaProducer] = None
        self._started = False
    
    async def start(self) -> None:
        """Start the producer."""
        if self._started:
            return
        
        self._producer = AIOKafkaProducer(
            bootstrap_servers=settings.kafka_bootstrap_servers,
            value_serializer=lambda v: json.dumps(v).encode("utf-8"),
            key_serializer=lambda k: k.encode("utf-8") if k else None,
            acks="all",
            enable_idempotence=True,
            max_batch_size=16384,
            linger_ms=10,
        )
        
        await self._producer.start()
        self._started = True
        logger.info("Kafka producer started")
    
    async def stop(self) -> None:
        """Stop the producer."""
        if self._producer and self._started:
            await self._producer.stop()
            self._started = False
            logger.info("Kafka producer stopped")
    
    async def publish(
        self,
        topic: str,
        event: EventBase,
        key: Optional[str] = None,
    ) -> bool:
        """
        Publish an event to a topic.
        
        Args:
            topic: Kafka topic name
            event: Event to publish
            key: Optional partition key (defaults to tenant_id)
        
        Returns:
            True if successful, False otherwise
        """
        if not self._started:
            await self.start()
        
        try:
            envelope = EventEnvelope.from_event(event)
            partition_key = key or str(event.tenant_id)
            
            await self._producer.send_and_wait(
                topic,
                value=envelope.model_dump(),
                key=partition_key,
            )
            
            logger.debug(f"Published event {event.event_id} to {topic}")
            return True
            
        except KafkaError as e:
            logger.error(f"Failed to publish event: {e}")
            return False
    
    async def publish_batch(
        self,
        topic: str,
        events: List[EventBase],
    ) -> int:
        """
        Publish multiple events to a topic.
        
        Returns:
            Number of successfully published events
        """
        if not self._started:
            await self.start()
        
        success_count = 0
        for event in events:
            if await self.publish(topic, event):
                success_count += 1
        
        return success_count


EventHandler = Callable[[EventEnvelope], Any]


class KafkaConsumerClient:
    """
    Async Kafka consumer for subscribing to events.
    
    Usage:
        consumer = KafkaConsumerClient([Topics.SCHEDULE_CREATED])
        consumer.register_handler(Topics.SCHEDULE_CREATED, my_handler)
        await consumer.start()
        await consumer.consume()  # Blocking
    """
    
    def __init__(
        self,
        topics: List[str],
        group_id: Optional[str] = None,
    ):
        self._topics = topics
        self._group_id = group_id or settings.kafka_consumer_group
        self._consumer: Optional[AIOKafkaConsumer] = None
        self._handlers: Dict[str, List[EventHandler]] = {}
        self._started = False
        self._running = False
    
    def register_handler(self, event_type: str, handler: EventHandler) -> None:
        """Register a handler for an event type."""
        if event_type not in self._handlers:
            self._handlers[event_type] = []
        self._handlers[event_type].append(handler)
    
    async def start(self) -> None:
        """Start the consumer."""
        if self._started:
            return
        
        self._consumer = AIOKafkaConsumer(
            *self._topics,
            bootstrap_servers=settings.kafka_bootstrap_servers,
            group_id=self._group_id,
            auto_offset_reset=settings.kafka_auto_offset_reset,
            value_deserializer=lambda v: json.loads(v.decode("utf-8")),
            enable_auto_commit=True,
            auto_commit_interval_ms=5000,
        )
        
        await self._consumer.start()
        self._started = True
        logger.info(f"Kafka consumer started for topics: {self._topics}")
    
    async def stop(self) -> None:
        """Stop the consumer."""
        self._running = False
        if self._consumer and self._started:
            await self._consumer.stop()
            self._started = False
            logger.info("Kafka consumer stopped")
    
    async def consume(self) -> None:
        """
        Start consuming messages.
        
        This is a blocking operation. Call stop() from another task to stop.
        """
        if not self._started:
            await self.start()
        
        self._running = True
        
        try:
            async for message in self._consumer:
                if not self._running:
                    break
                
                try:
                    envelope = EventEnvelope(**message.value)
                    await self._dispatch(envelope)
                except Exception as e:
                    logger.error(f"Error processing message: {e}")
                    await self._send_to_dlq(message.value, str(e))
        
        except Exception as e:
            logger.error(f"Consumer error: {e}")
            raise
    
    async def _dispatch(self, envelope: EventEnvelope) -> None:
        """Dispatch event to registered handlers."""
        handlers = self._handlers.get(envelope.event_type, [])
        
        if not handlers:
            logger.warning(f"No handlers for event type: {envelope.event_type}")
            return
        
        for handler in handlers:
            try:
                result = handler(envelope)
                if asyncio.iscoroutine(result):
                    await result
            except Exception as e:
                logger.error(f"Handler error for {envelope.event_type}: {e}")
    
    async def _send_to_dlq(self, message: Dict, error: str) -> None:
        """Send failed message to dead letter queue."""
        # In a full implementation, this would publish to the DLQ topic
        logger.error(f"DLQ message: {message}, error: {error}")


# Global instances
_producer: Optional[KafkaProducerClient] = None
_consumers: Dict[str, KafkaConsumerClient] = {}


async def get_producer() -> KafkaProducerClient:
    """Get or create the global producer."""
    global _producer
    if _producer is None:
        _producer = KafkaProducerClient()
        await _producer.start()
    return _producer


async def publish_event(topic: str, event: EventBase) -> bool:
    """Convenience function to publish an event."""
    producer = await get_producer()
    return await producer.publish(topic, event)


async def shutdown_kafka() -> None:
    """Shutdown all Kafka clients."""
    global _producer
    if _producer:
        await _producer.stop()
        _producer = None
    
    for consumer in _consumers.values():
        await consumer.stop()
    _consumers.clear()


# Health check
async def check_kafka_health() -> bool:
    """Check Kafka connectivity."""
    try:
        producer = await get_producer()
        return producer._started
    except Exception:
        return False

