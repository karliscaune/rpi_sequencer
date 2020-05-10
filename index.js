// import { Key } from './Key.enum';
class Step {
    constructor(pitch) {
        this.state = false;
        this.velocity = 127;
        this.pitch = pitch;
        this.pitchDeviation = 0;
        this.stateProbability = 100;
    }
    toggle() {
        this.state = !this.state;
    }
    get getState() {
        return this.state ? (Math.random() * 100) <= this.stateProbability : false;
    }
    get getPitch() {
        const result = this.pitchDeviation + this.pitch;
        if (result < 0) {
            return 0;
        }
        if (result > 127) {
            return 127;
        }
        return result;
    }
}
class Sequence {
    constructor() {
        this.length = 32;
        this.basePitch = 60; // C3
        this.steps = new Array(this.length).fill(null).map(step => new Step(this.basePitch));
        this.startOffset = 0;
        this.endOffset = 0;
        this.tempoDeviation = 0;
        this.mute = false;
        this.currentStepIndex = 1;
    }
    setStartOffset(deltaValue) {
        if (this.startOffset + deltaValue >= 0 &&
            this.length - this.endOffset - (this.startOffset + deltaValue) > 1) {
            this.startOffset += deltaValue;
        }
    }
    setEndOffset(deltaValue) {
        if (this.endOffset + deltaValue >= 0 &&
            this.length - this.startOffset - (this.endOffset + deltaValue) > 1) {
            this.endOffset += deltaValue;
        }
    }
    setBasePitch(pitch) {
        this.basePitch = pitch;
        this.steps.forEach(step => step.pitch = pitch);
    }
    moveForward() {
        if (this.currentStepIndex <= this.startOffset) {
            this.currentStepIndex = this.startOffset + 1;
        }
        else {
            if (this.currentStepIndex + 1 < this.length - this.endOffset) {
                this.currentStepIndex += 1;
            }
            else {
                this.currentStepIndex = this.startOffset + 1;
            }
        }
    }
    currentStep() {
        return this.steps[this.currentStepIndex - 1];
    }
    step(index) {
        return this.steps[index - 1];
    }
}
class Pattern {
    constructor(options) {
        this.sequenceCount = options.sequenceCount;
        this.patternNumber = options.patternNumber;
        this.sequences = new Array(this.sequenceCount).fill(null).map(() => new Sequence());
    }
    sequence(index) {
        if (index <= this.sequenceCount && index > 0) {
            return this.sequences[index - 1];
        }
        return;
    }
    moveForward() {
        this.sequences.forEach(sequence => sequence.moveForward());
    }
}
// const patt = new Pattern({sequenceCount: 7, patternNumber: 1});
// const seq = new Sequence();
// seq.setBasePitch(20);
// seq.setStartOffset(10);
// seq.setEndOffset(20);
// seq.moveForward();
// seq.moveForward();
// console.log(JSON.stringify(patt));
function getNoteName(midiNote) {
    if (midiNote >= 0 && midiNote <= 127) {
        const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        return noteNames[midiNote % 12] + (Math.floor(midiNote / 12) - 2);
    }
    return;
}
// function processKeyEvent(keycode: )
console.log(getNoteName(33));
