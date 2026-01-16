with open('LLMCenter.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove the specific corrupted emoji bytes
replacements = [
    ('�\x8f��\x8f ', ''),  # The corrupted timer emoji
    ('� ', ''),  # Any other corrupted emoji
    ('\x8f ', ''),  # Partial emoji bytes
]

for old, new in replacements:
    content = content.replace(old, new)

# Write back
with open('LLMCenter.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Corrupted emojis cleaned!')

