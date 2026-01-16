import shutil
import os

def restore_original_database():
    # Paths
    backup_db = r"C:\Users\beltr\100402025Kamioiv1\v10072025\backend\backup_llm_center_fix_20251017_175407\kamioi.db"
    current_db = r"C:\Users\beltr\100402025Kamioiv1\v10072025\backend\kamioi.db"
    
    print("Restoring your original database with 5 million mappings...")
    
    # Backup current database first
    if os.path.exists(current_db):
        shutil.copy2(current_db, current_db + ".backup_" + str(int(__import__('time').time())))
        print("Current database backed up")
    
    # Restore original database
    if os.path.exists(backup_db):
        shutil.copy2(backup_db, current_db)
        print("Original database restored successfully!")
        print("Your 5 million mappings should now be back")
    else:
        print(f"Backup database not found at: {backup_db}")

if __name__ == "__main__":
    restore_original_database()
