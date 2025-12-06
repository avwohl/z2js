# z2js - Remaining Work

Last updated: 2025-12-06

## Current Status: Games Work!

Both V3 (minizork) and V8 (lostpig) games display correctly and accept input in the browser. The core Z-Machine is functional.

## Remaining Work

### High Priority

1. **Text encoding bug** - Some special characters display incorrectly (e.g., parentheses in copyright messages show as wrong chars). Likely an alphabet table or ZSCII issue.

### Medium Priority

2. **Node.js readline cleanup** - When piping input, readline throws ERR_USE_AFTER_CLOSE after stdin closes. Needs better stream handling for non-interactive use.

3. **Status line** - The HTML has a status bar but it's not updated by the game. Need to implement `show_status` (V3) or split-window model (V4+).

### Low Priority (Stub Opcodes)

These are no-ops that some games may need:

- `erase_window` / `erase_line` (V4+) - Screen manipulation
- `set_cursor` / `get_cursor` (V4+) - Cursor positioning
- `set_text_style` (V4+) - Bold/italic/reverse
- `buffer_mode` (V4+) - Output buffering
- `output_stream` / `input_stream` - Stream redirection
- `read_char` (V4+) - Single character input (currently returns newline)
- `tokenise` (V5+) - Re-tokenization
- `encode_text` (V5+) - Text encoding
- `copy_table` (V5+) - Memory copying
- `print_table` (V5+) - Formatted table printing
- `sound_effect` - Audio playback

### Future Enhancements

- Server-side save support (currently browser localStorage only)
- Blorb resource extraction for images/sounds
- V6 graphics support

## Completed Features

- All core opcodes for V1-V8
- Object system (attributes, properties, tree)
- Text I/O with Z-string decoding
- Dictionary lookup and tokenization
- Branching and routine calls
- Save/restore (browser localStorage)
- V4+ property size handling
- Double-VAR opcodes (call_vs2, call_vn2)
- Automatic .js extension on output files

## Testing

```bash
# Generate and test
python jsgen.py docs/minizork.z3 -o test-output/minizork
python jsgen.py docs/lostpig.z8 -o test-output/lostpig

# Browser test (recommended)
xdg-open test-output/minizork.html

# Node test
node test-output/minizork.js
```

## File Structure

```
z2js/
├── jsgen.py          # Main compiler
├── zparser.py        # Z-Machine file parser
├── opcodes.py        # Opcode definitions
├── docs/
│   ├── TODO.md       # This file
│   ├── INSTALL.md    # Installation guide
│   ├── QUICKSTART.md # Quick start guide
│   ├── minizork.z3   # Test game (V3)
│   ├── lostpig.z8    # Test game (V8)
│   └── ...
└── test-output/      # Generated files
```
