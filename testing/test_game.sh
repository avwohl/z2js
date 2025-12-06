#!/bin/bash
# Test a single game with its walkthrough
# Usage: ./test_game.sh <game_name>

if [ $# -eq 0 ]; then
    echo "Usage: $0 <game_name>"
    echo "Example: $0 advent"
    exit 1
fi

GAME=$1
ZWALKER_DIR="$HOME/src/zwalker"
Z2JS_DIR="$HOME/src/z2js"

# Find the game file
GAME_FILE=$(find "$ZWALKER_DIR/games/zcode" -name "${GAME}.z*" | head -1)

if [ -z "$GAME_FILE" ]; then
    echo "ERROR: Game file not found for '$GAME'"
    exit 1
fi

# Find the walkthrough file
WALKTHROUGH="$ZWALKER_DIR/games/results/${GAME}_walkthrough.json"

if [ ! -f "$WALKTHROUGH" ]; then
    echo "ERROR: Walkthrough not found: $WALKTHROUGH"
    exit 1
fi

echo "=========================================="
echo "Testing: $GAME"
echo "Game file: $GAME_FILE"
echo "Walkthrough: $WALKTHROUGH"
echo "=========================================="

# Compile game to JS if not already done
JS_OUTPUT="$Z2JS_DIR/test-output/${GAME}.js"

if [ ! -f "$JS_OUTPUT" ]; then
    echo ""
    echo "Compiling game to JavaScript..."
    cd "$Z2JS_DIR"
    python -m jsgen "$GAME_FILE" -o "$JS_OUTPUT"

    if [ $? -ne 0 ]; then
        echo "ERROR: Compilation failed"
        exit 1
    fi
    echo "✓ Compilation successful"
fi

# Run playthrough test
echo ""
echo "Running playthrough test..."
cd "$Z2JS_DIR"
node run_playthrough.js "$JS_OUTPUT" "$WALKTHROUGH"

EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
    echo ""
    echo "✓ Test PASSED for $GAME"
else
    echo ""
    echo "✗ Test FAILED for $GAME"
fi

exit $EXIT_CODE
