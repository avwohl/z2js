# Current State of z2js Debugging

## Date
2025-01-20

## Current Issue
We have successfully implemented write logging in both our interpreter and Frotz to compare memory writes. This has revealed a critical bug.

## Key Finding

**Our interpreter performs spurious writes to global variable 53 (address 0x031e) that Frotz never does.**

### Evidence
```
Frotz write 1: @0x1a27 word 0x0000 -> 0x3e88
Our write 1:   @0x031e word 0x00b4 -> 0x00ae  <-- SPURIOUS!
Our write 2:   @0x1a27 word 0x0000 -> 0x3e88
```

### Details
- **When**: Instruction #6, PC=0x3b65
- **What**: Writing 0x00ae to global 53 (address 0x031e)
- **Why Wrong**: Frotz never touches this address
- **Variable Number**: setVariable is being called with varNum=69 (which maps to global 53)
- **Context**: Happens right after CALL 2 to routine at 0x3b4a

### Technical Details
- Global variables start at varNum 16
- varNum 69 = global (69-16) = global 53
- Address calculation: GLOBALS_ADDR (0x02B4) + 53*2 = 0x031e ✓ (correct)
- The value change (0x00b4 → 0x00ae) is a decrement by 6

## Implementation Status

### Completed
1. ✅ Write protection for static/high memory
2. ✅ Write logging in both interpreters (same format)
3. ✅ Identified exact instruction and address of divergence
4. ✅ Dictionary encoding works correctly (both write 0x2fd8 for "look")
5. ✅ Tokenization works correctly
6. ✅ Step-by-step execution tracing

### Outstanding Issues
1. ❌ Spurious write to global 53 at instruction #6
2. ❌ Local variable L1 mismatch at step 279 (L1=0x0001 vs Frotz's L1=0x0e00)
   - Note: This may be a consequence of issue #1

## Root Cause Hypothesis

The spurious write suggests one of:
1. **Instruction decode error**: We're reading the wrong store variable number from the instruction stream
2. **Store mechanism bug**: The `store()` function is computing addresses incorrectly
3. **Call frame corruption**: The storeVar in call frames is wrong

The write happens inside a routine at PC=0x3b65. The instruction at that address should be decoded to understand what's triggering the store operation.

## Files Modified

### Our Interpreter
- `jsgen.py`: Added write logging to writeByte() and writeWord()
  - Format: `[WRITE #N] @0xADDR byte/word 0xOLD -> 0xNEW`
  - Includes instruction counter for correlation

### Frotz
- `/home/wohl/frotz-src/src/common/fastmem.c`: Added write logging to storeb() and storew()
  - Format: `[WRITE] @0xADDR byte/word 0xOLD -> 0xNEW`
  - Same format as our interpreter for easy comparison

### Test Artifacts
- `/tmp/frotz_writes.txt`: First 50 writes from Frotz
- `/tmp/our_writes.txt`: First 70 writes from our interpreter
- `/tmp/frotz_trace.txt`: Step-by-step execution trace from Frotz
- `/tmp/our_trace.txt`: Step-by-step execution trace from ours

## How to Reproduce

```bash
# Run Frotz with write logging
echo "look" | /home/wohl/frotz-src/dfrotz docs/minizork.z3 2>&1 | grep "^\[WRITE\]" | head -50

# Run our interpreter with write logging
echo "look" | node z2js 2>&1 | grep "^\[WRITE\]" | head -50

# Compare side by side
diff -y <(echo "look" | /home/wohl/frotz-src/dfrotz docs/minizork.z3 2>&1 | grep "^\[WRITE\]" | head -30) \
        <(echo "look" | node z2js 2>&1 | grep "^\[WRITE\]" | head -30)
```

## Next Steps

### Immediate Priority
1. Decode the instruction at PC=0x3b65 to see what it actually is
2. Check if the store variable byte is being read from the wrong offset
3. Trace through the store() function execution for instruction #6

### Alternative Approach
The step-by-step comparison shows our interpreter has L1=0x0001 while Frotz has L1=0x0e00 at the same PC. This suggests our call stack/local variable architecture differs fundamentally from Frotz's. 

Frotz stores locals ON the evaluation stack (stack depth 981), while we store them separately (stack depth 8). This architectural difference may be the root cause of multiple issues.

### Long-term Fix
Consider refactoring to match Frotz's architecture:
- Store locals on the stack (not in a separate array)
- Use frame pointers to access locals
- This would make our stack depth match Frotz's and might fix both the L1 issue and the spurious write issue

## Test Status
- ❌ minizork: Crashes after "look" command
- ❌ planetfall: Not tested recently

## Architecture Notes

### Z-Machine Stack (Frotz style)
```
[... evaluation stack ...]
[local N]
[local 2]  
[local 1]
[PC high]
[PC low]
[prevFP]
[argc|storeVar|numLocals] <- frame pointer
[... evaluation stack ...]
```

### Our Current Architecture
```
Separate this.locals array: [L1, L2, ..., L15]
Evaluation stack: [... values ...]
Call stack: [{returnPC, locals, numLocals, storeVar}, ...]
```

The architectural mismatch means our stack operations don't interact correctly with locals.
