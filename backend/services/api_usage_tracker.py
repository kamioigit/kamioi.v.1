"""
API Usage Tracker - Tracks all DeepSeek API calls and charges
Uses database_manager instead of SQLAlchemy
"""

from database_manager import db_manager
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import json

class APIUsageTracker:
    """Track API calls, costs, and usage statistics"""
    
    # Official DeepSeek API Pricing (per 1M tokens)
    # Source: https://api-docs.deepseek.com/quick_start/pricing
    INPUT_COST_CACHE_HIT = 0.028 / 1_000_000   # $0.028 per 1M tokens
    INPUT_COST_CACHE_MISS = 0.28 / 1_000_000   # $0.28 per 1M tokens
    OUTPUT_COST = 0.42 / 1_000_000             # $0.42 per 1M tokens
    
    # Default: assume cache miss for input (more conservative cost estimate)
    DEFAULT_INPUT_COST = INPUT_COST_CACHE_MISS
    
    def _ensure_tables(self):
        """Ensure API usage and balance tables exist"""
        conn = db_manager.get_connection()
        try:
            cursor = conn.cursor()
            
            # Create api_usage table (SQLite syntax)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS api_usage (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    endpoint TEXT NOT NULL,
                    model TEXT NOT NULL,
                    prompt_tokens INTEGER DEFAULT 0,
                    completion_tokens INTEGER DEFAULT 0,
                    total_tokens INTEGER DEFAULT 0,
                    processing_time_ms INTEGER NOT NULL,
                    cost REAL NOT NULL DEFAULT 0.0000,
                    success INTEGER DEFAULT 1,
                    error_message TEXT,
                    request_data TEXT,
                    response_data TEXT,
                    user_id INTEGER,
                    page_tab TEXT,
                    created_at TEXT NOT NULL
                )
            """)
            
            # Add new columns if they don't exist (for existing databases)
            try:
                cursor.execute("ALTER TABLE api_usage ADD COLUMN user_id INTEGER")
            except:
                pass  # Column already exists
            try:
                cursor.execute("ALTER TABLE api_usage ADD COLUMN page_tab TEXT")
            except:
                pass  # Column already exists
            
            # Create api_balance table (SQLite syntax)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS api_balance (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    balance REAL NOT NULL DEFAULT 20.00,
                    updated_at TEXT NOT NULL
                )
            """)
            
            # Initialize balance if not exists
            cursor.execute("SELECT COUNT(*) FROM api_balance")
            if cursor.fetchone()[0] == 0:
                cursor.execute("INSERT INTO api_balance (balance, updated_at) VALUES (?, ?)", (20.00, datetime.now().isoformat()))
            
            conn.commit()
        except Exception as e:
            conn.rollback()
            print(f"Error ensuring tables: {e}")
        finally:
            db_manager.release_connection(conn)
    
    def record_api_call(self, endpoint: str, model: str, 
                       prompt_tokens: int = 0, completion_tokens: int = 0,
                       total_tokens: int = 0, processing_time_ms: int = 0, 
                       success: bool = True, error_message: str = None,
                       cache_hit: bool = False, user_id: int = None,
                       page_tab: str = None, request_data: str = None,
                       response_data: str = None) -> int:
        """
        Record an API call for tracking and billing
        
        Returns:
            ID of the created record
        """
        self._ensure_tables()
        
        if not success:
            cost = 0.0  # No charge for failed calls
        else:
            # Calculate cost based on DeepSeek pricing
            input_cost_per_token = self.INPUT_COST_CACHE_HIT if cache_hit else self.INPUT_COST_CACHE_MISS
            input_cost = prompt_tokens * input_cost_per_token
            output_cost = completion_tokens * self.OUTPUT_COST
            cost = input_cost + output_cost
        
        # Calculate total tokens if not provided
        if total_tokens == 0:
            total_tokens = prompt_tokens + completion_tokens
        
        conn = db_manager.get_connection()
        try:
            cursor = conn.cursor()
            
            # Debug logging
            print(f"📊 record_api_call - user_id: {user_id}, page_tab: {page_tab}")
            print(f"📊 record_api_call - request_data type: {type(request_data)}, length: {len(request_data) if request_data else 0}")
            print(f"📊 record_api_call - response_data type: {type(response_data)}, length: {len(response_data) if response_data else 0}")
            
            # Ensure request_data and response_data are strings (not None)
            request_data_str = str(request_data) if request_data else None
            response_data_str = str(response_data) if response_data else None
            
            cursor.execute("""
                INSERT INTO api_usage 
                (endpoint, model, prompt_tokens, completion_tokens, total_tokens, 
                 processing_time_ms, cost, success, error_message, user_id, page_tab,
                 request_data, response_data, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                endpoint, model, prompt_tokens, completion_tokens, total_tokens,
                processing_time_ms, cost, 1 if success else 0, error_message,
                user_id, page_tab, request_data_str, response_data_str, datetime.now().isoformat()
            ))
            record_id = cursor.lastrowid
            conn.commit()
            
            # Verify the insert
            cursor.execute("SELECT user_id, page_tab, request_data IS NOT NULL AND request_data != '', response_data IS NOT NULL AND response_data != '' FROM api_usage WHERE id = ?", (record_id,))
            verify = cursor.fetchone()
            print(f"📊 Verified record {record_id}: user_id={verify[0]}, page_tab={verify[1]}, has_request={bool(verify[2])}, has_response={bool(verify[3])}")
            
            # Additional debug: Check actual values
            cursor.execute("SELECT user_id, page_tab, LENGTH(request_data), LENGTH(response_data) FROM api_usage WHERE id = ?", (record_id,))
            debug_row = cursor.fetchone()
            print(f"📊 Debug record {record_id}: user_id={debug_row[0]}, page_tab={debug_row[1]}, request_len={debug_row[2]}, response_len={debug_row[3]}")
            
            return record_id
        except Exception as e:
            conn.rollback()
            print(f"❌ Error recording API call: {e}")
            import traceback
            traceback.print_exc()
            return None
        finally:
            db_manager.release_connection(conn)
    
    def get_usage_stats(self, days: int = 30) -> Dict:
        """
        Get usage statistics for the specified period
        """
        self._ensure_tables()
        cutoff_date = datetime.now() - timedelta(days=days)
        
        conn = db_manager.get_connection()
        try:
            cursor = conn.cursor()
            
            # Get all usage records
            cursor.execute("""
                SELECT endpoint, model, prompt_tokens, completion_tokens, total_tokens,
                       processing_time_ms, cost, success, error_message, created_at
                FROM api_usage
                WHERE created_at >= ?
            """, (cutoff_date.isoformat(),))
            
            rows = cursor.fetchall()
            
            total_calls = len(rows)
            successful_calls = sum(1 for r in rows if r[7])  # success column
            failed_calls = total_calls - successful_calls
            total_cost = sum(float(r[6]) for r in rows)  # cost column
            avg_processing_time = sum(r[5] for r in rows) / total_calls if total_calls > 0 else 0
            
            # Group by day
            calls_by_day = {}
            cost_by_day = {}
            for row in rows:
                created_at = row[9]  # created_at column
                try:
                    if isinstance(created_at, str):
                        # Try parsing ISO format
                        if 'T' in created_at:
                            day = datetime.fromisoformat(created_at.replace('Z', '+00:00').split('T')[0])
                        else:
                            day = datetime.fromisoformat(created_at.split()[0])
                        day = day.date() if hasattr(day, 'date') else day
                    else:
                        day = created_at.date() if hasattr(created_at, 'date') else datetime.fromisoformat(str(created_at)).date()
                except:
                    # Fallback: use today if parsing fails
                    day = datetime.now().date()
                
                day_str = str(day)
                if day_str not in calls_by_day:
                    calls_by_day[day_str] = 0
                    cost_by_day[day_str] = 0.0
                calls_by_day[day_str] += 1
                cost_by_day[day_str] += float(row[6] or 0)
            
            # Group by model
            calls_by_model = {}
            for row in rows:
                model = row[1]  # model column
                if model not in calls_by_model:
                    calls_by_model[model] = {'calls': 0, 'cost': 0.0}
                calls_by_model[model]['calls'] += 1
                calls_by_model[model]['cost'] += float(row[6])
            
            return {
                'total_calls': total_calls,
                'successful_calls': successful_calls,
                'failed_calls': failed_calls,
                'success_rate': round(successful_calls / total_calls * 100, 2) if total_calls > 0 else 0,
                'total_cost': round(total_cost, 4),
                'average_processing_time_ms': round(avg_processing_time, 2),
                'calls_by_day': [
                    {'date': day, 'calls': count}
                    for day, count in sorted(calls_by_day.items())
                ],
                'cost_by_day': [
                    {'date': day, 'cost': round(cost, 4)}
                    for day, cost in sorted(cost_by_day.items())
                ],
                'calls_by_model': {
                    model: {
                        'calls': data['calls'],
                        'cost': round(data['cost'], 4)
                    }
                    for model, data in calls_by_model.items()
                },
                'period_days': days
            }
        finally:
            db_manager.release_connection(conn)
    
    def get_current_month_cost(self) -> float:
        """Get total cost for current month"""
        self._ensure_tables()
        now = datetime.now()
        start_of_month = datetime(now.year, now.month, 1)
        
        conn = db_manager.get_connection()
        try:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT SUM(cost) FROM api_usage
                WHERE created_at >= ? AND success = 1
            """, (start_of_month.isoformat(),))
            
            result = cursor.fetchone()
            return round(float(result[0] or 0.0), 4)
        finally:
            db_manager.release_connection(conn)
    
    def get_balance_info(self) -> Dict:
        """
        Get balance information from database
        """
        self._ensure_tables()
        
        conn = db_manager.get_connection()
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT balance, updated_at FROM api_balance ORDER BY updated_at DESC LIMIT 1")
            row = cursor.fetchone()
            
            if row:
                balance = float(row[0])
                total_spent = self.get_current_month_cost()
                remaining = balance - total_spent
                updated_at = row[1]
                if isinstance(updated_at, str):
                    last_updated = updated_at
                else:
                    last_updated = updated_at.isoformat() if hasattr(updated_at, 'isoformat') else str(updated_at)
                
                return {
                    'current_balance': balance,
                    'total_spent': total_spent,
                    'remaining_balance': max(0.0, remaining),
                    'last_updated': last_updated
                }
            else:
                # Default balance if not set
                total_spent = self.get_current_month_cost()
                return {
                    'current_balance': 20.0,
                    'total_spent': total_spent,
                    'remaining_balance': 20.0 - total_spent,
                    'last_updated': None
                }
        finally:
            db_manager.release_connection(conn)
    
    def get_detailed_records(self, page: int = 1, limit: int = 50, days: int = 30, 
                            status: str = None, endpoint: str = None, 
                            user_id: str = None, page_tab: str = None) -> Dict:
        """
        Get detailed API usage records with pagination and filtering
        
        Args:
            page: Page number
            limit: Records per page
            days: Number of days to look back
            status: Filter by status ('success', 'failed', or None for all)
            endpoint: Filter by endpoint (partial match)
            user_id: Filter by user_id (can be account_number or numeric ID)
            page_tab: Filter by page_tab (partial match)
        
        Returns:
            {
                'records': List[Dict],
                'total': int,
                'page': int,
                'limit': int,
                'total_pages': int
            }
        """
        self._ensure_tables()
        cutoff_date = datetime.now() - timedelta(days=days)
        
        conn = db_manager.get_connection()
        try:
            use_postgresql = getattr(db_manager, '_use_postgresql', False)
            
            # Build WHERE clause with filters
            # Always include LEFT JOIN for user lookup in WHERE conditions
            where_conditions = []
            params = {} if use_postgresql else []
            
            # Base date filter
            if use_postgresql:
                where_conditions.append("au.created_at >= :cutoff_date")
                params['cutoff_date'] = cutoff_date.isoformat()
            else:
                where_conditions.append("au.created_at >= ?")
                params.append(cutoff_date.isoformat())
            
            if status:
                if status.lower() == 'success':
                    where_conditions.append("au.success = :success" if use_postgresql else "au.success = ?")
                    if use_postgresql:
                        params['success'] = 1
                    else:
                        params.append(1)
                elif status.lower() == 'failed':
                    where_conditions.append("au.success = :success" if use_postgresql else "au.success = ?")
                    if use_postgresql:
                        params['success'] = 0
                    else:
                        params.append(0)
            
            if endpoint:
                where_conditions.append("au.endpoint LIKE :endpoint" if use_postgresql else "au.endpoint LIKE ?")
                endpoint_pattern = f"%{endpoint}%"
                if use_postgresql:
                    params['endpoint'] = endpoint_pattern
                else:
                    params.append(endpoint_pattern)
            
            if user_id:
                # Try to match by account_number first, then by numeric ID
                where_conditions.append("""
                    (COALESCE(u.account_number, CAST(au.user_id AS TEXT)) = :user_id 
                     OR au.user_id = :user_id_numeric)
                """ if use_postgresql else """
                    (COALESCE(u.account_number, CAST(au.user_id AS TEXT)) = ? 
                     OR au.user_id = ?)
                """)
                if use_postgresql:
                    params['user_id'] = str(user_id)
                    # Try to parse as int for numeric match
                    try:
                        params['user_id_numeric'] = int(user_id)
                    except:
                        params['user_id_numeric'] = -1  # Won't match anything
                else:
                    params.append(str(user_id))
                    try:
                        params.append(int(user_id))
                    except:
                        params.append(-1)
            
            if page_tab:
                where_conditions.append("au.page_tab LIKE :page_tab" if use_postgresql else "au.page_tab LIKE ?")
                page_tab_pattern = f"%{page_tab}%"
                if use_postgresql:
                    params['page_tab'] = page_tab_pattern
                else:
                    params.append(page_tab_pattern)
            
            where_clause = " AND ".join(where_conditions)
            
            if use_postgresql:
                from sqlalchemy import text
                
                # Get total count (PostgreSQL)
                result = conn.execute(text(f"""
                    SELECT COUNT(*) FROM api_usage au
                    LEFT JOIN users u ON au.user_id = u.id
                    WHERE {where_clause}
                """), params)
                total = result.scalar()
                
                # Get paginated records with account_number lookup (PostgreSQL)
                offset = (page - 1) * limit
                params['limit'] = limit
                params['offset'] = offset
                result = conn.execute(text(f"""
                    SELECT au.id, au.endpoint, au.model, au.prompt_tokens, au.completion_tokens, au.total_tokens,
                           au.processing_time_ms, au.cost, au.success, au.error_message, au.request_data,
                           au.response_data, au.user_id, au.page_tab, au.created_at,
                           COALESCE(u.account_number, CAST(au.user_id AS TEXT)) as user_display_id
                    FROM api_usage au
                    LEFT JOIN users u ON au.user_id = u.id
                    WHERE {where_clause}
                    ORDER BY au.created_at DESC
                    LIMIT :limit OFFSET :offset
                """), params)
                rows = result.fetchall()
            else:
                # SQLite
                cursor = conn.cursor()
                
                # Get total count
                cursor.execute(f"""
                    SELECT COUNT(*) FROM api_usage au
                    LEFT JOIN users u ON au.user_id = u.id
                    WHERE {where_clause}
                """, params)
                total = cursor.fetchone()[0]
                
                # Get paginated records with account_number lookup
                offset = (page - 1) * limit
                params.append(limit)
                params.append(offset)
                cursor.execute(f"""
                    SELECT au.id, au.endpoint, au.model, au.prompt_tokens, au.completion_tokens, au.total_tokens,
                           au.processing_time_ms, au.cost, au.success, au.error_message, au.request_data,
                           au.response_data, au.user_id, au.page_tab, au.created_at,
                           COALESCE(u.account_number, CAST(au.user_id AS TEXT)) as user_display_id
                    FROM api_usage au
                    LEFT JOIN users u ON au.user_id = u.id
                    WHERE {where_clause}
                    ORDER BY au.created_at DESC
                    LIMIT ? OFFSET ?
                """, params)
                
                rows = cursor.fetchall()
            print(f"📊 get_detailed_records: Retrieved {len(rows)} rows from database")
            
            records = []
            for idx, row in enumerate(rows):
                # Debug first record
                if idx == 0:
                    print(f"📊 Sample record {row[0]}: user_id={row[12]}, user_display_id={row[15]}, page_tab={row[13]}, has_request={bool(row[10])}, has_response={bool(row[11])}")
                # Extract message from request_data if available
                message = None
                request_data_raw = row[10]  # request_data
                if request_data_raw:
                    try:
                        # Try parsing as JSON first
                        request_json = json.loads(request_data_raw)
                        # Try to extract message/prompt from common structures
                        if isinstance(request_json, dict):
                            if 'messages' in request_json and len(request_json['messages']) > 0:
                                # Get the last message (user message)
                                last_message = request_json['messages'][-1]
                                message = last_message.get('content', '')
                                # Truncate to 100 chars for display
                                if len(message) > 100:
                                    message = message[:100] + '...'
                            elif 'prompt' in request_json:
                                message = str(request_json['prompt'])
                                if len(message) > 100:
                                    message = message[:100] + '...'
                            elif 'content' in request_json:
                                message = str(request_json['content'])
                                if len(message) > 100:
                                    message = message[:100] + '...'
                    except json.JSONDecodeError:
                        # If JSON parsing fails, try to extract text directly
                        try:
                            message = str(request_data_raw)[:100] if request_data_raw else None
                            if len(message) > 100:
                                message = message[:100] + '...'
                        except:
                            message = None
                    except Exception as e:
                        print(f"⚠️ Error extracting message from request_data: {e}")
                        message = None
                
                # Determine if response was stored (has response_data)
                stored = bool(row[11])  # response_data
                
                # Format user_id - use account_number if available, otherwise use numeric ID, otherwise N/A
                user_id_display = row[15] if row[15] is not None else (str(row[12]) if row[12] is not None else 'N/A')
                
                records.append({
                    'id': row[0],
                    'date': row[14],  # created_at
                    'endpoint': row[1],
                    'model': row[2],
                    'prompt_tokens': row[3],
                    'completion_tokens': row[4],
                    'total_tokens': row[5],
                    'processing_time_ms': row[6],
                    'cost': float(row[7]),
                    'success': bool(row[8]),
                    'error_message': row[9],
                    'message': message or 'N/A',
                    'stored': stored,
                    'page_tab': row[13] if row[13] else 'N/A',
                    'user_id': user_id_display
                })
            
            total_pages = (total + limit - 1) // limit if total > 0 else 1
            
            return {
                'records': records,
                'total': total,
                'page': page,
                'limit': limit,
                'total_pages': total_pages
            }
        finally:
            db_manager.release_connection(conn)
    
    def update_balance(self, new_balance: float) -> Dict:
        """
        Update the API balance
        """
        self._ensure_tables()
        
        conn = db_manager.get_connection()
        try:
            cursor = conn.cursor()
            
            # Check if record exists
            cursor.execute("SELECT COUNT(*) FROM api_balance")
            exists = cursor.fetchone()[0] > 0
            
            if exists:
                cursor.execute("""
                    UPDATE api_balance 
                    SET balance = ?, updated_at = ?
                    WHERE id = (SELECT id FROM api_balance ORDER BY updated_at DESC LIMIT 1)
                """, (new_balance, datetime.now().isoformat()))
            else:
                cursor.execute("""
                    INSERT INTO api_balance (balance, updated_at)
                    VALUES (?, ?)
                """, (new_balance, datetime.now().isoformat()))
            
            conn.commit()
            return self.get_balance_info()
        except Exception as e:
            conn.rollback()
            print(f"Error updating balance: {e}")
            raise
        finally:
            db_manager.release_connection(conn)
    
    def get_daily_cost_limit_status(self, daily_limit: float = 10.0) -> Dict:
        """Check if daily cost limit is approaching"""
        self._ensure_tables()
        today = datetime.now().date()
        today_start = datetime.combine(today, datetime.min.time())
        
        conn = db_manager.get_connection()
        try:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT SUM(cost) FROM api_usage
                WHERE created_at >= ? AND success = 1
            """, (today_start.isoformat(),))
            
            result = cursor.fetchone()
            today_cost = float(result[0] or 0.0)
            
            return {
                'today_cost': round(today_cost, 4),
                'daily_limit': daily_limit,
                'remaining': round(daily_limit - today_cost, 4),
                'percentage_used': round(today_cost / daily_limit * 100, 2) if daily_limit > 0 else 0,
                'limit_exceeded': today_cost >= daily_limit
            }
        finally:
            db_manager.release_connection(conn)
