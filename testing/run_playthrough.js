#!/usr/bin/env node
/**
 * Play through a z2js game with commands from a solution JSON file
 */

const fs = require('fs');
const path = require('path');

if (process.argv.length < 4) {
    console.error('Usage: node run_playthrough.js <game.js> <solution.json>');
    process.exit(1);
}

const gameFile = path.resolve(process.argv[2]);
const solutionFile = path.resolve(process.argv[3]);

// Load solution
const solution = JSON.parse(fs.readFileSync(solutionFile, 'utf8'));
const commands = solution.solution_commands || [];

console.log('='.repeat(60));
console.log('PLAYTHROUGH TEST');
console.log('='.repeat(60));
console.log(`Game: ${path.basename(gameFile)}`);
console.log(`Commands: ${commands.length}`);
console.log('');

// Load the game
const {createZMachine} = require(gameFile);
const m = createZMachine();

let allOutput = '';
let commandIndex = 0;
let crashed = false;
let completed = false;

// Set up output callback
m.outputCallback = function(text) {
    allOutput += text;
};

// Run initial game
try {
    m.run();
} catch(e) {
    console.log('✗ CRASHED on startup');
    console.log(`Error: ${e.message}`);
    process.exit(1);
}

console.log('[Game started]');
console.log(allOutput.substring(0, 200) + '...\n');

// Function to send next command
function sendNextCommand() {
    if (commandIndex >= commands.length) {
        console.log('\n' + '='.repeat(60));
        console.log('✓ ALL COMMANDS EXECUTED SUCCESSFULLY');
        console.log('='.repeat(60));
        console.log(`Commands: ${commandIndex}/${commands.length}`);
        console.log(`Output: ${allOutput.length} chars`);
        console.log(`Crashed: No`);
        process.exit(0);
        return;
    }

    const cmd = commands[commandIndex++];
    console.log(`[${commandIndex}/${commands.length}] > ${cmd}`);

    // Clear previous output
    allOutput = '';

    // Send command
    if (m.inputCallback) {
        try {
            m.inputCallback(cmd);

            // Brief output preview
            setTimeout(() => {
                if (allOutput.length > 0) {
                    const preview = allOutput.substring(0, 150).replace(/\n/g, ' ');
                    console.log(`    ${preview}...`);
                }
                sendNextCommand();
            }, 10);
        } catch(e) {
            console.log('\n' + '='.repeat(60));
            console.log('✗ CRASHED');
            console.log('='.repeat(60));
            console.log(`Error: ${e.message}`);
            console.log(`Command ${commandIndex}/${commands.length}: "${cmd}"`);
            console.log(`Stack: ${e.stack}`);
            process.exit(1);
        }
    } else {
        console.log('    [Game not waiting for input]');
        sendNextCommand();
    }
}

// Start sending commands
setTimeout(sendNextCommand, 100);
