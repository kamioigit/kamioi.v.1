"""
Database Manager for Kamioi Platform
Handles persistent storage and data management
"""

import sqlite3
import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
import os
import threading
import time

# Try to import PostgreSQL support
try:
    from config import DatabaseConfig
    POSTGRESQL_SUPPORT = True
except ImportError:
    POSTGRESQL_SUPPORT = False
    DatabaseConfig = None

class DatabaseManager:
    def __init__(self, db_path: str = None):
        # Check if PostgreSQL is configured
        self._use_postgresql = False
        self._postgres_engine = None
        self._postgres_session_factory = None
        
        if POSTGRESQL_SUPPORT and DatabaseConfig and DatabaseConfig.is_postgresql():
            try:
                from sqlalchemy import create_engine
                from sqlalchemy.orm import sessionmaker
                from sqlalchemy.pool import QueuePool
                
                postgres_url = DatabaseConfig.get_postgres_url()
                self._postgres_engine = create_engine(
                    postgres_url,
                    poolclass=QueuePool,
                    pool_size=DatabaseConfig.POOL_SIZE,
                    max_overflow=DatabaseConfig.MAX_OVERFLOW,
                    pool_timeout=DatabaseConfig.POOL_TIMEOUT,
                    pool_recycle=DatabaseConfig.POOL_RECYCLE,
                    pool_pre_ping=True,
                    echo=False
                )
                self._postgres_session_factory = sessionmaker(bind=self._postgres_engine)
                self._use_postgresql = True
                print(f"[DATABASE] Using PostgreSQL: {DatabaseConfig.POSTGRES_HOST}:{DatabaseConfig.POSTGRES_PORT}/{DatabaseConfig.POSTGRES_DB}")
            except Exception as e:
                print(f"[WARNING] Failed to connect to PostgreSQL: {e}")
                print("[DATABASE] Falling back to SQLite")
                self._use_postgresql = False
        
        if db_path is None:
            # Use absolute path to ensure database is found
            import os
            current_dir = os.path.dirname(os.path.abspath(__file__))
            self.db_path = os.path.join(current_dir, "kamioi.db")
        else:
            self.db_path = db_path
        
        # Global database lock to prevent concurrent access
        self._db_lock = threading.Lock()
        self._connection_pool = []
        self._max_connections = 5
        
        if not self._use_postgresql:
            self.init_database()
        else:
            print("[DATABASE] PostgreSQL initialized - skipping SQLite init")
    
    def init_database(self):
        """Initialize database with all required tables"""
        # Use with lock to prevent concurrent initialization
        with self._db_lock:
            try:
                conn = sqlite3.connect(self.db_path, timeout=60)
                # Enable WAL mode for better concurrency with large datasets
                conn.execute('PRAGMA journal_mode=WAL')
                # Optimize for large datasets
                conn.execute('PRAGMA cache_size=10000')
                conn.execute('PRAGMA temp_store=MEMORY')
                # Enable UTF-8 support
                conn.execute('PRAGMA encoding="UTF-8"')
                cursor = conn.cursor()
            except sqlite3.OperationalError as e:
                if 'locked' in str(e).lower():
                    print(f"[WARNING] Database is locked, retrying in 2 seconds...")
                    time.sleep(2)
                    try:
                        conn = sqlite3.connect(self.db_path, timeout=60)
                        conn.execute('PRAGMA journal_mode=WAL')
                        conn.execute('PRAGMA cache_size=10000')
                        conn.execute('PRAGMA temp_store=MEMORY')
                        conn.execute('PRAGMA encoding="UTF-8"')
                        cursor = conn.cursor()
                    except sqlite3.OperationalError as e2:
                        print(f"[ERROR] Database still locked after retry.")
                        print(f"[ERROR] Please close any SQLite browser or other processes using kamioi.db")
                        raise Exception(f"Database is locked. Please close other processes accessing kamioi.db: {str(e2)}")
                else:
                    raise
        
        # Users table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                name TEXT NOT NULL,
                account_type TEXT NOT NULL,
                account_number TEXT UNIQUE,
                user_guid TEXT,
                password TEXT,
                city TEXT,
                state TEXT,
                zip_code TEXT,
                phone TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Transactions table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS transactions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                date TIMESTAMP NOT NULL,
                merchant TEXT,
                amount REAL NOT NULL,
                category TEXT,
                description TEXT,
                investable REAL DEFAULT 0,
                round_up REAL DEFAULT 0,
                total_debit REAL NOT NULL,
                ticker TEXT,
                shares REAL,
                price_per_share REAL,
                stock_price REAL,
                status TEXT DEFAULT 'pending',
                fee REAL DEFAULT 0,
                transaction_type TEXT DEFAULT 'bank',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        
        # Goals table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS goals (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                title TEXT NOT NULL,
                target_amount REAL NOT NULL,
                current_amount REAL DEFAULT 0,
                progress REAL DEFAULT 0,
                goal_type TEXT DEFAULT 'personal',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        
        # Portfolios table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS portfolios (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                ticker TEXT NOT NULL,
                shares REAL NOT NULL,
                average_price REAL NOT NULL,
                current_price REAL,
                total_value REAL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        
        # Notifications table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS notifications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                title TEXT NOT NULL,
                message TEXT NOT NULL,
                type TEXT DEFAULT 'info',
                read BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        
        # Market queue table for after-hours transactions
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS market_queue (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                transaction_id INTEGER,
                user_id INTEGER,
                ticker TEXT,
                amount REAL,
                status TEXT DEFAULT 'queued',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                processed_at TIMESTAMP,
                FOREIGN KEY (transaction_id) REFERENCES transactions (id),
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        
        # LLM Mappings table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS llm_mappings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                transaction_id INTEGER,
                merchant_name TEXT NOT NULL,
                ticker TEXT,
                category TEXT,
                confidence REAL DEFAULT 0,
                status TEXT DEFAULT 'pending',
                admin_approved BOOLEAN DEFAULT FALSE,
                ai_processed BOOLEAN DEFAULT FALSE,
                company_name TEXT,
                user_id TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (transaction_id) REFERENCES transactions (id)
            )
        ''')
        
        # Add user_id column if it doesn't exist (for existing databases)
        try:
            cursor.execute('ALTER TABLE llm_mappings ADD COLUMN user_id TEXT')
        except sqlite3.OperationalError:
            # Column already exists, ignore
            pass
        
        # Create indexes for better performance with millions of records
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_llm_mappings_merchant_name ON llm_mappings(merchant_name)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_llm_mappings_ticker ON llm_mappings(ticker)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_llm_mappings_category ON llm_mappings(category)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_llm_mappings_user_id ON llm_mappings(user_id)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_llm_mappings_status ON llm_mappings(status)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_llm_mappings_created_at ON llm_mappings(created_at)')
        
        # System Events table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS system_events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                event_type TEXT NOT NULL,
                tenant_id TEXT NOT NULL,
                tenant_type TEXT NOT NULL,
                data TEXT,
                correlation_id TEXT,
                source TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Round-up Ledger table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS roundup_ledger (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                transaction_id INTEGER NOT NULL,
                round_up_amount REAL NOT NULL,
                fee_amount REAL DEFAULT 0,
                status TEXT DEFAULT 'pending',
                swept_at TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id),
                FOREIGN KEY (transaction_id) REFERENCES transactions (id)
            )
        ''')
        
        # Advertisements table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS advertisements (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                subtitle TEXT,
                description TEXT NOT NULL,
                offer TEXT,
                button_text TEXT DEFAULT 'Learn More',
                link TEXT,
                gradient TEXT DEFAULT 'from-blue-600 to-purple-600',
                target_dashboards TEXT DEFAULT 'user,family',
                start_date TIMESTAMP,
                end_date TIMESTAMP,
                is_active BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Statements table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS statements (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                type TEXT NOT NULL,
                period TEXT NOT NULL,
                date TEXT NOT NULL,
                size TEXT,
                format TEXT DEFAULT 'PDF',
                file_path TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        
        # User Settings table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS user_settings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                setting_key TEXT NOT NULL,
                setting_value TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id),
                UNIQUE(user_id, setting_key)
            )
        ''')
        
        # Admin Settings table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS admin_settings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                setting_key TEXT UNIQUE NOT NULL,
                setting_value TEXT NOT NULL,
                setting_type TEXT DEFAULT 'string',
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Initialize default admin settings
        cursor.execute('''
            INSERT OR IGNORE INTO admin_settings (setting_key, setting_value, setting_type, description)
            VALUES 
                ('platform_fee', '0.25', 'decimal', 'Platform fee per transaction in dollars'),
                ('confidence_threshold', '0.90', 'decimal', 'Auto-approval confidence threshold'),
                ('auto_approval_enabled', 'true', 'boolean', 'Enable automatic approval for high-confidence mappings')
        ''')
        
        # Subscription Plans table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS subscription_plans (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                account_type TEXT NOT NULL,
                tier TEXT NOT NULL,
                price_monthly REAL NOT NULL,
                price_yearly REAL NOT NULL,
                features TEXT,
                limits TEXT,
                is_active BOOLEAN DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # User Subscriptions table with auto-renewal
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS user_subscriptions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                plan_id INTEGER NOT NULL,
                status TEXT NOT NULL,
                billing_cycle TEXT NOT NULL,
                current_period_start TIMESTAMP NOT NULL,
                current_period_end TIMESTAMP NOT NULL,
                next_billing_date TIMESTAMP,
                amount REAL NOT NULL,
                auto_renewal BOOLEAN DEFAULT 1,
                renewal_attempts INTEGER DEFAULT 0,
                last_renewal_attempt TIMESTAMP,
                payment_method_id TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id),
                FOREIGN KEY (plan_id) REFERENCES subscription_plans (id)
            )
        ''')
        
        # Renewal Queue table for processing auto-renewals
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS renewal_queue (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                subscription_id INTEGER NOT NULL,
                scheduled_date TIMESTAMP NOT NULL,
                status TEXT DEFAULT 'pending',
                attempt_count INTEGER DEFAULT 0,
                error_message TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (subscription_id) REFERENCES user_subscriptions (id)
            )
        ''')
        
        # Renewal History table for audit trail
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS renewal_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                subscription_id INTEGER NOT NULL,
                renewal_date TIMESTAMP NOT NULL,
                amount REAL NOT NULL,
                status TEXT NOT NULL,
                payment_method TEXT,
                error_message TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (subscription_id) REFERENCES user_subscriptions (id)
            )
        ''')
        
        # Subscription Analytics table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS subscription_analytics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                plan_id INTEGER NOT NULL,
                metric_name TEXT NOT NULL,
                metric_value REAL NOT NULL,
                date_recorded TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (plan_id) REFERENCES subscription_plans (id)
            )
        ''')
        
        # Subscription Changes table for upgrade/downgrade history
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS subscription_changes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                from_plan_id INTEGER,
                to_plan_id INTEGER NOT NULL,
                change_type TEXT NOT NULL,
                reason TEXT,
                admin_notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id),
                FOREIGN KEY (from_plan_id) REFERENCES subscription_plans (id),
                FOREIGN KEY (to_plan_id) REFERENCES subscription_plans (id)
            )
        ''')
        
        # Promo Codes table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS promo_codes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                code TEXT NOT NULL UNIQUE,
                description TEXT,
                discount_type TEXT NOT NULL DEFAULT 'free_months',
                discount_value INTEGER NOT NULL,
                plan_id INTEGER,
                account_type TEXT,
                max_uses INTEGER,
                current_uses INTEGER DEFAULT 0,
                valid_from TIMESTAMP,
                valid_until TIMESTAMP,
                is_active BOOLEAN DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (plan_id) REFERENCES subscription_plans (id)
            )
        ''')
        
        # Promo Code Usage tracking table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS promo_code_usage (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                promo_code_id INTEGER NOT NULL,
                user_id INTEGER NOT NULL,
                subscription_id INTEGER,
                used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (promo_code_id) REFERENCES promo_codes (id),
                FOREIGN KEY (user_id) REFERENCES users (id),
                FOREIGN KEY (subscription_id) REFERENCES user_subscriptions (id)
            )
        ''')
        
        # Add subscription fields to users table
        try:
            cursor.execute('ALTER TABLE users ADD COLUMN subscription_id INTEGER')
        except sqlite3.OperationalError:
            pass  # Column already exists
        
        try:
            cursor.execute('ALTER TABLE users ADD COLUMN subscription_status TEXT DEFAULT "trial"')
        except sqlite3.OperationalError:
            pass  # Column already exists
            
        try:
            cursor.execute('ALTER TABLE users ADD COLUMN trial_end_date TIMESTAMP')
        except sqlite3.OperationalError:
            pass  # Column already exists
            
        try:
            cursor.execute('ALTER TABLE users ADD COLUMN subscription_tier TEXT')
        except sqlite3.OperationalError:
            pass  # Column already exists
        
        # Add round_up_amount column to users table
        try:
            cursor.execute('ALTER TABLE users ADD COLUMN round_up_amount REAL DEFAULT 1.00')
        except sqlite3.OperationalError:
            pass  # Column already exists
        
        # Add cancellation_requested_at column to user_subscriptions table
        try:
            cursor.execute('ALTER TABLE user_subscriptions ADD COLUMN cancellation_requested_at TIMESTAMP')
        except sqlite3.OperationalError:
            pass  # Column already exists
        
        # NO AUTOMATIC SUBSCRIPTION PLANS - User will add them manually
        # Removed all automatic plan seeding - plans must be created manually through admin interface
        
        conn.commit()
        conn.close()
        print("Database initialized successfully (no subscription plans auto-seeded)")
    
    def get_connection(self):
        """Get database connection (PostgreSQL or SQLite)"""
        if self._use_postgresql and self._postgres_session_factory:
            # Return PostgreSQL session
            return self._postgres_session_factory()
        
        # SQLite connection
        try:
            conn = sqlite3.connect(self.db_path, timeout=30)
            # Enable WAL mode for better concurrency
            conn.execute('PRAGMA journal_mode=WAL')
            conn.execute('PRAGMA cache_size=10000')
            conn.execute('PRAGMA temp_store=MEMORY')
            # Enable UTF-8 support
            conn.execute('PRAGMA encoding="UTF-8"')
            return conn
        except Exception as e:
            raise e
    
    def release_connection(self, conn):
        """Release a database connection and unlock"""
        try:
            if conn:
                if self._use_postgresql:
                    # PostgreSQL session - just close
                    conn.close()
                else:
                    # SQLite connection
                    conn.close()
        finally:
            # Temporarily disable lock release for testing
            # self._db_lock.release()
            pass
    
    def seed_initial_data(self):
        """Seed database with initial data"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # Check if data already exists
        cursor.execute("SELECT COUNT(*) FROM users")
        if cursor.fetchone()[0] > 0:
            print("Database already has data, skipping seed")
            conn.close()
            return
        
        # Insert sample users
        users = [
            (1, 'user@kamioi.com', 'John User', 'user'),
            (2, 'family@kamioi.com', 'Smith Family', 'family'),
            (3, 'business@kamioi.com', 'Tech Corp', 'business'),
            (4, 'admin@kamioi.com', 'Admin User', 'admin')
        ]
        
        cursor.executemany('''
            INSERT OR IGNORE INTO users (id, email, name, account_type)
            VALUES (?, ?, ?, ?)
        ''', users)
        
        # Insert sample transactions
        transactions = [
            (1, 1, '2025-10-08 09:00:00', 'Apple Store', 250.0, 'technology', 'Apple stock purchase', 0.5, 1.0, 251.25, 'AAPL', 0.5, 500.0, 500.0, 'completed', 0.25),
            (2, 1, '2025-10-08 10:00:00', 'Starbucks', 4.75, 'food', 'Morning coffee', 0.25, 1.0, 6.0, 'SBUX', 0.1, 47.5, 47.5, 'completed', 0.25),
            (3, 2, '2025-10-08 20:00:00', 'Family Contribution', 2000.0, 'savings', 'Family Contribution', 0, 0, 2000.0, None, None, None, None, 'completed', 0),
            (4, 3, '2025-10-08 20:00:00', 'Client Payment', 5000.0, 'revenue', 'Client Project Payment', 0, 0, 5000.0, None, None, None, None, 'completed', 0)
        ]
        
        cursor.executemany('''
            INSERT OR IGNORE INTO transactions 
            (id, user_id, date, merchant, amount, category, description, investable, round_up, total_debit, ticker, shares, price_per_share, stock_price, status, fee)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', transactions)
        
        # Insert sample goals
        goals = [
            (1, 1, 'Emergency Fund', 10000.0, 7500.0, 75.0, 'personal'),
            (2, 2, 'Family Vacation', 10000.0, 3000.0, 30.0, 'family'),
            (3, 3, 'Expand Team', 50000.0, 10000.0, 20.0, 'business')
        ]
        
        cursor.executemany('''
            INSERT OR IGNORE INTO goals 
            (id, user_id, title, target_amount, current_amount, progress, goal_type)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', goals)
        
        # Insert sample portfolios
        portfolios = [
            (1, 1, 'AAPL', 0.5, 500.0, 500.0, 250.0),
            (2, 1, 'SBUX', 0.1, 47.5, 47.5, 4.75)
        ]
        
        cursor.executemany('''
            INSERT OR IGNORE INTO portfolios 
            (id, user_id, ticker, shares, average_price, current_price, total_value)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', portfolios)
        
        # Insert sample notifications
        notifications = [
            (1, 1, 'Investment Complete', 'Your Apple stock purchase has been completed', 'success'),
            (2, 1, 'Round-up Ready', 'You have $1.25 ready for investment', 'info'),
            (3, 2, 'Family Goal Update', 'Family vacation fund is 30% complete', 'info'),
            (4, 3, 'Revenue Growth', 'Monthly revenue increased 25% this quarter', 'success')
        ]
        
        cursor.executemany('''
            INSERT OR IGNORE INTO notifications 
            (id, user_id, title, message, type)
            VALUES (?, ?, ?, ?, ?)
        ''', notifications)
        
        conn.commit()
        conn.close()
        print("Initial data seeded successfully")
    
    def get_user_transactions(self, user_id: int, limit: int = 50, offset: int = 0) -> List[Dict]:
        """Get user transactions from database"""
        conn = None
        try:
            conn = self.get_connection()
            user_id = int(user_id)
            
            if self._use_postgresql:
                # PostgreSQL via SQLAlchemy
                from sqlalchemy import text
                query = text('''
                    SELECT * FROM transactions 
                    WHERE user_id = :user_id 
                    ORDER BY date DESC, id DESC
                    LIMIT :limit OFFSET :offset
                ''')
                result = conn.execute(query, {'user_id': user_id, 'limit': limit, 'offset': offset})
                transactions = [dict(row._mapping) for row in result]
                return transactions
            else:
                # SQLite
                cursor = conn.cursor()
                cursor.execute('''
                    SELECT * FROM transactions 
                    WHERE user_id = ? 
                    ORDER BY date DESC, id DESC
                    LIMIT ? OFFSET ?
                ''', (user_id, limit, offset))
                
                columns = [description[0] for description in cursor.description]
                transactions = [dict(zip(columns, row)) for row in cursor.fetchall()]
                return transactions
        except Exception as e:
            import traceback
            print(f"[ERROR] get_user_transactions failed: {e}")
            print(f"[ERROR] Traceback: {traceback.format_exc()}")
            return []
        finally:
            if conn:
                self.release_connection(conn)
    
    def get_user_dashboard_overview(self, user_id: int) -> Dict:
        """Get user dashboard overview from database"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # Get portfolio value
        cursor.execute('''
            SELECT SUM(total_value) as portfolio_value 
            FROM portfolios 
            WHERE user_id = ?
        ''', (user_id,))
        portfolio_result = cursor.fetchone()
        portfolio_value = portfolio_result[0] or 0
        
        # Get total invested
        cursor.execute('''
            SELECT SUM(round_up) as total_invested 
            FROM transactions 
            WHERE user_id = ? AND status = 'completed'
        ''', (user_id,))
        invested_result = cursor.fetchone()
        total_invested = invested_result[0] or 0
        
        # Calculate gains
        total_gains = portfolio_value - total_invested
        gain_percentage = (total_gains / total_invested * 100) if total_invested > 0 else 0
        
        # Get goals progress
        cursor.execute('''
            SELECT * FROM goals 
            WHERE user_id = ? 
            ORDER BY created_at DESC
        ''', (user_id,))
        goals = [dict(zip([desc[0] for desc in cursor.description], row)) for row in cursor.fetchall()]
        
        conn.close()
        
        return {
            'portfolio_value': portfolio_value,
            'total_invested': total_invested,
            'total_gains': total_gains,
            'gain_percentage': gain_percentage,
            'goals_progress': goals,
            'recent_transactions': []
        }
    
    def get_user_roundups_total(self, user_id: int) -> Dict:
        """Get user round-up totals from database"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # Total round-ups
        cursor.execute('''
            SELECT SUM(round_up) as total_roundups 
            FROM transactions 
            WHERE user_id = ? AND status = 'completed'
        ''', (user_id,))
        total_result = cursor.fetchone()
        total_roundups = total_result[0] or 0
        
        # Monthly round-ups
        cursor.execute('''
            SELECT SUM(round_up) as monthly_roundups 
            FROM transactions 
            WHERE user_id = ? AND status = 'completed' 
            AND date >= datetime('now', '-30 days')
        ''', (user_id,))
        monthly_result = cursor.fetchone()
        monthly_roundups = monthly_result[0] or 0
        
        # Count
        cursor.execute('''
            SELECT COUNT(*) as roundups_count 
            FROM transactions 
            WHERE user_id = ? AND status = 'completed' AND round_up > 0
        ''', (user_id,))
        count_result = cursor.fetchone()
        roundups_count = count_result[0] or 0
        
        conn.close()
        
        return {
            'total_roundups': total_roundups,
            'monthly_roundups': monthly_roundups,
            'roundups_count': roundups_count
        }
    
    def get_user_fees_total(self, user_id: int) -> Dict:
        """Get user fee totals from database"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # Total fees
        cursor.execute('''
            SELECT SUM(fee) as total_fees 
            FROM transactions 
            WHERE user_id = ? AND status = 'completed'
        ''', (user_id,))
        total_result = cursor.fetchone()
        total_fees = total_result[0] or 0
        
        # Monthly fees
        cursor.execute('''
            SELECT SUM(fee) as monthly_fees 
            FROM transactions 
            WHERE user_id = ? AND status = 'completed' 
            AND date >= datetime('now', '-30 days')
        ''', (user_id,))
        monthly_result = cursor.fetchone()
        monthly_fees = monthly_result[0] or 0
        
        # Count
        cursor.execute('''
            SELECT COUNT(*) as fees_count 
            FROM transactions 
            WHERE user_id = ? AND status = 'completed' AND fee > 0
        ''', (user_id,))
        count_result = cursor.fetchone()
        fees_count = count_result[0] or 0
        
        conn.close()
        
        return {
            'total_fees': total_fees,
            'monthly_fees': monthly_fees,
            'fees_count': fees_count
        }
    
    def add_transaction(self, user_id: int, transaction_data: Dict) -> int:
        """Add a new transaction to the database"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # Ensure columns exist (for databases created before schema updates)
        try:
            # Check if columns exist, if not add them
            cursor.execute("PRAGMA table_info(transactions)")
            columns = [row[1] for row in cursor.fetchall()]
            if 'shares' not in columns:
                cursor.execute('ALTER TABLE transactions ADD COLUMN shares REAL')
            if 'price_per_share' not in columns:
                cursor.execute('ALTER TABLE transactions ADD COLUMN price_per_share REAL')
            if 'stock_price' not in columns:
                cursor.execute('ALTER TABLE transactions ADD COLUMN stock_price REAL')
            if 'transaction_type' not in columns:
                cursor.execute('ALTER TABLE transactions ADD COLUMN transaction_type TEXT DEFAULT "bank"')
            conn.commit()
        except Exception as e:
            print(f"[WARNING] Could not verify/add columns: {e}")
            conn.rollback()
        
        # Use safe INSERT that only includes columns we have values for
        base_fields = ['user_id', 'date', 'merchant', 'amount', 'category', 'description', 
                      'investable', 'round_up', 'total_debit', 'status', 'fee', 'transaction_type']
        optional_fields = ['ticker', 'shares', 'price_per_share', 'stock_price']
        
        # Build dynamic INSERT based on available data
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
            transaction_data.get('fee', 0),
            transaction_data.get('transaction_type', 'bank')  # Default to 'bank' if not specified
        ]
        
        # Add optional fields only if they exist in transaction_data
        for field in optional_fields:
            if field in transaction_data and transaction_data[field] is not None:
                fields.append(field)
                values.append(transaction_data[field])
        
        placeholders = ', '.join(['?' for _ in fields])
        fields_str = ', '.join(fields)
        
        print(f"[DEBUG] add_transaction - user_id: {user_id} (type: {type(user_id)})")
        print(f"[DEBUG] add_transaction - INSERT INTO transactions ({fields_str})")
        print(f"[DEBUG] add_transaction - VALUES: {values}")
        
        cursor.execute(f'''
            INSERT INTO transactions ({fields_str})
            VALUES ({placeholders})
        ''', tuple(values))
        
        transaction_id = cursor.lastrowid
        print(f"[DEBUG] add_transaction - Transaction inserted with ID: {transaction_id}")
        conn.commit()
        
        # Verify the transaction was saved correctly
        cursor.execute('SELECT user_id, merchant, amount FROM transactions WHERE id = ?', (transaction_id,))
        verify = cursor.fetchone()
        if verify:
            print(f"[DEBUG] add_transaction - Verified: user_id={verify[0]}, merchant={verify[1]}, amount={verify[2]}")
        else:
            print(f"[DEBUG] add_transaction - WARNING: Transaction {transaction_id} not found after insert!")
        
        conn.close()
        
        return transaction_id
    
    def get_all_transactions_for_admin(self, limit: int = None, offset: int = 0) -> List[Dict]:
        """Get transactions for admin dashboard with pagination support"""
        conn = self.get_connection()
        
        if self._use_postgresql:
            from sqlalchemy import text
            query = '''
                SELECT t.*, u.name as user_name, u.account_type, u.account_number 
                FROM transactions t
                JOIN users u ON t.user_id = u.id
                ORDER BY t.date DESC
            '''
            if limit:
                query += f' LIMIT {limit} OFFSET {offset}'
            result = conn.execute(text(query))
            rows = result.fetchall()
            # Convert Row objects to dictionaries
            if rows:
                # Get column names from result keys
                columns = list(rows[0]._mapping.keys())
                transactions = []
                for row in rows:
                    # Convert row to dict using column names
                    row_dict = {}
                    for i, col in enumerate(columns):
                        row_dict[col] = row[i] if hasattr(row, '__getitem__') else getattr(row, col, None)
                    transactions.append(row_dict)
            else:
                transactions = []
            self.release_connection(conn)
        else:
            cursor = conn.cursor()
            query = '''
                SELECT t.*, u.name as user_name, u.account_type, u.account_number 
                FROM transactions t
                JOIN users u ON t.user_id = u.id
                ORDER BY t.date DESC
            '''
            if limit:
                query += f' LIMIT {limit} OFFSET {offset}'
            cursor.execute(query)
            columns = [description[0] for description in cursor.description]
            transactions = [dict(zip(columns, row)) for row in cursor.fetchall()]
            conn.close()
        
        # Use existing round-up values from database, or calculate defaults if missing
        for transaction in transactions:
            amount = float(transaction.get('amount', 0))
            
            # Use existing round_up from database if available, otherwise calculate default
            if transaction.get('round_up') is not None and transaction.get('round_up') > 0:
                round_up = float(transaction.get('round_up'))
            elif amount > 1.0:
                round_up = 1.00  # Default for transactions over $1.00
            else:
                round_up = 0.00
            
            # Use existing fee from database if available, otherwise calculate default
            if transaction.get('fee') is not None:
                platform_fee = float(transaction.get('fee'))
            elif round_up > 0:
                platform_fee = 0.25  # Default platform fee
            else:
                platform_fee = 0.00
            
            # Use existing total_debit from database if available, otherwise calculate
            if transaction.get('total_debit') is not None and transaction.get('total_debit') > 0:
                total_debit = float(transaction.get('total_debit'))
            else:
                total_debit = amount + round_up + platform_fee
            
            # Use existing investable from database if available, otherwise use round_up
            if transaction.get('investable') is not None:
                investable = float(transaction.get('investable'))
            else:
                investable = round_up
            
            # Update transaction with values (preserving database values when available)
            transaction['round_up'] = round_up
            transaction['platform_fee'] = platform_fee
            transaction['fee'] = platform_fee  # Also set 'fee' field for consistency
            transaction['total_debit'] = total_debit
            transaction['investable'] = investable
            
            # Set dashboard type based on user account type
            account_type = transaction.get('account_type', 'user')
            if account_type == 'family':
                transaction['dashboard'] = 'F'
            elif account_type == 'business':
                transaction['dashboard'] = 'B'
            else:
                transaction['dashboard'] = 'U'
        
        return transactions
    
    def get_transaction_count(self, exclude_user_id: int = None) -> int:
        """Get total count of transactions (for pagination)"""
        conn = self.get_connection()
        
        try:
            if self._use_postgresql:
                from sqlalchemy import text
                if exclude_user_id:
                    result = conn.execute(text('SELECT COUNT(*) FROM transactions WHERE user_id != :exclude_id'), 
                                        {'exclude_id': exclude_user_id})
                else:
                    result = conn.execute(text('SELECT COUNT(*) FROM transactions'))
                count = result.scalar()
                self.release_connection(conn)
            else:
                cursor = conn.cursor()
                if exclude_user_id:
                    cursor.execute('SELECT COUNT(*) FROM transactions WHERE user_id != ?', (exclude_user_id,))
                else:
                    cursor.execute('SELECT COUNT(*) FROM transactions')
                count = cursor.fetchone()[0]
                conn.close()
            return count
        except Exception as e:
            print(f"Error getting transaction count: {e}")
            if self._use_postgresql:
                self.release_connection(conn)
            else:
                conn.close()
            return 0
    
    def log_system_event(self, event_type: str, tenant_id: str, tenant_type: str, data: Dict = None, correlation_id: str = None, source: str = None):
        """Log system event to database"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO system_events 
            (event_type, tenant_id, tenant_type, data, correlation_id, source)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (
            event_type,
            tenant_id,
            tenant_type,
            json.dumps(data) if data else None,
            correlation_id,
            source
        ))
        
        conn.commit()
        self.release_connection(conn)
    
    def add_llm_mapping(self, transaction_id, merchant_name, ticker, category, confidence, status, admin_approved=False, ai_processed=False, company_name=None, user_id=None):
        """Add a new LLM mapping to the database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO llm_mappings 
            (transaction_id, merchant_name, ticker, category, confidence, status, admin_approved, ai_processed, company_name, user_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            transaction_id,
            merchant_name,
            ticker,
            category,
            confidence,
            status,
            admin_approved,
            ai_processed,
            company_name,
            user_id
        ))
        
        mapping_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return mapping_id
    
    def add_llm_mappings_batch(self, mappings_data):
        """Add multiple LLM mappings in a single batch for better performance - OPTIMIZED"""
        if not mappings_data:
            return 0
        
        try:
            conn = sqlite3.connect(self.db_path, timeout=60)
            cursor = conn.cursor()
            
            # Optimize database for bulk inserts
            cursor.execute('PRAGMA journal_mode=WAL')
            cursor.execute('PRAGMA synchronous=OFF')
            cursor.execute('PRAGMA cache_size=10000')
            cursor.execute('PRAGMA temp_store=MEMORY')
            cursor.execute('PRAGMA locking_mode=EXCLUSIVE')
            
            # Use prepared statement for better performance
            cursor.executemany('''
                INSERT INTO llm_mappings 
                (transaction_id, merchant_name, ticker, category, confidence, status, admin_approved, ai_processed, company_name, user_id, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
            ''', mappings_data)
            
            # SQLite's rowcount is unreliable with executemany, so use the actual count
            # Verify by checking the inserted count if possible, otherwise trust the input count
            conn.commit()
            
            # Verify insertion by checking count (optional, for debugging)
            try:
                cursor.execute('SELECT COUNT(*) FROM llm_mappings WHERE user_id = 2')
                # This gives total count, not just this batch, so we'll use input count
            except:
                pass
            
            conn.close()
            
            # Return the count we attempted to insert (SQLite executemany should insert all or fail)
            inserted_count = len(mappings_data)
            print(f"[BATCH INSERT] Inserted {inserted_count} mappings")
            return inserted_count
        except Exception as e:
            print(f"[BATCH INSERT ERROR] Failed to insert batch: {e}")
            import traceback
            traceback.print_exc()
            if 'conn' in locals():
                try:
                    conn.close()
                except:
                    pass
            raise
    
    def get_llm_mappings(self, user_id=None, status=None):
        """Get LLM mappings from the database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        query = 'SELECT * FROM llm_mappings WHERE 1=1'
        params = []
        
        if user_id:
            query += ' AND user_id = ?'
            params.append(user_id)
        
        if status:
            query += ' AND status = ?'
            params.append(status)
        
        query += ' ORDER BY created_at DESC'
        
        cursor.execute(query, params)
        mappings = cursor.fetchall()
        
        # Convert to list of dictionaries
        columns = [description[0] for description in cursor.description]
        result = []
        for mapping in mappings:
            mapping_dict = dict(zip(columns, mapping))
            result.append(mapping_dict)
        
        conn.close()
        return result
    
    def get_llm_mappings_paginated(self, user_id=None, status=None, limit=20, offset=0, exclude_bulk_uploads=False):
        """Get LLM mappings with pagination, including user information"""
        conn = sqlite3.connect(self.db_path, timeout=30)
        conn.execute('PRAGMA journal_mode=WAL')
        cursor = conn.cursor()
        
        # Build query with JOIN to users table
        query = '''
            SELECT 
                lm.*,
                u.email as user_email,
                u.account_number as user_account_number,
                u.name as user_name
            FROM llm_mappings lm
            LEFT JOIN users u ON lm.user_id = u.id
            WHERE 1=1
        '''
        params = []
        
        if user_id:
            query += ' AND lm.user_id = ?'
            params.append(user_id)
        
        if status:
            query += ' AND lm.status = ?'
            params.append(status)
            # If status is 'pending', 'pending-approval', or 'approved', automatically exclude bulk uploads
            # This ensures Approved Mappings only shows user submissions that were approved (not bulk uploads)
            if status in ['pending', 'pending-approval', 'approved']:
                query += ' AND lm.user_id != ?'
                params.append(2)
        
        # Exclude bulk uploads (user_id=2) if requested
        if exclude_bulk_uploads:
            query += ' AND lm.user_id != ?'
            params.append(2)
        
        query += ' ORDER BY lm.created_at DESC LIMIT ? OFFSET ?'
        params.extend([limit, offset])
        
        cursor.execute(query, params)
        mappings = cursor.fetchall()
        
        # Convert to list of dictionaries
        columns = [description[0] for description in cursor.description]
        result = []
        for mapping in mappings:
            mapping_dict = dict(zip(columns, mapping))
            
            # Correct company_name if ticker lookup is available
            try:
                from ticker_company_lookup import get_company_name_from_ticker, validate_ticker_company_match
                ticker = mapping_dict.get('ticker')
                current_company = mapping_dict.get('company_name') or mapping_dict.get('merchant_name', '')
                if ticker:
                    validation = validate_ticker_company_match(ticker, current_company)
                    if validation['needs_correction'] and validation['correct_company_name']:
                        mapping_dict['company_name'] = validation['correct_company_name']
                    elif not mapping_dict.get('company_name'):
                        correct_name = get_company_name_from_ticker(ticker)
                        if correct_name:
                            mapping_dict['company_name'] = correct_name
            except ImportError:
                pass  # Lookup not available, use database value as-is
            
            result.append(mapping_dict)
        
        conn.close()
        return result
    
    def get_llm_mappings_count(self, user_id=None, status=None, search=None, exclude_bulk_uploads=False):
        """Get total count of LLM mappings"""
        conn = sqlite3.connect(self.db_path, timeout=30)
        conn.execute('PRAGMA journal_mode=WAL')
        cursor = conn.cursor()
        
        if search:
            query = '''
                SELECT COUNT(*) FROM llm_mappings 
                WHERE (merchant_name LIKE ? OR ticker LIKE ? OR category LIKE ? OR company_name LIKE ?)
            '''
            search_pattern = f'%{search}%'
            cursor.execute(query, (search_pattern, search_pattern, search_pattern, search_pattern))
        else:
            query = 'SELECT COUNT(*) FROM llm_mappings WHERE 1=1'
            params = []
            
            if user_id:
                query += ' AND user_id = ?'
                params.append(user_id)
            
            if status:
                query += ' AND status = ?'
                params.append(status)
                # If status is 'pending', 'pending-approval', or 'approved', automatically exclude bulk uploads
                # This ensures Approved Mappings only shows user submissions that were approved (not bulk uploads)
                if status in ['pending', 'pending-approval', 'approved']:
                    query += ' AND user_id != ?'
                    params.append(2)
            
            # Exclude bulk uploads (user_id=2) if requested
            if exclude_bulk_uploads:
                query += ' AND user_id != ?'
                params.append(2)
            
            cursor.execute(query, params)
        
        count = cursor.fetchone()[0]
        conn.close()
        return count
    
    def search_llm_mappings(self, search_term, limit=50):
        """Search LLM mappings by merchant name, ticker, or category, including user information"""
        conn = sqlite3.connect(self.db_path, timeout=30)
        conn.execute('PRAGMA journal_mode=WAL')
        cursor = conn.cursor()
        
        # Search in merchant_name, ticker, category, and company_name with JOIN to users table
        query = '''
            SELECT 
                lm.*,
                u.email as user_email,
                u.account_number as user_account_number,
                u.name as user_name
            FROM llm_mappings lm
            LEFT JOIN users u ON lm.user_id = u.id
            WHERE lm.merchant_name LIKE ? 
               OR lm.ticker LIKE ? 
               OR lm.category LIKE ? 
               OR lm.company_name LIKE ?
            ORDER BY lm.created_at DESC
            LIMIT ?
        '''
        
        search_pattern = f'%{search_term}%'
        cursor.execute(query, (search_pattern, search_pattern, search_pattern, search_pattern, limit))
        mappings = cursor.fetchall()
        
        # Convert to list of dictionaries
        columns = [description[0] for description in cursor.description]
        result = []
        for mapping in mappings:
            mapping_dict = dict(zip(columns, mapping))
            
            # Correct company_name if ticker lookup is available
            try:
                from ticker_company_lookup import get_company_name_from_ticker, validate_ticker_company_match
                ticker = mapping_dict.get('ticker')
                current_company = mapping_dict.get('company_name') or mapping_dict.get('merchant_name', '')
                if ticker:
                    validation = validate_ticker_company_match(ticker, current_company)
                    if validation['needs_correction'] and validation['correct_company_name']:
                        mapping_dict['company_name'] = validation['correct_company_name']
                    elif not mapping_dict.get('company_name'):
                        correct_name = get_company_name_from_ticker(ticker)
                        if correct_name:
                            mapping_dict['company_name'] = correct_name
            except ImportError:
                pass  # Lookup not available, use database value as-is
            
            result.append(mapping_dict)
        
        conn.close()
        return result
    
    def update_llm_mapping_status(self, mapping_id, status, admin_approved=None):
        """Update the status of an LLM mapping"""
        if self._use_postgresql:
            from sqlalchemy import text
            conn = self.get_connection()
            try:
                if admin_approved is not None:
                    conn.execute(text('''
                        UPDATE llm_mappings 
                        SET status = :status, admin_approved = :admin_approved
                        WHERE id = :mapping_id
                    '''), {'status': status, 'admin_approved': admin_approved, 'mapping_id': mapping_id})
                else:
                    conn.execute(text('''
                        UPDATE llm_mappings 
                        SET status = :status
                        WHERE id = :mapping_id
                    '''), {'status': status, 'mapping_id': mapping_id})
                conn.commit()
                self.release_connection(conn)
            except Exception as e:
                self.release_connection(conn)
                raise e
        else:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            if admin_approved is not None:
                cursor.execute('''
                    UPDATE llm_mappings 
                    SET status = ?, admin_approved = ?
                    WHERE id = ?
                ''', (status, admin_approved, mapping_id))
            else:
                cursor.execute('''
                    UPDATE llm_mappings 
                    SET status = ?
                    WHERE id = ?
                ''', (status, mapping_id))
            
            conn.commit()
            conn.close()
        
        return True
    
    def get_mapping_by_transaction_id(self, transaction_id):
        """Get mapping details by transaction ID"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT * FROM llm_mappings 
            WHERE transaction_id = ?
            ORDER BY created_at DESC
            LIMIT 1
        ''', (transaction_id,))
        
        mapping = cursor.fetchone()
        
        if mapping:
            # Get column names
            cursor.execute("PRAGMA table_info(llm_mappings)")
            columns = [column[1] for column in cursor.fetchall()]
            
            # Convert to dictionary
            mapping_dict = dict(zip(columns, mapping))
            conn.close()
            return mapping_dict
        
        conn.close()
        return None
    
    def remove_llm_mapping(self, mapping_id):
        """Remove an LLM mapping by ID"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('DELETE FROM llm_mappings WHERE id = ?', (mapping_id,))
        conn.commit()
        conn.close()
        
        return True
    
    def get_user_active_ad(self, user_id):
        """Get active advertisement for a user"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT * FROM advertisements 
            WHERE is_active = 1 
            ORDER BY created_at DESC 
            LIMIT 1
        ''')
        
        ad = cursor.fetchone()
        
        if ad:
            # Get column names
            cursor.execute("PRAGMA table_info(advertisements)")
            columns = [column[1] for column in cursor.fetchall()]
            
            # Convert to dictionary
            ad_dict = dict(zip(columns, ad))
            conn.close()
            return ad_dict
        
        conn.close()
        return None

    def migrate_user_account_numbers(self):
        """Migrate existing users to have account numbers"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            # Get users without account numbers
            cursor.execute("SELECT id, account_type FROM users WHERE account_number IS NULL")
            users_without_numbers = cursor.fetchall()
            
            for user_id, account_type in users_without_numbers:
                # Generate account number
                account_number = self.generate_account_number(account_type)
                
                # Update user with account number
                cursor.execute(
                    "UPDATE users SET account_number = ? WHERE id = ?", 
                    (account_number, user_id)
                )
            
            conn.commit()
            conn.close()
            print(f"Migrated {len(users_without_numbers)} users with account numbers")
            return True
        except Exception as e:
            print(f"Error migrating account numbers: {e}")
            return False

    def migrate_user_address_fields(self):
        """Add address fields to existing users table"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            # Check if columns already exist
            cursor.execute("PRAGMA table_info(users)")
            columns = [column[1] for column in cursor.fetchall()]
            
            # Add missing columns
            if 'city' not in columns:
                cursor.execute("ALTER TABLE users ADD COLUMN city TEXT")
            if 'state' not in columns:
                cursor.execute("ALTER TABLE users ADD COLUMN state TEXT")
            if 'zip_code' not in columns:
                cursor.execute("ALTER TABLE users ADD COLUMN zip_code TEXT")
            if 'phone' not in columns:
                cursor.execute("ALTER TABLE users ADD COLUMN phone TEXT")
            
            conn.commit()
            conn.close()
            print("Successfully added address fields to users table")
            return True
        except Exception as e:
            print(f"Error adding address fields: {e}")
            return False

    def generate_account_number(self, account_type):
        """Generate unique account number with prefix"""
        import random
        
        # Define prefixes
        prefixes = {
            'individual': 'I',
            'family': 'F', 
            'business': 'B'
        }
        
        prefix = prefixes.get(account_type, 'I')
        
        # Generate 7-digit number
        while True:
            number = random.randint(1000000, 9999999)
            account_number = f"{prefix}{number}"
            
            # Check if unique
            conn = self.get_connection()
            cursor = conn.cursor()
            cursor.execute('SELECT id FROM users WHERE account_number = ?', (account_number,))
            existing = cursor.fetchone()
            conn.close()
            
            if not existing:
                return account_number

    def delete_user(self, user_id):
        """Delete a user and all associated data"""
        conn = None
        try:
            conn = self.get_connection()
            cursor = conn.cursor()

            # Use correct placeholder based on database type
            placeholder = '%s' if self._use_postgresql else '?'

            # Delete in order to respect foreign key constraints
            # Delete from all tables that reference user_id

            # Delete promo code usage
            cursor.execute(f"DELETE FROM promo_code_usage WHERE user_id = {placeholder}", (user_id,))

            # Delete subscription changes
            cursor.execute(f"DELETE FROM subscription_changes WHERE user_id = {placeholder}", (user_id,))

            # Delete user subscriptions
            cursor.execute(f"DELETE FROM user_subscriptions WHERE user_id = {placeholder}", (user_id,))

            # Delete user settings
            cursor.execute(f"DELETE FROM user_settings WHERE user_id = {placeholder}", (user_id,))

            # Delete statements
            cursor.execute(f"DELETE FROM statements WHERE user_id = {placeholder}", (user_id,))

            # Delete roundup ledger
            cursor.execute(f"DELETE FROM roundup_ledger WHERE user_id = {placeholder}", (user_id,))

            # Delete market queue
            cursor.execute(f"DELETE FROM market_queue WHERE user_id = {placeholder}", (user_id,))

            # Delete notifications
            cursor.execute(f"DELETE FROM notifications WHERE user_id = {placeholder}", (user_id,))

            # Delete transactions
            cursor.execute(f"DELETE FROM transactions WHERE user_id = {placeholder}", (user_id,))

            # Delete goals
            cursor.execute(f"DELETE FROM goals WHERE user_id = {placeholder}", (user_id,))

            # Delete portfolios
            cursor.execute(f"DELETE FROM portfolios WHERE user_id = {placeholder}", (user_id,))

            # Delete LLM mappings (user_id is TEXT in this table)
            cursor.execute(f"DELETE FROM llm_mappings WHERE user_id = {placeholder}", (str(user_id),))

            # Delete user
            cursor.execute(f"DELETE FROM users WHERE id = {placeholder}", (user_id,))

            conn.commit()
            return True
        except Exception as e:
            print(f"Error deleting user {user_id}: {e}")
            if conn:
                try:
                    conn.rollback()
                except:
                    pass
            return False
        finally:
            if conn:
                try:
                    conn.close()
                except:
                    pass

# Global database manager instance - lazy initialization
_db_manager_instance = None

def get_db_manager():
    """Get or create the global database manager instance"""
    global _db_manager_instance
    if _db_manager_instance is None:
        _db_manager_instance = DatabaseManager()
    return _db_manager_instance

# Create instance at import time but with error handling
try:
    db_manager = DatabaseManager()
except Exception as e:
    print(f"[WARNING] Failed to initialize database manager at import time: {e}")
    print(f"[INFO] Database manager will be initialized on first use")
    db_manager = None

# Fallback function
def _ensure_db_manager():
    """Ensure db_manager is initialized"""
    global db_manager
    if db_manager is None:
        try:
            db_manager = DatabaseManager()
        except Exception as e:
            print(f"[ERROR] Failed to initialize database: {e}")
            raise
    return db_manager
