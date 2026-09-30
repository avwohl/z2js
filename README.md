# z2js - Z-Machine to JavaScript Compiler

A Python compiler that converts Z-machine story files (.z1-.z8) to playable JavaScript that runs in browsers or Node.js.

## Features

- **Multi-version support**: Handles Z-machine versions 1-8
- **Browser and Node.js**: Generated code works in both environments
- **Save/Load**: Game state persistence using localStorage (browser) or files (Node.js)
- **Interactive HTML UI**: Automatically generates a styled HTML wrapper for browser play
- **Modular architecture**: Clean separation between parser, code generator, and runtime

## Installation

```bash
pip install z2js
```

For development or from source, see [INSTALL.md](docs/INSTALL.md).

## Usage

### Basic compilation

```bash
# Compile a Z-machine file to JavaScript
z2js game.z3

# This generates:
# - game.js: The JavaScript runtime and game data
# - game.html: Interactive HTML player interface
```

### Command-line options

```bash
# Specify output file
z2js game.z3 -o mygame.js

# Skip HTML generation
z2js game.z3 --no-html

# Verbose output (shows version, serial, etc.)
z2js game.z3 -v

# Show help
z2js --help
```

Open `game.html` in a browser, or run `node game.js` in a terminal.

## Documentation

- [docs/QUICKSTART.md](docs/QUICKSTART.md) - compile and run a game in two steps
- [docs/INSTALL.md](docs/INSTALL.md) - installing from PyPI or from source
- [docs/RUNNING.md](docs/RUNNING.md) - browser play, Node.js usage (including use as a module), tested games
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) - project structure, components, runtime features, Z-machine version support, opcode coverage, limitations, future enhancements
- [docs/TRANSCRIPT.md](docs/TRANSCRIPT.md) - transcript recording
- [docs/z-machine-version-notes.md](docs/z-machine-version-notes.md) - version-specific encoding notes
- [docs/TODO.md](docs/TODO.md) - remaining work
- [CHANGELOG.md](CHANGELOG.md) - what changed in each version

## License

This project is for educational purposes. Please respect the copyrights of original game files.

## Acknowledgments

Based on the Z-Machine Standards Document v1.1 by Graham Nelson and the work of the Interactive Fiction community.
