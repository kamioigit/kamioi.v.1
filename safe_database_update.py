import sqlite3
import json
from datetime import datetime

def update_database_schema():
    """Safely update database schema for AI fee system"""
    try:
        conn = sqlite3.connect('kamioi.db')
        cursor = conn.cursor()
        
        print("Updating database schema for AI fee system...")
        
        # Check existing columns
        cursor.execute("PRAGMA table_info(users)")
        existing_columns = [col[1] for col in cursor.fetchall()]
        print(f"Existing columns: {existing_columns}")
        
        # Add missing columns to users table
        new_columns = [
            ("tier_reset_date", "DATE"),
            ("loyalty_score", "DECIMAL(3,2) DEFAULT 0.0"),
            ("risk_profile", "VARCHAR(20) DEFAULT 'medium'"),
            ("ai_fee_multiplier", "DECIMAL(3,2) DEFAULT 1.0"),
            ("last_tier_check", "DATE"),
            ("total_lifetime_transactions", "INTEGER DEFAULT 0"),
            ("avg_monthly_transactions", "DECIMAL(5,2) DEFAULT 0.0")
        ]
        
        for col_name, col_type in new_columns:
            if col_name not in existing_columns:
                try:
                    cursor.execute(f"ALTER TABLE users ADD COLUMN {col_name} {col_type}")
                    print(f"SUCCESS: Added column: {col_name}")
                except sqlite3.OperationalError as e:
                    print(f"WARNING: Column {col_name} might already exist: {e}")
        
        # Create fee_tiers table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS fee_tiers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                account_type VARCHAR(20) NOT NULL,
                tier_level INTEGER NOT NULL,
                min_transactions INTEGER NOT NULL,
                max_transactions INTEGER,
                base_fee DECIMAL(5,2) NOT NULL,
                fee_type VARCHAR(10) NOT NULL,
                ai_adjustments TEXT,
                is_active BOOLEAN DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        print("SUCCESS: Created fee_tiers table")
        
        # Create AI fee history table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS ai_fee_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                transaction_id INTEGER NOT NULL,
                base_fee DECIMAL(5,2) NOT NULL,
                ai_adjustments TEXT,
                final_fee DECIMAL(5,2) NOT NULL,
                ai_factors TEXT,
                tier_at_time INTEGER DEFAULT 1,
                loyalty_score_at_time DECIMAL(3,2) DEFAULT 0.0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (transaction_id) REFERENCES transactions(id)
            )
        """)
        print("SUCCESS: Created ai_fee_history table")
        
        # Create market conditions table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS market_conditions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date DATE NOT NULL,
                volatility DECIMAL(5,4) NOT NULL,
                competitor_fees TEXT,
                market_sentiment VARCHAR(20) DEFAULT 'neutral',
                ai_recommendations TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        print("SUCCESS: Created market_conditions table")
        
        # Create user behavior analytics table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS user_behavior_analytics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                date DATE NOT NULL,
                transaction_frequency INTEGER DEFAULT 0,
                avg_transaction_amount DECIMAL(10,2) DEFAULT 0.0,
                behavior_score DECIMAL(3,2) DEFAULT 0.0,
                retention_risk DECIMAL(3,2) DEFAULT 0.0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        """)
        print("SUCCESS: Created user_behavior_analytics table")
        
        # Create AI recommendations table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS ai_recommendations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                recommendation_type VARCHAR(50) NOT NULL,
                current_value DECIMAL(5,2) NOT NULL,
                recommended_value DECIMAL(5,2) NOT NULL,
                confidence_score DECIMAL(3,2) NOT NULL,
                reasoning TEXT,
                is_applied BOOLEAN DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        """)
        print("SUCCESS: Created ai_recommendations table")
        
        # Insert default fee tiers if they don't exist
        cursor.execute("SELECT COUNT(*) FROM fee_tiers")
        if cursor.fetchone()[0] == 0:
            print("Inserting default fee tiers...")
            
            # Individual Account Tiers
            individual_tiers = [
                (1, 0, 10, 0.25, 'fixed'),
                (2, 11, 25, 0.20, 'fixed'),
                (3, 26, 50, 0.15, 'fixed'),
                (4, 51, 100, 0.10, 'fixed'),
                (5, 101, None, 0.05, 'fixed')
            ]
            
            for tier_level, min_trans, max_trans, base_fee, fee_type in individual_tiers:
                ai_adjustments = json.dumps({
                    "loyalty_bonus": 0.02,
                    "frequency_bonus": 0.01,
                    "volume_bonus": 0.03
                })
                cursor.execute("""
                    INSERT INTO fee_tiers (account_type, tier_level, min_transactions, max_transactions, base_fee, fee_type, ai_adjustments)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                """, ('individual', tier_level, min_trans, max_trans, base_fee, fee_type, ai_adjustments))
            
            # Family Account Tiers
            family_tiers = [
                (1, 0, 15, 0.10, 'fixed'),
                (2, 16, 30, 0.08, 'fixed'),
                (3, 31, 60, 0.06, 'fixed'),
                (4, 61, None, 0.04, 'fixed')
            ]
            
            for tier_level, min_trans, max_trans, base_fee, fee_type in family_tiers:
                ai_adjustments = json.dumps({
                    "family_size_bonus": 0.01,
                    "consistency_bonus": 0.02,
                    "retention_bonus": 0.01
                })
                cursor.execute("""
                    INSERT INTO fee_tiers (account_type, tier_level, min_transactions, max_transactions, base_fee, fee_type, ai_adjustments)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                """, ('family', tier_level, min_trans, max_trans, base_fee, fee_type, ai_adjustments))
            
            # Business Account Tiers
            business_tiers = [
                (1, 0, 20, 0.10, 'percentage'),
                (2, 21, 50, 0.08, 'percentage'),
                (3, 51, 100, 0.06, 'percentage'),
                (4, 101, None, 0.04, 'percentage')
            ]
            
            for tier_level, min_trans, max_trans, base_fee, fee_type in business_tiers:
                ai_adjustments = json.dumps({
                    "business_size_bonus": 0.01,
                    "industry_bonus": 0.02,
                    "growth_potential": 0.01
                })
                cursor.execute("""
                    INSERT INTO fee_tiers (account_type, tier_level, min_transactions, max_transactions, base_fee, fee_type, ai_adjustments)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                """, ('business', tier_level, min_trans, max_trans, base_fee, fee_type, ai_adjustments))
            
            print("SUCCESS: Inserted default fee tiers")
        
        # Insert initial market conditions
        cursor.execute("SELECT COUNT(*) FROM market_conditions")
        if cursor.fetchone()[0] == 0:
            competitor_fees = json.dumps({
                "competitor_a": 0.30,
                "competitor_b": 0.25,
                "competitor_c": 0.20
            })
            ai_recommendations = json.dumps({
                "recommended_adjustment": 0.02,
                "market_position": "competitive"
            })
            
            cursor.execute("""
                INSERT INTO market_conditions (date, volatility, competitor_fees, market_sentiment, ai_recommendations)
                VALUES (?, ?, ?, ?, ?)
            """, (datetime.now().strftime('%Y-%m-%d'), 0.0250, competitor_fees, 'positive', ai_recommendations))
            
            print("SUCCESS: Inserted initial market conditions")
        
        # Create indexes for performance
        indexes = [
            "CREATE INDEX IF NOT EXISTS idx_users_tier ON users(current_tier)",
            "CREATE INDEX IF NOT EXISTS idx_users_loyalty ON users(loyalty_score)",
            "CREATE INDEX IF NOT EXISTS idx_fee_tiers_account ON fee_tiers(account_type, tier_level)",
            "CREATE INDEX IF NOT EXISTS idx_ai_fee_history_user ON ai_fee_history(user_id)",
            "CREATE INDEX IF NOT EXISTS idx_ai_fee_history_date ON ai_fee_history(created_at)",
            "CREATE INDEX IF NOT EXISTS idx_market_conditions_date ON market_conditions(date)",
            "CREATE INDEX IF NOT EXISTS idx_user_behavior_user ON user_behavior_analytics(user_id)",
            "CREATE INDEX IF NOT EXISTS idx_ai_recommendations_user ON ai_recommendations(user_id)"
        ]
        
        for index_sql in indexes:
            cursor.execute(index_sql)
        
        print("SUCCESS: Created performance indexes")
        
        conn.commit()
        print("SUCCESS: Database schema updated successfully!")
        
        # Verify the update
        cursor.execute("SELECT COUNT(*) FROM fee_tiers")
        fee_tiers_count = cursor.fetchone()[0]
        print(f"Fee tiers created: {fee_tiers_count}")
        
        cursor.execute("SELECT COUNT(*) FROM market_conditions")
        market_conditions_count = cursor.fetchone()[0]
        print(f"Market conditions entries: {market_conditions_count}")
        
        conn.close()
        return True
        
    except Exception as e:
        print(f"ERROR: Error updating database: {e}")
        return False

if __name__ == "__main__":
    update_database_schema()
