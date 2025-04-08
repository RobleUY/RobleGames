document.addEventListener('DOMContentLoaded', () => {
    // Disable text selection and image dragging
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';
    document.body.style.msUserSelect = 'none';
    document.body.style.mozUserSelect = 'none';
    
    // Disable image dragging
    const allImages = document.querySelectorAll('img');
    allImages.forEach(img => {
        img.setAttribute('draggable', 'false');
        img.addEventListener('dragstart', (e) => e.preventDefault());
    });
    
    // Game elements
    const mainMenu = document.getElementById('main-menu');
    const gameArea = document.getElementById('game');
    const circle = document.getElementById('circle');
    const timerElement = document.getElementById('timer');
    const progressBar = document.getElementById('progress-bar');
    const percentageText = document.getElementById('percentage-text');
    const gameOverScreen = document.getElementById('game-over');
    const winnerScreen = document.getElementById('winner');
    const playButton = document.getElementById('play-button');
    const restartButton = document.getElementById('restart-button');
    const restartButtonWin = document.getElementById('restart-button-win');
    const menuButtonOver = document.getElementById('menu-button-over');
    const menuButtonWin = document.getElementById('menu-button-win');
    const timeSurvivedElement = document.getElementById('time-survived');
    const progressPercentElement = document.getElementById('progress-percent');
    
    // Statistics elements
    const victoriesCountElement = document.getElementById('victories-count');
    const defeatsCountElement = document.getElementById('defeats-count');
    const totalTimePlayedElement = document.getElementById('total-time-played');
    const maxConsecutiveVictoriesElement = document.getElementById('max-consecutive-victories');
    const coinsCountElement = document.getElementById('coins-count');
    
    // Shop elements
    const shopButton = document.getElementById('shop-button');
    const shopPanel = document.getElementById('shop-panel');
    const closeShopButton = document.getElementById('close-shop');
    const skinItems = document.querySelectorAll('.skin-item');
    const categorySkins = document.getElementById('category-skins');
    const categoryBackgrounds = document.getElementById('category-backgrounds');
    const skinsContainer = document.getElementById('skins-container');
    const backgroundsContainer = document.getElementById('backgrounds-container');
    
    // Settings elements
    const settingsButton = document.getElementById('settings-button');
    const settingsPanel = document.getElementById('settings-panel');
    const closeSettingsButton = document.getElementById('close-settings');
    const muteButton = document.getElementById('mute-button');
    const volumeIcon = document.getElementById('volume-icon');
    const volumeSlider = document.getElementById('volume-slider');
    const volumeValue = document.getElementById('volume-value');

    // Statistics constants
    const VICTORIES_KEY = 'robleuy_60secondsinthecircle_victories';
    const DEFEATS_KEY = 'robleuy_60secondsinthecircle_defeats';
    const TOTAL_TIME_KEY = 'robleuy_60secondsinthecircle_totaltimeplayed';
    const SELECTED_SKIN_KEY = 'robleuy_60secondsinthecircle_selectedskin';
    const CONSECUTIVE_VICTORIES_KEY = 'robleuy_60secondsinthecircle_consecutive_victories';
    const MAX_CONSECUTIVE_VICTORIES_KEY = 'robleuy_60secondsinthecircle_max_consecutive_victories';
    const COINS_KEY = 'robleuy_60secondsinthecircle_coins';
    const SELECTED_BACKGROUND_KEY = 'robleuy_60secondsinthecircle_selectedbackground';
    const PURCHASED_SKINS_KEY = 'robleuy_60secondsinthecircle_purchased_skins';
    const PURCHASED_BACKGROUNDS_KEY = 'robleuy_60secondsinthecircle_purchased_backgrounds';
    
    // Game statistics
    let victoriesCount = 0;
    let defeatsCount = 0; 
    let totalTimePlayed = 0; // in seconds
    let currentGameTime = 0; // in seconds
    let consecutiveVictories = 0; // Current streak of consecutive victories
    let maxConsecutiveVictories = 0; // Record of max consecutive victories
    let coins = 0; // Player's coins
    
    // Skin selection
    let selectedSkin = 'default';
    let selectedBackground = 'default';
    
    // Purchase constants
    const SKIN_PRICE = 1000;
    const BACKGROUND_PRICE = 1500;
    
    // Arrays to track purchased items
    let purchasedSkins = ['default'];
    let purchasedBackgrounds = ['default'];
    
    // Sound settings
    let globalVolume = 1.0; // Value between 0 and 1
    let isMuted = false;
    
    // Confirmation dialog elements
    let confirmationDialog = null;
    
    // Load game statistics from localStorage
    loadGameStatistics();
    
    // Load purchased items from localStorage
    loadPurchasedItems();
    
    // Load selected skin from localStorage
    loadSelectedSkin();
    
    // Load selected background from localStorage
    loadSelectedBackground();
    
    // Load saved audio configuration
    loadAudioSettings();

    // Function to load purchased items from localStorage
    function loadPurchasedItems() {
        if (localStorage.getItem(PURCHASED_SKINS_KEY)) {
            purchasedSkins = JSON.parse(localStorage.getItem(PURCHASED_SKINS_KEY));
        }
        
        if (localStorage.getItem(PURCHASED_BACKGROUNDS_KEY)) {
            purchasedBackgrounds = JSON.parse(localStorage.getItem(PURCHASED_BACKGROUNDS_KEY));
        }
    }
    
    // Function to save purchased items to localStorage
    function savePurchasedItems() {
        localStorage.setItem(PURCHASED_SKINS_KEY, JSON.stringify(purchasedSkins));
        localStorage.setItem(PURCHASED_BACKGROUNDS_KEY, JSON.stringify(purchasedBackgrounds));
    }
    
    // Function to create confirmation dialog
    function createConfirmationDialog(item, type, price) {
        // Remove any existing dialog
        if (confirmationDialog) {
            document.body.removeChild(confirmationDialog);
        }
        
        // Create dialog container
        confirmationDialog = document.createElement('div');
        confirmationDialog.className = 'confirmation-dialog';
        confirmationDialog.style.position = 'fixed';
        confirmationDialog.style.top = '50%';
        confirmationDialog.style.left = '50%';
        confirmationDialog.style.transform = 'translate(-50%, -50%)';
        confirmationDialog.style.backgroundColor = '#111';
        confirmationDialog.style.border = '2px solid #f0f0f0';
        confirmationDialog.style.borderRadius = '10px';
        confirmationDialog.style.padding = '20px';
        confirmationDialog.style.color = '#fff';
        confirmationDialog.style.textAlign = 'center';
        confirmationDialog.style.zIndex = '1000';
        confirmationDialog.style.boxShadow = '0 0 20px rgba(0, 0, 0, 0.7)';
        confirmationDialog.style.touchAction = 'manipulation'; // Permitir interacción táctil
        
        // Create message
        const message = document.createElement('p');
        message.textContent = `Confirm purchase of ${type === 'skin' ? 'Skin' : 'Background'} ${item} for ${price} coins?`;
        message.style.marginBottom = '20px';
        message.style.fontSize = '18px';
        
        // Create button container
        const buttonsContainer = document.createElement('div');
        buttonsContainer.style.display = 'flex';
        buttonsContainer.style.justifyContent = 'space-around';
        
        // Create confirm button
        const confirmButton = document.createElement('button');
        confirmButton.textContent = 'Accept';
        confirmButton.className = 'shop-button';
        confirmButton.style.padding = '10px 20px';
        confirmButton.style.margin = '0 10px';
        confirmButton.style.backgroundColor = '#4caf50';
        confirmButton.style.border = 'none';
        confirmButton.style.borderRadius = '5px';
        confirmButton.style.color = 'white';
        confirmButton.style.cursor = 'pointer';
        
        // Create cancel button
        const cancelButton = document.createElement('button');
        cancelButton.textContent = 'Cancel';
        cancelButton.className = 'shop-button';
        cancelButton.style.padding = '10px 20px';
        cancelButton.style.margin = '0 10px';
        cancelButton.style.backgroundColor = '#f44336';
        cancelButton.style.border = 'none';
        cancelButton.style.borderRadius = '5px';
        cancelButton.style.color = 'white';
        cancelButton.style.cursor = 'pointer';
        
        // Add event listeners to buttons with touch support
        confirmButton.addEventListener('click', handleConfirm);
        confirmButton.addEventListener('touchstart', (e) => {
            e.preventDefault();
            handleConfirm();
        }, { passive: false });
        
        cancelButton.addEventListener('click', handleCancel);
        cancelButton.addEventListener('touchstart', (e) => {
            e.preventDefault();
            handleCancel();
        }, { passive: false });
        
        function handleConfirm() {
            playClickSound();
            
            // Check if player has enough coins
            if (coins >= price) {
                playBuySound();
                addCoins(-price);
                updateCoinsDisplay();
                
                if (type === 'skin') {
                    purchaseSkin(item);
                    applySkin(item);
                    selectedSkin = item;
                    saveSelectedSkin();
                } else {
                    purchaseBackground(item);
                    applyBackground(item);
                    selectedBackground = item;
                    saveSelectedBackground();
                }
                
                updatePurchaseStatus();
                document.body.removeChild(confirmationDialog);
                confirmationDialog = null;
            } else {
                playErrorSound();
                message.textContent = `Not enough coins. You need ${price} coins.`;
                message.style.color = '#ff6b6b';
                
                buttonsContainer.innerHTML = '';
                
                const closeButton = document.createElement('button');
                closeButton.textContent = 'Close';
                closeButton.className = 'shop-button';
                closeButton.style.padding = '10px 20px';
                closeButton.style.backgroundColor = '#f44336';
                closeButton.style.border = 'none';
                closeButton.style.borderRadius = '5px';
                closeButton.style.color = 'white';
                closeButton.style.cursor = 'pointer';
                closeButton.style.touchAction = 'manipulation';
                
                closeButton.addEventListener('click', handleClose);
                closeButton.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    handleClose();
                }, { passive: false });
                
                function handleClose() {
                    playClickSound();
                    document.body.removeChild(confirmationDialog);
                    confirmationDialog = null;
                }
                
                buttonsContainer.appendChild(closeButton);
            }
        }
        
        function handleCancel() {
            playClickSound();
            document.body.removeChild(confirmationDialog);
            confirmationDialog = null;
        }
        
        // Assemble dialog
        buttonsContainer.appendChild(confirmButton);
        buttonsContainer.appendChild(cancelButton);
        confirmationDialog.appendChild(message);
        confirmationDialog.appendChild(buttonsContainer);
        
        // Add dialog to body
        document.body.appendChild(confirmationDialog);
    }
    
    // Function to purchase a skin
    function purchaseSkin(skinType) {
        if (!purchasedSkins.includes(skinType)) {
            purchasedSkins.push(skinType);
            savePurchasedItems();
        }
    }
    
    // Function to purchase a background
    function purchaseBackground(backgroundType) {
        if (!purchasedBackgrounds.includes(backgroundType)) {
            purchasedBackgrounds.push(backgroundType);
            savePurchasedItems();
        }
    }
    
    // Function to update purchase status on UI
    function updatePurchaseStatus() {
        // Update skins UI
        skinItems.forEach(item => {
            if (item.parentElement.id === 'skins-container') {
                const skinType = item.getAttribute('data-skin');
                const statusElement = item.querySelector('.skin-status');
                
                if (skinType === selectedSkin) {
                    statusElement.textContent = 'Selected';
                    statusElement.classList.add('selected');
                } else if (purchasedSkins.includes(skinType)) {
                    statusElement.textContent = 'Select';
                    statusElement.classList.remove('selected');
                } else {
                    statusElement.textContent = `${SKIN_PRICE} coins`;
                    statusElement.classList.remove('selected');
                }
            }
        });
        
        // Update backgrounds UI
        const backgroundItems = backgroundsContainer.querySelectorAll('.skin-item');
        backgroundItems.forEach(item => {
            const backgroundType = item.getAttribute('data-background');
            const statusElement = item.querySelector('.skin-status');
            
            if (backgroundType === selectedBackground) {
                statusElement.textContent = 'Selected';
                statusElement.classList.add('selected');
            } else if (purchasedBackgrounds.includes(backgroundType)) {
                statusElement.textContent = 'Select';
                statusElement.classList.remove('selected');
            } else {
                statusElement.textContent = `${BACKGROUND_PRICE} coins`;
                statusElement.classList.remove('selected');
            }
        });
    }

    // Function to load coins from localStorage
    function loadCoins() {
        if (localStorage.getItem(COINS_KEY) !== null) {
            coins = parseInt(localStorage.getItem(COINS_KEY)) || 0;
        }
    }

    // Function to save coins to localStorage
    function saveCoins() {
        localStorage.setItem(COINS_KEY, coins);
    }

    // Function to add coins
    function addCoins(amount) {
        coins += amount;
        saveCoins();
    }

    // Sound effects
    const clickSound = new Audio('assets/sounds/click.mp3');
    const winSound = new Audio('assets/sounds/win.mp3');
    const loseSound = new Audio('assets/sounds/lose.mp3');
    const buySound = new Audio('assets/sounds/buy.mp3');
    const errorSound = new Audio('assets/sounds/error.mp3');
    // Background music
    let backgroundMusic = null;
    
    // Function to load selected skin from localStorage
    function loadSelectedSkin() {
        if (localStorage.getItem(SELECTED_SKIN_KEY) !== null) {
            selectedSkin = localStorage.getItem(SELECTED_SKIN_KEY);
            applySkin(selectedSkin);
            
            // Make sure the selected skin is marked as purchased
            if (!purchasedSkins.includes(selectedSkin)) {
                purchasedSkins.push(selectedSkin);
                savePurchasedItems();
            }
            
            // Update the skin selection UI
            updatePurchaseStatus();
        }
    }
    
    // Function to save selected skin to localStorage
    function saveSelectedSkin() {
        localStorage.setItem(SELECTED_SKIN_KEY, selectedSkin);
    }
    
    // Function to apply the selected skin to the circle
    function applySkin(skinType) {
        // Remove all skin classes first
        circle.classList.remove(
            'default-skin', 
            'galaxy-skin', 
            'gold-skin', 
            'fire-skin', 
            'ocean-skin', 
            'neon-skin', 
            'crystal-skin', 
            'magma-skin', 
            'rainbow-skin', 
            'plasma-skin'
        );
        
        // Add the selected skin class
        circle.classList.add(skinType + '-skin');
    }
    
    // Function to load selected background from localStorage
    function loadSelectedBackground() {
        if (localStorage.getItem(SELECTED_BACKGROUND_KEY) !== null) {
            selectedBackground = localStorage.getItem(SELECTED_BACKGROUND_KEY);
            applyBackground(selectedBackground);
            
            // Make sure the selected background is marked as purchased
            if (!purchasedBackgrounds.includes(selectedBackground)) {
                purchasedBackgrounds.push(selectedBackground);
                savePurchasedItems();
            }
            
            // Update the background selection UI
            updatePurchaseStatus();
        }
    }
    
    // Function to save selected background to localStorage
    function saveSelectedBackground() {
        localStorage.setItem(SELECTED_BACKGROUND_KEY, selectedBackground);
    }
    
    // Function to apply the selected background
    function applyBackground(background) {
        // Remove all existing background classes
        document.body.classList.remove(
            'bg-default', 
            'bg-desert', 
            'bg-ocean', 
            'bg-space', 
            'bg-night', 
            'bg-lava', 
            'bg-winter', 
            'bg-abstract', 
            'bg-neon',
            'bg-volcano'
        );
        
        // Apply the new background class
        if (background) {
            document.body.classList.add('bg-' + background.replace('bg-', ''));
        } else {
            document.body.classList.add('bg-default');
        }
        
        // Save the selected background
        const bgToSave = background || 'default';
        localStorage.setItem(SELECTED_BACKGROUND_KEY, bgToSave);
        console.log('Background applied and saved:', bgToSave);
    }
    
    // Function to load game statistics from localStorage
    function loadGameStatistics() {
        // Load victories
        if (localStorage.getItem(VICTORIES_KEY) !== null) {
            victoriesCount = parseInt(localStorage.getItem(VICTORIES_KEY)) || 0;
            victoriesCountElement.textContent = victoriesCount;
        }
        
        // Load defeats
        if (localStorage.getItem(DEFEATS_KEY) !== null) {
            defeatsCount = parseInt(localStorage.getItem(DEFEATS_KEY)) || 0;
            defeatsCountElement.textContent = defeatsCount;
        }
        
        // Load total time played
        if (localStorage.getItem(TOTAL_TIME_KEY) !== null) {
            totalTimePlayed = parseInt(localStorage.getItem(TOTAL_TIME_KEY)) || 0;
            updateTotalTimeDisplay();
        }
        
        // Load consecutive victories
        if (localStorage.getItem(CONSECUTIVE_VICTORIES_KEY) !== null) {
            consecutiveVictories = parseInt(localStorage.getItem(CONSECUTIVE_VICTORIES_KEY)) || 0;
        }
        
        // Load max consecutive victories
        if (localStorage.getItem(MAX_CONSECUTIVE_VICTORIES_KEY) !== null) {
            maxConsecutiveVictories = parseInt(localStorage.getItem(MAX_CONSECUTIVE_VICTORIES_KEY)) || 0;
        }
        
        // Load coins
        loadCoins();
        updateCoinsDisplay();
        
        // Update max consecutive victories display
        updateMaxConsecutiveVictoriesDisplay();
    }
    
    // Function to save game statistics to localStorage
    function saveGameStatistics() {
        localStorage.setItem(VICTORIES_KEY, victoriesCount);
        localStorage.setItem(DEFEATS_KEY, defeatsCount);
        localStorage.setItem(TOTAL_TIME_KEY, totalTimePlayed);
        localStorage.setItem(CONSECUTIVE_VICTORIES_KEY, consecutiveVictories);
        localStorage.setItem(MAX_CONSECUTIVE_VICTORIES_KEY, maxConsecutiveVictories);
    }
    
    // Function to update the max consecutive victories display
    function updateMaxConsecutiveVictoriesDisplay() {
        // Check if the element exists in the DOM
        if (maxConsecutiveVictoriesElement) {
            maxConsecutiveVictoriesElement.textContent = maxConsecutiveVictories;
        }
    }
    
    // Format time in DD:HH:MM:SS format
    function formatTimeString(totalSeconds) {
        const days = Math.floor(totalSeconds / (24 * 3600));
        const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = Math.floor(totalSeconds % 60);
        
        const formatNumber = (num) => num.toString().padStart(2, '0');
        
        return `${formatNumber(days)}:${formatNumber(hours)}:${formatNumber(minutes)}:${formatNumber(seconds)}`;
    }
    
    // Update the displayed total time
    function updateTotalTimeDisplay() {
        totalTimePlayedElement.textContent = formatTimeString(totalTimePlayed);
    }

    // Function to start time tracking during the game
    function startTimeTracking() {
        currentGameTime = 0;
        
        // Update time tracking each second while the game is running
        timerInterval = setInterval(() => {
            timer--;
            timerElement.textContent = timer;
            
            // Update progress bar
            updateProgressBar();
            
            // Increment current game time and total time played
            currentGameTime++;
            totalTimePlayed++;
            
            // Add coins for each second survived
            addCoins(1);
            
            // Update all statistics in real time
            updateTotalTimeDisplay();
            updateCoinsDisplay();
            saveGameStatistics();
            
            if (timer <= 0) {
                clearInterval(timerInterval);
                win();
            }
        }, 1000);
    }
    
    // Function to load audio settings from localStorage
    function loadAudioSettings() {
        if (localStorage.getItem('volume') !== null) {
            globalVolume = parseFloat(localStorage.getItem('volume'));
            volumeSlider.value = Math.floor(globalVolume * 100);
            volumeValue.textContent = `${volumeSlider.value}%`;
        }
        
        if (localStorage.getItem('muted') !== null) {
            isMuted = localStorage.getItem('muted') === 'true';
            updateVolumeIcon();
        }
    }
    
    // Function to save audio settings to localStorage
    function saveAudioSettings() {
        localStorage.setItem('volume', globalVolume);
        localStorage.setItem('muted', isMuted);
    }
    
    // Function to update the volume icon based on mute/volume state
    function updateVolumeIcon() {
        if (isMuted || globalVolume === 0) {
            volumeIcon.src = 'assets/icons/volume_off.png';
        } else {
            volumeIcon.src = 'assets/icons/volume_on.png';
        }
    }
    
    // Function to apply volume settings to an audio element
    function applyVolumeSettings(audioElement) {
        if (!audioElement) return;
        audioElement.volume = isMuted ? 0 : globalVolume;
    }
    
    // Apply volume settings to all audio
    function applyVolumeToAllAudio() {
        applyVolumeSettings(clickSound);
        applyVolumeSettings(winSound);
        applyVolumeSettings(loseSound);
        applyVolumeSettings(buySound);
        applyVolumeSettings(errorSound);
        applyVolumeSettings(backgroundMusic);
    }
    
    // Function to play click sound
    function playClickSound() {
        // Reset the audio to start (in case it's still playing)
        clickSound.currentTime = 0;
        // Apply volume before playing
        applyVolumeSettings(clickSound);
        // Play the click sound
        clickSound.play().catch(e => console.log("Audio play failed:", e));
    }
    
    // Function to play win sound
    function playWinSound() {
        winSound.currentTime = 0;
        applyVolumeSettings(winSound);
        winSound.play().catch(e => console.log("Win sound play failed:", e));
    }
    
    // Function to play lose sound
    function playLoseSound() {
        loseSound.currentTime = 0;
        applyVolumeSettings(loseSound);
        loseSound.play().catch(e => console.log("Lose sound play failed:", e));
    }
    
    // Function to play buy sound
    function playBuySound() {
        buySound.currentTime = 0;
        applyVolumeSettings(buySound);
        buySound.play().catch(e => console.log("Buy sound play failed:", e));
    }
    
    // Function to play error sound
    function playErrorSound() {
        errorSound.currentTime = 0;
        applyVolumeSettings(errorSound);
        errorSound.play().catch(e => console.log("Error sound play failed:", e));
    }
    
    // Function to play random background music
    function playRandomBackgroundMusic() {
        // If there's music playing, stop it first
        if (backgroundMusic !== null) {
            backgroundMusic.pause();
            backgroundMusic = null;
        }
        
        // Randomly select one of the 4 songs
        const randomTrack = Math.floor(Math.random() * 4) + 1;
        backgroundMusic = new Audio(`assets/sounds/music/${randomTrack}.mp3`);
        
        // Set to loop
        backgroundMusic.loop = true;
        
        // Apply volume settings
        applyVolumeSettings(backgroundMusic);
        
        // Play music
        backgroundMusic.play().catch(e => console.log("Background music play failed:", e));
    }
    
    // Function to stop background music
    function stopBackgroundMusic() {
        if (backgroundMusic !== null) {
            backgroundMusic.pause();
            backgroundMusic.currentTime = 0;
        }
    }

    // Game state variables
    let isGameStarted = false;
    let isGameOver = false;
    let isHolding = false;
    let timer = 60;
    const maxTime = 60; // Total time for the game
    let timerInterval;
    let mouseX = 0;
    let mouseY = 0;
    let initialClickX = 0;
    let initialClickY = 0;
    let circleRect;
    let isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    // Variable to track current percentage
    let currentDisplayedPercent = 0;
    // How many percentages we should increase per second (100% / 60 seconds ≈ 1.67)
    const percentIncreasePerSecond = 100 / maxTime;
    // Counter to track the next update point
    let percentUpdateCounter = 0;

    // Get dynamic circle size based on viewport
    function getCircleSize() {
        // Use the smaller of 300px (doubled from 150px) or 60% (doubled from 30%) of the viewport's smallest dimension
        return Math.min(300, Math.min(window.innerWidth, window.innerHeight) * 0.6);
    }

    // Circle movement variables
    let xPos, yPos;
    let xSpeed = 0;
    let ySpeed = 0;
    let circleSize = getCircleSize(); // Dynamic size of the circle in pixels
    let circleMoving = false;

    // Set initial circle position
    function resetCirclePosition() {
        // Update circle size based on current viewport
        circleSize = getCircleSize();
        
        // Center the circle
        xPos = (window.innerWidth - circleSize) / 2;
        yPos = (window.innerHeight - circleSize) / 2;
        
        // Reset position using transform for better performance
        circle.style.left = '0px';
        circle.style.top = '0px';
        circle.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
    }

    // Update progress bar
    function updateProgressBar() {
        // Calculate actual progress for the bar width (smooth)
        const actualProgress = ((maxTime - timer) / maxTime) * 100;
        progressBar.style.width = `${actualProgress}%`;
        
        // Actualizar el contador con el tiempo transcurrido
        percentUpdateCounter = (maxTime - timer) * percentIncreasePerSecond;
        
        // Verificar si debemos incrementar el porcentaje mostrado
        // Convertimos a entero para incrementar de 1 en 1
        const targetPercent = Math.floor(percentUpdateCounter);
        
        // Actualizar solo si hay un nuevo porcentaje entero para mostrar
        if (targetPercent > currentDisplayedPercent) {
            currentDisplayedPercent = targetPercent;
            percentageText.textContent = `${currentDisplayedPercent}%`;
        }
        
        return currentDisplayedPercent;
    }

    // Show main menu
    function showMainMenu() {
        mainMenu.classList.remove('hidden');
        gameArea.classList.add('hidden');
        gameOverScreen.classList.add('hidden');
        winnerScreen.classList.add('hidden');
        settingsPanel.classList.add('hidden');
        shopPanel.classList.add('hidden');
        updateCoinsDisplay(); // Update coin counter
    }

    // Start the game from menu
    function startGameFromMenu() {
        mainMenu.classList.add('hidden');
        gameArea.classList.remove('hidden');
        resetGame();
    }

    // Reset game state for a new game
    function resetGame() {
        resetCirclePosition();
        timer = maxTime;
        timerElement.textContent = timer;
        // Reset progress bar
        progressBar.style.width = '0%';
        currentDisplayedPercent = 0;
        percentUpdateCounter = 0;
        percentageText.textContent = '0%';
        isGameStarted = false;
        isGameOver = false;
        isHolding = false;
        circleMoving = false;
        xSpeed = 0;
        ySpeed = 0;
        gameOverScreen.classList.add('hidden');
        winnerScreen.classList.add('hidden');
        clearInterval(timerInterval);
        
        // Reset current game time
        currentGameTime = 0;
        
        // Detener cualquier música que esté reproduciéndose
        stopBackgroundMusic();
    }

    // Initialize the game
    function initGame() {
        resetGame();
        showMainMenu();
        
        // Load and apply saved background
        const savedBackground = localStorage.getItem(SELECTED_BACKGROUND_KEY);
        applyBackground(savedBackground);
        
        // Update purchase status
        updatePurchaseStatus();
    }

    // Start the circle movement with random diagonal direction
    function startCircleMovement() {
        if (circleMoving) return;
        circleMoving = true;

        // Velocidad base fija para todos los dispositivos
        const baseSpeed = 2; // Velocidad base fija
        xSpeed = baseSpeed;
        ySpeed = baseSpeed;

        // Generar dirección diagonal aleatoria
        if (Math.random() > 0.5) xSpeed = -xSpeed;   
        if (Math.random() > 0.5) ySpeed = -ySpeed;

        // Iniciar el temporizador para aumentar la velocidad
        startSpeedIncreaseTimer();

        // Iniciar animación
        requestAnimationFrame(moveCircle);
    }

    // Función para aumentar la velocidad progresivamente
    function startSpeedIncreaseTimer() {
        // Asegurarnos de que el temporizador no se inicie múltiples veces
        if (window.speedIncreaseInterval) {
            clearInterval(window.speedIncreaseInterval);
        }

        window.speedIncreaseInterval = setInterval(() => {
            // Solo aumentar la velocidad si no hemos alcanzado el límite de tiempo
            if (timer > 30) { // Cuando quedan más de 20 segundos
                const speedMultiplier = 1.2; // Aumentar velocidad en un 20%
                xSpeed *= speedMultiplier;
                ySpeed *= speedMultiplier;
            } else {
                // Detener el temporizador cuando alcanzamos el límite
                clearInterval(window.speedIncreaseInterval);
            }
        }, 5000); // Cada 5 segundos
    }

    // Move and bounce the circle - optimized for mobile performance
    function moveCircle() {
        if (!circleMoving || isGameOver) return;

        xPos += xSpeed;
        yPos += ySpeed;

        // Bounce off walls
        if (xPos <= 0 || xPos >= window.innerWidth - circleSize) {
            xSpeed = -xSpeed;
            xPos = xPos <= 0 ? 0 : window.innerWidth - circleSize;
        }
        
        if (yPos <= 0 || yPos >= window.innerHeight - circleSize) {
            ySpeed = -ySpeed;
            yPos = yPos <= 0 ? 0 : window.innerHeight - circleSize;
        }

        // Update circle position using transform for better performance
        circle.style.transform = `translate(${xPos}px, ${yPos}px)`;

        // Check if game is still running and continue animation
        if (!isGameOver) {
            requestAnimationFrame(moveCircle);
        }
    }

    // Start the game timer
    function startTimer() {
        // Start tracking gameplay time
        startTimeTracking();
    }

    // Game over function
    function gameOver() {
        isGameOver = true;
        circleMoving = false;
        clearInterval(timerInterval);

        // Detener la música de fondo
        stopBackgroundMusic();
        
        // Play lose sound
        playLoseSound();

        // Update stats for game over screen
        const timeElapsed = maxTime - timer;
        const progressPercent = updateProgressBar();
        
        timeSurvivedElement.textContent = timeElapsed;
        progressPercentElement.textContent = progressPercent;
        
        // Increment defeats counter
        defeatsCount++;
        defeatsCountElement.textContent = defeatsCount;
        
        // Reset consecutive victories counter when player loses
        consecutiveVictories = 0;
        
        // Save updated statistics and update displays
        saveGameStatistics();
        updateCoinsDisplay();
        updateTotalTimeDisplay();
        updateMaxConsecutiveVictoriesDisplay();

        // Display the game over screen with a slight delay for effect
        setTimeout(() => {
            gameOverScreen.classList.remove('hidden');
        }, 300);
    }

    // Win function
    function win() {
        isGameOver = true;
        circleMoving = false;
        clearInterval(timerInterval);
        
        // Detener la música de fondo
        stopBackgroundMusic();
        
        // Play win sound
        playWinSound();
        
        // Ensure progress bar is at 100%
        progressBar.style.width = '100%';
        currentDisplayedPercent = 100;
        percentageText.textContent = '100%';
        
        // Increment victories counter
        victoriesCount++;
        victoriesCountElement.textContent = victoriesCount;
        
        // Increment consecutive victories counter
        consecutiveVictories++;
        
        // Update max consecutive victories if current streak is higher
        if (consecutiveVictories > maxConsecutiveVictories) {
            maxConsecutiveVictories = consecutiveVictories;
            // Update the display
            updateMaxConsecutiveVictoriesDisplay();
        }
        
        // Add bonus coins for winning
        addCoins(60);
        
        // Save updated statistics and update displays
        saveGameStatistics();
        updateCoinsDisplay();
        updateTotalTimeDisplay();
        
        // Display the winner screen with a slight delay for effect
        setTimeout(() => {
            winnerScreen.classList.remove('hidden');
        }, 300);
    }

    // Check if pointer is inside the circle
    function isPointerInsideCircle(pointerX, pointerY) {
        // Get current circle position
        circleRect = circle.getBoundingClientRect();
        
        // Calculate circle center
        const centerX = circleRect.left + circleRect.width / 2;
        const centerY = circleRect.top + circleRect.height / 2;
        
        // Calculate distance from center to pointer
        const distance = Math.sqrt(
            Math.pow(pointerX - centerX, 2) + 
            Math.pow(pointerY - centerY, 2)
        );
        
        // Check if distance is less than radius
        return distance < circleRect.width / 2;
    }

    // Event handling for both mouse and touch
    function handleStart(e) {
        if (isGameOver) return;
        
        e.preventDefault(); // Prevent default to avoid scrolling immediately
        
        // Record initial pointer position (mouse or touch)
        if (isMobile) {
            if (e.touches.length === 1) {
                initialClickX = e.touches[0].clientX;
                initialClickY = e.touches[0].clientY;
            } else {
                return; // Only handle single touches
            }
        } else {
            initialClickX = e.clientX;
            initialClickY = e.clientY;
        }
        
        // Verify pointer is inside circle before starting
        if (!isPointerInsideCircle(initialClickX, initialClickY)) {
            return;
        }
        
        isHolding = true;
        
        if (!isGameStarted) {
            isGameStarted = true;
            startCircleMovement();
            startTimer();
            
            // Iniciar música de fondo aleatoria
            playRandomBackgroundMusic();
        }
    }

    function handleMove(e) {
        if (!isHolding) return;
        
        e.preventDefault(); // Prevent default only if holding
        
        // Update pointer position (mouse or touch)
        if (isMobile) {
            if (e.touches.length === 1) {
                mouseX = e.touches[0].clientX;
                mouseY = e.touches[0].clientY;
            } else {
                handleEnd(e); // Cancel if more than one touch
                return;
            }
        } else {
            mouseX = e.clientX;
            mouseY = e.clientY;
        }
        
        if (isHolding && !isGameOver) {
            // Performance optimization: only check if still in circle
            if (!isPointerInsideCircle(mouseX, mouseY)) {
                gameOver();
            }
        }
    }

    function handleEnd(e) {
        if (isHolding && !isGameOver) {
            gameOver();
        }
        isHolding = false;
        e.preventDefault();
    }

    // Add event listeners for both mouse and touch
    if (isMobile) {
        circle.addEventListener('touchstart', handleStart, { passive: false });
        document.addEventListener('touchmove', handleMove, { passive: false });
        document.addEventListener('touchend', handleEnd, { passive: false });
        document.addEventListener('touchcancel', handleEnd, { passive: false });
    } else {
        circle.addEventListener('mousedown', handleStart);
        document.addEventListener('mousemove', handleMove);
        document.addEventListener('mouseup', handleEnd);
    }

    // Handle window resize
    window.addEventListener('resize', () => {
        // Update circle size based on new viewport dimensions
        circleSize = getCircleSize();
        
        if (!isGameStarted) {
            resetCirclePosition();
        } else {
            // Adjust position if near edge after resize
            if (xPos + circleSize > window.innerWidth) {
                xPos = window.innerWidth - circleSize;
            }
            if (yPos + circleSize > window.innerHeight) {
                yPos = window.innerHeight - circleSize;
            }
            
            circle.style.left = xPos + 'px';
            circle.style.top = yPos + 'px';
        }
    });

    // Añadir soporte táctil universal para todos los botones
    function addTouchSupportToButtons() {
        // Seleccionar todos los botones del juego
        const allButtons = document.querySelectorAll('button');
        
        // Iterar por cada botón para añadir evento táctil
        allButtons.forEach(button => {
            button.addEventListener('touchstart', (e) => {
                // Prevenir comportamiento predeterminado para evitar retrasos en dispositivos móviles
                e.preventDefault();
                // Disparar click para aprovechar los manejadores existentes
                button.click();
            }, { passive: false });
        });
        
        // Manejar caso especial del deslizador de volumen
        if (volumeSlider) {
            volumeSlider.addEventListener('touchstart', (e) => {
                // No prevenimos el comportamiento predeterminado aquí para permitir el deslizamiento
            });
            
            volumeSlider.addEventListener('touchmove', (e) => {
                const touch = e.touches[0];
                const slider = e.target;
                const rect = slider.getBoundingClientRect();
                const position = (touch.clientX - rect.left) / rect.width;
                const value = Math.max(0, Math.min(100, Math.round(position * 100)));
                
                // Actualizar el valor del deslizador
                slider.value = value;
                
                // Disparar el evento 'input' para activar el manejador existente
                slider.dispatchEvent(new Event('input'));
            });
        }

        // Agregar soporte táctil para los elementos de skin y background
        const skinItems = document.querySelectorAll('.skin-item');
        skinItems.forEach(item => {
            // Variables para detectar scrolling vs clicking
            let touchStartY = 0;
            let touchStartX = 0;
            let touchStartTime = 0;
            let isTouchScrolling = false;
            
            item.addEventListener('touchstart', (e) => {
                touchStartY = e.touches[0].clientY;
                touchStartX = e.touches[0].clientX;
                touchStartTime = Date.now();
                isTouchScrolling = false;
            }, { passive: true });
            
            item.addEventListener('touchmove', (e) => {
                // Calcular la distancia vertical de desplazamiento
                const touchY = e.touches[0].clientY;
                const touchX = e.touches[0].clientX;
                const diffY = Math.abs(touchY - touchStartY);
                const diffX = Math.abs(touchX - touchStartX);
                
                // Si el desplazamiento vertical es significativo, marcarlo como scrolling
                if (diffY > 10 || diffX > 10) {
                    isTouchScrolling = true;
                }
            }, { passive: true });
            
            item.addEventListener('touchend', (e) => {
                // La duración del toque
                const touchDuration = Date.now() - touchStartTime;
                
                // Si no fue scrolling y el toque fue breve (menos de 300ms), considerarlo un clic
                if (!isTouchScrolling && touchDuration < 300) {
                    e.preventDefault();
                    item.click();
                }
            }, { passive: false });
        });
    }

    // Menu buttons event listeners - Add click sound to all buttons except the circle
    playButton.addEventListener('click', () => {
        playClickSound();
        startGameFromMenu();
    });
    
    restartButton.addEventListener('click', () => {
        playClickSound();
        resetGame();
    });
    
    restartButtonWin.addEventListener('click', () => {
        playClickSound();
        resetGame();
    });
    
    menuButtonOver.addEventListener('click', () => {
        playClickSound();
        showMainMenu();
    });
    
    menuButtonWin.addEventListener('click', () => {
        playClickSound();
        showMainMenu();
    });

    // Shop event listeners
    shopButton.addEventListener('click', () => {
        playClickSound();
        mainMenu.classList.add('hidden');
        shopPanel.classList.remove('hidden');
    });
    
    closeShopButton.addEventListener('click', () => {
        playClickSound();
        shopPanel.classList.add('hidden');
        mainMenu.classList.remove('hidden');
    });
    
    // Category selection event listeners
    categorySkins.addEventListener('click', () => {
        playClickSound();
        categorySkins.classList.add('active');
        categoryBackgrounds.classList.remove('active');
        skinsContainer.classList.remove('hidden');
        backgroundsContainer.classList.add('hidden');
    });
    
    categoryBackgrounds.addEventListener('click', () => {
        playClickSound();
        categorySkins.classList.remove('active');
        categoryBackgrounds.classList.add('active');
        skinsContainer.classList.add('hidden');
        backgroundsContainer.classList.remove('hidden');
    });

    // Skin selection event listeners
    skinItems.forEach(item => {
        item.addEventListener('click', () => {
            playClickSound();
            const skinType = item.getAttribute('data-skin');
            const backgroundType = item.getAttribute('data-background');
            
            if (skinType) {
                // Es una skin
                if (purchasedSkins.includes(skinType)) {
                    // Ya está comprada, seleccionarla
                    applySkin(skinType);
                    selectedSkin = skinType;
                    saveSelectedSkin();
                    updatePurchaseStatus();
                } else {
                    // Mostrar diálogo de confirmación de compra
                    createConfirmationDialog(skinType, 'skin', SKIN_PRICE);
                }
            } else if (backgroundType) {
                // Es un background
                if (purchasedBackgrounds.includes(backgroundType)) {
                    // Ya está comprado, seleccionarlo
                    applyBackground(backgroundType);
                    selectedBackground = backgroundType;
                    saveSelectedBackground();
                    updatePurchaseStatus();
                } else {
                    // Mostrar diálogo de confirmación de compra
                    createConfirmationDialog(backgroundType, 'background', BACKGROUND_PRICE);
                }
            }
        });
    });
    
    // Settings event listeners
    settingsButton.addEventListener('click', () => {
        playClickSound();
        mainMenu.classList.add('hidden');
        settingsPanel.classList.remove('hidden');
    });
    
    closeSettingsButton.addEventListener('click', () => {
        playClickSound();
        settingsPanel.classList.add('hidden');
        mainMenu.classList.remove('hidden');
    });
    
    muteButton.addEventListener('click', () => {
        playClickSound();
        isMuted = !isMuted;
        updateVolumeIcon();
        applyVolumeToAllAudio();
        saveAudioSettings();
    });
    
    volumeSlider.addEventListener('input', () => {
        globalVolume = volumeSlider.value / 100;
        volumeValue.textContent = `${volumeSlider.value}%`;
        
        // If volume reaches 0, consider it muted
        if (globalVolume === 0) {
            isMuted = true;
        } else if (isMuted) {
            // If it was muted and volume is increased, unmute
            isMuted = false;
        }
        
        updateVolumeIcon();
        applyVolumeToAllAudio();
        saveAudioSettings();
    });
    
    // Apply touch support to all buttons
    addTouchSupportToButtons();

    // Function to update coins display
    function updateCoinsDisplay() {
        if (coinsCountElement) {
            coinsCountElement.textContent = coins;
        }
    }

    // Initialize the game
    initGame();
    
    // Mejorar la detección de scroll vs click en el panel de la tienda
    function improveShopScrolling() {
        const shopPanel = document.getElementById('shop-panel');
        
        if (!shopPanel) return;
        
        let touchStartY = 0;
        let touchStartTime = 0;
        let isTouchMoving = false;
        
        // Al iniciar el toque, guardar la posición inicial
        shopPanel.addEventListener('touchstart', (e) => {
            touchStartY = e.touches[0].clientY;
            touchStartTime = Date.now();
            isTouchMoving = false;
        }, { passive: true });
        
        // Durante el movimiento, determinar si es un desplazamiento
        shopPanel.addEventListener('touchmove', (e) => {
            const diffY = Math.abs(e.touches[0].clientY - touchStartY);
            
            // Si el desplazamiento es significativo
            if (diffY > 10) {
                isTouchMoving = true;
            }
        }, { passive: true });
        
        // El panel completo usa la lógica mejorada
        shopPanel.addEventListener('click', (e) => {
            // Si estábamos en un gesto de desplazamiento, ignorar el clic
            if (isTouchMoving) {
                e.stopPropagation();
                e.preventDefault();
            }
        }, { capture: true });
    }
    
    // Llamar a la función para mejorar el scrolling
    improveShopScrolling();
	
	window.addEventListener('blur', () => {
    if (isGameStarted && !isGameOver) {
        gameOver();
    }
});
});