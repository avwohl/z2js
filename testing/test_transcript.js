#!/usr/bin/env node
/**
 * Test transcript recording functionality
 *
 * This script demonstrates the new transcript recording feature that creates
 * zwalker-compatible JSON logs of game commands and room transitions.
 */

const fs = require('fs');
const path = require('path');

if (process.argv.length < 3) {
    console.error('Usage: node test_transcript.js <game.js> [output.json]');
    console.error('');
    console.error('Example:');
    console.error('  node test_transcript.js ../games/minizork.js transcript.json');
    process.exit(1);
}

const gameFile = path.resolve(process.argv[2]);
const outputFile = process.argv[3] ? path.resolve(process.argv[3]) : null;

// Sample commands to test with
const testCommands = [
    'look',
    'inventory',
    'north',
    'look',
    'south',
    'examine mailbox',
    'open mailbox',
    'read leaflet'
];

console.log('='.repeat(60));
console.log('TRANSCRIPT RECORDING TEST');
console.log('='.repeat(60));
console.log(`Game: ${path.basename(gameFile)}`);
console.log(`Test commands: ${testCommands.length}`);
console.log('');

// Load the game
const {createZMachine} = require(gameFile);
const m = createZMachine();

let allOutput = '';
let commandIndex = 0;

// Set up output callback
m.outputCallback = function(text) {
    allOutput += text;
    // Print output in real-time for visibility
    process.stdout.write(text);
};

// Run initial game
console.log('Starting game...\n');
try {
    m.run();
} catch(e) {
    console.error('\n✗ CRASHED on startup');
    console.error(`Error: ${e.message}`);
    process.exit(1);
}

// Wait a moment for initial output, then enable transcript
setTimeout(() => {
    console.log('\n' + '='.repeat(60));
    console.log('Enabling transcript recording...');
    m.enableTranscript();
    console.log('Transcript enabled. Current room:', m.getCurrentRoom());
    console.log('Status line room:', m.statusLine.room);
    console.log('='.repeat(60) + '\n');

    // Start sending commands
    setTimeout(sendNextCommand, 100);
}, 200);

// Function to send next command
function sendNextCommand() {
    if (commandIndex >= testCommands.length) {
        // All commands sent, export transcript
        setTimeout(() => {
            console.log('\n' + '='.repeat(60));
            console.log('TRANSCRIPT SUMMARY');
            console.log('='.repeat(60));

            const transcript = m.getTranscript();
            console.log(`Rooms visited: ${transcript.rooms_visited.join(', ')}`);
            console.log(`Total commands: ${transcript.stats.commands_tried}`);
            console.log(`Unique rooms: ${transcript.stats.rooms_found}`);
            console.log('');
            console.log('Command history:');
            transcript.full_solution_data.forEach((entry, i) => {
                const moved = entry.from_room !== entry.to_room ? ' ✓ MOVED' : '';
                console.log(`  ${i+1}. ${entry.command} (${entry.from_room} → ${entry.to_room})${moved}`);
            });

            // Export to file if specified
            if (outputFile) {
                const json = m.exportTranscript();
                fs.writeFileSync(outputFile, json, 'utf8');
                console.log('');
                console.log(`Transcript saved to: ${outputFile}`);
            }

            console.log('');
            console.log('='.repeat(60));
            console.log('✓ TEST COMPLETE');
            console.log('='.repeat(60));
            process.exit(0);
        }, 100);
        return;
    }

    const cmd = testCommands[commandIndex++];
    console.log(`\n> ${cmd}`);

    // Send command
    if (m.inputCallback) {
        try {
            m.inputCallback(cmd);

            // Wait for next command
            setTimeout(sendNextCommand, 100);
        } catch(e) {
            console.error('\n' + '='.repeat(60));
            console.error('✗ CRASHED');
            console.error('='.repeat(60));
            console.error(`Error: ${e.message}`);
            console.error(`Command: "${cmd}"`);
            console.error(`Stack: ${e.stack}`);
            process.exit(1);
        }
    } else {
        console.log('  [Game not waiting for input]');
        setTimeout(sendNextCommand, 100);
    }
}
