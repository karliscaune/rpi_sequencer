"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequencerClasses_1 = require("./src/sequencerClasses");
const utils_1 = require("./src/utils");
const readline = require("readline");
const fs = require("fs");
var _ = require('lodash');
var easymidi = require('easymidi');
// var inputs = easymidi.getInputs();
// var outputs = easymidi.getOutputs();
const midiOutput = 'UMC404HD 192k:UMC404HD 192k MIDI 1 20:0';
let midiInMessage;
var output = new easymidi.Output(midiOutput);
const UIState = new sequencerClasses_1.UiState();
let patt;
loadPattern();
const timer = new utils_1.Timer(function () {
    patt.moveForward();
    updateDisplay();
    const note = patt.sequence(UIState.currentSequence).currentStep().getPitch;
    const velocity = patt.sequence(UIState.currentSequence).currentStep().velocity;
    const channel = patt.sequence(UIState.currentSequence).midiChannel;
    if (patt.sequence(UIState.currentSequence).currentStep().getState) {
        output.send('noteon', {
            note: note,
            velocity: velocity,
            channel: channel
        });
        setTimeout(() => {
            output.send('noteoff', {
                note: note,
                velocity: velocity,
                channel: channel
            });
        }, 300);
    }
}, 200);
timer.stop();
function togglePlaying() {
    if (!UIState.playingState) {
        timer.start();
        UIState.togglePlayback();
    }
    else {
        timer.stop();
        UIState.togglePlayback();
    }
}
function processKeyEvent(key) {
    console.clear();
    if (key.ctrl) {
        UIState.shiftPressed = true;
        switch (key.name) {
            case 'right':
                patt.moveForward();
                break;
            case 'left':
                patt.moveBackward();
                break;
            case 'o':
                clearPattern();
                break;
            case 'y':
                decreaseTempo(10);
                break;
            case 'u':
                increaseTempo(10);
                break;
            case 'a':
                patt.sequence(UIState.currentSequence).decreaseMidiChannel();
                break;
            case 's':
                patt.sequence(UIState.currentSequence).increaseMidiChannel();
                break;
        }
    }
    else {
        UIState.shiftPressed = false;
        switch (key.name) {
            case 'left':
                UIState.stepBackward();
                break;
            case 'right':
                UIState.stepForward();
                break;
            case 'up':
                UIState.sequenceUp();
                break;
            case 'down':
                UIState.sequenceDown();
                break;
            case 't':
                patt.sequence(UIState.currentSequence).step(UIState.currentStep).toggle();
                break;
            case 'q':
                patt.sequence(UIState.currentSequence).step(UIState.currentStep).decreasePitchDeviation();
                break;
            case 'w':
                patt.sequence(UIState.currentSequence).step(UIState.currentStep).increasePitchDeviation();
                break;
            case 'e':
                patt.sequence(UIState.currentSequence).step(UIState.currentStep).decreaseVelocity();
                break;
            case 'r':
                patt.sequence(UIState.currentSequence).step(UIState.currentStep).increaseVelocity();
                break;
            case 'f':
                patt.sequence(UIState.currentSequence).step(UIState.currentStep).increaseProbablity();
                break;
            case 'd':
                patt.sequence(UIState.currentSequence).step(UIState.currentStep).decreaseProbablity();
                break;
            case 'a':
                patt.sequence(UIState.currentSequence).decreaseBasePitch();
                break;
            case 's':
                patt.sequence(UIState.currentSequence).increaseBasePitch();
                break;
            case 'g':
                patt.sequence(UIState.currentSequence).setStartOffset(-1);
                break;
            case 'h':
                patt.sequence(UIState.currentSequence).setStartOffset(1);
                break;
            case 'k':
                patt.sequence(UIState.currentSequence).setEndOffset(-1);
                break;
            case 'j':
                patt.sequence(UIState.currentSequence).setEndOffset(1);
                break;
            case 'o':
                savePattern(patt);
                break;
            case 'p':
                loadPattern();
                break;
            case 'v':
                UIState.patternPrev();
                break;
            case 'b':
                UIState.patternNext();
                break;
            case 'm':
                togglePlaying();
                break;
            case 'y':
                decreaseTempo(1);
                break;
            case 'u':
                increaseTempo(1);
                break;
            case 'i':
                patt.goToStart();
                break;
            case '1':
                patt.sequence(UIState.currentSequence).step(UIState.currentStep).decreaseLength();
                break;
            case '2': patt.sequence(UIState.currentSequence).step(UIState.currentStep).increaseLength();
        }
    }
    updateDisplay();
}
function savePattern(pattern) {
    fs.writeFileSync(__dirname + `/patterns/pattern_${pattern.patternNumber}.json`, JSON.stringify(pattern));
}
function loadPattern() {
    const rawObject = JSON.parse(fs.readFileSync(__dirname + `/patterns/pattern_${UIState.currentPattern}.json`).toString());
    patt = _.merge(new sequencerClasses_1.Pattern({ sequenceCount: 7, patternNumber: rawObject.patternNumber }), rawObject);
}
function clearPattern() {
    patt = new sequencerClasses_1.Pattern({ sequenceCount: 7, patternNumber: patt.patternNumber });
}
function updateDisplay() {
    console.clear();
    let display = utils_1.arduinoArrayFromPattern(patt, UIState);
    utils_1.mockRenderUi(display, patt.sequence(UIState.currentSequence).step(UIState.currentStep).length);
    console.log('');
    console.log(utils_1.renderLcdContent(UIState, patt).firstRow);
    console.log(utils_1.renderLcdContent(UIState, patt).secondRow);
    console.log(midiInMessage);
}
function decreaseTempo(increment) {
    patt.decreaseTempo(increment);
    timer.reset(utils_1.bpmToMs(patt.tempo));
    if (!UIState.playingState) {
        timer.stop();
    }
    updateDisplay();
}
function increaseTempo(increment) {
    patt.increaseTempo(increment);
    timer.reset(utils_1.bpmToMs(patt.tempo));
    if (!UIState.playingState) {
        timer.stop();
    }
    updateDisplay();
}
readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);
process.stdin.on('keypress', (str, key) => {
    if (key.ctrl && key.name === 'c') {
        process.exit();
    }
    else {
        processKeyEvent(key);
    }
});
updateDisplay();
