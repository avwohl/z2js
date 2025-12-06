#!/bin/bash
# Analyze which games were actually solved

echo "Game Completion Analysis"
echo "========================"
echo ""

cd ~/src/zwalker/games/results

echo "Command Counts:"
echo "---------------"
for f in *_walkthrough.json; do
    game=$(basename "$f" _walkthrough.json)
    cmds=$(jq -r '.commands | length' "$f" 2>/dev/null || echo "0")
    printf "%-15s %4d commands\n" "$game:" "$cmds"
done | sort

echo ""
echo "Games with 0 commands (not solved):"
echo "------------------------------------"
for f in *_walkthrough.json; do
    game=$(basename "$f" _walkthrough.json)
    cmds=$(jq -r '.commands | length' "$f" 2>/dev/null || echo "0")
    if [ "$cmds" -eq 0 ]; then
        echo "  $game"
    fi
done

echo ""
echo "Games with >0 commands (attempted/partial):"
echo "--------------------------------------------"
for f in *_walkthrough.json; do
    game=$(basename "$f" _walkthrough.json)
    cmds=$(jq -r '.commands | length' "$f" 2>/dev/null || echo "0")
    if [ "$cmds" -gt 0 ]; then
        printf "  %-15s %4d commands\n" "$game" "$cmds"
    fi
done
