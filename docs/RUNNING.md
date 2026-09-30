# Running Compiled Games

How to play a compiled game in a browser or under Node.js, and which games have
been tested.

## Browser Play

Open the generated HTML file in any modern browser:

```bash
# After compilation
open game.html  # macOS
xdg-open game.html  # Linux
start game.html  # Windows
```

Features in the browser interface:
- Retro terminal styling with green-on-black text
- Command history (arrow keys)
- Save/Load buttons
- Restart functionality
- Responsive design

## Node.js Usage

### Simple - Just run it:
```bash
node game.js
```

The game will automatically start when you run the file directly!

### Advanced - Use as a module:
```javascript
// Load the generated module
const { createZMachine } = require('./game.js');

// Create and run the Z-machine
const zm = createZMachine();

// Set up I/O callbacks
zm.outputCallback = (text) => process.stdout.write(text);
zm.inputCallback = // ... handle input

// Start the game
zm.run();
```

## Supported Games

The compiler has been tested with:
- Zork I-III
- Planetfall
- Enchanter
- Mini-Zork
- Most Inform 6/7 compiled games
