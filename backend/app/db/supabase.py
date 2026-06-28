import uuid
from datetime import datetime
from typing import Optional, Any
import logging
from supabase import create_client, Client
from app.core.config import get_settings

logger = logging.getLogger(__name__)

# In-memory storage fallback when offline
IN_MEMORY_DB = {
    "users": [],
    "conversations": [],
    "messages": [],
    "knowledge_documents": [
        {
            "id": "doc-diabetes",
            "filename": "diabetes_guidelines.pdf",
            "title": "Clinical Guidelines for Diabetes Care"
        }
    ]
}

class MockResponse:
    def __init__(self, data: Any):
        self.data = data

class MockQuery:
    def __init__(self, table_name: str, client: Any):
        self.table_name = table_name
        self.client = client
        self.filters = []
        self.order_by = None
        self.order_desc = False
        self.action = "select"  # select, insert, update, delete
        self.action_data = None
        self.limit_val = None

    def select(self, *args, **kwargs):
        self.action = "select"
        return self

    def insert(self, data: Any):
        self.action = "insert"
        self.action_data = data
        return self

    def update(self, data: Any):
        self.action = "update"
        self.action_data = data
        return self

    def delete(self):
        self.action = "delete"
        return self

    def eq(self, field: str, value: Any):
        self.filters.append(("eq", field, value))
        return self

    def is_(self, field: str, value: Any):
        self.filters.append(("is", field, value))
        return self

    def in_(self, field: str, values: list):
        self.filters.append(("in", field, values))
        return self

    def order(self, field: str, desc: bool = False):
        self.order_by = field
        self.order_desc = desc
        return self

    def limit(self, value: int):
        self.limit_val = value
        return self

    def execute(self):
        table = IN_MEMORY_DB.setdefault(self.table_name, [])
        
        if self.action == "insert":
            data = self.action_data
            if isinstance(data, dict):
                row = data.copy()
                if "id" not in row:
                    row["id"] = str(uuid.uuid4())
                if "created_at" not in row:
                    row["created_at"] = datetime.utcnow().isoformat()
                table.append(row)
                return MockResponse([row])
            elif isinstance(data, list):
                rows = []
                for item in data:
                    row = item.copy()
                    if "id" not in row:
                        row["id"] = str(uuid.uuid4())
                    if "created_at" not in row:
                        row["created_at"] = datetime.utcnow().isoformat()
                    table.append(row)
                    rows.append(row)
                return MockResponse(rows)
                
        elif self.action == "select":
            filtered = table
            for op, field, val in self.filters:
                if op == "eq":
                    filtered = [row for row in filtered if row.get(field) == val]
                elif op == "is":
                    if val is None or val == "null" or val == "None":
                        filtered = [row for row in filtered if row.get(field) is None]
                    else:
                        filtered = [row for row in filtered if row.get(field) == val]
                elif op == "in":
                    filtered = [row for row in filtered if row.get(field) in val]
            
            if self.order_by:
                filtered = sorted(
                    filtered,
                    key=lambda x: str(x.get(self.order_by) or ""),
                    reverse=self.order_desc
                )
                
            if self.limit_val is not None:
                filtered = filtered[:self.limit_val]
                
            return MockResponse(filtered)
            
        elif self.action == "update":
            filtered_indices = []
            for idx, row in enumerate(table):
                match = True
                for op, field, val in self.filters:
                    if op == "eq" and row.get(field) != val:
                        match = False
                    elif op == "is":
                        if (val is None or val == "null" or val == "None") and row.get(field) is not None:
                            match = False
                        elif val is not None and row.get(field) != val:
                            match = False
                    elif op == "in" and row.get(field) not in val:
                        match = False
                if match:
                    filtered_indices.append(idx)
                    
            updated_rows = []
            for idx in filtered_indices:
                table[idx].update(self.action_data)
                updated_rows.append(table[idx])
            return MockResponse(updated_rows)
            
        elif self.action == "delete":
            kept_rows = []
            deleted_rows = []
            for row in table:
                match = True
                for op, field, val in self.filters:
                    if op == "eq" and row.get(field) != val:
                        match = False
                    elif op == "is":
                        if (val is None or val == "null" or val == "None") and row.get(field) is not None:
                            match = False
                        elif val is not None and row.get(field) != val:
                            match = False
                    elif op == "in" and row.get(field) not in val:
                        match = False
                if match:
                    deleted_rows.append(row)
                else:
                    kept_rows.append(row)
            IN_MEMORY_DB[self.table_name] = kept_rows
            return MockResponse(deleted_rows)

        return MockResponse([])

class MockRpcQuery:
    def __init__(self, fn_name: str, params: dict, client_wrapper: Any):
        self.fn_name = fn_name
        self.params = params
        self.client_wrapper = client_wrapper

    def execute(self):
        logger.warning(f"Using in-memory mock fallback for RPC function: {self.fn_name}")
        if self.fn_name == "match_chunks":
            return MockResponse([
                {
                    "content": "Diabetes is a chronic condition characterized by high levels of blood glucose.",
                    "document_id": "doc-diabetes",
                    "similarity": 0.9
                }
            ])
        elif self.fn_name == "match_memory":
            return MockResponse([
                {
                    "summary": "Patient reported dry cough and minor fever in general medicine consultation.",
                    "similarity": 0.8
                }
            ])
        return MockResponse([])

class SupabaseFallbackWrapper:
    def __init__(self, real_client: Client):
        self.real_client = real_client
        self._use_fallback = False

    def table(self, table_name: str):
        if self._use_fallback:
            return MockQuery(table_name, self)
        
        real_query = self.real_client.table(table_name)
        return SupabaseQueryWrapper(table_name, real_query, self)

    def rpc(self, fn_name: str, params: dict):
        if self._use_fallback:
            return MockRpcQuery(fn_name, params, self)
        
        try:
            real_query = self.real_client.rpc(fn_name, params)
            return SupabaseRpcQueryWrapper(fn_name, params, real_query, self)
        except Exception:
            return MockRpcQuery(fn_name, params, self)

class SupabaseRpcQueryWrapper:
    def __init__(self, fn_name: str, params: dict, real_query: Any, client_wrapper: SupabaseFallbackWrapper):
        self.fn_name = fn_name
        self.params = params
        self.real_query = real_query
        self.client_wrapper = client_wrapper

    def execute(self):
        try:
            return self.real_query.execute()
        except Exception as e:
            err_msg = str(e)
            if "getaddrinfo" in err_msg or "Failed to establish" in err_msg or "Connection refused" in err_msg:
                logger.warning(f"Supabase RPC connection failed ({err_msg}). Falling back to local mock RPC '{self.fn_name}'.")
                self.client_wrapper._use_fallback = True
                mock_rpc = MockRpcQuery(self.fn_name, self.params, self.client_wrapper)
                return mock_rpc.execute()
            else:
                raise e

class SupabaseQueryWrapper:
    def __init__(self, table_name: str, real_query: Any, client_wrapper: SupabaseFallbackWrapper):
        self.table_name = table_name
        self.real_query = real_query
        self.client_wrapper = client_wrapper
        self.filters = []
        self.order_by = None
        self.order_desc = False
        self.action = "select"
        self.action_data = None
        self.limit_val = None

    def select(self, *args, **kwargs):
        self.action = "select"
        try:
            self.real_query = self.real_query.select(*args, **kwargs)
        except Exception:
            pass
        return self

    def insert(self, data: Any):
        self.action = "insert"
        self.action_data = data
        try:
            self.real_query = self.real_query.insert(data)
        except Exception:
            pass
        return self

    def update(self, data: Any):
        self.action = "update"
        self.action_data = data
        try:
            self.real_query = self.real_query.update(data)
        except Exception:
            pass
        return self

    def delete(self):
        self.action = "delete"
        try:
            self.real_query = self.real_query.delete()
        except Exception:
            pass
        return self

    def eq(self, field: str, value: Any):
        self.filters.append(("eq", field, value))
        try:
            self.real_query = self.real_query.eq(field, value)
        except Exception:
            pass
        return self

    def is_(self, field: str, value: Any):
        self.filters.append(("is", field, value))
        try:
            self.real_query = self.real_query.is_(field, value)
        except Exception:
            pass
        return self

    def in_(self, field: str, values: list):
        self.filters.append(("in", field, values))
        try:
            self.real_query = self.real_query.in_(field, values)
        except Exception:
            pass
        return self

    def order(self, field: str, desc: bool = False):
        self.order_by = field
        self.order_desc = desc
        try:
            self.real_query = self.real_query.order(field, desc=desc)
        except Exception:
            pass
        return self

    def limit(self, value: int):
        self.limit_val = value
        try:
            self.real_query = self.real_query.limit(value)
        except Exception:
            pass
        return self

    def execute(self):
        try:
            return self.real_query.execute()
        except Exception as e:
            err_msg = str(e)
            if "getaddrinfo" in err_msg or "Failed to establish" in err_msg or "Connection refused" in err_msg:
                logger.warning(f"Supabase connection failed ({err_msg}). Falling back to local in-memory DB for table '{self.table_name}'.")
                self.client_wrapper._use_fallback = True
                mock_q = MockQuery(self.table_name, self.client_wrapper)
                mock_q.action = self.action
                mock_q.action_data = self.action_data
                mock_q.filters = self.filters
                mock_q.order_by = self.order_by
                mock_q.order_desc = self.order_desc
                mock_q.limit_val = self.limit_val
                return mock_q.execute()
            else:
                raise e

_supabase_client: Optional[SupabaseFallbackWrapper] = None

def get_supabase() -> SupabaseFallbackWrapper:
    global _supabase_client
    if _supabase_client is None:
        settings = get_settings()
        real_client = create_client(
            supabase_url=settings.supabase_url,
            supabase_key=settings.supabase_anon_key
        )
        _supabase_client = SupabaseFallbackWrapper(real_client)
    return _supabase_client
