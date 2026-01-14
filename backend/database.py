"""
Database module for Production Orders, Errors, and Allocations API.
Handles SQLite database creation and queries with pagination.
"""

import sqlite3
from pathlib import Path
from typing import Optional, Tuple, List, Dict, Any
import pandas as pd

# Database path
DB_PATH = Path(__file__).parent / "prodplan.db"
EXCEL_PATH = Path(__file__).parent.parent / "Folha_IA.xlsx"


def get_connection() -> sqlite3.Connection:
    """Get SQLite connection with row factory for dict results."""
    conn = sqlite3.connect(str(DB_PATH), check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn


def init_database():
    """Initialize database and import all data from Excel if needed."""
    tables_needed = ['orders', 'errors', 'allocations']
    
    if DB_PATH.exists():
        conn = get_connection()
        cursor = conn.cursor()
        
        # Check all tables exist and have data
        all_initialized = True
        for table in tables_needed:
            cursor.execute(f"SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name='{table}'")
            if cursor.fetchone()[0] == 0:
                all_initialized = False
                break
            cursor.execute(f"SELECT COUNT(*) FROM {table}")
            if cursor.fetchone()[0] == 0:
                all_initialized = False
                break
        
        if all_initialized:
            cursor.execute("SELECT COUNT(*) FROM orders")
            orders_count = cursor.fetchone()[0]
            cursor.execute("SELECT COUNT(*) FROM errors")
            errors_count = cursor.fetchone()[0]
            cursor.execute("SELECT COUNT(*) FROM allocations")
            allocations_count = cursor.fetchone()[0]
            print(f"Database already initialized:")
            print(f"  - Orders: {orders_count:,}")
            print(f"  - Errors: {errors_count:,}")
            print(f"  - Allocations: {allocations_count:,}")
            conn.close()
            return
        conn.close()
    
    print("Importing all data from Excel to SQLite...")
    import_all_to_sqlite()


def import_all_to_sqlite():
    """Import all sheets from Excel to SQLite database."""
    print(f"Reading Excel file: {EXCEL_PATH}")
    
    xl = pd.ExcelFile(EXCEL_PATH)
    
    # Read all needed sheets
    df_orders = pd.read_excel(xl, sheet_name='OrdensFabrico')
    df_errors = pd.read_excel(xl, sheet_name='OrdemFabricoErros')
    df_allocations = pd.read_excel(xl, sheet_name='FuncionariosFaseOrdemFabrico')
    df_products = pd.read_excel(xl, sheet_name='Modelos')
    df_phases = pd.read_excel(xl, sheet_name='Fases')
    df_employees = pd.read_excel(xl, sheet_name='Funcionarios')
    
    # Create lookup dictionaries
    product_names = dict(zip(df_products['Produto_Id'], df_products['Produto_Nome']))
    phase_names = dict(zip(df_phases['Fase_Id'], df_phases['Fase_Nome']))
    employee_names = dict(zip(df_employees['Funcionario_Id'], df_employees['Funcionario_Nome']))
    
    # Helper function to get kayak type
    def get_kayak_type(name):
        if pd.isna(name):
            return 'Other'
        name = str(name)
        for prefix in ['K1', 'K2', 'K4', 'C1', 'C2', 'C4']:
            if name.startswith(prefix):
                return prefix
        return 'Other'
    
    conn = sqlite3.connect(str(DB_PATH))
    cursor = conn.cursor()
    
    # =====================================================================
    # ORDERS TABLE
    # =====================================================================
    print("Importing orders...")
    cursor.execute("DROP TABLE IF EXISTS orders")
    cursor.execute("""
        CREATE TABLE orders (
            id INTEGER PRIMARY KEY,
            product_id INTEGER,
            product_name TEXT,
            product_type TEXT,
            current_phase_id INTEGER,
            current_phase_name TEXT,
            created_date TEXT,
            completed_date TEXT,
            transport_date TEXT,
            status TEXT
        )
    """)
    
    orders = []
    for _, row in df_orders.iterrows():
        product_id = row['Of_ProdutoId']
        product_name = product_names.get(product_id, f'Product {product_id}') if pd.notna(product_id) else 'Unknown'
        phase_id = row['Of_FaseId']
        phase_name = phase_names.get(phase_id, 'Unknown')
        status = 'IN_PROGRESS' if pd.isna(row['Of_DataAcabamento']) else 'COMPLETED'
        
        orders.append({
            'id': int(row['Of_Id']),
            'product_id': int(product_id) if pd.notna(product_id) else None,
            'product_name': str(product_name),
            'product_type': get_kayak_type(product_name),
            'current_phase_id': int(phase_id) if pd.notna(phase_id) else None,
            'current_phase_name': str(phase_name),
            'created_date': row['Of_DataCriacao'].isoformat() if pd.notna(row['Of_DataCriacao']) else None,
            'completed_date': row['Of_DataAcabamento'].isoformat() if pd.notna(row['Of_DataAcabamento']) else None,
            'transport_date': row['Of_DataTransporte'].isoformat() if pd.notna(row['Of_DataTransporte']) else None,
            'status': status
        })
    
    cursor.executemany("""
        INSERT INTO orders (id, product_id, product_name, product_type, current_phase_id, 
                           current_phase_name, created_date, completed_date, transport_date, status)
        VALUES (:id, :product_id, :product_name, :product_type, :current_phase_id,
                :current_phase_name, :created_date, :completed_date, :transport_date, :status)
    """, orders)
    
    cursor.execute("CREATE INDEX idx_orders_created_date ON orders(created_date DESC)")
    cursor.execute("CREATE INDEX idx_orders_status ON orders(status)")
    cursor.execute("CREATE INDEX idx_orders_product_type ON orders(product_type)")
    cursor.execute("CREATE INDEX idx_orders_current_phase ON orders(current_phase_name)")
    
    print(f"  ✓ Imported {len(orders):,} orders")
    
    # =====================================================================
    # ERRORS TABLE
    # =====================================================================
    print("Importing errors...")
    cursor.execute("DROP TABLE IF EXISTS errors")
    cursor.execute("""
        CREATE TABLE errors (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER,
            phase_name TEXT,
            eval_phase_name TEXT,
            description TEXT,
            severity INTEGER
        )
    """)
    
    # Column mapping for errors:
    # Erro_Descricao - description
    # Erro_OfId - order ID
    # Erro_FaseAvaliacao - evaluation phase name
    # OFCH_GRAVIDADE - severity (1=Minor, 2=Major, 3=Critical)
    
    errors = []
    for _, row in df_errors.iterrows():
        errors.append({
            'order_id': int(row['Erro_OfId']) if pd.notna(row.get('Erro_OfId')) else None,
            'phase_name': str(row.get('Erro_FaseAvaliacao', 'Unknown')) if pd.notna(row.get('Erro_FaseAvaliacao')) else 'Unknown',
            'eval_phase_name': str(row.get('Erro_FaseAvaliacao', 'Unknown')) if pd.notna(row.get('Erro_FaseAvaliacao')) else 'Unknown',
            'description': str(row.get('Erro_Descricao', '')) if pd.notna(row.get('Erro_Descricao')) else '',
            'severity': int(row.get('OFCH_GRAVIDADE', 1)) if pd.notna(row.get('OFCH_GRAVIDADE')) else 1,
        })
    
    cursor.executemany("""
        INSERT INTO errors (order_id, phase_name, eval_phase_name, description, severity)
        VALUES (:order_id, :phase_name, :eval_phase_name, :description, :severity)
    """, errors)
    
    cursor.execute("CREATE INDEX idx_errors_severity ON errors(severity)")
    cursor.execute("CREATE INDEX idx_errors_order_id ON errors(order_id)")
    cursor.execute("CREATE INDEX idx_errors_phase ON errors(phase_name)")
    cursor.execute("CREATE INDEX idx_errors_description ON errors(description)")
    
    print(f"  ✓ Imported {len(errors):,} errors")
    
    # =====================================================================
    # ALLOCATIONS TABLE
    # =====================================================================
    print("Importing allocations...")
    
    # Need to join FuncionariosFaseOrdemFabrico with FasesOrdemFabrico
    df_fases_of = pd.read_excel(xl, sheet_name='FasesOrdemFabrico')
    
    # Create lookup from FasesOrdemFabrico
    fases_of_lookup = {}
    for _, row in df_fases_of.iterrows():
        fases_of_id = row['FaseOf_Id']
        fases_of_lookup[fases_of_id] = {
            'order_id': int(row['FaseOf_OfId']) if pd.notna(row.get('FaseOf_OfId')) else None,
            'phase_id': int(row['FaseOf_FaseId']) if pd.notna(row.get('FaseOf_FaseId')) else None,
            'start_date': row['FaseOf_Inicio'].isoformat() if pd.notna(row.get('FaseOf_Inicio')) else None,
            'end_date': row['FaseOf_Fim'].isoformat() if pd.notna(row.get('FaseOf_Fim')) else None,
        }
    
    cursor.execute("DROP TABLE IF EXISTS allocations")
    cursor.execute("""
        CREATE TABLE allocations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER,
            phase_id INTEGER,
            phase_name TEXT,
            employee_id INTEGER,
            employee_name TEXT,
            is_leader INTEGER DEFAULT 0,
            start_date TEXT,
            end_date TEXT
        )
    """)
    
    # Column mapping for allocations:
    # FuncionarioFaseOf_FaseOfId - references FasesOrdemFabrico.FaseOf_Id
    # FuncionarioFaseOf_FuncionarioId - employee ID
    # FuncionarioFaseOf_Chefe - is leader (1 = yes)
    
    allocations = []
    for _, row in df_allocations.iterrows():
        fases_of_id = row.get('FuncionarioFaseOf_FaseOfId')
        employee_id = row.get('FuncionarioFaseOf_FuncionarioId')
        
        # Get employee name
        employee_name = employee_names.get(employee_id, f'Employee {employee_id}') if pd.notna(employee_id) else 'Unknown'
        
        # Skip archived employees (names starting with 'z)')
        if employee_name.startswith('z)'):
            continue
        
        # Get order/phase info from lookup
        fases_of_info = fases_of_lookup.get(fases_of_id, {})
        phase_id = fases_of_info.get('phase_id')
        
        allocations.append({
            'order_id': fases_of_info.get('order_id'),
            'phase_id': phase_id,
            'phase_name': phase_names.get(phase_id, 'Unknown') if phase_id else 'Unknown',
            'employee_id': int(employee_id) if pd.notna(employee_id) else None,
            'employee_name': employee_name,
            'is_leader': 1 if row.get('FuncionarioFaseOf_Chefe') == 1 else 0,
            'start_date': fases_of_info.get('start_date'),
            'end_date': fases_of_info.get('end_date'),
        })
    
    cursor.executemany("""
        INSERT INTO allocations (order_id, phase_id, phase_name, employee_id, employee_name,
                                is_leader, start_date, end_date)
        VALUES (:order_id, :phase_id, :phase_name, :employee_id, :employee_name,
                :is_leader, :start_date, :end_date)
    """, allocations)
    
    cursor.execute("CREATE INDEX idx_allocations_start_date ON allocations(start_date DESC)")
    cursor.execute("CREATE INDEX idx_allocations_employee ON allocations(employee_id)")
    cursor.execute("CREATE INDEX idx_allocations_phase ON allocations(phase_name)")
    cursor.execute("CREATE INDEX idx_allocations_order ON allocations(order_id)")
    
    print(f"  ✓ Imported {len(allocations):,} allocations")
    
    conn.commit()
    conn.close()
    print("✓ All data imported successfully!")


# =========================================================================
# ORDERS QUERIES
# =========================================================================

def get_orders(
    page: int = 1,
    page_size: int = 20,
    status: Optional[str] = None,
    search: Optional[str] = None,
    product_type: Optional[str] = None,
    sort_by: str = "created_date",
    sort_order: str = "desc"
) -> Tuple[List[Dict[str, Any]], int]:
    """Get orders with pagination, filtering and sorting."""
    conn = get_connection()
    cursor = conn.cursor()
    
    conditions = []
    params = []
    
    if status and status.upper() != 'ALL':
        conditions.append("status = ?")
        params.append(status.upper())
    
    if product_type and product_type.upper() != 'ALL':
        conditions.append("product_type = ?")
        params.append(product_type)
    
    if search:
        conditions.append("(product_name LIKE ? OR id LIKE ? OR current_phase_name LIKE ?)")
        search_pattern = f"%{search}%"
        params.extend([search_pattern, search_pattern, search_pattern])
    
    where_clause = " AND ".join(conditions) if conditions else "1=1"
    
    sort_field_map = {
        "created_date": "created_date",
        "createdDate": "created_date",
        "product_name": "product_name",
        "productName": "product_name",
        "status": "status",
        "id": "id"
    }
    sort_field = sort_field_map.get(sort_by, "created_date")
    sort_dir = "DESC" if sort_order.lower() == "desc" else "ASC"
    
    cursor.execute(f"SELECT COUNT(*) FROM orders WHERE {where_clause}", params)
    total_count = cursor.fetchone()[0]
    
    offset = (page - 1) * page_size
    cursor.execute(f"""
        SELECT id, product_id, product_name, product_type, current_phase_id,
               current_phase_name, created_date, completed_date, transport_date, status
        FROM orders
        WHERE {where_clause}
        ORDER BY {sort_field} {sort_dir}
        LIMIT ? OFFSET ?
    """, params + [page_size, offset])
    
    orders = []
    for row in cursor.fetchall():
        orders.append({
            "id": str(row["id"]),
            "productId": str(row["product_id"]) if row["product_id"] else None,
            "productName": row["product_name"],
            "productType": row["product_type"],
            "currentPhaseId": str(row["current_phase_id"]) if row["current_phase_id"] else None,
            "currentPhaseName": row["current_phase_name"],
            "createdDate": row["created_date"],
            "completedDate": row["completed_date"],
            "transportDate": row["transport_date"],
            "status": row["status"]
        })
    
    conn.close()
    return orders, total_count


def get_orders_stats() -> Dict[str, Any]:
    """Get aggregate stats for orders."""
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT COUNT(*) FROM orders")
    total = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM orders WHERE status = 'IN_PROGRESS'")
    in_progress = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM orders WHERE status = 'COMPLETED'")
    completed = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM orders WHERE transport_date IS NOT NULL")
    with_transport = cursor.fetchone()[0]
    
    cursor.execute("""
        SELECT current_phase_name, COUNT(*) as count
        FROM orders
        GROUP BY current_phase_name
        ORDER BY count DESC
        LIMIT 8
    """)
    phase_distribution = [{"phase": row[0], "count": row[1]} for row in cursor.fetchall()]
    
    conn.close()
    
    return {
        "total": total,
        "inProgress": in_progress,
        "completed": completed,
        "withTransport": with_transport,
        "phaseDistribution": phase_distribution
    }


# =========================================================================
# ERRORS QUERIES
# =========================================================================

def get_errors(
    page: int = 1,
    page_size: int = 20,
    severity: Optional[int] = None,
    search: Optional[str] = None,
    phase: Optional[str] = None,
    sort_by: str = "id",
    sort_order: str = "desc"
) -> Tuple[List[Dict[str, Any]], int]:
    """Get errors with pagination, filtering and sorting."""
    conn = get_connection()
    cursor = conn.cursor()
    
    conditions = []
    params = []
    
    if severity and severity != 0:
        conditions.append("severity = ?")
        params.append(severity)
    
    if phase:
        conditions.append("phase_name LIKE ?")
        params.append(f"%{phase}%")
    
    if search:
        conditions.append("(description LIKE ? OR order_id LIKE ?)")
        search_pattern = f"%{search}%"
        params.extend([search_pattern, search_pattern])
    
    where_clause = " AND ".join(conditions) if conditions else "1=1"
    
    sort_field_map = {
        "severity": "severity",
        "description": "description",
        "id": "id",
        "orderId": "order_id"
    }
    sort_field = sort_field_map.get(sort_by, "id")
    sort_dir = "DESC" if sort_order.lower() == "desc" else "ASC"
    
    cursor.execute(f"SELECT COUNT(*) FROM errors WHERE {where_clause}", params)
    total_count = cursor.fetchone()[0]
    
    offset = (page - 1) * page_size
    cursor.execute(f"""
        SELECT id, order_id, phase_name, eval_phase_name, description, severity
        FROM errors
        WHERE {where_clause}
        ORDER BY {sort_field} {sort_dir}
        LIMIT ? OFFSET ?
    """, params + [page_size, offset])
    
    errors = []
    for row in cursor.fetchall():
        severity_label = {1: 'Minor', 2: 'Major', 3: 'Critical'}.get(row["severity"], 'Unknown')
        errors.append({
            "id": str(row["id"]),
            "orderId": str(row["order_id"]) if row["order_id"] else None,
            "phaseName": row["phase_name"],
            "evalPhaseName": row["eval_phase_name"],
            "description": row["description"],
            "severity": row["severity"],
            "severityLabel": severity_label
        })
    
    conn.close()
    return errors, total_count


def get_errors_stats() -> Dict[str, Any]:
    """Get aggregate stats for errors."""
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT COUNT(*) FROM errors")
    total = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM errors WHERE severity = 1")
    minor = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM errors WHERE severity = 2")
    major = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM errors WHERE severity = 3")
    critical = cursor.fetchone()[0]
    
    # Count distinct orders with at least one error (for rework rate)
    cursor.execute("SELECT COUNT(DISTINCT order_id) FROM errors")
    orders_with_errors = cursor.fetchone()[0]
    
    # Top 10 error descriptions
    cursor.execute("""
        SELECT description, COUNT(*) as count
        FROM errors
        WHERE description != ''
        GROUP BY description
        ORDER BY count DESC
        LIMIT 10
    """)
    top_descriptions = [{"description": row[0], "count": row[1]} for row in cursor.fetchall()]
    
    # Top phases with errors
    cursor.execute("""
        SELECT phase_name, COUNT(*) as count
        FROM errors
        WHERE phase_name != 'Unknown'
        GROUP BY phase_name
        ORDER BY count DESC
        LIMIT 10
    """)
    top_phases = [{"phase": row[0], "count": row[1]} for row in cursor.fetchall()]
    
    conn.close()
    
    return {
        "total": total,
        "bySeverity": {
            "minor": minor,
            "major": major,
            "critical": critical
        },
        "ordersWithErrors": orders_with_errors,
        "topDescriptions": top_descriptions,
        "topPhases": top_phases
    }


# =========================================================================
# ALLOCATIONS QUERIES
# =========================================================================

def get_allocations(
    page: int = 1,
    page_size: int = 20,
    employee_id: Optional[int] = None,
    phase: Optional[str] = None,
    search: Optional[str] = None,
    is_leader: Optional[bool] = None,
    sort_by: str = "start_date",
    sort_order: str = "desc"
) -> Tuple[List[Dict[str, Any]], int]:
    """Get allocations with pagination, filtering and sorting."""
    conn = get_connection()
    cursor = conn.cursor()
    
    conditions = []
    params = []
    
    if employee_id:
        conditions.append("employee_id = ?")
        params.append(employee_id)
    
    if phase:
        conditions.append("phase_name LIKE ?")
        params.append(f"%{phase}%")
    
    if is_leader is not None:
        conditions.append("is_leader = ?")
        params.append(1 if is_leader else 0)
    
    if search:
        conditions.append("(employee_name LIKE ? OR phase_name LIKE ? OR order_id LIKE ?)")
        search_pattern = f"%{search}%"
        params.extend([search_pattern, search_pattern, search_pattern])
    
    where_clause = " AND ".join(conditions) if conditions else "1=1"
    
    sort_field_map = {
        "start_date": "start_date",
        "startDate": "start_date",
        "employee_name": "employee_name",
        "employeeName": "employee_name",
        "phase_name": "phase_name",
        "phaseName": "phase_name",
        "id": "id"
    }
    sort_field = sort_field_map.get(sort_by, "start_date")
    sort_dir = "DESC" if sort_order.lower() == "desc" else "ASC"
    
    cursor.execute(f"SELECT COUNT(*) FROM allocations WHERE {where_clause}", params)
    total_count = cursor.fetchone()[0]
    
    offset = (page - 1) * page_size
    cursor.execute(f"""
        SELECT id, order_id, phase_id, phase_name, employee_id, employee_name,
               is_leader, start_date, end_date
        FROM allocations
        WHERE {where_clause}
        ORDER BY {sort_field} {sort_dir}
        LIMIT ? OFFSET ?
    """, params + [page_size, offset])
    
    allocations = []
    for row in cursor.fetchall():
        allocations.append({
            "id": str(row["id"]),
            "orderId": str(row["order_id"]) if row["order_id"] else None,
            "phaseId": str(row["phase_id"]) if row["phase_id"] else None,
            "phaseName": row["phase_name"],
            "employeeId": str(row["employee_id"]) if row["employee_id"] else None,
            "employeeName": row["employee_name"],
            "isLeader": bool(row["is_leader"]),
            "startDate": row["start_date"],
            "endDate": row["end_date"]
        })
    
    conn.close()
    return allocations, total_count


def get_allocations_stats() -> Dict[str, Any]:
    """Get aggregate stats for allocations."""
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT COUNT(*) FROM allocations")
    total = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM allocations WHERE is_leader = 1")
    as_leader = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(DISTINCT employee_id) FROM allocations")
    unique_employees = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(DISTINCT order_id) FROM allocations")
    unique_orders = cursor.fetchone()[0]
    
    # Top phases by allocations
    cursor.execute("""
        SELECT phase_name, COUNT(*) as count
        FROM allocations
        WHERE phase_name != 'Unknown'
        GROUP BY phase_name
        ORDER BY count DESC
        LIMIT 10
    """)
    top_phases = [{"phase": row[0], "count": row[1]} for row in cursor.fetchall()]
    
    # Top employees by allocations
    cursor.execute("""
        SELECT employee_name, COUNT(*) as count
        FROM allocations
        WHERE employee_name != 'Unknown'
        GROUP BY employee_name
        ORDER BY count DESC
        LIMIT 10
    """)
    top_employees = [{"employee": row[0], "count": row[1]} for row in cursor.fetchall()]
    
    conn.close()
    
    return {
        "total": total,
        "asLeader": as_leader,
        "uniqueEmployees": unique_employees,
        "uniqueOrders": unique_orders,
        "avgPerEmployee": round(total / unique_employees, 1) if unique_employees > 0 else 0,
        "topPhases": top_phases,
        "topEmployees": top_employees
    }


if __name__ == "__main__":
    # Run import when executed directly
    import_all_to_sqlite()
