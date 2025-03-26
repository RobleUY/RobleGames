document.addEventListener('DOMContentLoaded', () => {
    // Detectar si es un dispositivo móvil para optimizar rendimiento
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Elementos del DOM
    const canvas = document.getElementById('snake-canvas');
    const ctx = canvas.getContext('2d');
    const statusMessage = document.getElementById('status-message');
    const scoreElement = document.getElementById('score');
    const highScoreElement = document.getElementById('high-score');
    const finalScoreElement = document.getElementById('final-score');
    const restartBtn = document.getElementById('restart-btn');
    const playAgainBtn = document.getElementById('play-again-btn');
    const gameOverModal = document.querySelector('.game-over-modal');
    const gameOverMessage = document.getElementById('game-over-message');
    const easyModeBtn = document.getElementById('easy-mode');
    const mediumModeBtn = document.getElementById('medium-mode');
    const hardModeBtn = document.getElementById('hard-mode');
    
    // Botones de control móvil
    const upBtn = document.getElementById('up-btn');
    const downBtn = document.getElementById('down-btn');
    const leftBtn = document.getElementById('left-btn');
    const rightBtn = document.getElementById('right-btn');
    
    // Variables del juego
    let snake = [];
    let food = {};
    let direction = 'right';
    let nextDirection = 'right';
    let gameSpeed = 100; // Velocidad inicial (ms)
    let score = 0;
    let highScore = localStorage.getItem('snakeHighScore') || 0;
    let gameActive = false;
    let gameLoop;
    let gridSize = 20; // Tamaño de cada celda en píxeles
    let boardSize = 20; // Número de celdas en el tablero (20x20)
    let gameMode = 'easy'; // Modo de juego por defecto
    
    // Colores y estilos
    const colors = {
        background: 'rgba(0, 0, 0, 0.7)',
        snake: {
            head: '#00ffff',
            body: '#00cccc',
            border: '#00ffff'
        },
        food: '#ff00ff',
        grid: 'rgba(0, 255, 255, 0.1)'
    };
    
    // Efectos de sonido (se implementarán más adelante)
    const sounds = {
        eat: null,
        gameOver: null,
        move: null
    };
    
    // Inicializar el juego
    initGame();
    
    // Función para inicializar el juego
    function initGame() {
        // Configurar el canvas
        setupCanvas();
        
        // Inicializar la serpiente
        resetGame();
        
        // Mostrar la puntuación más alta
        highScoreElement.textContent = highScore;
        
        // Event listeners para controles de teclado
        document.addEventListener('keydown', handleKeyPress);
        
        // Event listeners para controles móviles
        if (isMobile) {
            setupMobileControls();
        }
        
        // Event listeners para botones
        restartBtn.addEventListener('click', resetGame);
        playAgainBtn.addEventListener('click', () => {
            gameOverModal.classList.remove('active');
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
        easyModeBtn.addEventListener('click', () => setGameMode('easy'));
        mediumModeBtn.addEventListener('click', () => setGameMode('medium'));
        hardModeBtn.addEventListener('click', () => setGameMode('hard'));
        
        // Dibujar el tablero inicial
        drawBoard();
    }
    
    // Configurar el canvas
    function setupCanvas() {
        // Hacer que el canvas sea cuadrado y responsive
        const boardWidth = Math.min(500, window.innerWidth * 0.8);
        canvas.width = boardWidth;
        canvas.height = boardWidth;
        
        // Calcular el tamaño de cada celda
        gridSize = boardWidth / boardSize;
    }
    
    // Configurar controles móviles
    function setupMobileControls() {
        document.querySelector('.mobile-controls').style.display = 'flex';
        
        upBtn.addEventListener('touchstart', () => {
            if (direction !== 'down') nextDirection = 'up';
            if (!gameActive) startGame();
        });
        
        downBtn.addEventListener('touchstart', () => {
            if (direction !== 'up') nextDirection = 'down';
            if (!gameActive) startGame();
        });
        
        leftBtn.addEventListener('touchstart', () => {
            if (direction !== 'right') nextDirection = 'left';
            if (!gameActive) startGame();
        });
        
        rightBtn.addEventListener('touchstart', () => {
            if (direction !== 'left') nextDirection = 'right';
            if (!gameActive) startGame();
        });
    }
    
    // Manejar pulsaciones de teclas
    function handleKeyPress(e) {
        // Iniciar el juego con cualquier tecla de flecha si no está activo
        if (!gameActive && (e.key === 'ArrowUp' || e.key === 'ArrowDown' || 
                           e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
            startGame();
        }
        
        // Cambiar dirección según la tecla presionada
        switch (e.key) {
            case 'ArrowUp':
                if (direction !== 'down') nextDirection = 'up';
                break;
            case 'ArrowDown':
                if (direction !== 'up') nextDirection = 'down';
                break;
            case 'ArrowLeft':
                if (direction !== 'right') nextDirection = 'left';
                break;
            case 'ArrowRight':
                if (direction !== 'left') nextDirection = 'right';
                break;
        }
    }
    
    // Establecer el modo de juego
    function setGameMode(mode) {
        gameMode = mode;
        
        // Actualizar UI
        easyModeBtn.classList.remove('active');
        mediumModeBtn.classList.remove('active');
        hardModeBtn.classList.remove('active');
        
        switch (mode) {
            case 'easy':
                easyModeBtn.classList.add('active');
                gameSpeed = 120;
                break;
            case 'medium':
                mediumModeBtn.classList.add('active');
                gameSpeed = 90;
                break;
            case 'hard':
                hardModeBtn.classList.add('active');
                gameSpeed = 60;
                break;
        }
        
        // Si el juego está activo, reiniciarlo con la nueva velocidad
        if (gameActive) {
            resetGame();
            startGame();
        }
    }
    
    // Iniciar el juego
    function startGame() {
        if (gameActive) return;
        
        gameActive = true;
        statusMessage.textContent = '¡En juego!';
        
        // Iniciar el bucle del juego
        gameLoop = setInterval(updateGame, gameSpeed);
        
        // Añadir efecto de pulso al mensaje
        statusMessage.style.animation = 'none';
        setTimeout(() => {
            statusMessage.style.animation = 'pulse 1s';
        }, 10);
    }
    
    // Reiniciar el juego
    function resetGame() {
        // Detener el bucle del juego si está activo
        if (gameLoop) {
            clearInterval(gameLoop);
        }
        
        // Reiniciar variables
        snake = [
            {x: 10, y: 10},
            {x: 9, y: 10},
            {x: 8, y: 10}
        ];
        direction = 'right';
        nextDirection = 'right';
        score = 0;
        gameActive = false;
        
        // Actualizar UI
        scoreElement.textContent = score;
        statusMessage.textContent = 'Presiona cualquier flecha para comenzar';
        
        // Generar comida inicial
        generateFood();
        
        // Dibujar el tablero
        drawBoard();
    }
    
    // Actualizar el estado del juego
    function updateGame() {
        // Actualizar dirección
        direction = nextDirection;
        
        // Mover la serpiente
        moveSnake();
        
        // Comprobar colisiones
        if (checkCollision()) {
            gameOver();
            return;
        }
        
        // Comprobar si la serpiente come
        if (snake[0].x === food.x && snake[0].y === food.y) {
            eatFood();
        } else {
            // Si no come, eliminar la última parte de la serpiente
            snake.pop();
        }
        
        // Dibujar el tablero actualizado
        drawBoard();
    }
    
    // Mover la serpiente
    function moveSnake() {
        // Crear nueva cabeza según la dirección
        const head = {x: snake[0].x, y: snake[0].y};
        
        switch (direction) {
            case 'up':
                head.y -= 1;
                break;
            case 'down':
                head.y += 1;
                break;
            case 'left':
                head.x -= 1;
                break;
            case 'right':
                head.x += 1;
                break;
        }
        
        // Añadir la nueva cabeza al principio del array
        snake.unshift(head);
    }
    
    // Comprobar colisiones
    function checkCollision() {
        const head = snake[0];
        
        // Colisión con los bordes
        if (head.x < 0 || head.x >= boardSize || head.y < 0 || head.y >= boardSize) {
            return true;
        }
        
        // Colisión con el propio cuerpo
        for (let i = 1; i < snake.length; i++) {
            if (head.x === snake[i].x && head.y === snake[i].y) {
                return true;
            }
        }
        
        return false;
    }
    
    // Comer comida
    function eatFood() {
        // Aumentar puntuación
        score += 10;
        scoreElement.textContent = score;
        
        // Actualizar puntuación más alta si es necesario
        if (score > highScore) {
            highScore = score;
            highScoreElement.textContent = highScore;
            localStorage.setItem('snakeHighScore', highScore);
        }
        
        // Generar nueva comida
        generateFood();
        
        // Reproducir sonido (se implementará más adelante)
        // playSound('eat');
        
        // Añadir efecto de pulso a la puntuación
        scoreElement.style.animation = 'none';
        setTimeout(() => {
            scoreElement.style.animation = 'pulse 0.5s';
        }, 10);
    }
    
    // Generar comida en una posición aleatoria
    function generateFood() {
        let validPosition = false;
        
        while (!validPosition) {
            food = {
                x: Math.floor(Math.random() * boardSize),
                y: Math.floor(Math.random() * boardSize)
            };
            
            // Comprobar que la comida no aparezca sobre la serpiente
            validPosition = true;
            for (let segment of snake) {
                if (segment.x === food.x && segment.y === food.y) {
                    validPosition = false;
                    break;
                }
            }
        }
    }
    
    // Fin del juego
    function gameOver() {
        // Detener el bucle del juego
        clearInterval(gameLoop);
        gameActive = false;
        
        // Actualizar UI
        finalScoreElement.textContent = score;
        gameOverModal.classList.add('active');
        
        // Reproducir sonido (se implementará más adelante)
        // playSound('gameOver');
    }
    
    // Dibujar el tablero
    function drawBoard() {
        // Limpiar el canvas
        ctx.fillStyle = colors.background;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Dibujar la cuadrícula
        drawGrid();
        
        // Dibujar la comida
        drawFood();
        
        // Dibujar la serpiente
        drawSnake();
    }
    
    // Dibujar la cuadrícula
    function drawGrid() {
        ctx.strokeStyle = colors.grid;
        ctx.lineWidth = 0.5;
        
        // Líneas verticales
        for (let x = 0; x <= boardSize; x++) {
            ctx.beginPath();
            ctx.moveTo(x * gridSize, 0);
            ctx.lineTo(x * gridSize, canvas.height);
            ctx.stroke();
        }
        
        // Líneas horizontales
        for (let y = 0; y <= boardSize; y++) {
            ctx.beginPath();
            ctx.moveTo(0, y * gridSize);
            ctx.lineTo(canvas.width, y * gridSize);
            ctx.stroke();
        }
    }
    
    // Dibujar la serpiente
    function drawSnake() {
        snake.forEach((segment, index) => {
            // Dibujar cada segmento
            const x = segment.x * gridSize;
            const y = segment.y * gridSize;
            const size = gridSize - 2; // Pequeño margen para ver la cuadrícula
            
            // Color diferente para la cabeza
            if (index === 0) {
                // Cabeza
                ctx.fillStyle = colors.snake.head;
                ctx.shadowColor = colors.snake.head;
                ctx.shadowBlur = 10;
            } else {
                // Cuerpo
                ctx.fillStyle = colors.snake.body;
                ctx.shadowColor = colors.snake.body;
                ctx.shadowBlur = 5;
            }
            
            // Dibujar el segmento con bordes redondeados
            ctx.beginPath();
            ctx.roundRect(x + 1, y + 1, size, size, 4);
            ctx.fill();
            
            // Resetear sombra
            ctx.shadowBlur = 0;
            
            // Añadir borde
            ctx.strokeStyle = colors.snake.border;
            ctx.lineWidth = 1;
            ctx.stroke();
            
            // Dibujar ojos en la cabeza
            if (index === 0) {
                drawSnakeEyes(x, y, size);
            }
        });
    }
    
    // Dibujar los ojos de la serpiente
    function drawSnakeEyes(x, y, size) {
        const eyeSize = size / 6;
        const eyeOffset = size / 4;
        
        ctx.fillStyle = '#000';
        
        // Posición de los ojos según la dirección
        switch (direction) {
            case 'up':
                ctx.beginPath();
                ctx.arc(x + eyeOffset, y + eyeOffset, eyeSize, 0, Math.PI * 2);
                ctx.arc(x + size - eyeOffset, y + eyeOffset, eyeSize, 0, Math.PI * 2);
                ctx.fill();
                break;
            case 'down':
                ctx.beginPath();
                ctx.arc(x + eyeOffset, y + size - eyeOffset, eyeSize, 0, Math.PI * 2);
                ctx.arc(x + size - eyeOffset, y + size - eyeOffset, eyeSize, 0, Math.PI * 2);
                ctx.fill();
                break;
            case 'left':
                ctx.beginPath();
                ctx.arc(x + eyeOffset, y + eyeOffset, eyeSize, 0, Math.PI * 2);
                ctx.arc(x + eyeOffset, y + size - eyeOffset, eyeSize, 0, Math.PI * 2);
                ctx.fill();
                break;
            case 'right':
                ctx.beginPath();
                ctx.arc(x + size - eyeOffset, y + eyeOffset, eyeSize, 0, Math.PI * 2);
                ctx.arc(x + size - eyeOffset, y + size - eyeOffset, eyeSize, 0, Math.PI * 2);
                ctx.fill();
                break;
        }
    }
    
    // Dibujar la comida
    function drawFood() {
        const x = food.x * gridSize;
        const y = food.y * gridSize;
        const size = gridSize - 2;
        
        // Efecto de brillo
        ctx.fillStyle = colors.food;
        ctx.shadowColor = colors.food;
        ctx.shadowBlur = 15;
        
        // Dibujar comida como un círculo pulsante
        const pulseSize = size * (0.8 + 0.2 * Math.sin(Date.now() / 200));
        const offset = (size - pulseSize) / 2;
        
        ctx.beginPath();
        ctx.arc(x + size/2, y + size/2, pulseSize/2, 0, Math.PI * 2);
        ctx.fill();
        
        // Resetear sombra
        ctx.shadowBlur = 0;
    }
    
    // Función para reproducir sonidos (se implementará más adelante)
    function playSound(soundType) {
        // Implementación futura
    }
    
    // Manejar cambios de tamaño de ventana
    window.addEventListener('resize', () => {
        setupCanvas();
        drawBoard();
    });
});