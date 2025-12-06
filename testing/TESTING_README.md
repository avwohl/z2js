# Z2JS Testing Guide

This directory contains tools for testing z2js-compiled games against AI-generated walkthroughs.

## Quick Start

### Test a single game:
```bash
./test_game.sh advent
```

### Test all games:
```bash
./test_all_games.sh
```

### Test manually:
```bash
# 1. Compile game to JS
python -m jsgen ~/src/zwalker/games/zcode/advent.z3 -o test-output/

# 2. Run playthrough
node run_playthrough.js test-output/advent.js ~/src/zwalker/games/results/advent_walkthrough.json
```

## Files

- `game_testing_tracker.md` - Master list of all games and their test status
- `testing_log.md` - Detailed results for the first 5 games tested
- `test_game.sh` - Test a single game
- `test_all_games.sh` - Test all games in batch
- `run_playthrough.js` - Node.js script that feeds commands to games

## Status

**Completed:** 5/43 games
- photopia ✅
- lostpig ✅
- anchor ✅
- trinity ✅
- curses ✅

**Remaining:** 38 games (see game_testing_tracker.md)

## Next Steps

When new walkthroughs arrive:
1. They should be placed in `~/src/zwalker/games/results/`
2. Update `game_testing_tracker.md` with the new games
3. Run `./test_all_games.sh` to test everything

## Test Results

- All tests so far: **100% pass rate**
- No bugs found yet
- Total commands executed: 301
