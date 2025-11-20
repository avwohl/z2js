# z2js Quick Start

## Compile and Run in 2 Steps

```bash
# 1. Compile a game
./z2js docs/minizork.z3 -o minizork.js

# 2. Run it!
node minizork.js
```

That's it!

## What You Get

After compiling, you get two files:
- `minizork.js` - Run with Node.js
- `minizork.html` - Open in a browser

## Running Games

### In Terminal (Node.js)
```bash
node minizork.js
```

### In Browser (Better UI)
```bash
xdg-open minizork.html
```

## Example Session

```bash
# Download and compile Mini-Zork
./z2js docs/minizork.z3

# Run it
node docs/minizork.js

# Output:
# Starting Z-Machine game...
#
# [Game text appears here]
#
# > [Type commands here]
```

## If Something Goes Wrong

Crashes automatically generate debug files:
```bash
# Look for crash dumps
ls zmachine-crash-*.json

# View the last crash
cat $(ls -t zmachine-crash-*.json | head -1)
```

These JSON files contain:
- ✅ Complete machine state
- ✅ Last 100 instructions
- ✅ Full call stack
- ✅ All variables
- ✅ Memory around crash point

Perfect for debugging!

## More Info

- `README.md` - Full documentation
- `FIXED_AND_WORKING.md` - What's working and what's not
- `STATUS.md` - Detailed project status
