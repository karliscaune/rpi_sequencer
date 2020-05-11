export interface PatternOptions {
    sequenceCount: number;
    patternNumber: number;
}

export class UiState {
    currentSequence: number;
    currentStep: number;
    currentPattern: number;
    playingState: boolean;
    shiftPressed: boolean;
    constructor() {
        this.currentSequence = 1;
        this.currentStep = 1;
        this.currentPattern = 1;
        this.playingState = false;
        this.shiftPressed = false;
    }

    sequenceUp() {
        if(this.currentSequence > 1) {
            this.currentSequence--;
        }
    }

    sequenceDown() {
        if(this.currentSequence < 7) {
            this.currentSequence++;
        }
    }

    stepForward() {
        if(this.currentStep < 32) {
            this.currentStep++;
        }
    }

    stepBackward() {
        if(this.currentStep > 1) {
            this.currentStep--;
        }
    }

    patternPrev() {
        if(this.currentPattern > 1) {
            this.currentPattern--;
        }
    }

    patternNext() {
        if(this.currentPattern < 200) {
            this.currentPattern++;
        }
    }

    togglePlayback() {
        this.playingState = !this.playingState;
    }
}
  
export class Step {
    pitchDeviation: number;
    state: boolean;
    velocity: number;
    pitch: number;
    stateProbability: number;
    length: number;

    constructor(pitch) {
        this.state = false;
        this.velocity = 127;
        this.pitch = pitch;
        this.pitchDeviation = 0;
        this.stateProbability = 100;
        this.length = 1;
    }

    toggle() {
        this.state = !this.state;
    }

    get getState(): boolean {
        return this.state ? (Math.random() * 100) <= this.stateProbability : false;
    }

    get getPitch(): number {
        const result = this.pitchDeviation + this.pitch;
        if (result < 0) {
        return 0;
        }
        if (result > 127) {
        return 127;
        }
        return result;
    }

    decreasePitchDeviation() {
        if(this.pitchDeviation > -26) {
            this.pitchDeviation--;
        }
    }

    increasePitchDeviation() {
        if(this.pitchDeviation < 26) {
            this.pitchDeviation++;
        }
    }

    decreaseVelocity() {
        if(this.velocity > 0) {
            this.velocity--;
        }
    }

    increaseVelocity() {
        if(this.velocity < 127) {
            this.velocity++;
        }
    }

    decreaseProbablity() {
        if(this.stateProbability > 1) {
            this.stateProbability--;
        }
    }

    increaseProbablity() {
        if(this.stateProbability < 99) {
            this.stateProbability++;
        }
    }

    increaseLength() {
        if(this.length > 1) {
            this.length = this.length / 2;
        }
    }

    decreaseLength() {
        if(this.length < 16) {
            this.length = this.length * 2;
        }
    }
}

export class Sequence {
    steps: Step[];
    length: number;
    startOffset: number;
    endOffset: number;
    basePitch: number;
    tempoDeviation: number;
    mute: boolean;
    currentStepIndex: number;
    midiChannel: number;

    constructor() {
        this.length = 32;
        this.basePitch = 60; // C3
        this.steps = new Array(this.length).fill(null).map(step => new Step(this.basePitch));
        this.startOffset = 0;
        this.endOffset = 0;
        this.tempoDeviation = 0;
        this.mute = false;
        this.currentStepIndex = 1;
        this.midiChannel = 1;
    }

    setStartOffset(deltaValue: number) {
        if (this.startOffset + deltaValue >= 0 && 
            this.length - this.endOffset - (this.startOffset + deltaValue) > 1) {
            this.startOffset += deltaValue;
        }
    }

    setEndOffset(deltaValue: number) {
        if (this.endOffset + deltaValue >= 0 && 
            this.length - this.startOffset - (this.endOffset + deltaValue) > 1) {
            this.endOffset += deltaValue;
        }
    }

    setBasePitch(pitch) {
        this.basePitch = pitch;
        this.steps.forEach(step => step.pitch = pitch);
    }

    increaseBasePitch() {
        if(this.basePitch < 100) {
            this.setBasePitch(this.basePitch + 1);
        }
    }

    decreaseBasePitch() {
        if(this.basePitch > 27) {
            this.setBasePitch(this.basePitch - 1);
        }
    }

    moveForward() {
        if(this.currentStepIndex <= this.startOffset) {
            this.currentStepIndex = this.startOffset + 1;
        } else {
            if(this.currentStepIndex < this.length - this.endOffset) {
                this.currentStepIndex += 1;
            } else {
                this.currentStepIndex = this.startOffset + 1;
            }
        }
    }

    moveBackward() {
        if(this.currentStepIndex <= this.startOffset + 1) {
            this.currentStepIndex = this.length - this.endOffset;
        } else {
            this.currentStepIndex -= 1;
        }
    }

    goToStart() {
        this.currentStepIndex = this.startOffset + 1;
    }

    currentStep() {
        return this.steps[this.currentStepIndex - 1];
    }

    step(index: number) {
        return this.steps[index -1];
    }

    increaseMidiChannel() {
        if(this.midiChannel < 99) {
            this.midiChannel += 1;
        }
    }

    decreaseMidiChannel() {
        if(this.midiChannel > 1) {
            this.midiChannel -= 1;
        }
    }
}

export class Pattern {
    sequences: Sequence[];
    patternNumber: number;
    sequenceCount: number;
    tempo: number;
    constructor(options: PatternOptions) {
        this.sequenceCount = options.sequenceCount;
        this.patternNumber = options.patternNumber;
        this.sequences = new Array(this.sequenceCount).fill(null).map(() => new Sequence());
        this.tempo = 120;
    }

    sequence(index: number) {
        if (index <= this.sequenceCount && index > 0) {
        return this.sequences[index - 1];
        }
        return;
    }

    moveForward() {
        this.sequences.forEach(sequence => sequence.moveForward());
    }

    moveBackward() {
        this.sequences.forEach(sequence => sequence.moveBackward());
    }

    goToStart() {
        this.sequences.forEach(sequence => sequence.goToStart());
    }

    increaseTempo(increment) {
        this.tempo += increment;
    }

    decreaseTempo(decrement) {
        if(this.tempo - decrement > 2) {
            this.tempo -= decrement;
        }
    }
}