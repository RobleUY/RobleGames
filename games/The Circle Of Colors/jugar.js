const circle = document.querySelector('.circle');
const timerElement = document.getElementById('timer');
const percentCounter = document.getElementById('percentCounter');
const victoryCount = document.getElementById('victoryCount');
const timeRemaining = document.getElementById('timeRemaining');
const percentText = document.getElementById('percentText');

const screenWidth = window.innerWidth;
const screenHeight = window.innerHeight;

let posX = (screenWidth - 300) / 2;
let posY = (screenHeight - 300) / 2;

let initialVelocity = 2;
let velocity = initialVelocity;
let direction = Math.random() * 2 * Math.PI;

let moving = false;
let timeLeft = 60;
let percentComplete = 0;
let intervalTimer;
let intervalPercent;

let coins = JSON.parse(localStorage.getItem('circulomonedas')) || 0;  // Monedas sumadas por porcentaje
let victories = JSON.parse(localStorage.getItem('circulowin')) || 0;  // Contador de victorias
victoryCount.textContent = victories;  // Mostrar las victorias en el contador

let invisiblePixel = { x: -1, y: -1 };
let gameStarted = false;

function changeBackgroundColor() {
  const colors = [
    { background: 'rgb(143, 173, 24)', circle: '#cef23f' },
    { background: 'rgb(181, 27, 150)', circle: '#f23fe9' },
    { background: 'rgb(27, 104, 181)', circle: '#3f96f2' },
    { background: 'rgb(163, 23, 23)', circle: '#f2423f' },
    { background: 'rgb(25, 163, 23)', circle: '#3ff25d' }
  ];

  let index = 0;
  setInterval(() => {
    document.body.style.backgroundColor = colors[index].background;
    circle.style.backgroundColor = colors[index].circle;
    index = (index + 1) % colors.length;
  }, 5000);
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes < 10 ? '0' : ''}${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
}

function startMovement() {
  moving = true;
  gameStarted = true;
  intervalTimer = setInterval(updateTimer, 1000);
  intervalPercent = setInterval(updatePercent, 1000);
  animate();
  playMusic();
}

function updateTimer() {
  if (timeLeft > 0) {
    timeLeft -= 1;
    timeRemaining.textContent = `Tiempo restante: ${formatTime(timeLeft)}`;
    timerElement.textContent = formatTime(timeLeft);
    adjustSpeedAndSize();
  } else {
    clearInterval(intervalTimer);
    clearInterval(intervalPercent);
    showWinMessage();  // Mostrar el mensaje de victoria cuando termine el tiempo
  }
}

function updatePercent() {
  if (timeLeft > 0) {
    percentComplete = ((60 - timeLeft) / 60) * 100;
    percentCounter.textContent = `${Math.min(Math.round(percentComplete), 100)}%`;
    percentText.textContent = `Porcentaje: ${Math.min(Math.round(percentComplete), 100)}%`;

    // Asignar monedas según el porcentaje completado
    const coinsToAdd = Math.round(percentComplete); // Este es el número de monedas a sumar
    coins = JSON.parse(localStorage.getItem('circulomonedas')) || 0;
    coins += coinsToAdd;
    localStorage.setItem('circulomonedas', JSON.stringify(coins)); // Actualizar las monedas en localStorage
    victoryCount.textContent = victories; // Mostrar las victorias en el contador de monedas

    // Guardar el porcentaje completado en localStorage
    localStorage.setItem('circulo_porcentajes', percentComplete);
  }
}

window.addEventListener('load', () => {
  // Eliminar el porcentaje guardado cuando la página de juego se carga
  localStorage.removeItem('circulo_porcentajes');

  // Si hay porcentaje guardado en localStorage, se muestra en la página de "perdiste" o "ganaste"
  const savedPercent = localStorage.getItem('circulo_porcentajes');
  if (savedPercent) {
    percentComplete = parseFloat(savedPercent);
    percentCounter.textContent = `${Math.min(Math.round(percentComplete), 100)}%`;
    percentText.textContent = `Porcentaje: ${Math.min(Math.round(percentComplete), 100)}%`;
  }

  setSkin();
  changeBackgroundColor();
});

function adjustSpeedAndSize() {
  const speedFactor = (60 - timeLeft) / 60;
  velocity = initialVelocity + (4 * speedFactor);
  const sizeFactor = (60 - timeLeft) / 60;
  const newSize = 300 - (170 * sizeFactor);
  circle.style.width = `${newSize}px`;
  circle.style.height = `${newSize}px`;
  percentCounter.style.fontSize = `${Math.max(250 - (150 * sizeFactor), 150)}px`;
}

function animate() {
  if (!moving) return;

  const velocityX = velocity * Math.cos(direction);
  const velocityY = velocity * Math.sin(direction);

  posX += velocityX;
  posY += velocityY;

  if (posX <= 0 || posX >= screenWidth - circle.offsetWidth) {
    direction = Math.PI - direction;
    posX = Math.max(0, Math.min(screenWidth - circle.offsetWidth, posX));
  }
  if (posY <= 0 || posY >= screenHeight - circle.offsetHeight) {
    direction = -direction;
    posY = Math.max(0, Math.min(screenHeight - circle.offsetHeight, posY));
  }

  circle.style.left = `${posX}px`;
  circle.style.top = `${posY}px`;

  if (circle.getBoundingClientRect().left > invisiblePixel.x || 
      circle.getBoundingClientRect().right < invisiblePixel.x || 
      circle.getBoundingClientRect().top > invisiblePixel.y ||
      circle.getBoundingClientRect().bottom < invisiblePixel.y) {
    showLoseMessage();
  }

  requestAnimationFrame(animate);
}

function showWinMessage() {
  victories += 1; // Aumentar el contador de victorias
  localStorage.setItem('circulowin', JSON.stringify(victories)); // Guardar las victorias en localStorage
  victoryCount.textContent = victories; // Actualizar el contador visual de victorias

  // Sumamos 1 moneda extra por completar el juego
  coins += 1;
  localStorage.setItem('circulomonedas', JSON.stringify(coins)); // Actualizar monedas

  // Guardar el porcentaje completado al ganar
  localStorage.setItem('circulo_porcentajes', percentComplete);  // Guardar el porcentaje completado
  
  window.location.href = 'ganaste.html';  // Redirigir al usuario a la página de victoria
}

function showLoseMessage() {
  // Guardar el porcentaje completado al perder
  localStorage.setItem('circulo_porcentajes', percentComplete);  // Guardar el porcentaje completado
  
  window.location.href = 'perdiste.html'; // Redirigir a la página de perder
}

document.addEventListener('visibilitychange', function() {
  if (document.hidden) {
    showLoseMessage();
  }
});

function playMusic() {
  const musicSetting = localStorage.getItem('circulomusic') || 'on';

  if (musicSetting === 'on') {
    const musicFiles = ['a.mp3', 'b.mp3', 'c.mp3'];
    const randomIndex = Math.floor(Math.random() * musicFiles.length);
    const music = new Audio(`music/${musicFiles[randomIndex]}`);
    music.loop = true;
    music.play();
  }
}

function setSkin() {
  let selectedSkin = localStorage.getItem("circuloskinselected") || "Inicial";

  if (selectedSkin === "Inicial") {
    circle.style.backgroundColor = "#45c942";
    circle.style.backgroundImage = '';
    circle.style.border = '5px solid black';
  } else {
    circle.style.backgroundImage = `url('skins/${selectedSkin}.png')`;
    circle.style.backgroundSize = 'cover';
    circle.style.backgroundPosition = 'center';
    circle.style.backgroundColor = 'transparent';
    circle.style.border = 'none';
  }
}

circle.addEventListener('touchstart', (e) => {
  const touch = e.touches[0];
  const circleRect = circle.getBoundingClientRect();

  if (
    touch.clientX >= circleRect.left &&
    touch.clientX <= circleRect.right &&
    touch.clientY >= circleRect.top &&
    touch.clientY <= circleRect.bottom
  ) {
    gameStarted = true;
    invisiblePixel.x = touch.clientX;
    invisiblePixel.y = touch.clientY;
    startMovement();
  } else {
    showLoseMessage();
  }
});

circle.addEventListener('touchmove', (e) => {
  const touch = e.touches[0];
  invisiblePixel.x = touch.clientX;
  invisiblePixel.y = touch.clientY;
  const circleRect = circle.getBoundingClientRect();

  if (
    touch.clientX < circleRect.left ||
    touch.clientX > circleRect.right ||
    touch.clientY < circleRect.top ||
    touch.clientY > circleRect.bottom
  ) {
    showLoseMessage();
  }
});

circle.addEventListener('touchend', (e) => {
  if (gameStarted) {
    const touch = e.changedTouches[0];
    const circleRect = circle.getBoundingClientRect();

    if (
      touch.clientX < circleRect.left || 
      touch.clientX > circleRect.right || 
      touch.clientY < circleRect.top || 
      touch.clientY > circleRect.bottom
    ) {
      showLoseMessage();
    } else {
      showLoseMessage();
    }
  }
});

window.addEventListener('load', () => {
  setSkin();
  changeBackgroundColor();
});
