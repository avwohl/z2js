#!/bin/bash
# Test all games with walkthroughs
# Usage: ./test_all_games.sh

ZWALKER_DIR="$HOME/src/zwalker"
Z2JS_DIR="$HOME/src/z2js"

# Get list of all walkthrough files (excluding test_summary.json)
WALKTHROUGHS=$(ls "$ZWALKER_DIR/games/results/"*_walkthrough.json 2>/dev/null)

if [ -z "$WALKTHROUGHS" ]; then
    echo "ERROR: No walkthrough files found"
    exit 1
fi

TOTAL=$(echo "$WALKTHROUGHS" | wc -l)
PASSED=0
FAILED=0
SKIPPED=0

echo "=========================================="
echo "Testing $TOTAL games"
echo "=========================================="
echo ""

# Create results log
RESULTS_LOG="$Z2JS_DIR/test_results_$(date +%Y%m%d_%H%M%S).log"
echo "# Test Results - $(date)" > "$RESULTS_LOG"
echo "" >> "$RESULTS_LOG"

for WALKTHROUGH in $WALKTHROUGHS; do
    GAME=$(basename "$WALKTHROUGH" _walkthrough.json)

    echo "[$((PASSED + FAILED + SKIPPED + 1))/$TOTAL] Testing $GAME..."

    # Run test
    "$Z2JS_DIR/test_game.sh" "$GAME" >> "$RESULTS_LOG" 2>&1
    RESULT=$?

    if [ $RESULT -eq 0 ]; then
        echo "  ✓ PASS"
        echo "$GAME: PASS" >> "$RESULTS_LOG"
        PASSED=$((PASSED + 1))
    else
        echo "  ✗ FAIL"
        echo "$GAME: FAIL" >> "$RESULTS_LOG"
        FAILED=$((FAILED + 1))
    fi

    echo "" >> "$RESULTS_LOG"
done

echo ""
echo "=========================================="
echo "TEST SUMMARY"
echo "=========================================="
echo "Total:  $TOTAL"
echo "Passed: $PASSED"
echo "Failed: $FAILED"
echo "=========================================="
echo "Pass rate: $((PASSED * 100 / TOTAL))%"
echo ""
echo "Detailed log: $RESULTS_LOG"

if [ $FAILED -eq 0 ]; then
    exit 0
else
    exit 1
fi
