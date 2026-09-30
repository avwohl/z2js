# Architecture and Technical Details

How the compiler is put together, what the generated runtime implements, and
what is still missing.

## Project Structure

```
z2js/
├── z2js           # Main compiler executable
├── zparser.py     # Z-machine file parser
├── opcodes.py     # Opcode decoder and instruction set
├── jsgen.py       # JavaScript code generator
└── test-output/   # Test compilation outputs
```

## Architecture

### Components

1. **Parser (zparser.py)**
   - Reads Z-machine story files
   - Parses headers, objects, dictionary
   - Decodes Z-strings and packed addresses

2. **Opcode Decoder (opcodes.py)**
   - Decodes all instruction forms (short, long, variable, extended)
   - Handles version-specific opcodes
   - Tracks operands, store variables, and branch targets

3. **JavaScript Generator (jsgen.py)**
   - Generates optimized JavaScript runtime
   - Embeds story data as base64
   - Creates complete Z-machine interpreter in JavaScript

### Runtime Features

The generated JavaScript runtime includes:

- **Memory management**: Dynamic and static memory regions
- **Stack machine**: Call stack and evaluation stack
- **Object system**: Full object tree with attributes and properties
- **I/O system**: Text output, keyboard input, save/restore
- **Z-string decoder**: Handles abbreviations and special characters

## Technical Details

### Z-Machine Versions

| Version | Max Size | Features | Status |
|---------|----------|----------|--------|
| 1-2 | 128KB | Basic | ✓ Supported |
| 3 | 128KB | Standard | ✓ Supported |
| 4 | 256KB | Plus | ✓ Supported |
| 5 | 256KB | Advanced | ✓ Supported |
| 6 | 256KB | Graphics | Partial |
| 7 | 320KB | Extended | Partial |
| 8 | 512KB | Large | ✓ Supported |

### Opcode Coverage

Currently implements core opcodes for:
- Control flow (call, return, jump, branch)
- Memory access (load, store, loadw, loadb)
- Object manipulation (get/set attributes, insert, remove)
- Text I/O (print, read, output streams)
- Arithmetic and logic operations
- Stack operations (push, pop)
- Game state (save, restore, restart, quit)

## Limitations

- Graphics opcodes (V6) are not fully implemented
- Sound effects are stubbed
- Some extended opcodes may not work correctly
- Mouse input not supported

## Future Enhancements

- Complete V6 graphics support
- Blorb file support for resources
- Debugger interface
- Optimization passes for generated code
- TypeScript output option
