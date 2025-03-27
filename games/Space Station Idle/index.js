// Storage constants
const STORAGE_PREFIX = 'robleuy_spaceStationIdleSaveGAME_0';
const STORAGE_KEYS = {
  SAVE_DATA: `${STORAGE_PREFIX}saveData`,
  ACHIEVEMENTS: `${STORAGE_PREFIX}achievements`,
  RESOURCES: `${STORAGE_PREFIX}resources`,
  UPGRADES: `${STORAGE_PREFIX}upgrades`,
  SETTINGS: `${STORAGE_PREFIX}settings`
};

// Game state
const gameState = {
  resources: {
    energy: 0,
    materials: 0,
    research: 0
  },
  upgrades: {
    'solar-panel': {
      count: 0,
      baseCost: 10,
      costMultiplier: 1.15,
      energyPerSecond: 1,
      interval: 1,
      resourceType: 'energy'
    },
    'material-collector': {
      count: 0,
      baseCost: 10,
      costMultiplier: 1.2,
      materialsPerInterval: 1,
      interval: 5,
      resourceType: 'materials'
    },
    'research-lab': {
      count: 0,
      baseCost: 10,
      costMultiplier: 1.25,
      researchPerInterval: 1,
      interval: 10,
      resourceType: 'research'
    }
  },
  crew: {
    engineer: false,
    scientist: false,
    miner: false
  },
  achievements: {
    'first-energy': false,
    'first-materials': false,
    'first-research': false,
    'energy-master': false,
    'material-master': false,
    'research-master': false,
    'crew-complete': false
  },
  clickMultiplier: 1,
  baseCooldowns: {
    energy: 2,
    materials: 5,
    research: 10
  },
  lastTick: Date.now(),
  saveInterval: 30000, // 30 seconds
  lastSave: Date.now()
};

// DOM elements
const elements = {
  energyCount: document.getElementById('energy-count'),
  materialsCount: document.getElementById('materials-count'),
  researchCount: document.getElementById('research-count'),
  generateEnergy: document.getElementById('generate-energy'),
  generateMaterials: document.getElementById('generate-materials'),
  generateResearch: document.getElementById('generate-research'),
  solarPanelCount: document.getElementById('solar-panel-count'),
  materialCollectorCount: document.getElementById('material-collector-count'),
  researchLabCount: document.getElementById('research-lab-count'),
  stationCore: document.querySelector('.station-core'),
  upgradeButtons: document.querySelectorAll('.buy-btn'),
  achievementsList: document.getElementById('achievements-list'),
  starsContainer: document.getElementById('stars-container'),
  clickSound: new Audio('sounds/click.mp3'),
  purchaseSound: new Audio('sounds/compra.mp3')
};

// Cooldown timers
let materialsCooldown = 0;
let researchCooldown = 0;
let energyCooldown = 0;

// Initialize the game
function initGame() {
  loadGame();
  createStars();
  updateUI();
  initAchievements();
  
  // Event listeners
  elements.generateEnergy.addEventListener('click', handleEnergyClick);
  elements.stationCore.addEventListener('click', handleEnergyClick);
  elements.generateMaterials.addEventListener('click', handleMaterialsClick);
  elements.generateResearch.addEventListener('click', handleResearchClick);
  
  elements.upgradeButtons.forEach(button => {
    button.addEventListener('click', () => {
      const upgradeId = button.dataset.upgrade;
      buyUpgrade(upgradeId);
    });
  });
  
  // Start game loops
  setInterval(gameLoop, 50); // Main game loop - every 50ms for smooth progress bars
  setInterval(saveGame, gameState.saveInterval); // Auto-save
}

// Create star background
function createStars() {
  const starsCount = 100;
  for (let i = 0; i < starsCount; i++) {
    const star = document.createElement('div');
    star.classList.add('star');
    star.style.top = `${Math.random() * 100}%`;
    star.style.left = `${Math.random() * 100}%`;
    star.style.animationDelay = `${Math.random() * 5}s`;
    elements.starsContainer.appendChild(star);
  }
}

// Main game loop
function gameLoop() {
  const now = Date.now();
  const deltaTime = (now - gameState.lastTick) / 1000; // in seconds
  gameState.lastTick = now;
  
  // Process automatic resource generation
  const solarPanelCount = gameState.upgrades['solar-panel'].count;
  const materialCollectorCount = gameState.upgrades['material-collector'].count;
  const researchLabCount = gameState.upgrades['research-lab'].count;
  
  // Update cooldowns
  if (energyCooldown > 0) {
    energyCooldown -= 0.05;
    const progress = ((getCurrentCooldown('energy') - energyCooldown) / getCurrentCooldown('energy')) * 100;
    elements.generateEnergy.querySelector('.progress-fill').style.width = `${progress}%`;
    
    if (energyCooldown <= 0) {
      energyCooldown = 0;
      elements.generateEnergy.disabled = false;
      elements.generateEnergy.querySelector('.progress-fill').style.width = '0%';
      gameState.resources.energy += 1 * gameState.clickMultiplier;
      createEnergyParticle(elements.generateEnergy);
      checkAchievements();
    }
  }
  
  if (materialsCooldown > 0) {
    materialsCooldown -= 0.05;
    const progress = ((getCurrentCooldown('materials') - materialsCooldown) / getCurrentCooldown('materials')) * 100;
    elements.generateMaterials.querySelector('.progress-fill').style.width = `${progress}%`;
    
    if (materialsCooldown <= 0) {
      materialsCooldown = 0;
      elements.generateMaterials.disabled = false;
      elements.generateMaterials.querySelector('.progress-fill').style.width = '0%';
      gameState.resources.materials += 1 * gameState.clickMultiplier;
      createMaterialParticle(elements.generateMaterials);
      checkAchievements();
    }
  }
  
  if (researchCooldown > 0) {
    researchCooldown -= 0.05;
    const progress = ((getCurrentCooldown('research') - researchCooldown) / getCurrentCooldown('research')) * 100;
    elements.generateResearch.querySelector('.progress-fill').style.width = `${progress}%`;
    
    if (researchCooldown <= 0) {
      researchCooldown = 0;
      elements.generateResearch.disabled = false;
      elements.generateResearch.querySelector('.progress-fill').style.width = '0%';
      gameState.resources.research += 1 * gameState.clickMultiplier;
      createResearchParticle(elements.generateResearch);
      checkAchievements();
    }
  }
  
  // Update UI
  updateUI();
}

// Get current cooldown for a resource
function getCurrentCooldown(resourceType) {
  const baseCooldown = gameState.baseCooldowns[resourceType];
  let reduction = 0;
  
  switch(resourceType) {
    case 'energy':
      reduction = gameState.upgrades['solar-panel'].count * 0.2;
      break;
    case 'materials':
      reduction = gameState.upgrades['material-collector'].count * 0.5;
      break;
    case 'research':
      reduction = gameState.upgrades['research-lab'].count * 1;
      break;
  }
  
  // Ensure cooldown doesn't go below 0.5 seconds
  return Math.max(0.5, baseCooldown - reduction);
}

// Handle manual energy generation
function handleEnergyClick() {
  if (energyCooldown > 0) return;
  
  const cooldown = getCurrentCooldown('energy');
  energyCooldown = cooldown;
  elements.generateEnergy.disabled = true;
  elements.generateEnergy.querySelector('.progress-fill').style.width = '0%';
  
  // Play click sound
  elements.clickSound.currentTime = 0;
  elements.clickSound.play().catch(() => {});
  
  // Create particle effect
  createEnergyParticle(elements.generateEnergy);
}

// Handle manual material generation
function handleMaterialsClick() {
  if (materialsCooldown > 0) return;
  
  const cooldown = getCurrentCooldown('materials');
  materialsCooldown = cooldown;
  elements.generateMaterials.disabled = true;
  elements.generateMaterials.querySelector('.progress-fill').style.width = '0%';
  
  // Play click sound
  elements.clickSound.currentTime = 0;
  elements.clickSound.play().catch(() => {});
  
  // Create particle effect
  createMaterialParticle(elements.generateMaterials);
}

// Handle manual research generation
function handleResearchClick() {
  if (researchCooldown > 0) return;
  
  const cooldown = getCurrentCooldown('research');
  researchCooldown = cooldown;
  elements.generateResearch.disabled = true;
  elements.generateResearch.querySelector('.progress-fill').style.width = '0%';
  
  // Play click sound
  elements.clickSound.currentTime = 0;
  elements.clickSound.play().catch(() => {});
  
  // Create particle effect
  createResearchParticle(elements.generateResearch);
}

// Create particle effect for energy clicks
function createEnergyParticle(event) {
  const particle = document.createElement('div');
  particle.classList.add('energy-particle');
  
  // Position at click location or at the station core
  if (event.target === elements.stationCore) {
    const rect = elements.stationCore.getBoundingClientRect();
    particle.style.left = `${rect.left + rect.width/2 + (Math.random() * 40 - 20)}px`;
    particle.style.top = `${rect.top + rect.height/2 + (Math.random() * 40 - 20)}px`;
  } else {
    particle.style.left = `${event.clientX}px`;
    particle.style.top = `${event.clientY}px`;
  }
  
  // Add to DOM
  document.body.appendChild(particle);
  
  // Animate
  const targetElement = elements.energyCount;
  const targetRect = targetElement.getBoundingClientRect();
  
  particle.animate([
    { opacity: 1, transform: 'scale(1)' },
    { opacity: 0.8, transform: 'scale(0.8) translate(0, -10px)' },
    { 
      opacity: 0,
      transform: `scale(0.5) translate(
        ${targetRect.left - parseFloat(particle.style.left)}px, 
        ${targetRect.top - parseFloat(particle.style.top)}px
      )`
    }
  ], {
    duration: 800,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
  }).onfinish = () => particle.remove();
}

// Create particle effect for material clicks
function createMaterialParticle(event) {
  const particle = document.createElement('div');
  particle.classList.add('energy-particle');
  particle.style.backgroundColor = 'var(--space-blue)';
  
  // Position at click location
  particle.style.left = `${event.clientX}px`;
  particle.style.top = `${event.clientY}px`;
  
  // Add to DOM
  document.body.appendChild(particle);
  
  // Animate
  const targetElement = elements.materialsCount;
  const targetRect = targetElement.getBoundingClientRect();
  
  particle.animate([
    { opacity: 1, transform: 'scale(1)' },
    { opacity: 0.8, transform: 'scale(0.8) translate(0, -10px)' },
    { 
      opacity: 0,
      transform: `scale(0.5) translate(
        ${targetRect.left - parseFloat(particle.style.left)}px, 
        ${targetRect.top - parseFloat(particle.style.top)}px
      )`
    }
  ], {
    duration: 800,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
  }).onfinish = () => particle.remove();
}

// Create particle effect for research clicks
function createResearchParticle(event) {
  const particle = document.createElement('div');
  particle.classList.add('energy-particle');
  particle.style.backgroundColor = 'var(--space-purple)';
  
  // Position at click location
  particle.style.left = `${event.clientX}px`;
  particle.style.top = `${event.clientY}px`;
  
  // Add to DOM
  document.body.appendChild(particle);
  
  // Animate
  const targetElement = elements.researchCount;
  const targetRect = targetElement.getBoundingClientRect();
  
  particle.animate([
    { opacity: 1, transform: 'scale(1)' },
    { opacity: 0.8, transform: 'scale(0.8) translate(0, -10px)' },
    { 
      opacity: 0,
      transform: `scale(0.5) translate(
        ${targetRect.left - parseFloat(particle.style.left)}px, 
        ${targetRect.top - parseFloat(particle.style.top)}px
      )`
    }
  ], {
    duration: 800,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
  }).onfinish = () => particle.remove();
}

// Buy an upgrade
function buyUpgrade(upgradeId) {
  const upgrade = gameState.upgrades[upgradeId];
  
  if (!upgrade) return;
  
  const cost = {
    [upgrade.resourceType]: Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, upgrade.count))
  };
  
  const canAfford = gameState.resources[upgrade.resourceType] >= cost[upgrade.resourceType];
  
  if (canAfford) {
    // Deduct cost
    gameState.resources[upgrade.resourceType] -= cost[upgrade.resourceType];
    
    // Add upgrade
    upgrade.count++;
    
    // Play purchase sound
    elements.purchaseSound.currentTime = 0;
    elements.purchaseSound.play().catch(() => {});
    
    // Update UI
    updateUI();
    
    // Show notification
    showNotification(`Purchased ${upgradeId.replace(/-/g, ' ')}!`, 'success');
    
    // Check achievements
    checkAchievements();
  } else {
    showNotification('Not enough resources!', 'warning');
  }
}

// Update the UI
function updateUI() {
  // Update resource counts with formatting
  elements.energyCount.textContent = Math.floor(gameState.resources.energy).toLocaleString();
  elements.materialsCount.textContent = Math.floor(gameState.resources.materials).toLocaleString();
  elements.researchCount.textContent = Math.floor(gameState.resources.research).toLocaleString();
  
  // Update upgrade counts
  elements.solarPanelCount.textContent = gameState.upgrades['solar-panel'].count;
  elements.materialCollectorCount.textContent = gameState.upgrades['material-collector'].count;
  elements.researchLabCount.textContent = gameState.upgrades['research-lab'].count;
  
  // Update upgrade button states
  updateUpgradeButtons();
}

// Show notification function
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.classList.add('notification', type);
  notification.innerHTML = `
    <i class="fa-solid ${type === 'success' ? 'fa-check-circle' : type === 'warning' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
    ${message}
  `;
  
  document.getElementById('notification-area').appendChild(notification);
  
  // Remove notification after 3 seconds
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// Update upgrade buttons (enabled/disabled state based on resource availability)
function updateUpgradeButtons() {
  // Solar Panel
  const solarPanelCost = Math.floor(gameState.upgrades['solar-panel'].baseCost * Math.pow(gameState.upgrades['solar-panel'].costMultiplier, gameState.upgrades['solar-panel'].count));
  const solarPanelButton = document.querySelector('[data-upgrade="solar-panel"]');
  const solarPanelCostElement = solarPanelButton.previousElementSibling.querySelector('span');
  solarPanelCostElement.textContent = `${solarPanelCost} energy`;
  solarPanelButton.disabled = gameState.resources.energy < solarPanelCost;
  
  // Material Collector
  const materialCollectorCost = Math.floor(gameState.upgrades['material-collector'].baseCost * Math.pow(gameState.upgrades['material-collector'].costMultiplier, gameState.upgrades['material-collector'].count));
  const materialCollectorButton = document.querySelector('[data-upgrade="material-collector"]');
  const materialCollectorCostElement = materialCollectorButton.previousElementSibling.querySelector('span');
  materialCollectorCostElement.textContent = `${materialCollectorCost} materials`;
  materialCollectorButton.disabled = gameState.resources.materials < materialCollectorCost;
  
  // Research Lab
  const researchLabCost = Math.floor(gameState.upgrades['research-lab'].baseCost * Math.pow(gameState.upgrades['research-lab'].costMultiplier, gameState.upgrades['research-lab'].count));
  const researchLabButton = document.querySelector('[data-upgrade="research-lab"]');
  const researchLabCostElement = researchLabButton.previousElementSibling.querySelector('span');
  researchLabCostElement.textContent = `${researchLabCost} research`;
  researchLabButton.disabled = gameState.resources.research < researchLabCost;
}

// Initialize achievements
function initAchievements() {
  // Clear existing achievements
  elements.achievementsList.innerHTML = '';
  
  // Create achievement elements
  Object.entries(gameState.achievements).forEach(([achievementId, unlocked]) => {
    const achievementElement = document.createElement('div');
    achievementElement.classList.add('achievement');
    if (unlocked) achievementElement.classList.add('unlocked');
    achievementElement.id = `achievement-${achievementId}`;
    
    achievementElement.innerHTML = `
      <div class="achievement-icon">✓</div>
      <div class="achievement-details">
        <div class="achievement-title">${achievementId.replace(/-/g, ' ').toUpperCase()}</div>
        <div class="achievement-description">${achievementId.replace(/-/g, ' ').toLowerCase()}</div>
      </div>
    `;
    
    elements.achievementsList.appendChild(achievementElement);
  });
}

// Check and update achievements
function checkAchievements() {
  let newAchievements = false;
  
  Object.entries(gameState.achievements).forEach(([achievementId, unlocked]) => {
    if (!unlocked) {
      const achievement = gameState.achievements[achievementId];
      if (achievement.condition()) {
        // Unlock achievement
        gameState.achievements[achievementId] = true;
        newAchievements = true;
        
        // Update UI
        const achievementElement = document.getElementById(`achievement-${achievementId}`);
        if (achievementElement) {
          achievementElement.classList.add('unlocked');
          
          // Animation effect
          achievementElement.animate([
            { transform: 'scale(1)', opacity: 0.5 },
            { transform: 'scale(1.05)', opacity: 1 },
            { transform: 'scale(1)', opacity: 1 }
          ], {
            duration: 500,
            easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
          });
        }
      }
    }
  });
  
  if (newAchievements) {
    saveGame();
  }
}

// Save game to localStorage
function saveGame() {
  const saveData = {
    resources: gameState.resources,
    upgrades: gameState.upgrades,
    achievements: gameState.achievements,
    clickMultiplier: gameState.clickMultiplier,
    timestamp: Date.now()
  };
  
  localStorage.setItem(STORAGE_KEYS.SAVE_DATA, JSON.stringify(saveData));
  gameState.lastSave = Date.now();
}

// Load game from localStorage
function loadGame() {
  const saveData = localStorage.getItem(STORAGE_KEYS.SAVE_DATA);
  
  if (saveData) {
    try {
      const parsedData = JSON.parse(saveData);
      
      // Load saved data with default values if missing
      gameState.resources = {
        energy: Number(parsedData.resources?.energy) || 0,
        materials: Number(parsedData.resources?.materials) || 0,
        research: Number(parsedData.resources?.research) || 0
      };
      
      // Ensure upgrades have all required properties
      gameState.upgrades = {
        'solar-panel': {
          count: Number(parsedData.upgrades?.['solar-panel']?.count) || 0,
          baseCost: 10,
          costMultiplier: 1.15,
          energyPerSecond: Number(parsedData.upgrades?.['solar-panel']?.energyPerSecond) || 1,
          interval: Number(parsedData.upgrades?.['solar-panel']?.interval) || 1,
          resourceType: 'energy'
        },
        'material-collector': {
          count: Number(parsedData.upgrades?.['material-collector']?.count) || 0,
          baseCost: 10,
          costMultiplier: 1.2,
          materialsPerInterval: Number(parsedData.upgrades?.['material-collector']?.materialsPerInterval) || 1,
          interval: Number(parsedData.upgrades?.['material-collector']?.interval) || 5,
          resourceType: 'materials'
        },
        'research-lab': {
          count: Number(parsedData.upgrades?.['research-lab']?.count) || 0,
          baseCost: 10,
          costMultiplier: 1.25,
          researchPerInterval: Number(parsedData.upgrades?.['research-lab']?.researchPerInterval) || 1,
          interval: Number(parsedData.upgrades?.['research-lab']?.interval) || 10,
          resourceType: 'research'
        }
      };
      
      // Ensure achievements are valid
      gameState.achievements = {
        'first-energy': Boolean(parsedData.achievements?.['first-energy']),
        'first-materials': Boolean(parsedData.achievements?.['first-materials']),
        'first-research': Boolean(parsedData.achievements?.['first-research']),
        'energy-master': Boolean(parsedData.achievements?.['energy-master']),
        'material-master': Boolean(parsedData.achievements?.['material-master']),
        'research-master': Boolean(parsedData.achievements?.['research-master']),
        'crew-complete': Boolean(parsedData.achievements?.['crew-complete'])
      };
      
      // Ensure clickMultiplier is a valid number
      gameState.clickMultiplier = Number(parsedData.clickMultiplier) || 1;
      
      // Process offline progress if saved timestamp exists
      if (parsedData.timestamp) {
        const offlineTime = (Date.now() - parsedData.timestamp) / 1000; // in seconds
        if (offlineTime > 0) {
          processOfflineProgress(offlineTime);
        }
      }
    } catch (error) {
      console.error('Error loading save data:', error);
      resetGameState();
    }
  } else {
    // If no save data exists, start fresh
    resetGameState();
  }
}

// Reset game state to initial values
function resetGameState() {
  gameState.resources = {
    energy: 0,
    materials: 0,
    research: 0
  };
  
  gameState.upgrades = {
    'solar-panel': {
      count: 0,
      baseCost: 10,
      costMultiplier: 1.15,
      energyPerSecond: 1,
      interval: 1,
      resourceType: 'energy'
    },
    'material-collector': {
      count: 0,
      baseCost: 10,
      costMultiplier: 1.2,
      materialsPerInterval: 1,
      interval: 5,
      resourceType: 'materials'
    },
    'research-lab': {
      count: 0,
      baseCost: 10,
      costMultiplier: 1.25,
      researchPerInterval: 1,
      interval: 10,
      resourceType: 'research'
    }
  };
  
  gameState.achievements = {
    'first-energy': false,
    'first-materials': false,
    'first-research': false,
    'energy-master': false,
    'material-master': false,
    'research-master': false,
    'crew-complete': false
  };
  
  gameState.clickMultiplier = 1;
}

// Process offline progress
function processOfflineProgress(offlineTime) {
  // Cap offline time at 24 hours (86400 seconds)
  const cappedOfflineTime = Math.min(offlineTime, 86400);
  
  // Calculate resources generated while offline
  const energyGenerated = (gameState.upgrades['solar-panel'].count * 
    (gameState.upgrades['solar-panel'].energyPerSecond || 0) * 
    cappedOfflineTime) || 0;
  
  const materialsGenerated = (gameState.upgrades['material-collector'].count * 
    (gameState.upgrades['material-collector'].materialsPerInterval || 0) * 
    (cappedOfflineTime / (gameState.upgrades['material-collector'].interval || 1))) || 0;
  
  const researchGenerated = (gameState.upgrades['research-lab'].count * 
    (gameState.upgrades['research-lab'].researchPerInterval || 0) * 
    (cappedOfflineTime / (gameState.upgrades['research-lab'].interval || 1))) || 0;
  
  // Add resources
  gameState.resources.energy += energyGenerated;
  gameState.resources.materials += materialsGenerated;
  gameState.resources.research += researchGenerated;
  
  // Show welcome back message
  if (cappedOfflineTime > 60) {
    showNotification(`Welcome back! You were away for ${Math.floor(cappedOfflineTime / 60)} minutes and earned:
      ${Math.floor(energyGenerated)} energy
      ${Math.floor(materialsGenerated)} materials
      ${Math.floor(researchGenerated)} research`, 'success');
  }
}

// Initialize the game when page loads
window.addEventListener('load', initGame);

// Add event listener for page close/refresh
window.addEventListener('beforeunload', saveGame);
