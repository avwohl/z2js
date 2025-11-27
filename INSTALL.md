# Installation

## From PyPI (Recommended)

```bash
pip install z2js
```

## From Source

```bash
git clone https://github.com/awohl/z2js.git
cd z2js
pip install .
```

## Development Installation

For development with editable installs:

```bash
git clone https://github.com/awohl/z2js.git
cd z2js
pip install -e .
```

## Requirements

- Python 3.8 or later
- No external dependencies

## Verify Installation

```bash
z2js --version
z2js --help
```

## Usage

After installation, the `z2js` command is available:

```bash
# Compile a Z-machine story file
z2js game.z3

# This generates:
# - game.js: JavaScript runtime and game data
# - game.html: Browser-playable interface

# Specify output file
z2js game.z3 -o mygame.js

# Skip HTML generation
z2js game.z3 --no-html

# Verbose output
z2js game.z3 -v
```

## Running Compiled Games

### Browser

Open the generated `.html` file in any modern browser.

### Node.js

```bash
node game.js
```

## Uninstall

```bash
pip uninstall z2js
```
