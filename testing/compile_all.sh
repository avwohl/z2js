#!/bin/bash
# Just compile all games without testing
# Usage: ./compile_all.sh

ZWALKER_DIR="$HOME/src/zwalker"
Z2JS_DIR="$HOME/src/z2js"

# Get list of all game files
GAMES=$(find "$ZWALKER_DIR/games/zcode" -name "*.z*" -type f | grep -v ".zip\|.tar\|.txt\|.html\|.js")

echo "Found $(echo "$GAMES" | wc -l) games to compile"
echo ""

COMPILED=0
FAILED=0

for GAME_FILE in $GAMES; do
    GAME=$(basename "$GAME_FILE" | sed 's/\.[^.]*$//')
    JS_OUTPUT="$Z2JS_DIR/test-output/${GAME}.js"

    if [ -f "$JS_OUTPUT" ]; then
        echo "Skip $GAME (already compiled)"
        COMPILED=$((COMPILED + 1))
        continue
    fi

    echo "Compiling $GAME..."
    timeout 60 python -m jsgen "$GAME_FILE" -o "$JS_OUTPUT" >/dev/null 2>&1

    if [ $? -eq 0 ] && [ -f "$JS_OUTPUT" ]; then
        echo "  ✓ $GAME"
        COMPILED=$((COMPILED + 1))
    else
        echo "  ✗ $GAME (failed or timeout)"
        FAILED=$((FAILED + 1))
    fi
done

echo ""
echo "=========================================="
echo "COMPILATION SUMMARY"
echo "=========================================="
echo "Compiled: $COMPILED"
echo "Failed:   $FAILED"
