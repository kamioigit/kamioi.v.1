import re

# Read the file
with open('LLMCenter.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Define corrupted emoji patterns and their replacements
replacements = {
    'â±ï¸': '',  # Corrupted clock emoji
    'âŒ': '',    # Corrupted X emoji
    'ðŸ"Š': '',  # Corrupted chart emoji
    'ðŸŽ¯': '',  # Corrupted trophy emoji
    'ðŸ"ˆ': '',  # Corrupted chart emoji
    'ðŸ'¾': '',  # Corrupted chart emoji
    'âœ…': '',   # Corrupted checkmark emoji
    'ðŸ—'ï¸': '', # Corrupted trash emoji
    'âš ï¸': '', # Corrupted warning emoji
    'ðŸ§ ': '',  # Corrupted gear emoji
}

# Apply replacements
for corrupted, replacement in replacements.items():
    content = content.replace(corrupted, replacement)

# Write the cleaned content back
with open('LLMCenter.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed all remaining corrupted emoji characters in LLMCenter.jsx")
