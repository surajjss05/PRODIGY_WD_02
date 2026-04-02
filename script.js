// DOM Elements
const minutesDisplay = document.getElementById('minutes');
const secondsDisplay = document.getElementById('seconds');
const millisecondsDisplay = document.getElementById('milliseconds');

const startPauseBtn = document.getElementById('startPauseBtn');
const startIcon = document.getElementById('startIcon');
const startText = document.getElementById('startText');

const resetBtn = document.getElementById('resetBtn');
const lapBtn = document.getElementById('lapBtn');
const clearLapsBtn = document.getElementById('clearLapsBtn');
const lapsList = document.getElementById('lapsList');

// State Variables
let startTime = 0;
let elapsedTime = 0;
let timerInterval = null;
let isRunning = false;
let laps = [];
let lastLapTime = 0;

// Initialize Empty State
renderEmptyLaps();

// Event Listeners
startPauseBtn.addEventListener('click', toggleStartPause);
resetBtn.addEventListener('click', resetTimer);
lapBtn.addEventListener('click', recordLap);
clearLapsBtn.addEventListener('click', clearLaps);

/**
 * Format time in ms to MM:SS.ms string parts
 */
function formatTime(timeInMs) {
    let date = new Date(timeInMs);
    let minutes = Math.floor(timeInMs / 60000).toString().padStart(2, '0');
    let seconds = Math.floor((timeInMs % 60000) / 1000).toString().padStart(2, '0');
    let milliseconds = Math.floor((timeInMs % 1000) / 10).toString().padStart(2, '0');
    return { minutes, seconds, milliseconds };
}

/**
 * Format string e.g. "01:23.45"
 */
function formatTimeString(timeInMs) {
    const { minutes, seconds, milliseconds } = formatTime(timeInMs);
    return `${minutes}:${seconds}.${milliseconds}`;
}

/**
 * Update the DOM display
 */
function updateDisplay(timeInMs) {
    const { minutes, seconds, milliseconds } = formatTime(timeInMs);
    minutesDisplay.textContent = minutes;
    secondsDisplay.textContent = seconds;
    millisecondsDisplay.textContent = milliseconds;
}

/**
 * Main timer loop using setInterval
 */
function updateTimer() {
    const now = Date.now();
    elapsedTime = now - startTime;
    updateDisplay(elapsedTime);
}

/**
 * Toggle Start and Pause states
 */
function toggleStartPause() {
    if (!isRunning) {
        // Start
        startTime = Date.now() - elapsedTime;
        timerInterval = setInterval(updateTimer, 10);
        isRunning = true;
        
        // Update UI
        startPauseBtn.classList.remove('start');
        startPauseBtn.classList.add('pause');
        startIcon.classList.replace('ph-play', 'ph-pause');
        startText.textContent = 'Pause';
        
        lapBtn.disabled = false;
        resetBtn.disabled = true; // disable reset while running
    } else {
        // Pause
        clearInterval(timerInterval);
        isRunning = false;
        
        // Update UI
        startPauseBtn.classList.remove('pause');
        startPauseBtn.classList.add('start');
        startIcon.classList.replace('ph-pause', 'ph-play');
        startText.textContent = 'Resume';
        
        lapBtn.disabled = true;
        resetBtn.disabled = false; // enable reset while paused
    }
}

/**
 * Reset Timer
 */
function resetTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    elapsedTime = 0;
    
    // Update Display
    updateDisplay(0);
    
    // Reset Buttons UI
    startPauseBtn.classList.remove('pause');
    startPauseBtn.classList.add('start');
    startIcon.classList.replace('ph-pause', 'ph-play');
    startText.textContent = 'Start';
    
    lapBtn.disabled = true;
    resetBtn.disabled = true; // no need to reset if already 0
}

/**
 * Record a Lap
 */
function recordLap() {
    if (!isRunning) return;

    const lapDuration = elapsedTime - lastLapTime;
    lastLapTime = elapsedTime;

    const lapData = {
        index: laps.length + 1,
        overallTime: elapsedTime,
        lapTime: lapDuration
    };

    laps.unshift(lapData); // add to beginning
    renderLaps();
    
    // Enable clear laps
    clearLapsBtn.disabled = false;
}

/**
 * Clear Laps List
 */
function clearLaps() {
    laps = [];
    lastLapTime = 0;
    if (isRunning) {
      lastLapTime = elapsedTime;
    }
    renderLaps();
    clearLapsBtn.disabled = true;
}

function renderEmptyLaps() {
    lapsList.innerHTML = `<li class="empty-laps">No laps recorded yet.</li>`;
}

/**
 * Render Laps into DOM
 */
function renderLaps() {
    if (laps.length === 0) {
        renderEmptyLaps();
        return;
    }

    // Find fastest/slowest for coloring (if more than 1 lap)
    let fastestLapIndex = -1;
    let slowestLapIndex = -1;
    
    if (laps.length > 1) {
        let minTime = Infinity;
        let maxTime = -Infinity;
        
        laps.forEach((lap, idx) => {
            if (lap.lapTime < minTime) { minTime = lap.lapTime; fastestLapIndex = idx; }
            if (lap.lapTime > maxTime) { maxTime = lap.lapTime; slowestLapIndex = idx; }
        });
    }

    lapsList.innerHTML = '';
    
    laps.forEach((lap, idx) => {
        const li = document.createElement('li');
        li.className = 'lap-item';
        
        if (idx === fastestLapIndex) li.classList.add('fastest');
        if (idx === slowestLapIndex) li.classList.add('slowest');

        li.innerHTML = `
            <span class="lap-index">Lap ${lap.index}</span>
            <span class="lap-diff">+${formatTimeString(lap.lapTime)}</span>
            <span class="lap-time">${formatTimeString(lap.overallTime)}</span>
        `;
        
        lapsList.appendChild(li);
    });
}
