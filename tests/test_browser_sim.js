// Simulate browser behavior
const {createZMachine} = require('/home/wohl/www/minizork.js');

const zm = createZMachine();
let outputText = '';

zm.outputCallback = function(text) {
    outputText += text;
    console.log('[OUTPUT]', text);
};

// Start the game
console.log('=== Starting game ===');
zm.run();

// Wait a bit then send input
setTimeout(() => {
    console.log('\n=== Checking inputCallback ===');
    console.log('inputCallback is:', typeof zm.inputCallback, zm.inputCallback ? 'SET' : 'NULL');

    if (zm.inputCallback) {
        console.log('\n=== Sending "look" command ===');
        zm.inputCallback('look');

        // Wait and check output
        setTimeout(() => {
            console.log('\n=== Final output ===');
            console.log(outputText);
            process.exit(0);
        }, 1000);
    } else {
        console.log('ERROR: inputCallback not set!');
        process.exit(1);
    }
}, 100);
