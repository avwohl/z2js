# Transcript Recording

z2js now supports transcript recording in zwalker-compatible JSON format. This allows users to record their playthroughs and share solutions that can be used to verify interpreter changes.

## Features

- Records all player commands with room transitions
- Tracks room numbers before and after each command
- Detects when movement occurs
- Exports in zwalker-compatible JSON format
- Displays room number in status bar when recording (if game has status bar)

## Usage

### Enabling Transcript Recording

```javascript
// Create and start the game
const {createZMachine} = require('./game.js');
const m = createZMachine();
m.run();

// Enable transcript recording
m.enableTranscript();
```

### Disabling Transcript Recording

```javascript
m.disableTranscript();
```

### Exporting Transcript

```javascript
// Get transcript as JSON object
const transcript = m.getTranscript();
console.log(transcript);

// Or export as JSON string
const jsonString = m.exportTranscript();
console.log(jsonString);

// Save to file (Node.js)
const fs = require('fs');
fs.writeFileSync('my-solution.json', m.exportTranscript());
```

### Checking Current Room

```javascript
// Get the current room number
const roomNum = m.getCurrentRoom();
console.log(`Currently in room ${roomNum}`);

// Room number is also available in statusLine when transcript is enabled
console.log(m.statusLine.room);
```

## JSON Format

The transcript is exported in zwalker-compatible format:

```json
{
  "game": "unknown",
  "solved": false,
  "rooms_visited": [46, 96],
  "solution_commands": [
    "LOOK",
    "NORTH",
    "EXAMINE DOOR"
  ],
  "full_solution_data": [
    {
      "command": "LOOK",
      "from_room": 46,
      "to_room": 46,
      "result": "boring"
    },
    {
      "command": "NORTH",
      "from_room": 46,
      "to_room": 96,
      "result": "moved"
    },
    {
      "command": "EXAMINE DOOR",
      "from_room": 96,
      "to_room": 96,
      "result": "boring"
    }
  ],
  "stats": {
    "rooms_found": 2,
    "commands_tried": 3
  }
}
```

### Field Descriptions

- `game`: Game identifier (set to "unknown" by default, can be manually edited)
- `solved`: Whether the game was completed (false by default, can be manually edited)
- `rooms_visited`: Array of unique room numbers visited
- `solution_commands`: Array of commands in order
- `full_solution_data`: Detailed array of each command with room transitions
  - `command`: The command text (uppercase)
  - `from_room`: Room number before the command
  - `to_room`: Room number after the command
  - `result`: "moved" if room changed, "boring" otherwise
- `stats`: Statistics about the playthrough
  - `rooms_found`: Number of unique rooms visited
  - `commands_tried`: Total number of commands

## Room Number Detection

The interpreter detects the current room using two methods:

1. **Infocom convention**: Global variable 0 contains the room object number
2. **Inform convention**: The player object's parent is the room

This works with most Infocom games and Inform-compiled games.

## Status Bar Display

When transcript recording is enabled, the room number is appended to the status bar:

```
West of House                                          [Room 46]
```

The room number is also stored in `m.statusLine.room` for programmatic access.

## Testing

A test script is provided to demonstrate transcript recording:

```bash
# Compile a game
python3 jsgen.py docs/minizork.z3 -o minizork.js

# Test transcript recording
node testing/test_transcript.js minizork.js output.json
```

## Use Cases

1. **Solution Sharing**: Players can share their solutions in a format that can be replayed
2. **Regression Testing**: Verify that interpreter changes don't break game behavior
3. **Game Analysis**: Analyze which rooms players visit and which commands they use
4. **Walkthrough Creation**: Create automated walkthroughs for games

## Compatibility

This feature is compatible with zwalker's JSON format, allowing transcripts to be:
- Used as input to zwalker for verification
- Compared with AI-generated solutions
- Replayed using the `run_playthrough.js` script

## Example: Complete Session

```javascript
const {createZMachine} = require('./minizork.js');
const fs = require('fs');

// Start game
const m = createZMachine();
m.outputCallback = (text) => process.stdout.write(text);
m.run();

// Wait for game to start, then enable recording
setTimeout(() => {
    m.enableTranscript();

    // Play some commands
    setTimeout(() => {
        if (m.inputCallback) m.inputCallback('look');

        setTimeout(() => {
            if (m.inputCallback) m.inputCallback('north');

            // Save transcript after a few commands
            setTimeout(() => {
                const transcript = m.exportTranscript();
                fs.writeFileSync('solution.json', transcript);
                console.log('Transcript saved!');
            }, 200);
        }, 200);
    }, 200);
}, 500);
```

## Notes

- Room numbers are Z-Machine object numbers, not arbitrary indices
- Commands are recorded in uppercase for consistency
- The transcript records commands as they are processed, not necessarily after all output is displayed
- For games without status bars, the room number is still tracked internally
