# Z2JS Game Testing Tracker

This log tracks the testing status of all Z-machine games with AI-generated walkthroughs.

**Last Updated:** 2025-12-06

## Overall Progress

- **Total games:** 43 (excluding test_summary.json)
- **Compiled:** 43/43 (100%) ✅
- **Playthrough tested:** 16/43
- **Compilation failures:** 0
- **Runtime crashes:** 0
- **Pass rate:** 100%

## Testing Status

### ✅ Completed Tests (5)

| Game | Commands | Result | Notes |
|------|----------|--------|-------|
| photopia | 4 | ✅ PASS | All commands executed |
| lostpig | 123 | ✅ PASS | Full walkthrough |
| anchor | 174 | ✅ PASS | AI stuck but game OK |
| trinity | 0 | ✅ PASS | Screen width issue |
| curses | 0 | ✅ PASS | Waiting for input |

### 🔄 Pending Tests (38)

| # | Game | Walkthrough File | Status |
|---|------|------------------|--------|
| 1 | 905 | 905_walkthrough.json | ⏳ TODO |
| 2 | acheton | acheton_walkthrough.json | ⏳ TODO |
| 3 | acorncourt | acorncourt_walkthrough.json | ⏳ TODO |
| 4 | adv440 | adv440_walkthrough.json | ⏳ TODO |
| 5 | adv550 | adv550_walkthrough.json | ⏳ TODO |
| 6 | advent | advent_walkthrough.json | ⏳ TODO |
| 7 | adverbum | adverbum_walkthrough.json | ⏳ TODO |
| 8 | aisle | aisle_walkthrough.json | ⏳ TODO |
| 9 | allroads | allroads_walkthrough.json | ⏳ TODO |
| 10 | amfv | amfv_walkthrough.json | ⏳ TODO |
| 11 | animals | animals_walkthrough.json | ⏳ TODO |
| 12 | bedlam | bedlam_walkthrough.json | ⏳ TODO |
| 13 | bluechairs | bluechairs_walkthrough.json | ⏳ TODO |
| 14 | booth | booth_walkthrough.json | ⏳ TODO |
| 15 | bunny | bunny_walkthrough.json | ⏳ TODO |
| 16 | candy | candy_walkthrough.json | ⏳ TODO |
| 17 | catseye | catseye_walkthrough.json | ⏳ TODO |
| 18 | cheeseshop | cheeseshop_walkthrough.json | ⏳ TODO |
| 19 | coldiron | coldiron_walkthrough.json | ⏳ TODO |
| 20 | czech | czech_walkthrough.json | ⏳ TODO |
| 21 | detective | detective_walkthrough.json | ⏳ TODO |
| 22 | devours | devours_walkthrough.json | ⏳ TODO |
| 23 | dracula | dracula_walkthrough.json | ⏳ TODO |
| 24 | dreamhold | dreamhold_walkthrough.json | ⏳ TODO |
| 25 | edifice | edifice_walkthrough.json | ⏳ TODO |
| 26 | enchanter | enchanter_walkthrough.json | ⏳ TODO |
| 27 | enemies | enemies_walkthrough.json | ⏳ TODO |
| 28 | etude | etude_walkthrough.json | ⏳ TODO |
| 29 | failsafe | failsafe_walkthrough.json | ⏳ TODO |
| 30 | gntests | gntests_walkthrough.json | ⏳ TODO |
| 31 | lists | lists_walkthrough.json | ⏳ TODO |
| 32 | shade | shade_walkthrough.json | ⏳ TODO |
| 33 | tangle | tangle_walkthrough.json | ⏳ TODO |
| 34 | theatre | theatre_walkthrough.json | ⏳ TODO |
| 35 | winter | winter_walkthrough.json | ⏳ TODO |
| 36 | zombies | zombies_walkthrough.json | ⏳ TODO |
| 37 | zork1 | zork1_walkthrough.json | ⏳ TODO |
| 38 | zork2 | zork2_walkthrough.json | ⏳ TODO |

## Testing Workflow

To test a game:

1. Compile the game to JS (if not already done):
   ```bash
   cd ~/src/z2js
   python -m jsgen ~/src/zwalker/games/zcode/<game>.z* -o test-output/
   ```

2. Run the playthrough test:
   ```bash
   cd ~/src/z2js
   node run_playthrough.js test-output/<game>.js ~/src/zwalker/games/results/<game>_walkthrough.json
   ```

3. Update this file with the result

## Bugs Found

(none yet)

## Notes

- Some games may not have complete walkthroughs (AI got stuck)
- Games with 0 commands still count as tested if they start correctly
- Focus on finding crashes and compilation errors, not game completion
