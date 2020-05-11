import { Pattern, UiState } from './sequencerClasses'

export function getNoteName(midiNote: number): String {
    if(midiNote >= 0 && midiNote <= 127) {
        const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        return noteNames[midiNote % 12] + (Math.floor(midiNote / 12) - 2);
    }
    return;
}

export function mockRenderUi(arduinoGrid: boolean[], stepLength: number) {
    // Render the note length
    console.log('1 /', stepLength);
    // Render step grid
    for(let i = 0; i < 8; i++) {
        let line = '';
        for(let k = 0; k < 32; k++) {
            line = `${line}${arduinoGrid[(i * 32) + k] ? '█' : '_'}`;
        }
        console.log(line);
    }
}
  
export function arduinoArrayFromPattern(pattern: Pattern, state: UiState): boolean[] {
    const booleanGrid = [];
    pattern.sequences.forEach((sequence) => {
        sequence.steps.forEach((step) => {
        booleanGrid.push(step.getState);
        })
    })
    // clear the row under the current patterm
    for(let i = 1; i <= 32; i++) {
        setStateInDisplayCell(booleanGrid, state.currentSequence + 1, i, false);
    }
    // draw the cursor
    setStateInDisplayCell(booleanGrid, state.currentSequence + 1, state.currentStep, true);
    // draw the loop points
    if(pattern.sequence(state.currentSequence).startOffset > 0) {
        setStateInDisplayCell(booleanGrid, state.currentSequence + 1, pattern.sequence(state.currentSequence).startOffset, true);
    };

    if(pattern.sequence(state.currentSequence).endOffset > 0) {
        setStateInDisplayCell(booleanGrid, state.currentSequence + 1, 33 - pattern.sequence(state.currentSequence).endOffset, true);
    };
    // draw the current step
    for(let i = 1; i <= 7; i++) {
        if(i !== state.currentSequence + 1) {
            setStateInDisplayCell(booleanGrid, i, pattern.sequence(i).currentStepIndex, true);
        }
    }

    return booleanGrid;
}
  
export function setStateInDisplayCell(grid: boolean[], row: number, column: number, state: boolean) {
    grid[((row - 1) * 32) + column - 1] = state;
}

export function renderLcdContent(state: UiState, pattern: Pattern) {
    const midiChannel = expandString(addZeroes(pattern.sequence(state.currentSequence).midiChannel.toString()), 5);
    const baseNote = getNoteName(pattern.sequence(state.currentSequence).basePitch).toString();
    const velocity = pattern.sequence(state.currentSequence).step(state.currentStep).velocity.toString();
    const probablity = pattern.sequence(state.currentSequence).step(state.currentStep).stateProbability.toString();
    const patternNumber = addZeroes(state.currentPattern.toString());
    const tempo = pattern.tempo.toString();
    const pitchDeviationInt = pattern.sequence(state.currentSequence).step(state.currentStep).pitchDeviation;
    const pitchDeviation = pitchDeviationInt > 0 ? '+' + pitchDeviationInt.toString() : pitchDeviationInt.toString();
    let firstRow = '';
    let secondRow = '';
    if(state.shiftPressed) {
        firstRow = midiChannel + expandString(velocity, 5) + expandString(probablity, 6);
    } else {
        firstRow = expandString(baseNote, 5) + expandString(velocity, 5) + expandString(probablity, 6);
    }
    
    secondRow = expandString(patternNumber, 5) + expandString(tempo, 5) + expandString(pitchDeviation, 6);
    return {firstRow, secondRow};
}

function expandString(source: string, length: number): string {
    let result = source;
    if(source.length < length) {
        for(let i = 0; i < length - source.length; i++) {
            result = result + '\xa0';
        }
    }
    return result;
}

function addZeroes(source: string): string {
    let result = source;
    if(source.length < 3) {
        for(let i = 0; i < 3 - source.length; i++) {
            result = '0' + result;
        }
    }
    return result;
}

export function Timer(fn, t) {
    var timerObj = setInterval(fn, t);
  
    this.stop = function() {
        if (timerObj) {
            clearInterval(timerObj);
            timerObj = null;
        }
        return this;
    }
  
    // start timer using current settings (if it's not already running)
    this.start = function() {
        if (!timerObj) {
            this.stop();
            timerObj = setInterval(fn, t);
        }
        return this;
    }
  
    // start with new or original interval, stop current interval
    this.reset = function(newT = t) {
        t = newT;
        return this.stop().start();
    }
  }

export function bpmToMs(bpm: number): number {
    return Math.round(15000 / bpm);
}