import audioManager from './audio.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const BLOCK_SIZE = 30;
const ROWS = 20;
const COLS = 10;
let score = 0;
let level = 1;
let gameLoop = null;
let currentPiece = null;
let gameBoard = null;
let isPaused = false;
let lastDropTime = 0;
let dropInterval = 1000;

const SHAPES = [
    [[1, 1, 1, 1]],  // I
    [[1, 1], [1, 1]],  // O
    [[1, 1, 1], [0, 1, 0]],  // T
    [[1, 1, 1], [1, 0, 0]],  // L
    [[1, 1, 1], [0, 0, 1]],  // J
    [[1, 1, 0], [0, 1, 1]],  // S
    [[0, 1, 1], [1, 1, 0]]   // Z
];

const COLORS = [
    '#00f0f0', '#f0f000', '#a000f0',
    '#f0a000', '#0000f0', '#00f000', '#f00000'
];

function initBoard() {
    gameBoard = Array(ROWS).fill().map(() => Array(COLS).fill(0));
}

function drawBlock(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE - 1, BLOCK_SIZE - 1);
}

function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            if (gameBoard[row][col]) {
                drawBlock(col, row, COLORS[gameBoard[row][col] - 1]);
            }
        }
    }
}

function createPiece() {
    const shapeIndex = Math.floor(Math.random() * SHAPES.length);
    return {
        shape: SHAPES[shapeIndex],
        color: COLORS[shapeIndex],
        x: Math.floor(COLS / 2) - Math.floor(SHAPES[shapeIndex][0].length / 2),
        y: 0,
        index: shapeIndex
    };
}

function drawPiece() {
    if (!currentPiece) return;
    currentPiece.shape.forEach((row, i) => {
        row.forEach((cell, j) => {
            if (cell) {
                drawBlock(currentPiece.x + j, currentPiece.y + i, currentPiece.color);
            }
        });
    });
}

function collision(piece, moveX = 0, moveY = 0) {
    return piece.shape.some((row, i) => {
        return row.some((cell, j) => {
            if (!cell) return false;
            const newX = piece.x + j + moveX;
            const newY = piece.y + i + moveY;
            return newX < 0 || newX >= COLS || newY >= ROWS || 
                   (newY >= 0 && gameBoard[newY][newX]);
        });
    });
}

function mergePiece() {
    if (!currentPiece) return;
    currentPiece.shape.forEach((row, i) => {
        row.forEach((cell, j) => {
            if (cell) {
                gameBoard[currentPiece.y + i][currentPiece.x + j] = currentPiece.index + 1;
            }
        });
    });
    audioManager.playDrop();
}

function clearLines() {
    let linesCleared = 0;
    for (let row = ROWS - 1; row >= 0; row--) {
        if (gameBoard[row].every(cell => cell)) {
            gameBoard.splice(row, 1);
            gameBoard.unshift(Array(COLS).fill(0));
            linesCleared++;
            row++;
        }
    }
    if (linesCleared > 0) {
        audioManager.playClear();
        score += linesCleared * 100 * level;
        document.getElementById('score').textContent = score;
        if (score >= level * 1000) {
            level++;
            dropInterval = 1000 / level;
            document.getElementById('level').textContent = level;
        }
    }
}

function moveDown() {
    if (!currentPiece) return;
    if (!collision(currentPiece, 0, 1)) {
        currentPiece.y++;
        lastDropTime = Date.now();
        return true;
    } else {
        mergePiece();
        clearLines();
        currentPiece = createPiece();
        if (collision(currentPiece)) {
            gameOver();
        }
        return false;
    }
}

function moveLeft() {
    if (!currentPiece || isPaused) return;
    if (!collision(currentPiece, -1, 0)) {
        currentPiece.x--;
        audioManager.playMove();
    }
}

function moveRight() {
    if (!currentPiece || isPaused) return;
    if (!collision(currentPiece, 1, 0)) {
        currentPiece.x++;
        audioManager.playMove();
    }
}

function rotate() {
    if (!currentPiece || isPaused) return;
    const rotated = currentPiece.shape[0].map((_, i) =>
        currentPiece.shape.map(row => row[row.length - 1 - i])
    );
    const previousShape = currentPiece.shape;
    currentPiece.shape = rotated;
    if (collision(currentPiece)) {
        currentPiece.shape = previousShape;
    } else {
        audioManager.playRotate();
    }
}

function gameLoop() {
    if (isPaused) return;

    const currentTime = Date.now();
    if (currentTime - lastDropTime > dropInterval) {
        moveDown();
        lastDropTime = currentTime;
    }

    drawBoard();
    drawPiece();
    requestAnimationFrame(gameLoop);
}

function togglePause() {
    if (!document.getElementById('startBtn').disabled) return;
    
    isPaused = !isPaused;
    if (isPaused) {
        document.getElementById('pauseBtn').textContent = '继续';
    } else {
        lastDropTime = Date.now();
        document.getElementById('pauseBtn').textContent = '暂停';
        requestAnimationFrame(gameLoop);
    }
}

function gameOver() {
    isPaused = true;
    alert('游戏结束！得分：' + score);
    document.getElementById('startBtn').disabled = false;
    document.getElementById('pauseBtn').disabled = true;
}

function gameStart() {
    initBoard();
    score = 0;
    level = 1;
    dropInterval = 1000;
    isPaused = false;
    lastDropTime = Date.now();
    
    audioManager.playBGM();
    document.getElementById('score').textContent = score;
    document.getElementById('level').textContent = level;
    document.getElementById('startBtn').disabled = true;
    document.getElementById('pauseBtn').disabled = false;
    document.getElementById('pauseBtn').textContent = '暂停';
    
    currentPiece = createPiece();
    requestAnimationFrame(gameLoop);
}

document.addEventListener('keydown', (e) => {
    if (document.getElementById('startBtn').disabled && !isPaused) {
        switch(e.key) {
            case 'ArrowLeft':
                moveLeft();
                break;
            case 'ArrowRight':
                moveRight();
                break;
            case 'ArrowDown':
                moveDown();
                break;
            case 'ArrowUp':
                rotate();
                break;
            case ' ':
                togglePause();
                break;
        }
        drawBoard();
        drawPiece();
    } else if (e.key === ' ') {
        togglePause();
    }
});

document.getElementById('pauseBtn').addEventListener('click', togglePause);
document.getElementById('startBtn').addEventListener('click', gameStart);