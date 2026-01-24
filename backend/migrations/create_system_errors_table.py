"""
Migration: Create system_errors table for error tracking

Run with: python migrations/create_system_errors_table.py
"""

import os
import sys

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database_manager import db_manager


def create_system_errors_table():
    """Create the system_errors table for error tracking"""
    print("=" * 60)
    print("Creating system_errors table...")
    print("=" * 60)

    conn = db_manager.get_connection()
    use_postgresql = getattr(db_manager, '_use_postgresql', False)

    try:
        if use_postgresql:
            from sqlalchemy import text
            conn.execute(text('''
                CREATE TABLE IF NOT EXISTS system_errors (
                    id SERIAL PRIMARY KEY,
                    error_type VARCHAR(100) NOT NULL,
                    error_message TEXT NOT NULL,
                    error_stack TEXT,
                    endpoint VARCHAR(255),
                    http_method VARCHAR(10),
                    user_id INTEGER,
                    admin_id INTEGER,
                    request_data TEXT,
                    severity VARCHAR(20) DEFAULT 'error',
                    is_resolved BOOLEAN DEFAULT FALSE,
                    resolved_at TIMESTAMP,
                    resolved_by INTEGER,
                    resolution_notes TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            '''))
            conn.commit()
            print("[OK] Created system_errors table (PostgreSQL)")

            # Create indexes
            conn.execute(text('CREATE INDEX IF NOT EXISTS idx_system_errors_type ON system_errors(error_type)'))
            conn.execute(text('CREATE INDEX IF NOT EXISTS idx_system_errors_severity ON system_errors(severity)'))
            conn.execute(text('CREATE INDEX IF NOT EXISTS idx_system_errors_resolved ON system_errors(is_resolved)'))
            conn.execute(text('CREATE INDEX IF NOT EXISTS idx_system_errors_created ON system_errors(created_at)'))
            conn.commit()
            print("[OK] Created indexes")

            db_manager.release_connection(conn)
        else:
            cur = conn.cursor()
            cur.execute('''
                CREATE TABLE IF NOT EXISTS system_errors (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    error_type TEXT NOT NULL,
                    error_message TEXT NOT NULL,
                    error_stack TEXT,
                    endpoint TEXT,
                    http_method TEXT,
                    user_id INTEGER,
                    admin_id INTEGER,
                    request_data TEXT,
                    severity TEXT DEFAULT 'error',
                    is_resolved INTEGER DEFAULT 0,
                    resolved_at TEXT,
                    resolved_by INTEGER,
                    resolution_notes TEXT,
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            conn.commit()
            print("[OK] Created system_errors table (SQLite)")

            # Create indexes
            cur.execute('CREATE INDEX IF NOT EXISTS idx_system_errors_type ON system_errors(error_type)')
            cur.execute('CREATE INDEX IF NOT EXISTS idx_system_errors_severity ON system_errors(severity)')
            cur.execute('CREATE INDEX IF NOT EXISTS idx_system_errors_resolved ON system_errors(is_resolved)')
            cur.execute('CREATE INDEX IF NOT EXISTS idx_system_errors_created ON system_errors(created_at)')
            conn.commit()
            print("[OK] Created indexes")

            conn.close()

        print("\n[SUCCESS] system_errors table created successfully!")
        return True

    except Exception as e:
        print(f"[ERROR] Failed to create system_errors table: {e}")
        return False


if __name__ == "__main__":
    create_system_errors_table()
