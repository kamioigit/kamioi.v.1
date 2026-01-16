#!/usr/bin/env python3
"""
Create database tables manually
"""
import sqlite3

def create_tables():
    conn = sqlite3.connect('kamioi.db')
    cursor = conn.cursor()
    
    # Create users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            name TEXT NOT NULL,
            role TEXT DEFAULT 'user',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create transactions table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            date TEXT,
            merchant TEXT,
            amount REAL,
            category TEXT,
            description TEXT,
            total_debit REAL,
            status TEXT DEFAULT 'pending',
            ticker TEXT,
            investable BOOLEAN DEFAULT 0,
            round_up REAL DEFAULT 0,
            fee REAL DEFAULT 0,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    # Create llm_mappings table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS llm_mappings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            transaction_id INTEGER,
            merchant_name TEXT,
            ticker TEXT,
            category TEXT,
            confidence REAL,
            status TEXT DEFAULT 'pending',
            admin_approved BOOLEAN DEFAULT 0,
            ai_processed BOOLEAN DEFAULT 0,
            company_name TEXT,
            user_id INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (transaction_id) REFERENCES transactions (id),
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    # Create admin user
    cursor.execute('SELECT * FROM users WHERE email = ?', ('admin@admin.com',))
    if not cursor.fetchone():
        cursor.execute('''
            INSERT INTO users (email, password, name, role) 
            VALUES (?, ?, ?, ?)
        ''', ('admin@admin.com', 'admin123', 'Admin User', 'admin'))
        print("Admin user created")
    else:
        print("Admin user already exists")
    
    conn.commit()
    conn.close()
    print("Tables created successfully!")

if __name__ == '__main__':
    create_tables()


