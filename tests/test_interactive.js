const readline = require('readline');
const {createZMachine} = require('./test-output/minizork.js');

const m = createZMachine();

// Enable debug mode via command line arg
m.debugMode = process.argv.includes('--debug');

m.outputCallback = (text) => {
    process.stdout.write(text);
};

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: ''
});

m.inputCallback = (callback) => {
    rl.once('line', (line) => {
        callback(line);
    });
};

// Handle Ctrl-C gracefully
rl.on('SIGINT', () => {
    console.log('\n\nThanks for playing!');
    rl.close();
    process.exit(0);
});

console.log('Starting Mini-Zork...\n');
console.log('Use --debug flag to see debug output on stderr\n');
m.run();