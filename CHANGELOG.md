# Changelog

All notable changes to z2js, the Z-machine to JavaScript compiler, are
documented here.

## [0.2.3] - 2026-08-20

The first release since 0.2.1. The version was bumped to 0.2.2 in December
2025 and that commit message says it was published, but nothing under that
number is on PyPI, so everything committed as 0.2.2 is included here. Almost
all of it is in the JavaScript interpreter that `jsgen.py` emits; the compiler
front end is unchanged apart from the ZSCII table added to `zparser.py`.
Because the fixes live in the emitted runtime, a game compiled with 0.2.1 still
carries every one of these bugs; recompile it to pick them up.

### Fixed
- Emitted runtime: The A2 punctuation alphabet was missing the backslash, so
  every z-char at or after that position decoded one entry early. `\` printed
  as `-`, `-` as `:`, `:` as `(`, `(` as `)`, and `)` — the last entry, now off
  the end of the string and caught by the bounds check — printed as nothing at
  all. Any string holding one of those five characters came out wrong, which on
  a typical title page meant `ZORK I(` instead of `ZORK I:` and `Copyright )c`
  instead of `Copyright (c)`. Both the V1 and the V2+ variants of the alphabet
  were short. `zparser.py` has had the character all along, so the Python
  decoder and the emitted one disagreed.
- Emitted runtime: `test_attr` reads the attribute bytes out of memory instead
  of assembling them into a JavaScript number first. For V4 and later the 48
  attribute bits were packed with `readWord(objAddr) << 32 | ...`, but
  JavaScript masks shift counts to five bits, so `<< 32` is the identity and
  the first attribute word landed on top of the third; the test mask
  `1 << (47 - attrNum)` collapsed the same way. Attributes N and N+32 (for N in
  0-15) were indistinguishable — `test_attr` reported true when either was set
  — while `set_attr` and `clear_attr` had always addressed the correct byte
  directly, so a game could set a flag and read back a different one. V1-V3
  games, whose 32 attribute bits fit in an int32, were not affected.
- Emitted runtime: 0OP opcode `0x09` had no case in `execute0OP` and fell
  through to the default, which throws `Unimplemented 0OP opcode: 0x9` and
  kills the interpreter. That opcode is `pop` in V1-V4 and `catch` in V5 and
  later, so a game reaching either one died on the spot. `catch` now stores the
  call-stack depth as its frame token and `pop` discards the top of the stack.
  `throw` (2OP `0x1C`) was a no-op that let execution continue past the unwind
  it was asked for; it now pops frames down to the token and returns the value
  from the catching routine.
- Emitted runtime: `output_stream` was a no-op for every stream. Stream 3 is
  how a game redirects printing into a table in memory, so with it ignored the
  text went to the screen where the player could see it and the table was never
  written — the game then read whatever bytes were already there as the
  captured length and contents. The runtime now keeps a capture stack (the 16
  levels the standard allows), suppresses screen and buffer output while a
  capture is active, and on deselect writes the byte count as a word at the
  table address followed by the ZSCII bytes. Characters with no ZSCII
  representation are captured as `?`. Selecting or deselecting streams 1, 2
  and 4 is still a no-op, and the V6 table-width operand is ignored.
- Emitted runtime: `read_char` stored 13 (Return) and carried straight on
  without waiting for a keystroke. Any V4+ game with a "press any key" pause or
  a keystroke-driven menu ran through it instantly, so prompts dismissed
  themselves and paged text scrolled past unread. It now suspends the
  interpreter and stores the code of the first character typed, the same way
  `read` does. The optional time and interrupt-routine operands are still
  ignored.
- Emitted runtime and `zparser.py`: ZSCII codes 155-223, the default accented
  character set, were handed straight to `String.fromCharCode` and `chr()`, so
  ZSCII 155 (`ä`) came out as U+009B and the rest of the range as invisible C1
  control characters. Both decoders now carry the table from Standard 1.0
  §3.8.5 and apply it in the 10-bit z-string escape; the emitted runtime also
  applies it in `print_char`, which `zparser.py` has no equivalent of. Codes
  224-251, which need a game-supplied Unicode table this runtime does not read,
  print `?`; codes outside every defined range now print nothing rather than a
  stray control character.
- Emitted runtime: `load`, `store` and `pull` treated an indirect reference to
  variable 0 as an ordinary push or pop. The standard requires the top of the
  stack be read or written in place for these three. `load sp` popped the value
  it was meant to leave alone, `store sp` pushed its operand on top of the
  stack instead of overwriting the top, and `pull sp` put the popped value
  straight back, leaving the stack one item deeper than it should be. In each
  case the stack pointer ended up one off from what the compiled game assumed
  and the next value read back was the wrong one.
- Emitted runtime: The word position written into the parse buffer was the
  offset into the typed text plus one. That is correct for V1-V4, but in V5 and
  later byte 1 of the text buffer holds the number of characters typed and the
  text starts at byte 2. Every word in a V5+ game was reported one byte early,
  so a game reading the raw input back through the parse buffer — to echo an
  unrecognized word, for instance — started one character short.
- Emitted runtime: `random` never saw a negative argument. Operands arrive as
  unsigned 16-bit values, so `@random -100` reached the runtime as 65436 and
  the `range <= 0` test never fired; instead of seeding, it returned a random
  number between 1 and 65436. `random 0`, which the standard defines as a
  return to unpredictable mode, was the one value that did take that branch, so
  it switched the generator into its predictable sequence with seed 0 and left
  it there — every random result for the rest of the session was fixed, and the
  same from one run to the next. The argument is now read as signed: 0 restores
  random mode, a negative value seeds the predictable generator with its
  magnitude, and a positive value draws as before. The seed is now also the
  generator's starting state; it used to be reset to 0 whatever the seed, so
  every seed had produced the same sequence.
- Generated page: The Save, Load and Restart buttons kept keyboard focus after
  a click, so the next thing the player typed went nowhere until they clicked
  back into the input box. Every button now hands focus back to the input.
- Packaging: `Homepage`, `Repository` and `Issues` in `pyproject.toml` all
  pointed at `github.com/awohl/z2js`, which is not where the project lives, so
  all three links on the PyPI project page were dead. They now name `avwohl`.
- Docs: The README linked `INSTALL.md` at the repository root; the file is
  `docs/INSTALL.md`, so the link 404'd. The clone URL inside `docs/INSTALL.md`
  named the same wrong `awohl` account, so anyone following the from-source
  instructions failed at `git clone`.

### Added
- Emitted runtime: Transcript recording, off by default. `enableTranscript()`,
  `disableTranscript()`, `getTranscript()` and `exportTranscript()` on the
  ZMachine object, with Enable and Export buttons on the generated page. Each
  command is recorded with the room number before and after it and whether the
  two differ, and the whole thing exports as JSON in the format the zwalker
  project consumes. The room number comes from `getCurrentRoom()`, which reads
  global 0 and accepts any value under 1000, falling back to the parent of
  object 1 — the Infocom and Inform conventions respectively. It is a guess,
  not something the story file declares. While recording is on, the room number
  is appended to text printed to the status window, so it changes what the
  player sees. Described in `docs/TRANSCRIPT.md`.
- A `testing/` directory of shell and Node scripts for compiling and driving a
  corpus of story files, together with the notes from a run over 43 games. All
  43 compiled with no errors, but only 11 were actually driven through a
  playthrough — `testing/FINAL_TEST_RESULTS.md` lists 32 as still pending and
  the `animals` walkthrough as timing out — and 37 of the walkthroughs are a
  dozen commands of directional wandering. None of it says whether the games
  can be completed, which `testing/HONEST_SUMMARY.txt` states plainly. None of
  this ships in the package.

### Changed
- Release workflow: `.github/workflows/publish.yml` now publishes on a
  published GitHub Release rather than on a pushed `v*.*.*` tag, and uses PyPI
  trusted publishing instead of a `PYPI_API_TOKEN` secret. Build and publish
  are one job on Python 3.12. Pushing a tag alone no longer releases anything.
- Generated page: The status bar is repainted from `zm.statusLine` every 100 ms
  instead of showing the literal text the page was built with. Nothing in the
  runtime assigns `location`, `score` or `turns` — `show_status` is still a
  no-op — so in practice the bar continues to read `Score: 0 | Moves: 0`. The
  only field that moves is the room number, and only while transcript recording
  is on.

Earlier history is in the git log.
