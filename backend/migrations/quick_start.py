"""
Quick Start Script for Phase 1 Migration
This script guides you through the migration process step by step
"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def print_header(text):
    """Print formatted header"""
    print("\n" + "=" * 60)
    print(text)
    print("=" * 60)

def check_prerequisites():
    """Check if prerequisites are installed"""
    print_header("Checking Prerequisites")
    
    issues = []
    
    # Check PostgreSQL adapter
    try:
        import psycopg2
        print("✅ psycopg2 installed")
    except ImportError:
        print("❌ psycopg2 not installed")
        issues.append("Install: pip install psycopg2-binary")
    
    # Check SQLAlchemy
    try:
        import sqlalchemy
        print("✅ SQLAlchemy installed")
    except ImportError:
        print("❌ SQLAlchemy not installed")
        issues.append("Install: pip install SQLAlchemy")
    
    # Check config
    try:
        from config import DatabaseConfig
        print("✅ config.py found")
    except ImportError:
        print("❌ config.py not found")
        issues.append("Create config.py in backend directory")
    
    if issues:
        print("\n⚠️  Issues found:")
        for issue in issues:
            print(f"   - {issue}")
        print("\nFix these issues and run again.")
        return False
    
    print("\n✅ All prerequisites met!")
    return True

def check_postgresql_connection():
    """Check PostgreSQL connection"""
    print_header("Checking PostgreSQL Connection")
    
    try:
        from config import DatabaseConfig
        
        if not DatabaseConfig.is_postgresql():
            print("⚠️  DB_TYPE is not set to 'postgresql'")
            print("Set environment variable: DB_TYPE=postgresql")
            print("Or edit config.py: DB_TYPE = 'postgresql'")
            return False
        
        import psycopg2
        conn = psycopg2.connect(
            host=DatabaseConfig.POSTGRES_HOST,
            port=DatabaseConfig.POSTGRES_PORT,
            user=DatabaseConfig.POSTGRES_USER,
            password=DatabaseConfig.POSTGRES_PASSWORD,
            database='postgres'  # Connect to default database first
        )
        conn.close()
        print(f"✅ Connected to PostgreSQL at {DatabaseConfig.POSTGRES_HOST}:{DatabaseConfig.POSTGRES_PORT}")
        return True
        
    except Exception as e:
        print(f"❌ Failed to connect to PostgreSQL: {e}")
        print("\nMake sure:")
        print("1. PostgreSQL is running")
        print("2. Credentials are correct in config.py or environment variables")
        print("3. Database server is accessible")
        return False

def check_sqlite_database():
    """Check if SQLite database exists"""
    print_header("Checking SQLite Database")
    
    try:
        from config import DatabaseConfig
        import os
        
        sqlite_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), DatabaseConfig.SQLITE_DB_PATH)
        
        if os.path.exists(sqlite_path):
            import sqlite3
            conn = sqlite3.connect(sqlite_path)
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) FROM sqlite_master WHERE type='table'")
            table_count = cursor.fetchone()[0]
            conn.close()
            
            print(f"✅ SQLite database found: {sqlite_path}")
            print(f"✅ Found {table_count} tables")
            return True
        else:
            print(f"⚠️  SQLite database not found: {sqlite_path}")
            print("This is OK if you're starting fresh or database is in a different location")
            return False
            
    except Exception as e:
        print(f"⚠️  Error checking SQLite database: {e}")
        return False

def main():
    """Main quick start function"""
    print_header("Phase 1 Migration - Quick Start")
    
    print("This script will guide you through the PostgreSQL migration process.")
    print("\nSteps:")
    print("1. Check prerequisites")
    print("2. Check PostgreSQL connection")
    print("3. Check SQLite database (if exists)")
    print("4. Create PostgreSQL schema")
    print("5. Migrate data (if SQLite exists)")
    
    # Step 1: Prerequisites
    if not check_prerequisites():
        print("\n❌ Prerequisites check failed. Please fix issues above.")
        sys.exit(1)
    
    # Step 2: PostgreSQL connection
    if not check_postgresql_connection():
        print("\n❌ PostgreSQL connection failed. Please fix issues above.")
        sys.exit(1)
    
    # Step 3: SQLite database
    has_sqlite = check_sqlite_database()
    
    # Step 4: Create schema
    print_header("Creating PostgreSQL Schema")
    response = input("Create PostgreSQL schema? (yes/no): ")
    if response.lower() in ['yes', 'y']:
        try:
            from migrations.create_postgres_schema import create_postgres_schema
            if create_postgres_schema():
                print("\n✅ Schema created successfully!")
            else:
                print("\n❌ Schema creation failed")
                sys.exit(1)
        except Exception as e:
            print(f"\n❌ Error: {e}")
            sys.exit(1)
    else:
        print("Skipping schema creation...")
    
    # Step 5: Migrate data
    if has_sqlite:
        print_header("Migrating Data")
        response = input("Migrate data from SQLite to PostgreSQL? (yes/no): ")
        if response.lower() in ['yes', 'y']:
            try:
                from migrations.migrate_data import migrate_data
                if migrate_data():
                    print("\n✅ Data migration completed successfully!")
                else:
                    print("\n❌ Data migration failed")
                    sys.exit(1)
            except Exception as e:
                print(f"\n❌ Error: {e}")
                import traceback
                traceback.print_exc()
                sys.exit(1)
        else:
            print("Skipping data migration...")
    
    # Final instructions
    print_header("Migration Complete!")
    print("Next steps:")
    print("1. Set environment variable: DB_TYPE=postgresql")
    print("2. Restart your Flask application")
    print("3. Test the application")
    print("4. Keep SQLite database as backup (don't delete yet)")
    print("\nYour application will now use PostgreSQL!")

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print("\n\nMigration cancelled by user.")
        sys.exit(0)
    except Exception as e:
        print(f"\n\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

