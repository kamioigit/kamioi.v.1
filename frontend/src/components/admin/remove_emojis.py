import re

# Read the file
with open('LLMCenter.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove all emoji characters (Unicode ranges for emojis)
# This regex matches most common emojis
emoji_pattern = re.compile("["
    u"\U0001F600-\U0001F64F"  # emoticons
    u"\U0001F300-\U0001F5FF"  # symbols & pictographs
    u"\U0001F680-\U0001F6FF"  # transport & map symbols
    u"\U0001F1E0-\U0001F1FF"  # flags (iOS)
    u"\U00002702-\U000027B0"
    u"\U000024C2-\U0001F251"
    u"\U0001F900-\U0001F9FF"  # Supplemental Symbols and Pictographs
    u"\U0001FA00-\U0001FA6F"  # Chess Symbols
    u"\U00002600-\U000026FF"  # Miscellaneous Symbols
    "]+", flags=re.UNICODE)

content_clean = emoji_pattern.sub('', content)

# Also remove any remaining corrupted emoji bytes
content_clean = content_clean.replace('â±ï¸ ', '')
content_clean = content_clean.replace('ðŸš€ ', '')
content_clean = content_clean.replace('ðŸ¤– ', '')
content_clean = content_clean.replace('ðŸ"§ ', '')

# Write back
with open('LLMCenter.jsx', 'w', encoding='utf-8') as f:
    f.write(content_clean)

print('All emojis removed successfully!')

