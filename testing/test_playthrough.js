#!/usr/bin/env node
/**
 * Play through a z2js game with commands from a solution JSON file
 */

const fs = require('fs');
const path = require('path');

if (process.argv.length < 4) {
    console.error('Usage: node test_playthrough.js <game.js> <solution.json>');
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
console.log(`Game: ${gameFile}`);
console.log(`Solution: ${solutionFile}`);
console.log(`Commands to execute: ${commands.length}`);
console.log('');

// Load the game
const {createZMachine} = require(gameFile);
const m = createZMachine();

let allOutput = '';
let commandIndex = 0;
let crashed = false;
let errorMessage = '';

// Set up output callback
m.outputCallback = function(text) {
    allOutput += text;
    process.stdout.write(text);
};

// Set up input callback to feed commands
m.inputCallback = null; // Will be set when game requests input

// Monkey-patch the readLine function to feed our commands
const originalReadLine = m.readLine;
m.readLine = function(callback) {
    if (commandIndex < commands.length) {
        const cmd = commands[commandIndex++];
        console.log(`\n> ${cmd}`);
        setTimeout(() => callback(cmd), 0);
    } else {
        console.log('\n[All commands executed]');
        process.exit(0);
    }
};

// Start the game
console.log('[Starting game...]');
console.log('');
try {
    m.run();

    // If we get here and game is finished
    if (m.finished) {
        console.log('\n' + '='.repeat(60));
        console.log('✓ PLAYTHROUGH COMPLETED SUCCESSFULLY');
        console.log('='.repeat(60));
        console.log(`Commands executed: ${commandIndex}/${commands.length}`);
        console.log(`Total output: ${allOutput.length} chars`);
        process.exit(0);
    }
} catch(e) {
    crashed = true;
    errorMessage = e.message;
    console.log('\n' + '='.repeat(60));
    console.log('✗ GAME CRASHED');
    console.log('='.repeat(60));
    console.log(`Error: ${errorMessage}`);
    console.log(`Commands executed before crash: ${commandIndex}/${commands.length}`);
    console.log(`Stack: ${e.stack}`);
    process.exit(1);
}
