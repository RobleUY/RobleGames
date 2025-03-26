document.addEventListener('DOMContentLoaded', () => {
    // Detectar si es un dispositivo móvil para optimizar rendimiento
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Elementos del DOM
    const cells = document.querySelectorAll('.cell');
    const statusMessage = document.getElementById('status-message');
    const restartBtn = document.getElementById('restart-btn');
    const playAgainBtn = document.getElementById('play-again-btn');
    const winModal = document.querySelector('.win-modal');
    const winMessage = document.getElementById('win-message');
    const pvpModeBtn = document.getElementById('pvp-mode');
    const cpuModeBtn = document.getElementById('cpu-mode');
    const playerX = document.querySelector('.player-x');
    const playerO = document.querySelector('.player-o');

    // Variables del juego
    let currentPlayer = 'X';
    let gameBoard = ['', '', '', '', '', '', '', '', ''];
    let gameActive = true;
    let gameMode = 'pvp'; // Por defecto: jugador vs jugador
    let cpuDelay = 700; // Retraso para la jugada de la CPU (ms)

    // Combinaciones ganadoras (índices del tablero)
    const winningCombinations = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Filas
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columnas
        [0, 4, 8], [2, 4, 6]             // Diagonales
    ];

    // Inicializar el juego
    initGame();

    // Función para inicializar el juego
    function initGame() {
        // Agregar event listeners a las celdas
        cells.forEach(cell => {
            cell.addEventListener('click', () => handleCellClick(cell));
        });

        // Event listener para el botón de reinicio
        restartBtn.addEventListener('click', resetGame);

        // Event listener para el botón de jugar de nuevo
        playAgainBtn.addEventListener('click', () => {
            winModal.classList.remove('active');
            resetGame();
        });

        // Event listener para el botón de volver al menú
        const menuBtn = document.getElementById('menu-btn');
        if (menuBtn) {
            menuBtn.addEventListener('click', () => {
                window.location.href = '../../index.html';
            });
        }

        // Event listeners para los botones de modo de juego
        pvpModeBtn.addEventListener('click', () => setGameMode('pvp'));
        cpuModeBtn.addEventListener('click', () => setGameMode('cpu'));

        // Inicializar el estado del juego
        updateStatusMessage();
        addHoverEffects();
    }

    // Función para manejar el clic en una celda
    function handleCellClick(cell) {
        const index = cell.getAttribute('data-index');

        // Verificar si la celda ya está ocupada o el juego ha terminado
        if (gameBoard[index] !== '' || !gameActive) {
            return;
        }

        // Actualizar el tablero y la UI
        updateCell(cell, index);
        
        // Verificar si hay un ganador o empate
        checkGameResult();

        // Si el juego sigue activo y es modo CPU, hacer la jugada de la CPU
        if (gameActive && gameMode === 'cpu' && currentPlayer === 'O') {
            setTimeout(() => {
                makeCpuMove();
                checkGameResult();
            }, cpuDelay);
        }
    }

    // Función para actualizar una celda
    function updateCell(cell, index) {
        gameBoard[index] = currentPlayer;
        
        // Añadir la marca visual (X u O)
        if (currentPlayer === 'X') {
            cell.classList.add('x-mark');
        } else {
            cell.classList.add('o-mark');
        }
        
        // Reproducir el sonido de movimiento
        playSound('move');
        
        // Añadir animación de aparición
        cell.style.animation = 'pulse 0.5s';
        
        // Cambiar de jugador
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        
        // Actualizar la UI
        updateStatusMessage();
        updatePlayerActive();
        addHoverEffects();
    }

    // Función para verificar el resultado del juego
    function checkGameResult() {
        let roundWon = false;
        let winningCombo = null;

        // Verificar si hay un ganador
        for (let i = 0; i < winningCombinations.length; i++) {
            const [a, b, c] = winningCombinations[i];
            if (gameBoard[a] && gameBoard[a] === gameBoard[b] && gameBoard[a] === gameBoard[c]) {
                roundWon = true;
                winningCombo = winningCombinations[i];
                break;
            }
        }

        // Si hay un ganador
        if (roundWon) {
            gameActive = false;
            const winner = currentPlayer === 'X' ? 'O' : 'X'; // El ganador es el jugador anterior
            highlightWinningCells(winningCombo);
            setTimeout(() => {
                showWinMessage(winner);
            }, 1000);
            return;
        }

        // Verificar si hay empate
        if (!gameBoard.includes('')) {
            gameActive = false;
            setTimeout(() => {
                showDrawMessage();
            }, 500);
            return;
        }
    }

    // Función para resaltar las celdas ganadoras
    function highlightWinningCells(combo) {
        combo.forEach(index => {
            cells[index].style.animation = 'pulse 1s infinite';
            cells[index].style.boxShadow = '0 0 20px rgba(0, 255, 255, 0.8)';
            cells[index].style.transform = 'scale(1.05)';
        });
    }

    // Función para mostrar el mensaje de victoria y reproducir el sonido correspondiente
    function showWinMessage(winner) {
        let winnerName;
        if (winner === 'X') {
            winnerName = 'Jugador 1';
        } else {
            winnerName = gameMode === 'pvp' ? 'Jugador 2' : 'CPU';
        }
        winMessage.textContent = `¡${winnerName} Gana!`;
        winModal.classList.add('active');
        
        // En modo CPU: si la IA gana (jugador "O") se reproduce lose.mp3; de lo contrario win.mp3.
        if (gameMode === 'cpu' && winner === 'O') {
            playSound('lose');
        } else {
            playSound('win');
        }
    }

    // Función para mostrar el mensaje de empate y reproducir el sonido correspondiente
    function showDrawMessage() {
        winMessage.textContent = '¡Empate!';
        winModal.classList.add('active');
        playSound('draw');
    }

    // Función para actualizar el mensaje de estado
    function updateStatusMessage() {
        const playerName = currentPlayer === 'X' ? 'Jugador 1' : (gameMode === 'pvp' ? 'Jugador 2' : 'CPU');
        statusMessage.textContent = `Turno de ${playerName}`;
        
        // Añadir efecto de pulso al mensaje
        statusMessage.style.animation = 'none';
        setTimeout(() => {
            statusMessage.style.animation = 'pulse 1s';
        }, 10);
    }

    // Función para actualizar el jugador activo en la UI
    function updatePlayerActive() {
        if (currentPlayer === 'X') {
            playerX.classList.add('active');
            playerO.classList.remove('active');
        } else {
            playerX.classList.remove('active');
            playerO.classList.add('active');
        }
    }

    // Función para añadir efectos de hover (se desactivan en dispositivos móviles)
    function addHoverEffects() {
        if (isMobile) return; // Si es móvil, no aplicamos hover
        cells.forEach(cell => {
            const index = cell.getAttribute('data-index');
            if (gameBoard[index] === '') {
                cell.classList.remove('x-hover', 'o-hover');
                cell.classList.add(currentPlayer === 'X' ? 'x-hover' : 'o-hover');
            } else {
                cell.classList.remove('x-hover', 'o-hover');
            }
        });
    }

    // Función para reiniciar el juego
    function resetGame() {
        gameBoard = ['', '', '', '', '', '', '', '', ''];
        gameActive = true;
        currentPlayer = 'X';

        // Limpiar el tablero
        cells.forEach(cell => {
            cell.classList.remove('x-mark', 'o-mark', 'x-hover', 'o-hover');
            cell.style.animation = '';
            cell.style.boxShadow = '';
            cell.style.transform = '';
        });

        // Actualizar la UI
        updateStatusMessage();
        updatePlayerActive();
        addHoverEffects();
        // No se reproduce sonido al reiniciar, pero si se requiere se podría agregar.
    }

    // Función para establecer el modo de juego
    function setGameMode(mode) {
        gameMode = mode;
        
        // Actualizar botones de modo
        if (mode === 'pvp') {
            pvpModeBtn.classList.add('active');
            cpuModeBtn.classList.remove('active');
            playerO.querySelector('.player-name').textContent = 'Jugador 2';
        } else {
            cpuModeBtn.classList.add('active');
            pvpModeBtn.classList.remove('active');
            playerO.querySelector('.player-name').textContent = 'CPU';
        }
        
        // Reiniciar el juego al cambiar de modo
        resetGame();
    }
    
    // Función para que la CPU haga su jugada
    function makeCpuMove() {
        // Si no hay celdas disponibles, retornar
        if (!gameBoard.includes('')) return;
        
        let index;
        
        // Estrategia de la CPU:
        // 1. Intentar ganar
        index = findWinningMove('O');
        if (index !== -1) {
            makeMove(index);
            return;
        }
        
        // 2. Bloquear al jugador
        index = findWinningMove('X');
        if (index !== -1) {
            makeMove(index);
            return;
        }
        
        // 3. Tomar el centro si está disponible
        if (gameBoard[4] === '') {
            makeMove(4);
            return;
        }
        
        // 4. Tomar una esquina aleatoria disponible
        const corners = [0, 2, 6, 8].filter(i => gameBoard[i] === '');
        if (corners.length > 0) {
            const randomCorner = corners[Math.floor(Math.random() * corners.length)];
            makeMove(randomCorner);
            return;
        }
        
        // 5. Tomar cualquier celda disponible
        const availableCells = gameBoard.map((cell, i) => cell === '' ? i : null).filter(i => i !== null);
        const randomIndex = availableCells[Math.floor(Math.random() * availableCells.length)];
        makeMove(randomIndex);
    }
    
    // Función auxiliar para encontrar una jugada ganadora
    function findWinningMove(player) {
        for (let combo of winningCombinations) {
            const [a, b, c] = combo;
            // Verificar si puede ganar en la próxima jugada
            if (gameBoard[a] === player && gameBoard[b] === player && gameBoard[c] === '') return c;
            if (gameBoard[a] === player && gameBoard[c] === player && gameBoard[b] === '') return b;
            if (gameBoard[b] === player && gameBoard[c] === player && gameBoard[a] === '') return a;
        }
        return -1;
    }
    
    // Función auxiliar para que la CPU haga su jugada
    function makeMove(index) {
        const cell = cells[index];
        updateCell(cell, index);
    }
    
    // Función para reproducir sonidos según el tipo
    function playSound(type) {
        let src = '';
        switch(type) {
            case 'move':
                src = 'Sounds/movimiento.mp3';
                break;
            case 'win':
                src = 'Sounds/win.mp3';
                break;
            case 'lose':
                src = 'Sounds/lose.mp3';
                break;
            case 'draw':
                src = 'Sounds/empate.mp3';
                break;
            default:
                return;
        }
        const audio = new Audio(src);
        audio.volume = 0.5;
        audio.play().catch(e => console.log('Error al reproducir sonido:', e));
    }
});
