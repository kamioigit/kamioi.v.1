with open('LLMCenter.jsx', 'r', encoding='utf-8', errors='replace') as f:
    lines = f.readlines()

# Fix line 908 (index 907)
if len(lines) > 907:
    line = lines[907]
    # Remove any non-ASCII characters before "Processing"
    if 'Processing...' in line:
        # Find where "Processing" starts
        idx = line.find('Processing...')
        if idx > 0:
            # Keep everything before the backtick and after Processing
            before = line[:line.find('`') + 1]
            after = line[idx:]
            lines[907] = before + after

# Write back
with open('LLMCenter.jsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)

print('Line 908 fixed!')

