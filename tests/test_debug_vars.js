const {createZMachine} = require('/home/wohl/www/minizork.js');

const m = createZMachine();

// Keep debug mode on to see variable logging
m.debugMode = true;

let outputBuffer = '';
let inputRequested = false;

m.outputCallback = (text) => {
    outputBuffer += text;
    process.stdout.write(text);
};

m.inputCallback = (callback) => {
    if (!inputRequested) {
        inputRequested = true;
        console.log('\n[TEST] Sending "look" command');
        setTimeout(() => {
            callback('look');
        }, 100);
    } else {
        console.log('\n[TEST] Additional input requested - stopping');
        process.exit(0);
    }
};

console.log('Starting Mini-Zork with variable tracking...\n');
m.run();
