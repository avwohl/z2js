const {createZMachine} = require('/home/wohl/www/minizork.js');
const m = createZMachine();

// Suppress most debug output
m.debugMode = false;

m.outputCallback = (text) => { 
    process.stdout.write(text); 
};

m.inputCallback = (callback) => {
    // Simulate user typing "look"
    setTimeout(() => {
        console.error('\n[USER INPUT: look]');
        callback('look');
    }, 10);
};

m.run();

// Stop after 1 second
setTimeout(() => {
    console.error('\n[STOPPING TEST]');
    process.exit(0);
}, 1000);
