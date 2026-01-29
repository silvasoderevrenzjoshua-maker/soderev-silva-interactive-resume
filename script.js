/* =========================================
   AUDIO ENGINE 4.0: ENERGETIC FLOW STATE
   ========================================= */
class SoundEngine {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        
        // MASTER GAIN
        this.masterGain = this.ctx.createGain();
        this.masterGain.connect(this.ctx.destination);
        this.masterGain.gain.value = 0.4; 

        // MUSIC CHANNEL
        this.musicGain = this.ctx.createGain();
        this.musicGain.connect(this.ctx.destination);
        this.musicGain.gain.value = 0; 

        this.muted = false;
        this.isPlaying = false;
        this.timerIDs = []; 
    }

    toggleMute() {
        this.muted = !this.muted;
        
        // Mute/Unmute Logic
        const sfxVol = this.muted ? 0 : 0.4;
        this.masterGain.gain.setTargetAtTime(sfxVol, this.ctx.currentTime, 0.1);

        if (!this.muted) {
            if (!this.isPlaying) this.startMusic();
            this.musicGain.gain.setTargetAtTime(0.25, this.ctx.currentTime, 1.0); 
        } else {
            this.musicGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.5); 
        }
        return this.muted;
    }

    // ===========================================
    // 🎵 THE "ENERGETIC FLOW" GENERATOR
    // ===========================================
    
    // Helper: Play a single soft pluck sound
    playPluck(freq, time, volume = 0.1) {
        if(this.muted) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'sine'; 
        osc.frequency.value = freq;

        // Envelope: Quick attack, medium decay (Like a marimba)
        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(volume, time + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.5);

        osc.connect(gain);
        gain.connect(this.musicGain);
        osc.start(time);
        osc.stop(time + 0.6);
    }

    // Helper: Play a deep bass pulse
    playBass(freq, time) {
        if(this.muted) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'triangle'; 
        osc.frequency.value = freq;
        
        // Filter out the buzz to make it warm
        filter.type = 'lowpass';
        filter.frequency.value = 400;

        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(0.15, time + 0.05);
        gain.gain.linearRampToValueAtTime(0, time + 0.4);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.musicGain);
        osc.start(time);
        osc.stop(time + 0.5);
    }

    startMusic() {
        if (this.isPlaying) return;
        this.isPlaying = true;
        const t = this.ctx.currentTime;
        
        // 1. FADE IN (2-second smooth fade)
        this.musicGain.gain.setValueAtTime(0, t);
        this.musicGain.gain.linearRampToValueAtTime(0.25, t + 2);

        // 2. MUSICAL SCALES (C Minor Pentatonic - "Tech" but "Chill")
        const scaleHigh = [523.25, 622.25, 698.46, 783.99, 932.33]; 
        const scaleLow = [130.81, 155.56, 174.61, 196.00]; 

        // 3. THE "PULSE" LOOP (Energy)
        // Plays a note every 150ms (approx 100 BPM 16th notes)
        const tempo = 150; 
        
        const loop = () => {
            if (!this.isPlaying) return;

            const now = this.ctx.currentTime;
            
            // LAYER A: Random Melody (The "Sparkles")
            if (Math.random() > 0.3) { // 70% chance to play a note
                const note = scaleHigh[Math.floor(Math.random() * scaleHigh.length)];
                // Add slight randomness to timing for "Human" feel
                this.playPluck(note, now, 0.08); 
            }

            // LAYER B: The Bass (The "Drive")
            // Plays a bass note every 4 beats (approx)
            if (Math.floor(Date.now() / tempo) % 8 === 0) {
                 const bassNote = scaleLow[Math.floor(Math.random() * scaleLow.length)];
                 this.playBass(bassNote, now);
            }

            // Schedule next loop
            this.timerIDs.push(setTimeout(loop, tempo));
        };

        loop();
    }

    stopMusic() {
        // Fade out
        this.musicGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.5);
        this.isPlaying = false;
        
        // Clear all loops
        this.timerIDs.forEach(id => clearTimeout(id));
        this.timerIDs = [];
    }

    // ===========================================
    // 🔊 SOUND EFFECTS (Keep these the same)
    // ===========================================

    // HELPER: Create Noise Buffer (for friction/whoosh sounds)
    createNoiseBuffer() {
        const bufferSize = this.ctx.sampleRate * 2; // 2 seconds
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        return buffer;
    }

    // 1. REALISTIC CUBE TURN (Plastic Friction + Heavy Snap)
    playSnap() {
        if(this.muted) return;
        const t = this.ctx.currentTime;

        // LAYER A: The "Whoosh" (Friction)
        const noise = this.ctx.createBufferSource();
        noise.buffer = this.createNoiseBuffer();
        const noiseFilter = this.ctx.createBiquadFilter();
        noiseFilter.type = 'lowpass';
        noiseFilter.frequency.setValueAtTime(800, t);
        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.5, t);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
        
        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(this.masterGain);
        noise.start(t);

        // LAYER B: The "Click" (Impact)
        const osc = this.ctx.createOscillator();
        const clickGain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(150, t); 
        osc.frequency.exponentialRampToValueAtTime(40, t + 0.1); 
        clickGain.gain.setValueAtTime(0.8, t + 0.05); 
        clickGain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);

        osc.connect(clickGain);
        clickGain.connect(this.masterGain);
        osc.start(t);
        osc.stop(t + 0.2);
    }

    // 2. DATA SCRAMBLE (High-Tech Computing)
    playScrambleNoise() {
        if(this.muted) return;
        const t = this.ctx.currentTime;

        // Play a burst of rapid random blips
        const count = 8;
        for(let i=0; i<count; i++) {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            // Random Sci-Fi Waveforms
            osc.type = i % 2 === 0 ? 'square' : 'sawtooth';
            
            // Random Frequencies in a "Tech" scale
            const freq = 800 + (Math.random() * 1000);
            osc.frequency.setValueAtTime(freq, t + (i * 0.04));
            
            // Short staccato envelope
            gain.gain.setValueAtTime(0.05, t + (i * 0.04));
            gain.gain.exponentialRampToValueAtTime(0.001, t + (i * 0.04) + 0.03);
            
            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(t + (i * 0.04));
            osc.stop(t + (i * 0.04) + 0.05);
        }
    }

    // 3. CHARGING UP (For "Step Fix")
    // A rising energy turbine sound
    playServo() {
        if(this.muted) return;
        const t = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'sawtooth';
        // Rise from low hum to high energy
        osc.frequency.setValueAtTime(100, t);
        osc.frequency.exponentialRampToValueAtTime(800, t + 0.6);
        
        // Filter to remove harshness
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(400, t);
        filter.frequency.linearRampToValueAtTime(2000, t + 0.6);

        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.2, t + 0.1);
        gain.gain.linearRampToValueAtTime(0, t + 0.6);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        osc.start(t);
        osc.stop(t + 0.6);
    }

    // 4. UI HOVER (Subtle Glass Taps)
    playHover() {
        if(this.muted) return;
        const t = this.ctx.currentTime;
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, t);
        
        gain.gain.setValueAtTime(0.05, t); // Very quiet
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(t);
        osc.stop(t + 0.05);
    }

    // 5. SUCCESS (Ethereal Chord)
    playSuccess() {
        if(this.muted) return;
        const t = this.ctx.currentTime;

        // A Major 7th Chord (Futuristic & Uplifting)
        const notes = [440, 554, 659, 830]; 
        
        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.type = 'triangle'; 
            osc.frequency.value = freq;
            
            // Slow attack, long release
            gain.gain.setValueAtTime(0, t);
            gain.gain.linearRampToValueAtTime(0.15, t + 0.1 + (i*0.05));
            gain.gain.exponentialRampToValueAtTime(0.001, t + 2.0);
            
            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(t);
            osc.stop(t + 2.0);
        });
    }
}

// Particle animation system for circuit node background visualization
const canvas = document.getElementById('backgroundCanvas');
const ctx = canvas.getContext('2d');
let particles = [];

function resize() { 
    canvas.width = window.innerWidth; 
    canvas.height = window.innerHeight; 
}
window.addEventListener('resize', resize);
resize();

function animate() {
    ctx.fillStyle = 'rgba(15, 23, 42, 0.2)'; 
    ctx.fillRect(0,0,canvas.width, canvas.height);
    
    ctx.fillStyle = '#38bdf8';
    particles.forEach(p => {
        p.x += p.vx; 
        p.y += p.vy;
        
        if(p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if(p.y < 0 || p.y > canvas.height) p.vy *= -1;
        
        ctx.fillRect(p.x, p.y, 3, 3);
        
        particles.forEach(p2 => {
            let dx = p.x - p2.x;
            let dy = p.y - p2.y;
            let dist = Math.sqrt(dx*dx + dy*dy);
            if(dist < 100) {
                ctx.strokeStyle = `rgba(56, 189, 248, ${1 - dist/100})`;
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
            }
        });
    });
    requestAnimationFrame(animate);
}

// Updates ambient lighting effects based on active cube face
function updateAmbientLight(face) {
    const root = document.documentElement;
    const glows = {
        'front':  'rgba(100, 210, 255, 0.15)',
        'right':  'rgba(255, 95, 86, 0.15)',
        'back':   'rgba(255, 189, 46, 0.15)',
        'left':   'rgba(255, 213, 10, 0.15)',
        'top':    'rgba(162, 89, 255, 0.15)',
        'bottom': 'rgba(40, 205, 65, 0.15)'
    };
    
    const color = glows[face] || glows['front'];
    
    document.body.style.transition = "background 1s ease";
    document.body.style.background = `radial-gradient(circle at center, ${color} 0%, #050505 70%)`;
}

document.addEventListener('DOMContentLoaded', () => {
    const cube = document.getElementById('cube');
    const explodeBtn = document.getElementById('explodeBtn');
    const wireframeBtn = document.getElementById('wireframeBtn');

    // Toggles active state for interactive buttons
    function toggleState(btn, className) {
        const isActive = cube.classList.contains(className);
        
        if (isActive) {
            cube.classList.remove(className);
            btn.classList.remove('active');
            
        } else {
            cube.classList.add(className);
            btn.classList.add('active');
           
        }
    }

    if (explodeBtn) {
        explodeBtn.addEventListener('click', () => toggleState(explodeBtn, 'exploded'));
    }
    
    if (wireframeBtn) {
        wireframeBtn.addEventListener('click', () => toggleState(wireframeBtn, 'wireframe'));
    }

    // Attaches navigation button handlers for cube face lighting synchronization
    document.querySelectorAll('.nav-icon-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const face = btn.dataset.face || 'front';
            updateAmbientLight(face);
        });
    });
});

// Removes interaction hint on first user interaction
const hint = document.querySelector('.interaction-hint');
const cubeWrapper = document.querySelector('.cube-wrapper');

function removeHint() {
    if(hint) {
        hint.style.transition = "opacity 0.5s";
        hint.style.opacity = "0";
        setTimeout(() => hint.remove(), 500);
    }
}

// Monitors user interactions to dismiss hint
if(cubeWrapper) {
    cubeWrapper.addEventListener('mousedown', removeHint);
    cubeWrapper.addEventListener('touchstart', removeHint);
}

// Intersection Observer system for content reveal and synchronization
const observerOptions = {
    root: null,
    threshold: 0.5,
    rootMargin: "-10% 0px -10% 0px"
};

const scrollObserver = new IntersectionObserver((entries) => {
    
    const isAnySectionActive = entries.some(entry => entry.isIntersecting);
    
    
    if (isAnySectionActive) {
        document.body.classList.add('focus-mode');
    } else {
        document.body.classList.remove('focus-mode');
    }

    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            entry.target.classList.remove('hidden');
            
            // Synchronizes navigation sidebar with active content
            const id = entry.target.id;
            document.querySelectorAll('.nav-icon-btn').forEach(btn => btn.classList.remove('active'));
            const activeBtn = document.querySelector(`.nav-icon-btn[data-section="${id}"]`);
            
            if(activeBtn) {
                activeBtn.classList.add('active');
                
                // Updates sidebar color to reflect active section theme
                const color = getComputedStyle(entry.target).getPropertyValue('--section-color');
                activeBtn.style.setProperty('--glow-color', color);
            }
        } else {
            entry.target.classList.remove('revealed');
            entry.target.classList.add('hidden');
        }
    });
}, observerOptions);

// Registers observer for all resume sections
document.querySelectorAll('.resume-section').forEach(section => {
    scrollObserver.observe(section);
});

// Initializes particle positions and velocities for background animation
for(let i=0; i<40; i++) {
    particles.push({
        x:Math.random()*canvas.width, 
        y:Math.random()*canvas.height, 
        vx:(Math.random()-0.5)*0.5, 
        vy:(Math.random()-0.5)*0.5
    });
}
animate();

/* =========================================
   1B. HEADER STATE UPDATER
   ========================================= */
function updateHeaderState(isFixed) {
    const statusText = document.getElementById('status-text');
    const terminalBody = document.getElementById('terminal-body');
    
    if (isFixed) {
        statusText.innerText = "OPTIMIZED";
        statusText.style.color = "#00ff66";
        
        terminalBody.innerHTML = `
            <p class="code-line success"><span class="prompt">>></span> [SYSTEM] kernel_stable_v2.0</p>
            <p class="code-line success"><span class="prompt">>></span> [SUCCESS] data_blocks_restored</p>
            <p class="code-line success"><span class="prompt">>></span> ACCESS_GRANTED: welcome_recruiter()</p>
        `;
    } else {
        statusText.innerText = "UNOPTIMIZED";
        statusText.style.color = "#ff4444";
        
        terminalBody.innerHTML = `
            <p class="code-line error"><span class="prompt">>></span> [CRITICAL] segment_fault_core_dumped</p>
            <p class="code-line warn"><span class="prompt">>></span> [WARNING] data_stream_scrambled</p>
            <p class="code-line action active"><span class="prompt">>></span> EXECUTE: require_manual_fix(_)</p>
        `;
    }
}

/* =========================================
   2. Enhanced Cube3D Resume with Solve-to-Reveal and Step-Solve Features
   ========================================= */
class Cube3DResume {
    constructor() {
        this.cube = document.getElementById('cube');
        this.cubeWrapper = document.getElementById('cubeWrapper');
        this.movesCounter = document.getElementById('movesCounter');
        this.complexityValue = document.getElementById('complexityValue');
        this.scrambleBtn = document.getElementById('scrambleBtn');
        this.solveBtn = document.getElementById('solveBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.stepBtn = document.getElementById('stepSolveBtn'); 
        this.rotateCubeBtn = document.getElementById('rotateCubeBtn'); 
        this.shapeShiftBtn = document.getElementById('shapeShiftBtn'); 
        this.progressFill = document.getElementById('progressFill');
        this.progressText = document.getElementById('progressText');
        this.solveProgress = document.getElementById('solveProgress');
        this.resumeContent = document.getElementById('resumeContent');
        
        // Optimizes rendering performance for cube transformations
        this.cube.style.willChange = 'transform';
        
        // Track tap vs drag interactions
        this.dragStartTime = 0;
        this.isDragMove = false;
        
        // Maintains cube transformation and interaction state
        this.state = {
            rotation: { x: -25, y: -25, z: 0 },
            scale: 1,
            moves: 0,
            isAnimating: false,
            isDragging: false,
            lastMousePos: { x: 0, y: 0 },
            isSolving: false,
            currentStep: 0,
            totalSteps: 6,
            complexity: 'O(1)',
            activeColor: null,
            isRotating: false, 
            stepFixCounter: 0, 
            maxStepFixes: 10, 
            shapeShiftMode: 0 
        };
        
        // Tracks solve steps for progressive resolution sequence
        this.solveStack = [];
        
        // Defines the solved configuration for all cube faces
        this.solvedState = {
            front: Array(9).fill('white'),
            back: Array(9).fill('yellow'),
            right: Array(9).fill('green'),
            left: Array(9).fill('blue'),
            top: Array(9).fill('red'),
            bottom: Array(9).fill('orange')
        };
        
        // Stores current cube configuration state
        this.currentState = JSON.parse(JSON.stringify(this.solvedState));
        
        // Maps cube faces to their rotation targets during solving
        this.faceRotations = [
            { x: -25, y: -25, color: 'white' },    // Step 1: Front/Overview
            { x: -25, y: -115, color: 'red' },     // Step 2: Right/Education
            { x: -115, y: -25, color: 'blue' },    // Step 3: Top/Experience
            { x: 65, y: -25, color: 'green' },     // Step 4: Bottom/Skills
            { x: -25, y: 65, color: 'orange' },    // Step 5: Left/Achievements
            { x: -25, y: 155, color: 'yellow' }    // Step 6: Back/Contact
        ];
        
        // Defines resume content sections in progression order
        this.resumeSections = [
            'section-overview',
            'section-education',
            'section-experience',
            'section-skills',
            'section-achievements',
            'section-contact'
        ];
        
        // Associates cube faces with their display colors
        this.faceToColor = {
            'front': 'white',
            'back': 'yellow',
            'right': 'red',
            'left': 'orange',
            'top': 'blue',
            'bottom': 'green'
        };
        
        // Defines easing functions for animation transitions
        this.animationTiming = {
            snap: 'cubic-bezier(0.19, 1, 0.22, 1)',      
            smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',      
            bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)', 
            linear: 'linear'
        };
        
        // NEW: Initialize Audio Engine
        this.soundFX = new SoundEngine();
        
        // Resume AudioContext immediately and start music
        const startAudioImmediately = () => {
            if (this.soundFX.ctx.state === 'suspended') {
                this.soundFX.ctx.resume().then(() => {
                    console.log('AudioContext resumed immediately');
                    if (!this.soundFX.isPlaying && !this.soundFX.muted) {
                        this.soundFX.startMusic();
                    }
                }).catch(err => console.log('Audio autostart blocked by browser:', err));
            } else if (this.soundFX.ctx.state === 'running') {
                // If context is already running, start music now
                if (!this.soundFX.isPlaying && !this.soundFX.muted) {
                    this.soundFX.startMusic();
                }
            }
        };
        
        // Try to start audio immediately
        startAudioImmediately();
        
        // Also try after a short delay in case context needs time to initialize
        setTimeout(() => startAudioImmediately(), 100);
        setTimeout(() => startAudioImmediately(), 300);
        
        // Fallback: Resume on any user interaction
        const resumeAudio = () => {
            startAudioImmediately();
            document.removeEventListener('click', resumeAudio);
            document.removeEventListener('keydown', resumeAudio);
            document.removeEventListener('touchstart', resumeAudio);
        };
        
        document.addEventListener('click', resumeAudio, { once: false });
        document.addEventListener('keydown', resumeAudio, { once: false });
        document.addEventListener('touchstart', resumeAudio, { once: false });
        
        this.init();
    }
    
    // Initializes cube with boot sequence and event handlers
    init() {
        this.createCube();
        this.setupEventListeners();
        this.updateDisplay();
        this.updateDashboard(); // Initialize dashboard with zeros
        
        this.initHackerTyper(); 
        
        // Triggers intro animation after DOM setup
        setTimeout(() => {
            this.animateIntro();
        }, 500);
        
        // Executes boot sequence after intro animation completes
        setTimeout(() => {
            this.bootSequence();
        }, 2500); // Gentler timing for intro
        
        // Auto-scramble after 2-4 seconds from boot sequence
        const delayBeforeScramble = 3000 + Math.random() * 2000; // 3-5 seconds total
        setTimeout(() => {
            this.autoScrambleAndStartGame();
        }, delayBeforeScramble);
    }
    
    // Initializes cube with scrambled state and populates solve stack
    bootSequence() {
        // Hides content sections during initialization
        this.hideAllSections();
        
        // Reset background color
        this.resetBackgroundColor();
        
        // Generates random rotation for boot sequence animation
        const randomX = (Math.random() * 180) - 90;
        const randomY = (Math.random() * 180) - 90;
        
        // Applies randomized rotation to cube
        this.state.rotation.x += randomX;
        this.state.rotation.y += randomY;
        this.updateCubeTransform();
        
        // Resets solve sequence stack
        this.solveStack = [];
        
        // Reset step fix counter
        this.state.stepFixCounter = 0;
        
        // Updates interface with boot sequence status
        document.getElementById('movesCounter').innerText = "BOOT";
        document.getElementById('complexityValue').innerText = "INIT";
        
        // Applies visual effects during boot initialization
        this.cube.style.transition = 'box-shadow 0.8s ease';
        this.cube.style.boxShadow = '0 0 30px rgba(0, 255, 255, 0.6)';
        
        setTimeout(() => {
            this.cube.style.boxShadow = '';
            this.state.moves = 10; 
            this.updateDisplay();
            this.state.complexity = 'O(n²)';
            this.updateComplexity();
        }, 1500);
    }
    
    // Auto-scramble after delay and start the game timer
    autoScrambleAndStartGame() {
        if (this.state.stepFixCounter > 0) return; // Already started
        
        // Ensure audio context is running before scramble
        if (this.soundFX.ctx.state === 'suspended') {
            this.soundFX.ctx.resume().then(() => {
                console.log('Audio context resumed for scramble');
            }).catch(err => console.log('Could not resume audio'));
        }
        
        // Perform multiple aggressive scrambles for visibility
        let scrambleCount = 0;
        const performScramble = () => {
            if (scrambleCount >= 3) {
                // After 3 scrambles, show error counts
                this.updateDashboard();
                return;
            }
            
            this.state.isAnimating = true;
            const scrambleMoves = this.generateScrambleSequence(8); 
            
            this.executeScrambleSequence(scrambleMoves, () => {
                this.state.isAnimating = false;
                scrambleCount++;
                setTimeout(performScramble, 200); 
            });
        };
        
        performScramble();
    }
    
    // Start the game timer
    startGameTimer() {
        
    }
    
    // Stop the game timer (call when cube is solved)
    stopGameTimer() {
        
    }
    
    triggerVisualEffect(type, count) {
        const cubelets = this.cube.querySelectorAll('.cubelet');
        const animClass = type === 'encrypt' ? 'encrypting' : 'scanning';
        
        // Pick Candidates
        let candidates = [];
        if (type === 'scan') {
            candidates = Array.from(cubelets).filter(c => !c.classList.contains(c.dataset.color));
        } else {
            candidates = Array.from(cubelets);
        }
        if (candidates.length === 0 && type === 'scan') return;
        if (candidates.length === 0) candidates = Array.from(cubelets);

        // Shuffle
        const selected = candidates.sort(() => 0.5 - Math.random()).slice(0, count);

        selected.forEach(c => {
            const trueColor = c.dataset.color;

            // Reset Animation
            c.classList.remove('encrypting', 'scanning');
            void c.offsetWidth;
            c.classList.add(animClass);

            // Add glow effect during scanning
            if (type === 'scan') {
                c.style.boxShadow = '0 0 20px rgba(100, 210, 255, 0.8), inset 0 0 10px rgba(100, 210, 255, 0.5)';
            }

            // STATE CHANGE TIMING
            if (type === 'encrypt') {
                // SCRAMBLE: Swap color at 30% mark (approx 120ms)
                const colors = ['red', 'orange', 'yellow', 'green', 'blue', 'white'];
                let randomC = colors[Math.floor(Math.random() * colors.length)];
                
                setTimeout(() => {
                    c.className = `cubelet ${randomC} ${animClass}`;
                }, 120); 
            } 
            else if (type === 'scan') {
                setTimeout(() => {
                    c.className = `cubelet ${trueColor} ${animClass}`;
                    c.classList.add('fixed'); 
                    const icon = c.querySelector('.cube-face-icon');
                    if(icon) {
                        icon.style.opacity = '1';
                        icon.style.textShadow = '0 0 15px rgba(100, 210, 255, 0.8)';
                    }
                   
                    c.style.boxShadow = '0 0 30px rgba(100, 255, 200, 1), inset 0 0 15px rgba(100, 255, 200, 0.7), 0 0 50px rgba(100, 210, 255, 0.9)';
                }, 400); 
            }

            // Cleanup
            setTimeout(() => {
                c.classList.remove(animClass);
                c.style.boxShadow = '';
                const icon = c.querySelector('.cube-face-icon');
                if(icon) icon.style.textShadow = '';
            }, 900);
        });
    }
    
    stepSolve() {
        if (this.state.isAnimating) return;
        if (this.state.stepFixCounter >= this.state.maxStepFixes) {
            // Already fixed, do nothing
            return;
        }

        this.stepBtn.disabled = true;
        this.state.isAnimating = true;
        this.stepBtn.classList.add('active-fix');

        // NEW: Play the high-tech servo sound
        this.soundFX.playServo();

        // Increment step counter
        this.state.stepFixCounter++;

        // 1. Visual: Strong Glow Effect on Cube
        this.cube.style.transition = 'box-shadow 0.3s ease';
        this.cube.style.boxShadow = `
            0 0 30px rgba(100, 210, 255, 0.8),
            0 0 60px rgba(100, 210, 255, 0.5),
            inset 0 0 40px rgba(100, 210, 255, 0.2)
        `;

        // 2. Visual: Restore Pulse Animation
        this.cube.classList.remove('restore-pulse');
        void this.cube.offsetWidth;
        this.cube.classList.add('restore-pulse');

        // 3. Rotate cube to show the face being fixed
        const faceIndex = (this.state.stepFixCounter - 1) % this.faceRotations.length;
        const targetFace = this.faceRotations[faceIndex];
        
        this.cube.style.transition = `transform 600ms cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.3s ease`;
        this.state.rotation.x = targetFace.x;
        this.state.rotation.y = targetFace.y;
        this.updateCubeTransform();

        // 4. Visual: Enhanced Scanner Beam with more cubelets
        // Fix 5-7 cubelets per step for visible progress
        const fixCount = 5 + (this.state.stepFixCounter % 3);
        this.triggerVisualEffect('scan', fixCount); 

        // 5. Create detailed progress display
        const progress = Math.round((this.state.stepFixCounter / this.state.maxStepFixes) * 100);
        const filledBars = Math.ceil((this.state.stepFixCounter / this.state.maxStepFixes) * 10);
        const emptyBars = 10 - filledBars;
        const progressBar = '█'.repeat(filledBars) + '░'.repeat(emptyBars);
        
        this.state.complexity = `STEP ${this.state.stepFixCounter}/${this.state.maxStepFixes} [${progressBar}] ${progress}%`;
        this.updateDisplay();
        
        // 6. Update step progress indicator
        const stepCounter = document.getElementById('stepCounter');
        const stepBarFill = document.getElementById('stepBarFill');
        if (stepCounter) stepCounter.textContent = this.state.stepFixCounter;
        if (stepBarFill) {
            const fillPercentage = (this.state.stepFixCounter / this.state.maxStepFixes) * 100;
            stepBarFill.style.width = fillPercentage + '%';
        }

        setTimeout(() => {
            // Pulse effect after scan completes
            this.cube.style.boxShadow = `
                0 0 40px rgba(100, 210, 255, 0.6),
                0 0 80px rgba(100, 210, 255, 0.3),
                inset 0 0 30px rgba(100, 210, 255, 0.15)
            `;
            
            setTimeout(() => {
                this.cube.style.boxShadow = '';
                this.state.isAnimating = false;
                this.stepBtn.disabled = false;
                this.stepBtn.classList.remove('active-fix');
                
                // Check if fully solved
                if (this.state.stepFixCounter >= this.state.maxStepFixes) {
                    this.triggerVisualEffect('scan', 54);
                    this.completeStepSolve();
                }
            }, 200);
        }, 700);
    }
    
    // Finalizes solve sequence with visual celebration effects
    completeStepSolve() {
        // Applies solved state styling and animations
        this.cube.style.transition = 'box-shadow 0.6s ease';
        this.cube.style.boxShadow = '0 0 40px rgba(0, 255, 100, 0.7)';
        
        // Resets move counter and updates display
        document.getElementById('complexityValue').innerText = "FIXED";
        this.state.complexity = 'O(1)';
        
        // Highlights step button with pulse animation
        this.stepBtn.classList.add('solved');
        
        // Automatically reveals overview content when fully solved
        setTimeout(() => {
            this.cube.style.boxShadow = '';
            this.revealSection('section-overview');
        }, 1000);
        
        // Clears solved state styling after animation completes
        setTimeout(() => {
            this.stepBtn.classList.remove('solved');
        }, 2000);
    }
    
    // Determines closest cube face relative to current rotation
    getClosestFaceIndex() {
        const currentRotation = this.state.rotation;
        let closestIndex = -1;
        let closestDistance = Infinity;
        
        this.faceRotations.forEach((face, index) => {
            const dx = Math.abs(currentRotation.x - face.x);
            const dy = Math.abs(currentRotation.y - face.y);
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 30 && distance < closestDistance) { 
                closestDistance = distance;
                closestIndex = index;
            }
        });
        
        return closestIndex;
    }
    
    // UPDATED: Hacker Typer Logic
    initHackerTyper() {
        const lines = document.querySelectorAll('.code-line');
        let delay = 0;
    
        lines.forEach((line) => {
            // Initializes line width for typing animation
            line.style.width = '0';
            
            setTimeout(() => {
                line.classList.add('typing-active');
                
                // Removes cursor after animation completes
                setTimeout(() => {
                    line.classList.remove('typing-active');
                    line.classList.add('typing-done');
                    line.style.width = '100%'; 
                }, 2000); 
    
            }, delay);
            
            delay += 2000; // Wait 2 seconds before starting next line
        });
    }
    
    createCube() {
        this.cube.innerHTML = '';
        
        // --- 1. INSERT THE SILICON HEART (The "Inside") ---
        const core = document.createElement('div');
        core.className = 'cube-core';
        core.innerHTML = `
            <div class="core-circuit"></div>
            <div class="core-light"></div>
            <i class="fas fa-microchip core-icon"></i>
            <div class="core-data-stream"></div>
        `;
        this.cube.appendChild(core);

        // --- 2. CREATE THE FACES (Standard Logic) ---
        const faceOrder = ['front', 'right', 'top', 'bottom', 'left', 'back'];
        
        // Icons representing your sections
        const faceIcons = {
            'front': 'fa-user-astronaut',  // Profile
            'right': 'fa-university',      // Education
            'top':   'fa-briefcase',       // Experience
            'bottom':'fa-tools',           // Skills
            'left':  'fa-trophy',          // Achievements
            'back':  'fa-envelope'         // Contact
        };

        faceOrder.forEach((faceName) => {
            const face = document.createElement('div');
            face.className = `face face-${faceName}`;
            
            const color = this.faceToColor[faceName];
            
            // Create the 9 cubelets per face
            this.solvedState[faceName].forEach((_, index) => {
                const cubelet = document.createElement('div');
                cubelet.className = `cubelet ${color}`;
                cubelet.dataset.face = faceName;
                cubelet.dataset.position = index;
                cubelet.dataset.color = color;
                
                // Inject Icon into the CENTER cubelet (Index 4)
                if (index === 4) {
                    const icon = document.createElement('i');
                    icon.className = `fas ${faceIcons[faceName]} cube-face-icon`;
                    cubelet.appendChild(icon);
                }
                
                face.appendChild(cubelet);
            });
            
            this.cube.appendChild(face);
        });
        
        this.updateCubeTransform();
    }
    
    // Initializes event listeners for controls and interactions
    setupEventListeners() {
        // Attaches button click handlers
        this.scrambleBtn.addEventListener('click', () => this.scramble());
        this.solveBtn.addEventListener('click', () => this.solveToReveal());
        this.resetBtn.addEventListener('click', () => this.resetAll());
        this.rotateCubeBtn.addEventListener('click', () => this.randomRotateCube());
        this.shapeShiftBtn.addEventListener('click', () => this.shapeShiftCube());
        
        // Attaches step solve button handler
        this.stepBtn.addEventListener('click', () => this.stepSolve());
        
        // Attaches mouse drag handlers for rotation control
        // 1. Track if mouse moved to distinguish "Click" from "Drag"
        this.cubeWrapper.addEventListener('mousedown', (e) => {
            this.dragStartTime = Date.now();
            this.isDragMove = false;
            this.startDrag(e);
        });

        this.cubeWrapper.addEventListener('mousemove', (e) => {
            this.isDragMove = true; 
            this.drag(e);
        });

        // 2. Handle the "Tap" Event
        this.cubeWrapper.addEventListener('mouseup', (e) => {
            this.endDrag();
            
            const dragDuration = Date.now() - this.dragStartTime;
            
            // If it was a quick tap (less than 200ms) and NOT a drag interaction
            if (dragDuration < 200 && !this.isDragMove) {
                
                // Logic: Rotate to the NEXT section in the list
                if (!this.state.isAnimating && !this.state.isSolving) {
                    
                    // Find current section index
                    let nextStep = this.state.currentStep + 1;
                    
                    // Loop back to start if at the end
                    if (nextStep >= this.faceRotations.length) {
                        nextStep = 0;
                    }
                    
                    // Trigger the jump
                    this.state.currentStep = nextStep;
                    const faceNames = ['front', 'right', 'top', 'bottom', 'left', 'back'];
                    this.jumpToFace(faceNames[nextStep]);
                }
            }
        });
        
        // Attaches touch event handlers for mobile interaction
        this.cubeWrapper.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                this.dragStartTime = Date.now();
                this.isDragMove = false;
                this.startDrag(e.touches[0]);
                e.preventDefault();
            }
        });
        
        document.addEventListener('touchmove', (e) => {
            if (e.touches.length === 1) {
                this.isDragMove = true;
                this.drag(e.touches[0]);
                e.preventDefault();
            }
        });

        document.addEventListener('touchend', () => this.endDrag());
        
        // Attaches mouse wheel handler for zoom control
        this.cubeWrapper.addEventListener('wheel', (e) => {
            e.preventDefault();
            
            // Limits zoom event frequency for performance
            if (this.state.isRotating) return;
            this.state.isRotating = true;
            
            const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
            this.zoom(zoomFactor);
            
            // Resets solve sequence when user initiates manual control
            this.solveStack = [];
            
            setTimeout(() => {
                this.state.isRotating = false;
            }, 50);
        }, { passive: false });
        
        // Attaches keyboard shortcuts for quick actions
        document.addEventListener('keydown', (e) => {
            if (e.key === 's' || e.key === 'S') this.scramble();
            if (e.key === 'r' || e.key === 'R') this.resetAll();
            if (e.key === 'Enter') this.solveToReveal();
            if (e.key === 'Escape') this.resetAll();
            if (e.key === ' ') this.stepSolve(); // Spacebar for step solve
        });
        
        // NEW: Mute Button Logic
        const muteBtn = document.getElementById('muteBtn');
        if (muteBtn) {
            // Ensure button starts in unmuted state (sound on)
            muteBtn.classList.remove('active');
            const icon = muteBtn.querySelector('i');
            if (icon) {
                icon.className = 'fas fa-volume-up';
            }
            
            muteBtn.addEventListener('click', () => {
                const isMuted = this.soundFX.toggleMute();
                
                // Update Icon
                const icon = muteBtn.querySelector('i');
                if (isMuted) {
                    icon.className = 'fas fa-volume-mute';
                    muteBtn.classList.add('active'); // Use amber color for muted
                } else {
                    icon.className = 'fas fa-volume-up';
                    muteBtn.classList.remove('active');
                }
            });
        }
        
        // Enables face click navigation with stack clearing
        this.cube.addEventListener('click', (e) => {
            const cubelet = e.target.closest('.cubelet');
            if (cubelet && !this.state.isAnimating && !this.state.isSolving) {
                const faceName = cubelet.dataset.face;
                this.jumpToFace(faceName);
                
                // Resets solve sequence when user manually navigates
                this.solveStack = [];
            }
        });
        
        // ADD HOVER SOUNDS TO ALL BUTTONS
        const allButtons = document.querySelectorAll('button, .nav-icon-btn, .cubelet');
        
        allButtons.forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                this.soundFX.playHover();
            });
        });
    }
    
    // Rotates cube to specified face and reveals associated content
    jumpToFace(faceName) {
        // Maps face names to progression step indices
        const faceToStep = {
            'front': 0, 'right': 1, 'top': 2, 
            'bottom': 3, 'left': 4, 'back': 5
        };

        const stepIndex = faceToStep[faceName];
        if (stepIndex === undefined) return;

        // Resets solve sequence when navigating to face
        this.solveStack = [];

        this.state.isSolving = true;
        this.state.isAnimating = true;
        this.solveProgress.classList.add('show');
        this.updateProgress(stepIndex + 1);

        const targetRotation = this.faceRotations[stepIndex];
        const sectionId = this.resumeSections[stepIndex];

        // Prevents additional interactions during transition
        this.scrambleBtn.disabled = true;
        this.solveBtn.disabled = true;
        this.resetBtn.disabled = true;
        this.stepBtn.disabled = true;

        this.rotateToFace(targetRotation, () => {
            this.revealSection(sectionId);
            this.state.isSolving = false;
            this.state.isAnimating = false;
            
            // Restores button interactivity
            this.scrambleBtn.disabled = false;
            this.solveBtn.disabled = false;
            this.resetBtn.disabled = false;
            this.stepBtn.disabled = false;
            
            // Hide progress bar after delay
            setTimeout(() => {
                this.solveProgress.classList.remove('show');
            }, 1000);
        });
    }
    
    // Displays section content with synchronized visual styling
    revealSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.classList.remove('hidden');
            
            // Synchronizes background color with section theme
            const sectionColor = section.dataset.color;
            this.state.activeColor = sectionColor;
            this.applyBackgroundColor(sectionColor);

            setTimeout(() => {
                section.classList.add('revealed');
                section.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center',
                    inline: 'nearest'
                });
            }, 100);
        }
    }
    
    applyBackgroundColor(color) {
        // Removes existing color styling classes
        document.body.className = document.body.className.replace(/\bactive-\w+\b/g, '');
        
        // Adds color-specific styling class
        document.body.classList.add(`active-${color}`);
        
        // Creates dynamic stylesheet for color transition animations
        const styleId = 'dynamic-background-colors';
        let style = document.getElementById(styleId);
        if (!style) {
            style = document.createElement('style');
            style.id = styleId;
            document.head.appendChild(style);
        }
        
        // Defines gradient backgrounds for each section color theme
        const colorGradients = {
            'white': `linear-gradient(135deg, 
                rgba(255, 255, 255, 0.1) 0%, 
                rgba(200, 200, 200, 0.05) 50%,
                rgba(150, 150, 150, 0.02) 100%)`,
            'red': `linear-gradient(135deg, 
                rgba(255, 0, 85, 0.15) 0%, 
                rgba(204, 0, 0, 0.08) 50%,
                rgba(153, 0, 0, 0.03) 100%)`,
            'blue': `linear-gradient(135deg, 
                rgba(0, 204, 255, 0.15) 0%, 
                rgba(0, 102, 255, 0.08) 50%,
                rgba(0, 51, 204, 0.03) 100%)`,
            'green': `linear-gradient(135deg, 
                rgba(0, 255, 102, 0.15) 0%, 
                rgba(0, 204, 68, 0.08) 50%,
                rgba(0, 153, 51, 0.03) 100%)`,
            'orange': `linear-gradient(135deg, 
                rgba(255, 136, 0, 0.15) 0%, 
                rgba(255, 68, 0, 0.08) 50%,
                rgba(204, 51, 0, 0.03) 100%)`,
            'yellow': `linear-gradient(135deg, 
                rgba(255, 204, 0, 0.15) 0%, 
                rgba(255, 170, 0, 0.08) 50%,
                rgba(204, 136, 0, 0.03) 100%)`
        };
        
        const gradient = colorGradients[color] || colorGradients.white;
        
        style.textContent = `
            .active-${color}::before {
                content: '';
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: ${gradient};
                z-index: -1;
                pointer-events: none;
                animation: colorPulse 3s ease-in-out infinite;
                transition: opacity 0.8s ${this.animationTiming.snap};
            }
            
            @keyframes colorPulse {
                0%, 100% { opacity: 0.3; }
                50% { opacity: 0.5; }
            }
        `;
    }
    
    // Initiates cube drag interaction for rotation control
    startDrag(e) {
        if (this.state.isAnimating || this.state.isSolving || this.state.isRotating) return;
        
        this.state.isDragging = true;
        this.state.lastMousePos = { 
            x: e.clientX, 
            y: e.clientY 
        };
        this.cube.style.transition = 'none';
        this.cubeWrapper.style.cursor = 'grabbing';
        
        // Optimizes rendering for drag operations
        this.cube.style.willChange = 'transform';
        
        // Resets solve sequence when user initiates manual control
        this.solveStack = [];
    }
    
    drag(e) {
        if (!this.state.isDragging || this.state.isAnimating || this.state.isSolving) return;
        
        const deltaX = e.clientX - this.state.lastMousePos.x;
        const deltaY = e.clientY - this.state.lastMousePos.y;
        
        this.state.rotation.y += deltaX * 0.5;
        this.state.rotation.x -= deltaY * 0.5;
        
        // Applies animation frame for smooth rendering
        requestAnimationFrame(() => {
            this.updateCubeTransform();
        });
        
        this.incrementMoves();
        this.updateComplexity();
        this.updateDashboard(); // Update dashboard on drag
        
        this.state.lastMousePos = { x: e.clientX, y: e.clientY };
    }
    
    endDrag() {
        if (!this.state.isDragging) return;
        
        this.state.isDragging = false;
        this.cube.style.transition = `transform 0.5s ${this.animationTiming.smooth}`;
        this.cubeWrapper.style.cursor = 'grab';
        
        // Restores rendering optimization setting
        setTimeout(() => {
            this.cube.style.willChange = 'auto';
        }, 500);
    }
    
    zoom(factor) {
        if (this.state.isAnimating || this.state.isSolving) return;
        
        this.state.scale *= factor;
        this.state.scale = Math.max(0.3, Math.min(3, this.state.scale));
        
        // Resets solve sequence on zoom interaction
        this.solveStack = [];
        
        // Applies animated zoom transition
        this.cube.style.transition = `transform 0.3s ${this.animationTiming.smooth}`;
        this.updateCubeTransform();
        this.incrementMoves();
        this.updateComplexity();
        
        // Restores standard animation timing after zoom
        setTimeout(() => {
            this.cube.style.transition = `transform 0.5s ${this.animationTiming.smooth}`;
        }, 300);
    }
    
    // =================================================================
    // 1. SCRAMBLE ENGINE (The Chaos)
    // =================================================================
    scramble() {
        if (this.state.isAnimating) return;
        this.state.isAnimating = true;
        this.toggleButtons(true);
        
        // Reset
        this.solveStack = []; 
        this.state.moves = 0;
        this.updateDisplay();
        this.resetBackgroundColor();

        // 12 Moves of Chaos
        const scrambleMoves = this.generateScrambleSequence(12); 

        this.executeScrambleSequence(scrambleMoves, () => {
            this.state.isAnimating = false;
            this.toggleButtons(false);
            this.stepBtn.classList.add('ready');
            this.state.complexity = `SYSTEM ENCRYPTED: ${this.solveStack.length} BLOCKS`;
            this.updateDisplay();
            
            // NEW: Refresh the dashboard numbers immediately
            this.updateDashboard();
        });
    }

    // NEW: Random cube rotation (smooth visual rotation without affecting puzzle state)
    randomRotateCube() {
        if (this.state.isRotating) return;
        this.state.isRotating = true;
        
        // Generate gentle rotation values (1-2 full rotations for smooth feel)
        const randomX = (Math.random() * 360) + 360; // 360-720 degrees
        const randomY = (Math.random() * 360) + 360; // 360-720 degrees
        const randomZ = (Math.random() * 360) + 360; // 360-720 degrees
        
        // Smooth transition duration for gentle but noticeable effect
        const duration = 1.2; // seconds
        
        // Update rotation state
        this.state.rotation.x = randomX;
        this.state.rotation.y = randomY;
        this.state.rotation.z = randomZ;
        
        // Apply transition with smooth easing for gentle, fluid motion
        this.cube.style.transition = `transform ${duration}s cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
        this.updateCubeTransform();
        
        // Reset transition after animation completes
        setTimeout(() => {
            this.cube.style.transition = 'none';
            this.state.isRotating = false;
            // Play rotation sound effect
            this.soundFX.playSnap();
        }, duration * 1000);
    }

    // NEW: Shape shift the cube through 5 different forms
    shapeShiftCube() {
        if (this.state.isRotating) return;
        this.state.isRotating = true;
        
        // Cycle through shape modes: 0 (Normal) -> 1 (Flattened) -> 2 (Exploded) -> 3 (Twisted) -> 4 (Stretched) -> 0
        this.state.shapeShiftMode = (this.state.shapeShiftMode + 1) % 5;
        
        const duration = 0.8; // seconds
        this.cube.style.transition = `transform ${duration}s cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
        
        switch(this.state.shapeShiftMode) {
            case 0: // Normal form
                this.cube.style.transform = `
                    rotateX(${this.state.rotation.x}deg)
                    rotateY(${this.state.rotation.y}deg)
                    rotateZ(${this.state.rotation.z}deg)
                    scale(1)
                `;
                break;
            case 1: // Flattened form
                this.cube.style.transform = `
                    rotateX(${this.state.rotation.x}deg)
                    rotateY(${this.state.rotation.y}deg)
                    rotateZ(${this.state.rotation.z}deg)
                    scaleY(0.3)
                `;
                break;
            case 2: // Exploded form (spread out)
                this.cube.style.transform = `
                    rotateX(${this.state.rotation.x}deg)
                    rotateY(${this.state.rotation.y}deg)
                    rotateZ(${this.state.rotation.z}deg)
                    scale(1.4)
                `;
                break;
            case 3: // Twisted form (spiral-like with extra rotation)
                this.cube.style.transform = `
                    rotateX(${this.state.rotation.x + 45}deg)
                    rotateY(${this.state.rotation.y + 45}deg)
                    rotateZ(${this.state.rotation.z + 90}deg)
                    scale(0.9)
                `;
                break;
            case 4: // Stretched form (elongated horizontally)
                this.cube.style.transform = `
                    rotateX(${this.state.rotation.x}deg)
                    rotateY(${this.state.rotation.y}deg)
                    rotateZ(${this.state.rotation.z}deg)
                    scaleX(1.6)
                    scaleY(0.8)
                `;
                break;
        }
        
        // Play shape shift sound
        this.soundFX.playScrambleNoise();
        
        // Reset animation flag
        setTimeout(() => {
            this.state.isRotating = false;
        }, duration * 1000);
    }

    // Helper to toggle all buttons
    toggleButtons(disabled) {
        this.scrambleBtn.disabled = disabled;
        this.solveBtn.disabled = disabled;
        this.resetBtn.disabled = disabled;
        this.stepBtn.disabled = disabled;
    }
    
    resetBackgroundColor() {
        // Removes all color styling classes from body element
        document.body.className = document.body.className.replace(/\bactive-\w+\b/g, '');
        this.state.activeColor = null;
    }
    
    generateScrambleSequence(count) {
        const moves = [];
        const faceNames = ['R', 'L', 'U', 'D', 'F', 'B'];
        const modifiers = ['', "'", '2'];
        
        for (let i = 0; i < count; i++) {
            const face = faceNames[Math.floor(Math.random() * faceNames.length)];
            const modifier = modifiers[Math.floor(Math.random() * modifiers.length)];
            const angle = this.getAngleFromMove(face, modifier);
            
            moves.push({
                face,
                modifier,
                angle,
                duration: 250 + Math.random() * 100 // Adds slight variation for natural appearance
            });
        }
        
        return moves;
    }
    
    getAngleFromMove(face, modifier) {
        let angle = 90;
        if (modifier === "'") angle = -90;
        if (modifier === '2') angle = 180;
        return angle;
    }
    
    executeScrambleSequence(moves, callback) {
        let index = 0;
        
        // NEW: Play the digital glitch sound at start
        this.soundFX.playScrambleNoise();
        
        const executeNext = () => {
            if (index >= moves.length) { if (callback) callback(); return; }
            const move = moves[index];

            // 1. Record Reverse Move
            let reverseMove = { axis: '', angle: 0, duration: 800 }; 
            switch(move.face) {
                case 'R': this.state.rotation.y += move.angle; reverseMove.axis='y'; reverseMove.angle = -move.angle; break;
                case 'L': this.state.rotation.y -= move.angle; reverseMove.axis='y'; reverseMove.angle = move.angle; break;
                case 'U': this.state.rotation.x -= move.angle; reverseMove.axis='x'; reverseMove.angle = move.angle; break;
                case 'D': this.state.rotation.x += move.angle; reverseMove.axis='x'; reverseMove.angle = -move.angle; break;
                case 'F': this.state.rotation.z += move.angle; reverseMove.axis='z'; reverseMove.angle = -move.angle; break;
                case 'B': this.state.rotation.z -= move.angle; reverseMove.axis='z'; reverseMove.angle = move.angle; break;
            }
            this.solveStack.push(reverseMove);

            // 2. Animate Rotation (Snappy but Smooth)
            this.cube.style.transition = `transform 250ms cubic-bezier(0.4, 0.0, 0.2, 1)`;
            this.updateCubeTransform();
            
            // 3. VISUAL: Trigger "Schematic Dissolve"
            this.triggerVisualEffect('encrypt', 6); 
            
            // NEW: Play a mechanical snap on every turn
            this.soundFX.playSnap();

            index++;
            setTimeout(() => requestAnimationFrame(executeNext), 220); // Smooth timing
        };
        executeNext();
    }
    
    scrambleColors() {
        const cubelets = this.cube.querySelectorAll('.cubelet');
        const colors = ['red', 'orange', 'yellow', 'green', 'blue', 'white'];
        
        cubelets.forEach(cubelet => {
            // 30% chance to glitch a color
            if (Math.random() < 0.3) {
                const currentColor = cubelet.dataset.color; // The TRUE color
                let newColor;
                
                // Pick a random WRONG color
                do {
                    newColor = colors[Math.floor(Math.random() * colors.length)];
                } while (newColor === currentColor);
                
                cubelet.className = `cubelet ${newColor}`; 
                
                // Add a glitch animation
                cubelet.style.transform = 'scale(0.9)';
                setTimeout(() => cubelet.style.transform = 'scale(1)', 200);
            }
        });
    }
    
    // UPDATED: Solve to Reveal function
    solveToReveal() {
        if (this.state.isAnimating || this.state.isSolving) return;
        
        // Clear solve stack when using auto-solve
        this.solveStack = [];
        
        this.state.isSolving = true;
        this.state.currentStep = 0;
        this.scrambleBtn.disabled = true;
        this.solveBtn.disabled = true;
        this.resetBtn.disabled = true;
        this.stepBtn.disabled = true;
        
        // Show progress bar
        this.solveProgress.classList.add('show');
        
        // Reset moves counter
        this.state.moves = 0;
        this.updateDisplay();
        
        // Hide all sections first
        this.hideAllSections();
        
        // Reset background color
        this.resetBackgroundColor();
        
        // Start solving sequence
        this.solveNextStep();
    }
    
    solveNextStep() {
        if (this.state.currentStep >= this.state.totalSteps) {
            this.completeSolve();
            return;
        }
        
        const step = this.state.currentStep;
        const targetRotation = this.faceRotations[step];
        const sectionId = this.resumeSections[step];
        
        // Update progress
        this.updateProgress(step + 1);
        
        // Rotate cube to next face
        this.rotateToFace(targetRotation, () => {
            // After rotation completes, reveal the section
            this.revealSection(sectionId);
            
            // Move to next step after delay
            setTimeout(() => {
                this.state.currentStep++;
                this.solveNextStep();
            }, 800); // Reduced from 1000ms for faster flow
        });
    }
    
    // UPDATED: rotateToFace with Power4 Out timing
    rotateToFace(targetRotation, callback) {
        this.state.isAnimating = true;
        this.state.isRotating = true;
        
        // SMOOTH ANIMATION 
        this.cube.style.transition = `transform 1.1s ${this.animationTiming.snap}`;
        this.state.rotation.x = targetRotation.x;
        this.state.rotation.y = targetRotation.y;
        this.updateCubeTransform();
        
        // Update moves counter
        this.incrementMoves();
        this.updateComplexity();
        
        // Highlight the face with correct color
        setTimeout(() => {
            this.highlightFace(targetRotation.color);
            
            setTimeout(() => {
                this.state.isAnimating = false;
                this.state.isRotating = false;
                if (callback) callback();
            }, 400);
        }, 800);
    }
    
    highlightFace(color) {
        const cubelets = this.cube.querySelectorAll('.cubelet');
        const colorMap = {
            'white': 'white',
            'red': 'red',
            'blue': 'blue',
            'green': 'green',
            'orange': 'orange',
            'yellow': 'yellow'
        };
        
        const targetColor = colorMap[color];
        
        cubelets.forEach((cubelet, index) => {
            setTimeout(() => {
                // Change to correct color for this step
                cubelet.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
                cubelet.className = `cubelet ${targetColor}`;
                cubelet.dataset.color = targetColor;
                
                // Add highlight animation
                cubelet.style.transform = 'scale(1.08)';
                cubelet.style.boxShadow = `0 0 18px ${this.getColorHex(targetColor)}`;
                
                setTimeout(() => {
                    cubelet.style.transform = 'scale(1)';
                    cubelet.style.boxShadow = '';
                }, 300);
            }, index * 20); 
        });
    }
    
    getColorHex(color) {
        const colorMap = {
            'red': '#e63946',
            'orange': '#f4a261',
            'yellow': '#ffb703',
            'green': '#2a9d8f',
            'blue': '#0077b6',
            'white': '#f8f9fa'
        };
        return colorMap[color] || '#ffffff';
    }
    
    hideAllSections() {
        this.resumeSections.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (section) {
                section.classList.remove('revealed');
                section.classList.add('hidden');
            }
        });
    }
    
    updateProgress(currentStep) {
        const progress = (currentStep / this.state.totalSteps) * 100;
        this.progressFill.style.transition = `width 0.8s ${this.animationTiming.smooth}`;
        this.progressFill.style.width = `${progress}%`;
        this.progressText.textContent = `${currentStep}/${this.state.totalSteps} Sections`;
    }
    
    completeSolve() {
        // Stop the game timer when puzzle is solved
        this.stopGameTimer();
        
        // NEW: Play the victory chime!
        this.soundFX.playSuccess();
        
        this.state.isSolving = false;
        this.scrambleBtn.disabled = false;
        this.solveBtn.disabled = false;
        this.resetBtn.disabled = false;
        this.stepBtn.disabled = false;
        
        // Hide progress bar after delay
        setTimeout(() => {
            this.solveProgress.classList.remove('show');
        }, 1500); // Reduced from 2000ms
        
        // Update header to show system optimized state
        updateHeaderState(true);
        
        // Celebration effect
        this.celebrateCompletion();
        
        // Update complexity
        this.state.complexity = 'O(1)';
        this.updateDisplay();
        
        // Scroll to top of resume content
        setTimeout(() => {
            this.resumeContent.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }, 300);
    }
    
    celebrateCompletion() {
        // Add celebration to math symbols
        const mathSymbols = document.querySelectorAll('.math');
        mathSymbols.forEach((symbol, index) => {
            setTimeout(() => {
                symbol.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
                symbol.style.color = '#00ff66';
                symbol.style.transform = 'scale(1.2)';
                symbol.style.textShadow = '0 0 25px #00ff66';
                
                setTimeout(() => {
                    symbol.style.color = '';
                    symbol.style.transform = '';
                    symbol.style.textShadow = '';
                }, 400); 
            }, index * 80); 
        });
        
        // Completion pulse to cube
        this.cube.style.transition = 'box-shadow 0.5s ease';
        this.cube.style.boxShadow = '0 0 40px rgba(0, 255, 100, 0.5)';
        setTimeout(() => {
            this.cube.style.boxShadow = '';
        }, 800); 
    }
    
    // UPDATED: Reset All function with solveStack clearance
    resetAll() {
        if (this.state.isAnimating || this.state.isSolving) return;
        
        // Reset step fix counter and game state
        this.state.stepFixCounter = 0;
        
        this.state.rotation = { x: -25, y: -25, z: 0 };
        this.state.scale = 1;
        this.state.moves = 0;
        this.state.currentStep = 0;
        this.state.complexity = 'O(1)';
        this.state.isSolving = false;
        this.state.activeColor = null;
        this.state.isRotating = false;
        
        // Clear solve stack
        this.solveStack = [];
        
        // Reset cube rotation with smooth timing
        this.cube.style.transition = `transform 0.9s ${this.animationTiming.snap}`;
        this.updateCubeTransform();
        
        // Reset cube colors to solved state
        setTimeout(() => {
            this.createCube();
        }, 300);
        
        // Hide all sections
        this.hideAllSections();
        
        // Reset progress
        this.updateProgress(0);
        this.solveProgress.classList.remove('show');
        
        // Reset background color
        this.resetBackgroundColor();
        
        // Reset moves counter
        this.updateDisplay();
        
        // Reset dashboard to show all zeros
        const faces = ['front', 'back', 'left', 'right', 'top', 'bottom'];
        faces.forEach(face => {
            const btn = document.getElementById(`stat-${face}`);
            const countSpan = btn.querySelector('.error-count');
            countSpan.innerText = '0';
            btn.classList.remove('active');
        });
        
        // Reset UI text
        this.complexityValue.textContent = 'O(1)';
        this.movesCounter.textContent = '0';
        
        // Reset header to unoptimized state
        updateHeaderState(false);
        
        // Scroll to top
        setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 200);
        
        // Re-enable buttons
        this.scrambleBtn.disabled = false;
        this.solveBtn.disabled = false;
        this.resetBtn.disabled = false;
        this.stepBtn.disabled = false;
        
        setTimeout(() => {
            this.cube.style.transition = `transform 0.5s ${this.animationTiming.smooth}`;
        }, 900);
    }
    
    animateIntro() {
        // PHASE 1: Gentle, smooth rotation to showcase the cube
        this.cube.style.transition = `transform 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
        this.state.rotation = { x: -30, y: 40, z: 0 };
        this.updateCubeTransform();
        
        // PHASE 2: Settle into hero display position (Isometric showcase angle)
        setTimeout(() => {
            this.cube.style.transition = `transform 1.0s cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
            this.state.rotation = { x: -30, y: 40, z: 0 };
            this.updateCubeTransform();
        }, 1500);
    }
    
    updateCubeTransform() {
        // Use requestAnimationFrame for smoother updates
        requestAnimationFrame(() => {
            this.cube.style.transform = `
                rotateX(${this.state.rotation.x}deg)
                rotateY(${this.state.rotation.y}deg)
                rotateZ(${this.state.rotation.z}deg)
                scale(${this.state.scale})
            `;
        });
    }
    
    updateDisplay() {
        this.movesCounter.textContent = this.state.moves;
        this.complexityValue.textContent = this.state.complexity;
        
        // Animate counter with smooth timing
        this.movesCounter.style.transition = 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)';
        this.movesCounter.style.transform = 'scale(1.08)';
        setTimeout(() => {
            this.movesCounter.style.transform = 'scale(1)';
        }, 120); 
    }
    
    incrementMoves() {
        this.state.moves++;
        this.updateDisplay();
    }
    
    updateComplexity() {
        // Update complexity based on moves
        if (this.state.moves < 5) {
            this.state.complexity = 'O(1)';
        } else if (this.state.moves < 10) {
            this.state.complexity = 'O(log n)';
        } else if (this.state.moves < 20) {
            this.state.complexity = 'O(n)';
        } else if (this.state.moves < 30) {
            this.state.complexity = 'O(n²)';
        } else {
            this.state.complexity = 'O(n³)';
        }
        
        this.complexityValue.textContent = this.state.complexity;
    }

    // ===============================================
    // PRIORITY DASHBOARD LOGIC
    // ===============================================

    // 1. CALCULATE ERRORS & UPDATE UI
    updateDashboard() {
        const faces = ['front', 'back', 'left', 'right', 'top', 'bottom'];
        const cubelets = Array.from(this.cube.querySelectorAll('.cubelet'));

        let totalErrors = 0;

        faces.forEach(face => {
            // Find all pieces that belong to this face
            const pieces = cubelets.filter(c => c.dataset.face === face);
            
            // Count how many are WRONG (visual class doesn't match data-color)
            const errorCount = pieces.filter(c => !c.classList.contains(c.dataset.color)).length;
            totalErrors += errorCount;

            // UPDATE BUTTON
            const btn = document.getElementById(`stat-${face}`);
            const countSpan = btn.querySelector('.error-count');
            
            // Update Text
            countSpan.innerText = errorCount;

            // Update Visual State
            if (errorCount > 0) {
                btn.classList.add('active'); // Lights up
            } else {
                btn.classList.remove('active'); // Goes dim
            }
        });

        // Optional: Update global text status
        if(totalErrors === 0 && !this.state.isAnimating) {
             this.state.complexity = "SYSTEM OPTIMIZED";
             this.updateDisplay();
        }
    }

    // 2. FIX SECTOR (Updated to refresh dashboard)
    fixSector(faceName) {
        if (this.state.isAnimating) return;
        
        // Safety: Don't fix if count is 0
        const btn = document.getElementById(`stat-${faceName}`);
        if (!btn.classList.contains('active')) return;

        this.state.isAnimating = true;

        // A. ROTATE
        const angles = {
            'front':  { x: -25, y: -25 },   'back':   { x: -25, y: 155 },
            'left':   { x: -25, y: 65 },    'right':  { x: -25, y: -115 },
            'top':    { x: 65,  y: -25 },   'bottom': { x: -115, y: -25 }
        };

        this.cube.style.transition = "transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)";
        this.state.rotation = { ...angles[faceName], z: 0 };
        this.updateCubeTransform();

        // B. ANIMATE FIX
        setTimeout(() => {
            const cubelets = this.cube.querySelectorAll('.cubelet');
            const targetPieces = Array.from(cubelets).filter(c => c.dataset.face === faceName);

            targetPieces.forEach((c, index) => {
                const trueColor = c.dataset.color;
                const positionClass = `face-${c.dataset.face}`;

                // Only animate if it's actually broken
                if (!c.classList.contains(trueColor)) {
                    setTimeout(() => {
                        c.classList.remove('restoring');
                        void c.offsetWidth;
                        c.classList.add('restoring');

                        setTimeout(() => {
                            // Restore Color
                            c.className = `cubelet ${trueColor} restoring ${positionClass}`;
                        }, 200);
                    }, index * 50);
                }
            });

            // C. FINISH & REFRESH NUMBERS
            setTimeout(() => {
                this.state.isAnimating = false;
                this.updateDashboard(); 
            }, 1000);

        }, 400);
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    const cube3D = new Cube3DResume();
    
    // Click handlers for contact buttons
    document.querySelectorAll('.contact-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            if (btn.classList.contains('outline')) {
                alert('Phone: +63 9919904578');
            } else {
                window.location.href = 'mailto:silvasoderevrenzjoshua@gmail.com';
            }
        });
    });
    
    // HUD button event listeners with Cube Rotation
    const hudButtons = document.querySelectorAll('.nav-icon-btn:not(.control-btn):not(.action-btn)');
    
    hudButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = btn.getAttribute('data-section');
            
            if (targetId) {
                // 1. Highlight Button
                hudButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // 2. Trigger Cube Rotation
                // Map the button to the face index
                const sectionMap = {
                    'section-overview': 0,
                    'section-education': 1,
                    'section-experience': 2,
                    'section-skills': 3,
                    'section-achievements': 4,
                    'section-contact': 5
                };
                
                const index = sectionMap[targetId];
                const faceNames = ['front', 'right', 'top', 'bottom', 'left', 'back'];
                
                // Use the cube3D instance to trigger rotation
                if (cube3D && faceNames[index]) {
                    cube3D.jumpToFace(faceNames[index]);
                }
            }
        });
    });
    
    // Initialize 3D Tilt Effect on Cards
    initTiltEffect();
    
    // Performance optimization for the entire page
    if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
            // Preload animations
            document.body.classList.add('animations-ready');
        });
    }
});

// Interactive 3D Tilt Effect for Cards 
function initTiltEffect() {
    document.addEventListener('mousemove', (e) => {
        const cards = document.querySelectorAll('.info-card');
        
        cards.forEach(card => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Only animate if mouse is near or over the card
            if (x > -100 && x < rect.width + 100 && y > -100 && y < rect.height + 100) {
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                // Calculate tilt (limit to small angles for subtlety)
                const rotateX = ((y - centerY) / centerY) * -2; 
                const rotateY = ((x - centerX) / centerX) * 2;  
                
                // Apply Transform
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
                
                // Optional: Move the background glow (Spotlight effect)
                card.style.background = `
                    radial-gradient(
                        circle at ${x}px ${y}px, 
                        rgba(255,255,255,0.08) 0%, 
                        rgba(30, 32, 38, 0.75) 60%
                    )
                `;
            } else {
                // Reset when mouse leaves
                card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
                card.style.background = 'rgba(30, 32, 38, 0.75)';
            }
        });
    });
}

/* =========================================
   AUTO-SCROLL ANIMATION FOR LEADERSHIP CARD
   ========================================= */
function initScrollableCardAnimation() {
    const scrollableContent = document.querySelector('.scrollable-content');
    
    if (!scrollableContent) return;
    
    // Ensure it starts at the very top 
    scrollableContent.scrollTop = 0;
    
    // Wait longer (5 seconds)  
    setTimeout(() => {
        let isAutoScrolling = true;
        
        // Auto-scroll animation: scroll down to reveal the 4th item
        const autoScrollInterval = setInterval(() => {
            if (!isAutoScrolling) {
                clearInterval(autoScrollInterval);
                return;
            }
            
            const maxScroll = scrollableContent.scrollHeight - scrollableContent.clientHeight;
            
            // Scroll down smoothly with smaller increments
            scrollableContent.scrollTop += 1.5;
            
            // Stop when reached bottom (Supreme Student Government is visible)
            if (scrollableContent.scrollTop >= maxScroll) {
                scrollableContent.scrollTop = maxScroll;
                isAutoScrolling = false;
                clearInterval(autoScrollInterval);
            }
        }, 16);
        
        // Allow manual scroll to stop auto-scroll
        scrollableContent.addEventListener('wheel', () => {
            isAutoScrolling = false;
            clearInterval(autoScrollInterval);
        }, { once: true });
        
        scrollableContent.addEventListener('touchstart', () => {
            isAutoScrolling = false;
            clearInterval(autoScrollInterval);
        }, { once: true });
    }, 5000);
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initScrollableCardAnimation();
});