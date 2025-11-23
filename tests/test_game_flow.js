const {createZMachine} = require('./test-output/minizork.js');

const m = createZMachine();

// Enable debug if requested
m.debugMode = process.argv.includes('--debug');

const commands = ['look', 'north', 'inventory'];
let commandIndex = 0;

m.outputCallback = (text) => {
    process.stdout.write(text);
};

m.inputCallback = (callback) => {
    if (commandIndex < commands.length) {
        const cmd = commands[commandIndex++];
        console.log(`\n> ${cmd}`);
        callback(cmd);
    } else {
        console.log('\n[Test complete]');
        process.exit(0);
    }
};

m.run();
