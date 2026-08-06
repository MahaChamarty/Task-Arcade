/**
 * Web Audio API Sound Synthesizer for QuestDo
 * Zero external asset dependencies - generates retro & modern sound effects on the fly.
 */

class SoundEngine {
    constructor() {
        this.ctx = null;
        this.muted = localStorage.getItem('questdo_muted') === 'true';
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.ctx = new AudioContext();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggleMute() {
        this.muted = !this.muted;
        localStorage.setItem('questdo_muted', this.muted);
        return this.muted;
    }

    isMuted() {
        return this.muted;
    }

    // Play a gentle click sound
    playClick() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(200, this.ctx.currentTime + 0.05);

        gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.05);
    }

    // Play task complete chime (+XP ding)
    playTaskComplete() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 arpeggio

        notes.forEach((freq, index) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + index * 0.06);

            gain.gain.setValueAtTime(0, now + index * 0.06);
            gain.gain.linearRampToValueAtTime(0.2, now + index * 0.06 + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.06 + 0.25);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now + index * 0.06);
            osc.stop(now + index * 0.06 + 0.25);
        });
    }

    // Play sword slash hit sound on Boss
    playBossHit() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;

        // Noise buffer for slash/impact effect
        const bufferSize = this.ctx.sampleRate * 0.15;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1200, now);
        filter.frequency.exponentialRampToValueAtTime(300, now + 0.15);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        noise.start(now);
        noise.stop(now + 0.15);

        // Low punch synth
        const osc = this.ctx.createOscillator();
        const oscGain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.12);

        oscGain.gain.setValueAtTime(0.3, now);
        oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

        osc.connect(oscGain);
        oscGain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.12);
    }

    // Play level-up fanfare sound
    playLevelUp() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const melody = [
            { f: 440.00, d: 0.1, t: 0 },    // A4
            { f: 554.37, d: 0.1, t: 0.1 },  // C#5
            { f: 659.25, d: 0.1, t: 0.2 },  // E5
            { f: 880.00, d: 0.35, t: 0.3 }  // A5
        ];

        melody.forEach(note => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(note.f, now + note.t);

            gain.gain.setValueAtTime(0.18, now + note.t);
            gain.gain.exponentialRampToValueAtTime(0.001, now + note.t + note.d);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now + note.t);
            osc.stop(now + note.t + note.d);
        });
    }

    // Play Boss Defeated Victory Fanfare
    playBossDefeated() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const chords = [
            { f: [523.25, 659.25, 783.99], t: 0, d: 0.2 },     // C Major
            { f: [587.33, 698.46, 880.00], t: 0.22, d: 0.2 },  // D Minor
            { f: [659.25, 783.99, 987.77], t: 0.44, d: 0.2 },  // E Minor
            { f: [783.99, 987.77, 1174.66], t: 0.66, d: 0.6 }  // G Major High
        ];

        chords.forEach(chord => {
            chord.f.forEach(freq => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();

                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, now + chord.t);

                gain.gain.setValueAtTime(0.15, now + chord.t);
                gain.gain.exponentialRampToValueAtTime(0.001, now + chord.t + chord.d);

                osc.connect(gain);
                gain.connect(this.ctx.destination);

                osc.start(now + chord.t);
                osc.stop(now + chord.t + chord.d);
            });
        });
    }

    // Play Delete Sound
    playDelete() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.15);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.15);
    }
}

const sounds = new SoundEngine();
