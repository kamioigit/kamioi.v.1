import re

# Read the file
with open('LLMCenter.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove common corrupted emoji patterns using regex
patterns = [
    r'â±ï¸',  # Corrupted clock emoji
    r'âŒ',    # Corrupted X emoji
    r'ðŸ"Š',  # Corrupted chart emoji
    r'ðŸŽ¯',  # Corrupted trophy emoji
    r'ðŸ"ˆ',  # Corrupted chart emoji
    r'ðŸ'¾',  # Corrupted chart emoji
    r'âœ…',   # Corrupted checkmark emoji
    r'ðŸ—'ï¸', # Corrupted trash emoji
    r'âš ï¸', # Corrupted warning emoji
    r'ðŸ§ ',  # Corrupted gear emoji
]

# Apply replacements
for pattern in patterns:
    content = re.sub(pattern, '', content)

# Write the cleaned content back
with open('LLMCenter.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed all remaining corrupted emoji characters in LLMCenter.jsx")
