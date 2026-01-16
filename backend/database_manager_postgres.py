"""
Database Manager for Kamioi Platform - PostgreSQL Support
Phase 1 Migration: Supports both SQLite (legacy) and PostgreSQL (new)
"""
import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
import os
import threading
import time

try:
    from sqlalchemy import create_engine, text, MetaData, Table, Column, Integer, String, Float, Boolean, DateTime, Text
    from sqlalchemy.pool import QueuePool
    from sqlalchemy.orm import sessionmaker, Session
    from sqlalchemy.exc import SQLAlchemyError
    SQLALCHEMY_AVAILABLE = True
except ImportError:
    SQLALCHEMY_AVAILABLE = False
    print("Warning: SQLAlchemy not available. Install with: pip install SQLAlchemy")

import sqlite3
from config import DatabaseConfig

class DatabaseManagerPostgres:
    """
    Database Manager with PostgreSQL support and connection pooling
    Falls back to SQLite if PostgreSQL is not configured
    """
    
    def __init__(self, db_path: str = None):
        self.db_path = db_path or DatabaseConfig.SQLITE_DB_PATH
        self._db_lock = threading.Lock()
        self._engine = None
        self._session_factory = None
        self._use_postgresql = False
        
        # Initialize database connection
        if DatabaseConfig.is_postgresql() and SQLALCHEMY_AVAILABLE:
            self._init_postgresql()
        else:
            if DatabaseConfig.is_postgresql():
                print("WARNING: PostgreSQL configured but SQLAlchemy not available. Falling back to SQLite.")
                print("Install with: pip install SQLAlchemy psycopg2-binary")
            self._init_sqlite()
    
    def _init_postgresql(self):
        """Initialize PostgreSQL connection with connection pooling"""
        try:
            postgres_url = DatabaseConfig.get_postgres_url()
            
            # Create engine with connection pooling
            self._engine = create_engine(
                postgres_url,
                poolclass=QueuePool,
                pool_size=DatabaseConfig.POOL_SIZE,
                max_overflow=DatabaseConfig.MAX_OVERFLOW,
                pool_timeout=DatabaseConfig.POOL_TIMEOUT,
                pool_recycle=DatabaseConfig.POOL_RECYCLE,
                pool_pre_ping=True,  # Verify connections before using
                echo=False  # Set to True for SQL debugging
            )
            
            # Create session factory
            self._session_factory = sessionmaker(bind=self._engine)
            
            self._use_postgresql = True
            print(f"✅ Connected to PostgreSQL with connection pooling (pool_size={DatabaseConfig.POOL_SIZE})")
            
        except Exception as e:
            print(f"ERROR: Failed to connect to PostgreSQL: {e}")
            print("Falling back to SQLite...")
            self._init_sqlite()
    
    def _init_sqlite(self):
        """Initialize SQLite connection (legacy)"""
        import os
        current_dir = os.path.dirname(os.path.abspath(__file__))
        if not os.path.isabs(self.db_path):
            self.db_path = os.path.join(current_dir, self.db_path)
        
        self._use_postgresql = False
        print(f"✅ Using SQLite database: {self.db_path}")
    
    def get_connection(self):
        """Get database connection (SQLite or PostgreSQL)"""
        if self._use_postgresql:
            # Return SQLAlchemy session for PostgreSQL
            return self._session_factory()
        else:
            # Return SQLite connection
            conn = sqlite3.connect(self.db_path, timeout=30)
            conn.execute('PRAGMA journal_mode=WAL')
            conn.execute('PRAGMA cache_size=10000')
            conn.execute('PRAGMA temp_store=MEMORY')
            conn.execute('PRAGMA encoding="UTF-8"')
            return conn
    
    def release_connection(self, conn):
        """Release database connection"""
        if self._use_postgresql:
            # SQLAlchemy session
            if conn:
                conn.close()
        else:
            # SQLite connection
            if conn:
                conn.close()
    
    def execute_query(self, query: str, params: tuple = None, fetch_one: bool = False, fetch_all: bool = True):
        """
        Execute a query (works with both SQLite and PostgreSQL)
        Handles SQL dialect differences automatically
        """
        conn = None
        try:
            conn = self.get_connection()
            
            if self._use_postgresql:
                # PostgreSQL via SQLAlchemy
                if params:
                    result = conn.execute(text(query), params)
                else:
                    result = conn.execute(text(query))
                
                conn.commit()
                
                if fetch_one:
                    row = result.fetchone()
                    return dict(row._mapping) if row else None
                elif fetch_all:
                    rows = result.fetchall()
                    return [dict(row._mapping) for row in rows]
                else:
                    return result.rowcount
            else:
                # SQLite
                cursor = conn.cursor()
                if params:
                    cursor.execute(query, params)
                else:
                    cursor.execute(query)
                
                conn.commit()
                
                if fetch_one:
                    row = cursor.fetchone()
                    if row:
                        columns = [desc[0] for desc in cursor.description]
                        return dict(zip(columns, row))
                    return None
                elif fetch_all:
                    rows = cursor.fetchall()
                    columns = [desc[0] for desc in cursor.description]
                    return [dict(zip(columns, row)) for rows in rows]
                else:
                    return cursor.rowcount
                    
        except Exception as e:
            if conn:
                if self._use_postgresql:
                    conn.rollback()
                else:
                    conn.rollback()
            raise e
        finally:
            if conn:
                self.release_connection(conn)
    
    def get_user_transactions(self, user_id: int, limit: int = 50, offset: int = 0) -> List[Dict]:
        """Get user transactions - compatible with both SQLite and PostgreSQL"""
        query = '''
            SELECT * FROM transactions 
            WHERE user_id = :user_id 
            ORDER BY date DESC, id DESC
            LIMIT :limit OFFSET :offset
        '''
        
        # Convert query for SQLite if needed
        if not self._use_postgresql:
            query = query.replace(':user_id', '?').replace(':limit', '?').replace(':offset', '?')
            params = (user_id, limit, offset)
        else:
            params = {'user_id': user_id, 'limit': limit, 'offset': offset}
        
        return self.execute_query(query, params, fetch_all=True)
    
    def add_transaction(self, user_id: int, transaction_data: Dict) -> int:
        """Add a new transaction - compatible with both SQLite and PostgreSQL"""
        # Build dynamic INSERT based on available data
        base_fields = ['user_id', 'date', 'merchant', 'amount', 'category', 'description', 
                      'investable', 'round_up', 'total_debit', 'status', 'fee']
        optional_fields = ['ticker', 'shares', 'price_per_share', 'stock_price']
        
        fields = base_fields.copy()
        values = [
            user_id,
            transaction_data.get('date'),
            transaction_data.get('merchant'),
            transaction_data.get('amount'),
            transaction_data.get('category'),
            transaction_data.get('description'),
            transaction_data.get('investable', 0),
            transaction_data.get('round_up', 0),
            transaction_data.get('total_debit', transaction_data.get('amount', 0)),
            transaction_data.get('status', 'pending'),
            transaction_data.get('fee', 0)
        ]
        
        for field in optional_fields:
            if field in transaction_data and transaction_data[field] is not None:
                fields.append(field)
                values.append(transaction_data[field])
        
        if self._use_postgresql:
            # PostgreSQL - use RETURNING to get ID
            placeholders = ', '.join([f':{field}' for field in fields])
            fields_str = ', '.join(fields)
            query = f'INSERT INTO transactions ({fields_str}) VALUES ({placeholders}) RETURNING id'
            params = dict(zip(fields, values))
            
            result = self.execute_query(query, params, fetch_one=True)
            return result['id'] if result else None
        else:
            # SQLite
            placeholders = ', '.join(['?' for _ in fields])
            fields_str = ', '.join(fields)
            query = f'INSERT INTO transactions ({fields_str}) VALUES ({placeholders})'
            
            conn = self.get_connection()
            try:
                cursor = conn.cursor()
                cursor.execute(query, tuple(values))
                transaction_id = cursor.lastrowid
                conn.commit()
                return transaction_id
            finally:
                self.release_connection(conn)
    
    # Add other methods from original DatabaseManager as needed
    # They should follow the same pattern - check self._use_postgresql and adapt queries

# For backward compatibility, create a wrapper that uses the appropriate manager
def get_database_manager():
    """Get database manager instance (PostgreSQL or SQLite)"""
    if DatabaseConfig.is_postgresql() and SQLALCHEMY_AVAILABLE:
        return DatabaseManagerPostgres()
    else:
        # Import original SQLite manager
        from database_manager import DatabaseManager
        return DatabaseManager()

