#!/bin/bash
# Quick script to play a compiled Z-Machine game

if [ $# -eq 0 ]; then
    echo "Usage: $0 <game.js>"
    echo "Example: $0 test-output/minizork.js"
    exit 1
fi

GAME_FILE="$1"

if [ ! -f "$GAME_FILE" ]; then
    echo "Error: File '$GAME_FILE' not found"
    exit 1
fi

# Check for corresponding HTML file
HTML_FILE="${GAME_FILE%.js}.html"

if [ -f "$HTML_FILE" ]; then
    echo "Opening game in browser..."
    xdg-open "$HTML_FILE"
else
    echo "HTML file not found. Running in Node.js..."
    node -e "
    const {createZMachine} = require('./$GAME_FILE');
    const m = createZMachine();
    m.outputCallback = (text) => process.stdout.write(text);
    console.log('=== Starting game ===\n');
    try {
        m.run();
        console.log('\n\n=== Game stopped ===');
        if (!m.finished) {
            console.log('Game is waiting for input or hit an error.');
            console.log('Check for zmachine-crash-*.json files for debug info.');
        }
    } catch(e) {
        console.error('Error:', e.message);
    }
    "
fi
