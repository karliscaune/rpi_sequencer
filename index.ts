import { Pattern, UiState } from './src/sequencerClasses';
import { mockRenderUi, arduinoArrayFromPattern, renderLcdContent, Timer, bpmToMs } from './src/utils';
import readline = require('readline');
import fs = require('fs');
var _ = require('lodash');

const UIState = new UiState();
let patt: Pattern;
loadPattern();

const timer = new Timer(function() {
  patt.moveForward();
  updateDisplay();
}, 200);

timer.stop();

function togglePlaying() {
  if(!UIState.playingState) {
    timer.start();
    UIState.togglePlayback();
  } else {
    timer.stop();
    UIState.togglePlayback();
  }
}

function processKeyEvent(key) {
  console.clear();
  if(key.ctrl) {
    UIState.shiftPressed = true;
    switch(key.name) {
      case 'right': patt.moveForward();
      break;
      case 'left': patt.moveBackward();
      break;
      case 'o': clearPattern();
      break;
      case 'y': decreaseTempo(10);
      break;
      case 'u': increaseTempo(10);
      break;
      case 'a': patt.sequence(UIState.currentSequence).decreaseMidiChannel();
      break;
      case 's': patt.sequence(UIState.currentSequence).increaseMidiChannel();
      break;
    }
  } else {
    UIState.shiftPressed = false;
    switch(key.name) {
      case 'left': UIState.stepBackward();
      break;
      case 'right': UIState.stepForward();
      break;
      case 'up': UIState.sequenceUp();
      break;
      case 'down': UIState.sequenceDown();
      break;
      case 't': patt.sequence(UIState.currentSequence).step(UIState.currentStep).toggle();
      break;
      case 'q': patt.sequence(UIState.currentSequence).step(UIState.currentStep).decreasePitchDeviation();
      break;
      case 'w': patt.sequence(UIState.currentSequence).step(UIState.currentStep).increasePitchDeviation();
      break;
      case 'e': patt.sequence(UIState.currentSequence).step(UIState.currentStep).decreaseVelocity();
      break;
      case 'r': patt.sequence(UIState.currentSequence).step(UIState.currentStep).increaseVelocity();
      break;
      case 'f': patt.sequence(UIState.currentSequence).step(UIState.currentStep).increaseProbablity();
      break;
      case 'd': patt.sequence(UIState.currentSequence).step(UIState.currentStep).decreaseProbablity();
      break;
      case 'a': patt.sequence(UIState.currentSequence).decreaseBasePitch();
      break;
      case 's': patt.sequence(UIState.currentSequence).increaseBasePitch();
      break;
      case 'g': patt.sequence(UIState.currentSequence).setStartOffset(-1);
      break;
      case 'h': patt.sequence(UIState.currentSequence).setStartOffset(1);
      break;
      case 'k': patt.sequence(UIState.currentSequence).setEndOffset(-1);
      break;
      case 'j': patt.sequence(UIState.currentSequence).setEndOffset(1);
      break;
      case 'o': savePattern(patt);
      break;
      case 'p': loadPattern();
      break;
      case 'v': UIState.patternPrev();
      break;
      case 'b': UIState.patternNext();
      break;
      case 'm': togglePlaying();
      break;
      case 'y': decreaseTempo(1);
      break;
      case 'u': increaseTempo(1);
      break;
      case 'i': patt.goToStart();
      break;
      case '1': patt.sequence(UIState.currentSequence).step(UIState.currentStep).decreaseLength();
      break;
      case '2': patt.sequence(UIState.currentSequence).step(UIState.currentStep).increaseLength();
    }
  }
  
  updateDisplay();
}

function savePattern(pattern: Pattern) {
  fs.writeFileSync(__dirname + `/patterns/pattern_${pattern.patternNumber}.json`, JSON.stringify(pattern));
}

function loadPattern() {
  const rawObject = JSON.parse(fs.readFileSync(__dirname + `/patterns/pattern_${UIState.currentPattern}.json`).toString());
  patt = _.merge(new Pattern({sequenceCount: 7, patternNumber: rawObject.patternNumber}), rawObject);
}

function clearPattern() {
  patt = new Pattern({sequenceCount: 7, patternNumber: patt.patternNumber});
}

function updateDisplay() {
  console.clear();
  let display = arduinoArrayFromPattern(patt, UIState);
  mockRenderUi(display, patt.sequence(UIState.currentSequence).step(UIState.currentStep).length);
  console.log('');
  console.log(renderLcdContent(UIState, patt).firstRow);
  console.log(renderLcdContent(UIState, patt).secondRow);
}

function decreaseTempo(increment) {
  patt.decreaseTempo(increment);
  timer.reset(bpmToMs(patt.tempo));
  if(!UIState.playingState) {
    timer.stop();
  }
  updateDisplay();
}

function increaseTempo(increment) {
  patt.increaseTempo(increment);
  timer.reset(bpmToMs(patt.tempo));
  if(!UIState.playingState) {
    timer.stop();
  }
  updateDisplay();
}

readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);
process.stdin.on('keypress', (str, key) => {
  if (key.ctrl && key.name === 'c') {
    process.exit();
  } else {
    processKeyEvent(key);
  }
});

updateDisplay();



