#!/bin/bash

# Generate trace from our implementation
echo "Generating z2js trace..."
node test_browser_sim.js 2>&1 | grep -E "^\[STEP|^\[WRITE" > z2js-full-trace.txt

echo "Generated z2js trace with $(wc -l < z2js-full-trace.txt) lines"

# TODO: Generate Frotz trace with same format
# For now, let's just analyze our trace
echo "Done!"
