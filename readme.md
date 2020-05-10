# RPi midi sequencer

This is the software side of a standalone Raspberry Pi powered DIY MIDI sequencer.
It features
* multiple tracks
* non-linear sequencing
* controlling 8x8x4 LED matrix display via Arduino serial communication
* & sending data to a 16x2 LCD display, and some LED lights as well
* saving, loading patterns

Code is written in Typescript and runs on NodeJS.
To test in terminal-simulation-mode, run
```
yarn install
yarn run start
```
