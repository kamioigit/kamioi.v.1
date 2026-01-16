# Read the file
with open('LLMCenter.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Simple string replacements for the remaining corrupted characters
content = content.replace('â±ï¸Time:', 'Time:')
content = content.replace('âŒ Errors:', 'Errors:')

# Write the cleaned content back
with open('LLMCenter.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed remaining corrupted emoji characters in LLMCenter.jsx")
