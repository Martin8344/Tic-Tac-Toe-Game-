const setupCard = document.getElementById("setupCard");
const gameArea = document.getElementById("gameArea");

const playerOneInput = document.getElementById("playerOneInput");
const playerTwoInput = document.getElementById("playerTwoInput");
const errorMsg = document.getElementById("errorMsg");
const startBtn = document.getElementById("startBtn");

const soundToggleBtn = document.getElementById("soundToggleBtn");
const musicToggleBtn = document.getElementById("musicToggleBtn");
const soundIconOn = document.getElementById("soundIconOn");
const soundIconOff = document.getElementById("soundIconOff");
const musicIconOn = document.getElementById("musicIconOn");
const musicIconOff = document.getElementById("musicIconOff");
const soundVolumeSlider = document.getElementById("soundVolume");
const musicVolumeSlider = document.getElementById("musicVolume");
const musicSelect = document.getElementById("musicSelect");

const playerOneNameText = document.getElementById("playerOneName");
const playerTwoNameText = document.getElementById("playerTwoName");
const playerOneScoreText = document.getElementById("playerOneScore");
const playerTwoScoreText = document.getElementById("playerTwoScore");

const playerOneCard = document.getElementById("playerOneCard");
const playerTwoCard = document.getElementById("playerTwoCard");

const turnImg = document.getElementById("turnImg");
const turnText = document.getElementById("turnText");
const cells = document.querySelectorAll(".cell");

const celebrationOverlay = document.getElementById("celebrationOverlay");
const celebrationCard = document.getElementById("celebrationCard");
const winnerImg = document.getElementById("winnerImg");
const celebrationBadge = document.getElementById("celebrationBadge");
const winnerTitle = document.getElementById("winnerTitle");

const playAgainBtn = document.getElementById("playAgainBtn");
const resetScoreBtn = document.getElementById("resetScoreBtn");
const newPlayersBtn = document.getElementById("newPlayersBtn");

const winSound = document.getElementById("winSound");

let playerOneName = "Player 1";
let playerTwoName = "Player 2";
let playerOneScore = 0;
let playerTwoScore = 0;

let currentPlayer = "X";
let gameActive = true;
let boardState = ["", "", "", "", "", "", "", "", ""];

let audioContext = null;
let isSoundMuted = false;
let isMusicMuted = false;
let soundLevel = 0.8;
let musicLevel = 0.65;
let selectedTrack = "chill";
let musicTimer = null;
let musicStep = 0;

const winPatterns = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

const musicTracks = {
    chill: {
        tempo: 360,
        wave: "triangle",
        melody: [
            329.63, 392.00, 493.88, 523.25,
            493.88, 392.00, 329.63, 392.00,
            293.66, 349.23, 440.00, 523.25,
            440.00, 349.23, 329.63, 392.00
        ],
        bass: [
            130.81, 0, 130.81, 0,
            146.83, 0, 146.83, 0,
            110.00, 0, 110.00, 0,
            123.47, 0, 123.47, 0
        ]
    },
    arcade: {
        tempo: 250,
        wave: "square",
        melody: [
            523.25, 659.25, 783.99, 659.25,
            587.33, 698.46, 880.00, 698.46,
            523.25, 659.25, 783.99, 1046.50,
            783.99, 659.25, 587.33, 493.88
        ],
        bass: [
            130.81, 130.81, 196.00, 130.81,
            146.83, 146.83, 220.00, 146.83,
            130.81, 130.81, 196.00, 130.81,
            123.47, 123.47, 196.00, 146.83
        ]
    },
    lofi: {
        tempo: 460,
        wave: "sine",
        melody: [
            261.63, 329.63, 392.00, 329.63,
            293.66, 349.23, 440.00, 349.23,
            220.00, 261.63, 329.63, 261.63,
            246.94, 293.66, 392.00, 293.66
        ],
        bass: [
            130.81, 0, 0, 0,
            116.54, 0, 0, 0,
            110.00, 0, 0, 0,
            98.00, 0, 0, 0
        ]
    },
    cyber: {
        tempo: 280,
        wave: "sawtooth",
        melody: [
            220.00, 261.63, 329.63, 440.00,
            392.00, 329.63, 293.66, 329.63,
            220.00, 261.63, 329.63, 493.88,
            440.00, 392.00, 329.63, 293.66
        ],
        bass: [
            110.00, 110.00, 110.00, 110.00,
            98.00, 98.00, 98.00, 98.00,
            87.31, 87.31, 87.31, 87.31,
            98.00, 98.00, 110.00, 123.47
        ]
    }
};

function initAudio() {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) {
        return null;
    }

    if (!audioContext) {
        audioContext = new AudioCtx();
    }

    if (audioContext.state === "suspended") {
        audioContext.resume();
    }

    return audioContext;
}

function playMusicStep() {
    if (isMusicMuted || musicLevel <= 0) {
        return;
    }

    const ctx = initAudio();
    if (!ctx) {
        return;
    }

    const track = musicTracks[selectedTrack];
    const now = ctx.currentTime;
    const noteFreq = track.melody[musicStep];
    const bassFreq = track.bass[musicStep];

    const melodyGainPeak = (track.wave === "square" || track.wave === "sawtooth" ? 0.11 : 0.22) * musicLevel;
    const bassGainPeak = 0.22 * musicLevel;

    const melodyOsc = ctx.createOscillator();
    const melodyFilter = ctx.createBiquadFilter();
    const melodyGain = ctx.createGain();

    melodyOsc.type = track.wave;
    melodyOsc.frequency.setValueAtTime(noteFreq, now);

    melodyFilter.type = "lowpass";
    melodyFilter.frequency.setValueAtTime(1400, now);

    melodyGain.gain.setValueAtTime(0.001, now);
    melodyGain.gain.linearRampToValueAtTime(melodyGainPeak, now + 0.03);
    melodyGain.gain.exponentialRampToValueAtTime(0.001, now + (track.tempo / 1000) * 0.92);

    melodyOsc.connect(melodyFilter);
    melodyFilter.connect(melodyGain);
    melodyGain.connect(ctx.destination);

    melodyOsc.start(now);
    melodyOsc.stop(now + (track.tempo / 1000) * 0.95);

    if (bassFreq > 0) {
        const bassOsc = ctx.createOscillator();
        const bassFilter = ctx.createBiquadFilter();
        const bassGain = ctx.createGain();

        bassOsc.type = "sine";
        bassOsc.frequency.setValueAtTime(bassFreq, now);

        bassFilter.type = "lowpass";
        bassFilter.frequency.setValueAtTime(520, now);

        bassGain.gain.setValueAtTime(0.001, now);
        bassGain.gain.linearRampToValueAtTime(bassGainPeak, now + 0.04);
        bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

        bassOsc.connect(bassFilter);
        bassFilter.connect(bassGain);
        bassGain.connect(ctx.destination);

        bassOsc.start(now);
        bassOsc.stop(now + 0.48);
    }

    musicStep = (musicStep + 1) % track.melody.length;
}

function startBackgroundMusic() {
    if (isMusicMuted || musicLevel <= 0 || musicTimer !== null) {
        return;
    }

    const ctx = initAudio();
    if (!ctx) {
        return;
    }

    const track = musicTracks[selectedTrack];
    playMusicStep();
    musicTimer = setInterval(playMusicStep, track.tempo);
}

function stopBackgroundMusic() {
    if (musicTimer !== null) {
        clearInterval(musicTimer);
        musicTimer = null;
    }
}

function changeMusicTrack() {
    selectedTrack = musicSelect.value;
    musicStep = 0;

    if (musicTimer !== null) {
        stopBackgroundMusic();
        startBackgroundMusic();
    } else if (!isMusicMuted && musicLevel > 0 && !gameArea.classList.contains("hidden") && gameActive) {
        startBackgroundMusic();
    }
}

function updateSoundButtonUI() {
    if (isSoundMuted || soundLevel <= 0) {
        soundIconOn.classList.add("hidden");
        soundIconOff.classList.remove("hidden");
        soundToggleBtn.classList.add("muted-btn");
    } else {
        soundIconOn.classList.remove("hidden");
        soundIconOff.classList.add("hidden");
        soundToggleBtn.classList.remove("muted-btn");
    }
}

function updateMusicButtonUI() {
    if (isMusicMuted || musicLevel <= 0) {
        musicIconOn.classList.add("hidden");
        musicIconOff.classList.remove("hidden");
        musicToggleBtn.classList.add("muted-btn");
    } else {
        musicIconOn.classList.remove("hidden");
        musicIconOff.classList.add("hidden");
        musicToggleBtn.classList.remove("muted-btn");
    }
}

function toggleSoundMute() {
    isSoundMuted = !isSoundMuted;

    if (isSoundMuted) {
        stopCelebrationSound();
    } else if (soundLevel === 0) {
        soundLevel = 0.5;
        soundVolumeSlider.value = "50";
    }

    updateSoundButtonUI();
}

function toggleMusicMute() {
    isMusicMuted = !isMusicMuted;

    if (isMusicMuted) {
        stopBackgroundMusic();
    } else {
        if (musicLevel === 0) {
            musicLevel = 0.5;
            musicVolumeSlider.value = "50";
        }
        if (!gameArea.classList.contains("hidden") && gameActive) {
            startBackgroundMusic();
        }
    }

    updateMusicButtonUI();
}

function handleSoundVolumeChange() {
    soundLevel = Number(soundVolumeSlider.value) / 100;

    if (winSound) {
        winSound.volume = soundLevel;
    }

    if (soundLevel === 0) {
        isSoundMuted = true;
        stopCelebrationSound();
    } else {
        isSoundMuted = false;
    }

    updateSoundButtonUI();
}

function handleMusicVolumeChange() {
    musicLevel = Number(musicVolumeSlider.value) / 100;

    if (musicLevel === 0) {
        isMusicMuted = true;
        stopBackgroundMusic();
    } else {
        isMusicMuted = false;
        if (!gameArea.classList.contains("hidden") && gameActive && musicTimer === null) {
            startBackgroundMusic();
        }
    }

    updateMusicButtonUI();
}

function playMoveSound(playerSymbol) {
    if (isSoundMuted || soundLevel <= 0) {
        return;
    }

    const ctx = initAudio();
    if (!ctx) {
        return;
    }

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = "sine";

    if (playerSymbol === "X") {
        oscillator.frequency.setValueAtTime(520, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(680, ctx.currentTime + 0.11);
    } else {
        oscillator.frequency.setValueAtTime(420, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(540, ctx.currentTime + 0.11);
    }

    gainNode.gain.setValueAtTime(0.22 * soundLevel, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.12);
}

function playCelebrationSound() {
    if (isSoundMuted || soundLevel <= 0 || !winSound) {
        return;
    }

    winSound.volume = soundLevel;
    winSound.currentTime = 0;
    const playPromise = winSound.play();

    if (playPromise !== undefined) {
        playPromise.catch(function (error) {
            console.log("Sound error:", error);
        });
    }
}

function stopCelebrationSound() {
    if (!winSound) {
        return;
    }

    winSound.pause();
    winSound.currentTime = 0;
}

function startGame() {
    const firstInput = playerOneInput.value.trim();
    const secondInput = playerTwoInput.value.trim();

    if (firstInput === "" || secondInput === "") {
        errorMsg.textContent = "Please enter both player names first!";
        return;
    }

    errorMsg.textContent = "";
    playerOneName = firstInput;
    playerTwoName = secondInput;

    playerOneNameText.textContent = playerOneName;
    playerTwoNameText.textContent = playerTwoName;

    setupCard.classList.add("hidden");
    gameArea.classList.remove("hidden");

    resetBoard();
}

function updateTurnDisplay() {
    if (currentPlayer === "X") {
        turnImg.src = "../images/x.png";
        turnText.textContent = playerOneName + "'s Turn";
        playerOneCard.classList.add("active-blue-turn");
        playerTwoCard.classList.remove("active-red-turn");
    } else {
        turnImg.src = "../images/o.png";
        turnText.textContent = playerTwoName + "'s Turn";
        playerTwoCard.classList.add("active-red-turn");
        playerOneCard.classList.remove("active-blue-turn");
    }
}

function handleCellClick(event) {
    const clickedCell = event.currentTarget;
    const cellIndex = Number(clickedCell.getAttribute("data-index"));

    if (boardState[cellIndex] !== "" || !gameActive) {
        return;
    }

    boardState[cellIndex] = currentPlayer;
    playMoveSound(currentPlayer);

    const symbolImage = document.createElement("img");
    symbolImage.classList.add("cell-symbol");

    if (currentPlayer === "X") {
        symbolImage.src = "../images/x.png";
        symbolImage.alt = "X";
    } else {
        symbolImage.src = "../images/o.png";
        symbolImage.alt = "O";
    }

    clickedCell.appendChild(symbolImage);

    checkGameResult();
}

function showCelebration(winnerSymbol) {
    celebrationCard.classList.remove("blue-win-card");
    celebrationCard.classList.remove("red-win-card");

    if (winnerSymbol === "X") {
        winnerImg.src = "../images/x.png";
        celebrationBadge.textContent = "WINNER CELEBRATION";
        winnerTitle.textContent = playerOneName + " Wins!";
        celebrationCard.classList.add("blue-win-card");
    } else if (winnerSymbol === "O") {
        winnerImg.src = "../images/o.png";
        celebrationBadge.textContent = "WINNER CELEBRATION";
        winnerTitle.textContent = playerTwoName + " Wins!";
        celebrationCard.classList.add("red-win-card");
    } else {
        winnerImg.src = "../images/xo.png";
        celebrationBadge.textContent = "ROUND OVER";
        winnerTitle.textContent = "It's a Draw!";
    }

    celebrationOverlay.classList.remove("hidden");
}

function checkGameResult() {
    let roundWon = false;
    let winningCells = [];

    for (let i = 0; i < winPatterns.length; i++) {
        const pattern = winPatterns[i];
        const first = boardState[pattern[0]];
        const second = boardState[pattern[1]];
        const third = boardState[pattern[2]];

        if (first !== "" && first === second && second === third) {
            roundWon = true;
            winningCells = pattern;
            break;
        }
    }

    if (roundWon) {
        gameActive = false;
        stopBackgroundMusic();
        highlightWinningCells(winningCells);
        playCelebrationSound();

        if (currentPlayer === "X") {
            playerOneScore = playerOneScore + 1;
            playerOneScoreText.textContent = playerOneScore;
            turnImg.src = "../images/x.png";
            turnText.textContent = playerOneName + " Wins!";
        } else {
            playerTwoScore = playerTwoScore + 1;
            playerTwoScoreText.textContent = playerTwoScore;
            turnImg.src = "../images/o.png";
            turnText.textContent = playerTwoName + " Wins!";
        }

        const winningSymbol = currentPlayer;
        setTimeout(function () {
            showCelebration(winningSymbol);
        }, 350);

        return;
    }

    const isDraw = !boardState.includes("");

    if (isDraw) {
        gameActive = false;
        stopBackgroundMusic();
        turnImg.src = "../images/xo.png";
        turnText.textContent = "It's a Draw!";
        playerOneCard.classList.remove("active-blue-turn");
        playerTwoCard.classList.remove("active-red-turn");

        setTimeout(function () {
            showCelebration("DRAW");
        }, 350);

        return;
    }

    if (currentPlayer === "X") {
        currentPlayer = "O";
    } else {
        currentPlayer = "X";
    }

    updateTurnDisplay();
}

function highlightWinningCells(pattern) {
    const winClass = currentPlayer === "X" ? "winning-blue-cell" : "winning-red-cell";

    for (let i = 0; i < pattern.length; i++) {
        const cellIndex = pattern[i];
        cells[cellIndex].classList.add(winClass);
    }
}

function resetBoard() {
    stopCelebrationSound();
    boardState = ["", "", "", "", "", "", "", "", ""];
    gameActive = true;
    currentPlayer = "X";
    celebrationOverlay.classList.add("hidden");

    for (let i = 0; i < cells.length; i++) {
        cells[i].innerHTML = "";
        cells[i].classList.remove("winning-blue-cell");
        cells[i].classList.remove("winning-red-cell");
    }

    updateTurnDisplay();
    startBackgroundMusic();
}

function resetScores() {
    playerOneScore = 0;
    playerTwoScore = 0;
    playerOneScoreText.textContent = "0";
    playerTwoScoreText.textContent = "0";
    resetBoard();
}

function changePlayers() {
    stopBackgroundMusic();
    stopCelebrationSound();
    playerOneScore = 0;
    playerTwoScore = 0;
    playerOneScoreText.textContent = "0";
    playerTwoScoreText.textContent = "0";
    playerOneInput.value = "";
    playerTwoInput.value = "";
    gameArea.classList.add("hidden");
    setupCard.classList.remove("hidden");
}

startBtn.addEventListener("click", startGame);
soundToggleBtn.addEventListener("click", toggleSoundMute);
musicToggleBtn.addEventListener("click", toggleMusicMute);
soundVolumeSlider.addEventListener("input", handleSoundVolumeChange);
musicVolumeSlider.addEventListener("input", handleMusicVolumeChange);
musicSelect.addEventListener("change", changeMusicTrack);
playAgainBtn.addEventListener("click", resetBoard);
resetScoreBtn.addEventListener("click", resetScores);
newPlayersBtn.addEventListener("click", changePlayers);

for (let i = 0; i < cells.length; i++) {
    cells[i].addEventListener("click", handleCellClick);
}