# z2js Project Status

**Date**: 2025-01-20
**Current Status**: Major progress - core opcode handlers implemented, but runtime has control flow bugs

## Latest Update (2025-01-20 - Evening)

### ✅ Added Comprehensive Debug System

**Crash Dump Feature**: The generated JavaScript now automatically saves detailed crash dumps when errors occur!

- **Automatic JSON Generation**: Creates `zmachine-crash-{timestamp}.json` files
- **Browser Support**: Triggers automatic download in browsers
- **Node.js Support**: Saves to current directory
- **Comprehensive State Capture**:
  - Error details (message, stack trace)
  - Machine state (PC, instruction count, running status)
  - Memory context (bytes around crash point)
  - Full stack state (evaluation stack + call stack with all frames)
  - Local and global variables
  - Last 100 instructions executed
  - Output buffer (last 500 chars)

**Debug Mode**: Enabled by default, tracks:
- Instruction count with 100k safety limit
- Instruction history (rolling buffer of last 100)
- Stack and call depth at each instruction
- Auto-detection of infinite loops

## What Was Fixed

### ✅ Completed

1. **Implemented Missing Opcode Handlers** (jsgen.py)
   - `execute2OP`: All 27 two-operand instructions (je, jl, jg, add, sub, mul, div, mod, and, or, loadw, loadb, get_prop, etc.)
   - `execute2OPVar`: Variable-form 2OP instruction decoder
   - `executeVAR`: All variable-operand instructions (call, storew, storeb, read, print_char, print_num, random, push, pull, scan_table, etc.)
   - Added missing 1OP opcodes: `load` (0x0E), `not`/`call_1n` (0x0F)

2. **Implemented Helper Methods** (jsgen.py)
   - Object tree manipulation: `insertObject`, `removeObject`, `getObjectName`
   - Property system: `getProperty`, `putProperty`, `getPropertyAddr`, `getNextProperty`
   - Input/tokenization: `read`, `tokenize`, `lookupWord`, `encodeWord`
   - Utilities: `scanTable`

3. **Added Safety Features**
   - Routine call validation (prevents calling into header region)
   - Better error messages for debugging

4. **Identified Bad Test Files**
   - Documented corrupted z3 files in `/home/wohl/zorkie/test-games/zork1/`
   - Created analysis document: `BAD_Z3_FILES_ANALYSIS.md`

5. **Downloaded Valid Test Game**
   - Mini-Zork (v34, serial 871124) from IF Archive
   - Located at: `docs/minizork.z3`
   - Successfully compiles to JavaScript (120KB output)

## Current Issues

### ⚠️ Remaining Bugs

**Control Flow Problem**: The Z-Machine executes instructions but never properly returns from routine calls, leading to stack underflow errors.

**Symptoms**:
- Routines are entered correctly (PC is set, locals initialized)
- Instructions execute
- Return instructions (rtrue/rfalse/ret) exist in the code but are never reached
- Call stack depth increases but never decreases
- Eventually hits `load (variable 0)` which tries to pop from empty stack → crash

**Observed Behavior** (minizork.z3):
```
CALL depth=1 addr=0x1d9b store=0
  CALL depth=2 addr=0x1da5 store=3
    CALL depth=3 addr=0x1a23 store=171
    [executes ~12 instructions]
    ERROR: Stack underflow at PC 0x351b

Call depth at error: 3 (should be 0)
RET operations executed: 0 (should be 3)
```

**Likely Causes**:
1. Branch/jump offset calculations may be incorrect
2. Print literal string skip logic may have bugs
3. Some opcode implementation causes infinite loops or wrong control flow
4. The `branch()` helper function might not be handling all edge cases

## Original Problems - SOLVED ✅

Your original issues are now fixed:

1. **Browser "Loading..." freeze** ✅ FIXED
   - Cause: Missing `execute2OP`, `execute2OPVar`, `executeVAR` methods
   - Solution: All opcode handlers now implemented

2. **Node.js silent exit** ✅ FIXED
   - Cause: Same missing opcode handlers caused immediate crash
   - Solution: Runtime now starts and executes instructions

## Testing Summary

### Broken Test Files (Don't Use)
- `/home/wohl/zorkie/test-games/zork1/zork1-ours.z3` - Only 622 bytes, no code
- `/home/wohl/zorkie/test-games/zork1/zork1.z3` - 32KB, contains illegal opcodes
- Any file with serial "250115"

### Good Test Files
- `/home/wohl/z2js/docs/minizork.z3` - Official Mini-Zork demo (52KB, serial 871124) ✅
- `/home/wohl/zorkie/test-games/examples/zork1-reference.z3` - Full Zork I (87KB, serial 880429)
- `/home/wohl/zorkie/test-games/zork1/COMPILED/zork1.z3` - Full Zork I (87KB, serial 880429)

## Next Steps to Complete the Project

### High Priority Bugs to Fix

1. **Debug Control Flow**
   - Add detailed instruction-by-instruction tracing
   - Verify branch offset calculations (especially the -2 adjustment)
   - Check print_literal string advancement logic
   - Verify all jump/branch opcodes properly update PC

2. **Test Specific Opcodes**
   - 0OP: rtrue (0xB0), rfalse (0xB1) - are these working?
   - 1OP: ret (0xB), jump (0xC) - verify offset math
   - Branch instructions - verify the conditional logic and PC updates

3. **Fix Root Cause**
   - Once control flow is fixed, routines should return properly
   - Stack will remain balanced
   - Game will produce output

### Lower Priority Enhancements

1. Complete remaining opcodes as needed
2. Better handling of I/O and async input
3. Improved dictionary/tokenization for parser
4. Full screen/window management for V3+ games

## How to Test

```bash
# Compile Mini-Zork
./z2js docs/minizork.z3 -o test-output/minizork.js -v

# Test in Node.js (will hit control flow bug)
node -e "
const {createZMachine} = require('./test-output/minizork.js');
const m = createZMachine();
m.outputCallback = (text) => process.stdout.write(text);
m.run();
"

# Open in browser (will also hit control flow bug)
# Open test-output/minizork.html in Chrome/Firefox
```

## Architecture Notes

The z2js compiler has three main components:

1. **zparser.py** - Parses Z-Machine story files, reads headers, decodes structures
2. **opcodes.py** - Defines instruction set, decodes opcodes
3. **jsgen.py** - Generates JavaScript runtime with embedded story data

The generated JavaScript includes:
- Complete Z-Machine virtual machine
- Memory management (dynamic/static regions)
- Stack machine with call stack
- Object system with attributes/properties
- I/O system
- All ~100 Z-Machine opcodes (most now implemented)

## References

- Z-Machine Standards Document v1.1
- IF Archive: https://ifarchive.org
- Mini-Zork source: https://ifarchive.org/if-archive/infocom/demos/minizork.z3
