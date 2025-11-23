const {createZMachine} = require('./test-output/minizork.js');

const m = createZMachine();
m.debugMode = true;

let stepCount = 0;
const maxSteps = 100;

m.outputCallback = (text) => {
    // Suppress game output for trace
};

m.inputCallback = (callback) => {
    // No input for initial trace
    console.error('Input requested, stopping trace');
    process.exit(0);
};

// Intercept to stop after maxSteps
const originalRun = m.run.bind(m);
m.run = function() {
    if (stepCount++ >= maxSteps) {
        console.error(`\nStopped after ${maxSteps} steps`);
        process.exit(0);
    }
    originalRun();
};

m.run();
