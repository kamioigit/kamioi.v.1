#!/usr/bin/env python3
"""
Initialize database with tables and seed data
"""

from database_manager import db_manager

def main():
    print("Initializing Kamioi Platform Database...")
    
    # Initialize database tables
    db_manager.init_database()
    
    # Seed with initial data
    db_manager.seed_initial_data()
    
    print("Database initialization completed successfully!")
    print("Database file: kamioi.db")
    print("Tables created: users, transactions, goals, portfolios, notifications, llm_mappings, system_events, roundup_ledger")

if __name__ == "__main__":
    main()
