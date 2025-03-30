let currentQuestionIndex = 0;
let score = 0;
let timer;
let timeLeft;
let timerContainer;
let timerBar;
let timerText;
let isAnswerSelected = false;
let currentQuestions = []; // Array para almacenar las preguntas mezcladas

// Efectos de sonido
const timerSound = new Audio('Sonidos/timer.mp3');
const loseSound = new Audio('Sonidos/lose.mp3');
const winSound = new Audio('Sonidos/win.mp3');

// Preguntas del juego
const questions = [
    {
        pregunta: "¿En qué continente se encuentra el desierto de Sahara?",
        opciones: ["Asia", "África", "América"],
        respuestaCorrecta: 1
    },
    {
        pregunta: "¿Qué animal es el símbolo nacional de Australia?",
        opciones: ["Canguro", "Koala", "Emú"],
        respuestaCorrecta: 0
    },
    {
        pregunta: "¿Cuál es la moneda oficial de Japón?",
        opciones: ["Yen", "Won", "Baht"],
        respuestaCorrecta: 0
    },
    {
        pregunta: "¿En qué ciudad se encuentra la Torre Eiffel?",
        opciones: ["Madrid", "Londres", "París"],
        respuestaCorrecta: 2
    },
    {
        pregunta: "¿Qué gas es el más abundante en la atmósfera terrestre?",
        opciones: ["Oxígeno", "Nitrógeno", "Carbono"],
        respuestaCorrecta: 1
    },
    {
        pregunta: "¿Cuál es el continente más pequeño?",
        opciones: ["Asia", "Oceanía", "Antártida"],
        respuestaCorrecta: 1
    },
    {
        pregunta: "¿Quién es el autor de 'Don Quijote de la Mancha'?",
        opciones: ["Gabriel García Márquez", "Miguel de Cervantes", "William Shakespeare"],
        respuestaCorrecta: 1
    },
    {
        pregunta: "¿Qué gas es responsable del efecto invernadero?",
        opciones: ["Oxígeno", "Nitrógeno", "Dióxido de carbono"],
        respuestaCorrecta: 2
    },
    {
        pregunta: "¿Cuántos planetas hay en el sistema solar?",
        opciones: ["7", "8", "9"],
        respuestaCorrecta: 1
    },
    {
        pregunta: "¿Qué país tiene la mayor población del mundo?",
        opciones: ["India", "China", "Estados Unidos"],
        respuestaCorrecta: 1
    },
    {
        pregunta: "¿Qué es el ADN?",
        opciones: ["Ácido desoxirribonucleico", "Ácido ribonucleico", "Ácido nucleico"],
        respuestaCorrecta: 0
    },
    {
        pregunta: "¿En qué año terminó la Segunda Guerra Mundial?",
        opciones: ["1939", "1945", "1950"],
        respuestaCorrecta: 1
    },
    {
        pregunta: "¿Cuál es el océano más grande del mundo?",
        opciones: ["Atlántico", "Índico", "Pacífico"],
        respuestaCorrecta: 2
    },
    {
        pregunta: "¿Quién fue el primer hombre en caminar sobre la Luna?",
        opciones: ["Buzz Aldrin", "Yuri Gagarin", "Neil Armstrong"],
        respuestaCorrecta: 2
    },
    {
        pregunta: "¿En qué país se encuentra la pirámide de Chichén Itzá?",
        opciones: ["México", "Perú", "Egipto"],
        respuestaCorrecta: 0
    },
    {
        pregunta: "¿Qué tipo de animal es el delfín?",
        opciones: ["Pez", "Mamífero", "Reptil"],
        respuestaCorrecta: 1
    },
    {
        pregunta: "¿Qué instrumento musical tiene 88 teclas?",
        opciones: ["Piano", "Guitarra", "Bajo"],
        respuestaCorrecta: 0
    },
    {
        pregunta: "¿En qué continente se encuentra el Amazonas?",
        opciones: ["Asia", "África", "América del Sur"],
        respuestaCorrecta: 2
    },
    {
        pregunta: "¿Cuántos huesos tiene el cuerpo humano?",
        opciones: ["206", "210", "215"],
        respuestaCorrecta: 0
    },
    {
        pregunta: "¿Quién fue el primer presidente de los Estados Unidos?",
        opciones: ["Abraham Lincoln", "Thomas Jefferson", "George Washington"],
        respuestaCorrecta: 2
    },
    {
        pregunta: "¿Qué continente tiene la mayor cantidad de países?",
        opciones: ["África", "Asia", "Europa"],
        respuestaCorrecta: 0
    },
    {
        pregunta: "¿Qué instrumento musical es de cuerdas y se toca con un arco?",
        opciones: ["Guitarra", "Violín", "Piano"],
        respuestaCorrecta: 1
    },
    {
        pregunta: "¿Cuál es el país más grande del mundo por superficie?",
        opciones: ["Estados Unidos", "Rusia", "China"],
        respuestaCorrecta: 1
    },
    {
        pregunta: "¿En qué año comenzó la Primera Guerra Mundial?",
        opciones: ["1910", "1914", "1920"],
        respuestaCorrecta: 1
    },
    {
        pregunta: "¿Qué planeta es conocido como el 'planeta rojo'?",
        opciones: ["Marte", "Júpiter", "Venus"],
        respuestaCorrecta: 0
    },
    {
        pregunta: "¿Qué parte del cuerpo humano produce insulina?",
        opciones: ["Páncreas", "Hígado", "Estómago"],
        respuestaCorrecta: 0
    },
    {
        pregunta: "¿Quién pintó 'La última cena'?",
        opciones: ["Michelangelo", "Leonardo da Vinci", "Raphael"],
        respuestaCorrecta: 1
    },
    {
        pregunta: "¿En qué país se originó el fútbol?",
        opciones: ["Brasil", "Inglaterra", "España"],
        respuestaCorrecta: 1
    },
    {
        pregunta: "¿Qué significa 'OM' en la religión hindú?",
        opciones: ["Dios", "Sonido sagrado", "Sufrimiento"],
        respuestaCorrecta: 1
    },
    {
        pregunta: "¿Qué isla es famosa por su gran tamaño y su biodiversidad?",
        opciones: ["Madagascar", "Hawái", "Isla de Pascua"],
        respuestaCorrecta: 0
    },
    {
        pregunta: "¿Quién inventó la bombilla eléctrica?",
        opciones: ["Nikola Tesla", "Thomas Edison", "Alexander Graham Bell"],
        respuestaCorrecta: 1
    },
    {
        pregunta: "¿Qué planeta está más cerca del Sol?",
        opciones: ["Venus", "Mercurio", "Marte"],
        respuestaCorrecta: 1
    },
    {
        pregunta: "¿Cuál es el nombre de la primera mujer en el espacio?",
        opciones: ["Valentina Tereshkova", "Sally Ride", "Mae Jemison"],
        respuestaCorrecta: 0
    },
    {
        pregunta: "¿Qué es el Big Bang?",
        opciones: ["La creación de un agujero negro", "La teoría de la expansión del universo", "La teoría de la formación de planetas"],
        respuestaCorrecta: 1
    },
    {
        pregunta: "¿En qué país se habla el idioma árabe como lengua principal?",
        opciones: ["Irak", "Francia", "China"],
        respuestaCorrecta: 0
    },
    {
        pregunta: "¿Quién es el autor de la obra 'Romeo y Julieta'?",
        opciones: ["William Shakespeare", "Charles Dickens", "George Orwell"],
        respuestaCorrecta: 0
    },
    {
        pregunta: "¿Qué animal es conocido por su capacidad de cambiar de color?",
        opciones: ["Camaleón", "Loro", "Pulpo"],
        respuestaCorrecta: 0
    }
];

const startScreen = document.getElementById('start-screen');
const questionScreen = document.getElementById('question-screen');
const resultScreen = document.getElementById('result-screen');
const questionText = document.getElementById('question-text');
const optionButtons = document.querySelectorAll('.option-button');
const scoreElement = document.getElementById('score');
const finalScoreElement = document.getElementById('final-score');
const startButton = document.getElementById('start-button');
const restartButton = document.getElementById('restart-button');
const scoreContainer = document.querySelector('.score-container');

// Inicializar elementos del temporizador
timerContainer = document.querySelector('.timer-container');
timerBar = document.querySelector('.timer-bar');
timerText = document.querySelector('.timer-text');

startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', startGame);

// Función para mezclar array (Fisher-Yates shuffle)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function startGame() {
    currentQuestionIndex = 0;
    score = 0;
    isAnswerSelected = false;
    scoreElement.textContent = score;
    
    // Detener todos los sonidos
    timerSound.pause();
    timerSound.currentTime = 0;
    loseSound.pause();
    loseSound.currentTime = 0;
    winSound.pause();
    winSound.currentTime = 0;
    
    // Crear una copia del array de preguntas y mezclarlo
    currentQuestions = [...questions];
    shuffleArray(currentQuestions);
    
    startScreen.classList.add('hidden');
    questionScreen.classList.add('hidden');
    resultScreen.classList.add('hidden');
    
    // Mostrar el contenedor de puntuación
    scoreContainer.classList.add('visible');
    
    questionScreen.classList.remove('hidden');
    
    showQuestion();
}

function startTimer() {
    // Limpiar cualquier temporizador existente
    if (timer) {
        clearInterval(timer);
    }

    // Reiniciar el estado del temporizador inmediatamente
    timeLeft = 10;
    timerText.textContent = timeLeft;
    
    // Reproducir sonido del temporizador
    timerSound.currentTime = 0;
    timerSound.play();
    
    // Iniciar el temporizador inmediatamente
    timer = setInterval(() => {
        if (!isAnswerSelected) {
            timeLeft--;
            timerText.textContent = timeLeft;
            
            if (timeLeft <= 0) {
                clearInterval(timer);
                timerSound.pause();
                handleTimeUp();
            }
        }
    }, 1000);
}

function handleTimeUp() {
    if (!isAnswerSelected) {
        isAnswerSelected = true;
        // Deshabilitar todos los botones
        optionButtons.forEach(button => button.disabled = true);
        
        // Reproducir sonido de perder
        loseSound.currentTime = 0;
        loseSound.play();
        
        // Mostrar la respuesta correcta
        const question = currentQuestions[currentQuestionIndex];
        optionButtons[question.respuestaCorrecta].style.backgroundColor = '#2ecc71';
        
        // Esperar antes de pasar a la siguiente pregunta
        setTimeout(() => {
            currentQuestionIndex++;
            showQuestion();
        }, 1000);
    }
}

function showQuestion() {
    if (currentQuestionIndex >= currentQuestions.length) {
        endGame();
        return;
    }

    // Limpiar el temporizador anterior si existe
    if (timer) {
        clearInterval(timer);
    }

    isAnswerSelected = false;
    const question = currentQuestions[currentQuestionIndex];
    questionText.textContent = question.pregunta;
    
    // Reset button styles
    optionButtons.forEach(button => {
        button.disabled = false;
        button.classList.remove('correct', 'incorrect');
        button.style.backgroundColor = '';
    });
    
    // Set up answer buttons
    optionButtons.forEach((button, index) => {
        button.textContent = question.opciones[index];
        button.onclick = () => checkAnswer(index);
    });
    
    // Reiniciar el temporizador inmediatamente
    timeLeft = 10;
    timerText.textContent = timeLeft;
    
    // Iniciar el temporizador
    startTimer();
}

function checkAnswer(selectedIndex) {
    if (!isAnswerSelected) {
        isAnswerSelected = true;
        clearInterval(timer); // Detener el temporizador
        timerSound.pause(); // Detener el sonido del temporizador
        
        const question = currentQuestions[currentQuestionIndex];
        const isCorrect = selectedIndex === question.respuestaCorrecta;
        
        // Disable all buttons after answering
        optionButtons.forEach(button => button.disabled = true);
        
        // Show feedback
        if (isCorrect) {
            score += 10;
            scoreElement.textContent = score;
            optionButtons[selectedIndex].style.backgroundColor = '#2ecc71';
            // Reproducir sonido de ganar
            winSound.currentTime = 0;
            winSound.play();
        } else {
            optionButtons[selectedIndex].style.backgroundColor = '#e74c3c';
            optionButtons[question.respuestaCorrecta].style.backgroundColor = '#2ecc71';
            // Reproducir sonido de perder
            loseSound.currentTime = 0;
            loseSound.play();
        }
        
        // Wait before showing next question
        setTimeout(() => {
            currentQuestionIndex++;
            showQuestion();
        }, 1000);
    }
}

function endGame() {
    questionScreen.classList.add('hidden');
    resultScreen.classList.remove('hidden');
    finalScoreElement.textContent = score;
    // Ocultar el contenedor de puntuación
    scoreContainer.classList.remove('visible');
}
