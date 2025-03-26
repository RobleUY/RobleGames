// Funcionalidad principal para RobleGames

document.addEventListener('DOMContentLoaded', () => {
    // Inicializar funcionalidad del menú desplegable
    initDropdownMenu();
    
    // Seleccionar todos los botones de juego
    const playButtons = document.querySelectorAll('.play-button');
    
    // Añadir manejadores de eventos a cada botón
    playButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            // Prevenir comportamiento predeterminado
            e.preventDefault();
            
            // Obtener el ID del juego desde el atributo data
            const gameId = button.getAttribute('data-game');
            
            // Cargar el juego seleccionado
            loadGame(gameId);
        });
    });
    
    // Añadir efecto hover a las tarjetas
    const gameCards = document.querySelectorAll('.game-card');
    gameCards.forEach(card => {
        card.addEventListener('click', (e) => {
            // Solo activar si no se hizo clic en el botón
            if (!e.target.classList.contains('play-button')) {
                const gameId = card.id;
                loadGame(gameId);
            }
        });
    });
    
    // Inicializar funcionalidad de filtrado por categorías
    initCategoryFilter();
});

/**
 * Función para cargar el juego seleccionado
 * @param {string} gameId - ID del juego a cargar
 */
function loadGame(gameId) {
    console.log(`Cargando juego: ${gameId}`);
    
    // Ruta del juego basada en su ID
    const gamePath = `games/${gameId}/index.html`;
    
    // Redireccionar a la página del juego
    window.location.href = gamePath;
    
    // Alternativa: cargar el juego en un iframe dentro de la página actual
    // Esta funcionalidad se puede implementar más adelante si es necesario
}

/**
 * Función para volver al menú principal desde un juego
 * Para ser utilizada desde las páginas de juegos individuales
 */
function backToMainMenu() {
    window.location.href = '../../index.html';
}

/**
 * Función para inicializar el menú desplegable
 */
function initDropdownMenu() {
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
    
    // Para dispositivos táctiles, convertir hover en click
    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            e.preventDefault();
            const parent = toggle.parentElement;
            
            // Cerrar otros dropdowns abiertos
            document.querySelectorAll('.dropdown.active').forEach(item => {
                if (item !== parent) {
                    item.classList.remove('active');
                }
            });
            
            // Toggle el dropdown actual
            parent.classList.toggle('active');
        });
    });
    
    // Cerrar dropdown al hacer clic fuera
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.dropdown')) {
            document.querySelectorAll('.dropdown.active').forEach(item => {
                item.classList.remove('active');
            });
        }
    });
}

// Animaciones para las tarjetas de juegos
document.addEventListener('DOMContentLoaded', () => {
    // Añadir clase para activar animación cuando las tarjetas estén en el viewport
    const gameCards = document.querySelectorAll('.game-card');
    
    // Función para verificar si un elemento está visible en la ventana
    const isElementInViewport = (el) => {
        const rect = el.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    };
    
    // Función para añadir animación a elementos visibles
    const handleScroll = () => {
        gameCards.forEach(card => {
            if (isElementInViewport(card) && !card.classList.contains('hidden')) {
                card.classList.add('animate');
            }
        });
    };
    
    // Verificar al cargar y al hacer scroll
    handleScroll();
    window.addEventListener('scroll', handleScroll);
});

/**
 * Función para inicializar el filtrado por categorías
 */
function initCategoryFilter() {
    // Seleccionar todos los enlaces de categorías
    const categoryLinks = document.querySelectorAll('.dropdown-menu a');
    const homeLink = document.querySelector('.nav-links a.active'); // Enlace de inicio
    
    // Añadir manejadores de eventos a cada enlace de categoría
    categoryLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remover clase active de todos los enlaces
            document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
            
            // Añadir clase active al enlace actual
            link.classList.add('active');
            
            // Obtener el texto de la categoría seleccionada
            const category = link.textContent.trim();
            
            // Filtrar juegos según la categoría
            filterGamesByCategory(category);
        });
    });
    
    // Añadir manejador de evento al enlace de inicio
    if (homeLink) {
        homeLink.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remover clase active de todos los enlaces
            document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
            
            // Añadir clase active al enlace de inicio
            homeLink.classList.add('active');
            
            // Mostrar todos los juegos
            showAllGames();
        });
    }
}

/**
 * Función para filtrar juegos según la categoría seleccionada
 * @param {string} category - Categoría seleccionada
 */
function filterGamesByCategory(category) {
    const gameCards = document.querySelectorAll('.game-card');
    
    gameCards.forEach(card => {
        // Obtener los iconos de plataforma del juego
        const platformIcons = card.querySelectorAll('.platform-icon');
        let showCard = false;
        const gameId = card.id;
        
        // Verificar si el juego pertenece a la categoría seleccionada
        if (category === 'Todos los Juegos') {
            // Mostrar todos los juegos
            showCard = true;
        } else if (category === 'Juegos de PC') {
            // Snake es el único juego solo para PC por ahora
            if (gameId === 'Snake') {
                showCard = true;
            }
        } else if (category === 'Juegos de Celular') {
            // Por ahora no hay juegos exclusivos para celular
            showCard = false;
        } else if (category === 'Juegos para Ambos') {
            // Todos los juegos excepto Snake son para ambas plataformas
            if (gameId !== 'Snake') {
                showCard = true;
            }
        }
        
        // Mostrar u ocultar la tarjeta según corresponda
        if (showCard) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
        
        // Mostrar u ocultar la tarjeta según corresponda
        if (showCard) {
            card.style.display = '';
            card.classList.remove('hidden');
        } else {
            card.style.display = 'none';
            card.classList.add('hidden');
        }
    });
}

/**
 * Función para mostrar todos los juegos
 */
function showAllGames() {
    const gameCards = document.querySelectorAll('.game-card');
    
    gameCards.forEach(card => {
        card.style.display = '';
        card.classList.remove('hidden');
    });
}