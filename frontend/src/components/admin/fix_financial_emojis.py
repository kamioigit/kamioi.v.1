import os

# List of Financial Analytics files to clean
files = [
    'FinancialAnalytics.jsx',
    'FinancialAnalyticsFast.jsx', 
    'FinancialAnalytics_New.jsx'
]

# Process each file
for filename in files:
    if os.path.exists(filename):
        print(f"Processing {filename}...")
        
        # Read the file
        with open(filename, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Remove all non-ASCII characters (corrupted emojis)
        cleaned_content = ''.join(char for char in content if ord(char) < 128)
        
        # Write the cleaned content back
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(cleaned_content)
        
        print(f"Cleaned {filename}")
    else:
        print(f"File {filename} not found")

print("All Financial Analytics files cleaned!")
