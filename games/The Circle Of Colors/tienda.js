const colors = ["#065c05", "#732415", "#a67117", "#191775"];
let currentColorIndex = 0;
setInterval(() => {
  document.body.style.backgroundColor = colors[currentColorIndex];
  currentColorIndex = (currentColorIndex + 1) % colors.length;
}, 5000);

let circulomonedasCount = parseInt(localStorage.getItem("circulomonedas")) || 0;
document.getElementById("victoryCount").innerText = circulomonedasCount;

function loadSkins() {
  let unlockedSkins = JSON.parse(localStorage.getItem("circuloskins"));
  
  if (!unlockedSkins) {
    unlockedSkins = ["Inicial"];
    localStorage.setItem("circuloskins", JSON.stringify(unlockedSkins));
  }
  
  if (!unlockedSkins.includes("Inicial")) {
    unlockedSkins.push("Inicial");
    localStorage.setItem("circuloskins", JSON.stringify(unlockedSkins));
  }

  let selectedSkin = localStorage.getItem("circuloskinselected") || "Inicial";

  document.querySelectorAll('.skin').forEach(skin => {
    const skinId = skin.getAttribute('data-skin');
    
    if (unlockedSkins.includes(skinId)) {
      if (skinId === selectedSkin) {
        skin.style.borderColor = 'green';
      } else {
        skin.style.borderColor = 'yellow';
      }
    } else {
      skin.style.borderColor = 'red';
    }

    skin.addEventListener('click', () => {
      if (unlockedSkins.includes(skinId)) {
        selectSkin(skinId);
      } else {
        unlockSkin(skinId);
      }
    });
  });
}

function selectSkin(skinId) {
  localStorage.setItem("circuloskinselected", skinId);
  loadSkins();
}

function unlockSkin(skinId) {
  let unlockedSkins = JSON.parse(localStorage.getItem("circuloskins")) || ["Inicial"];
  
  const skinPrices = {
    "Agua": { price: 150, name: getSkinName("Agua") },
    "Lava": { price: 300, name: getSkinName("Lava") },
    "Luna": { price: 450, name: getSkinName("Luna") },
    "Sonrisa": { price: 600, name: getSkinName("Sonrisa") },
    "Halloween": { price: 750, name: getSkinName("Halloween") },
    "Diablo": { price: 900, name: getSkinName("Diablo") },
    "Anonymous": { price: 1050, name: getSkinName("Anonymous") },
    "Skater": { price: 1200, name: getSkinName("Skater") },
    "Spiderman": { price: 1350, name: getSkinName("Spiderman") },
    "RayoMcQueen": { price: 1500, name: getSkinName("RayoMcQueen") },
  };
  
  let skinPrice = skinPrices[skinId]?.price || 100000;
  let skinName = skinPrices[skinId]?.name || getSkinName("desconocida");

  if (unlockedSkins.includes(skinId)) return;

  if (circulomonedasCount >= skinPrice) {
    showConfirmation(getMessage("confirmPurchase", skinName, skinPrice), () => {
      circulomonedasCount -= skinPrice;
      localStorage.setItem("circulomonedas", circulomonedasCount); 
      unlockedSkins.push(skinId);
      localStorage.setItem("circuloskins", JSON.stringify(unlockedSkins)); 
      loadSkins();
      document.getElementById("victoryCount").innerText = circulomonedasCount;
    });
  } else {
    showConfirmation(getMessage("insufficientBalance", skinName, skinPrice, circulomonedasCount), () => {
      closeConfirmation();
    }, true);
  }
}

function getMessage(type, skinName, skinPrice, balance) {
  const language = localStorage.getItem('circuloidioma') || 'spanish';

  const messages = {
    spanish: {
      confirmPurchase: `¿Quieres comprar ${skinName}?\nPrecio: $${skinPrice}`,
      insufficientBalance: `Saldo insuficiente.\n${skinName}\nPrecio: $${skinPrice}\nTienes: $${balance}`,
      accept: "Aceptar",
      confirm: "Confirmar compra",
    },
    english: {
      confirmPurchase: `Do you want to buy ${skinName}?\nPrice: $${skinPrice}`,
      insufficientBalance: `Insufficient balance.\n${skinName}\nPrice: $${skinPrice}\nYou have: $${balance}`,
      accept: "Accept",
      confirm: "Confirm purchase",
    }
  };

  return messages[language][type];
}

function getSkinName(skinId) {
  const language = localStorage.getItem('circuloidioma') || 'spanish';

  const skinNames = {
    spanish: {
      "Agua": "Skin Agua",
      "Lava": "Skin Lava",
      "Luna": "Skin Luna",
      "Sonrisa": "Skin Sonrisa",
      "Halloween": "Skin Halloween",
      "Diablo": "Skin Diablo",
      "Anonymous": "Skin Anonymous",
      "Skater": "Skin Skater",
      "Spiderman": "Skin Spiderman",
      "RayoMcQueen": "Skin Rayo McQueen",
      "desconocida": "Skin desconocida"
    },
    english: {
      "Agua": "Water Skin",
      "Lava": "Lava Skin",
      "Luna": "Moon Skin",
      "Sonrisa": "Smile Skin",
      "Halloween": "Halloween Skin",
      "Diablo": "Devil Skin",
      "Anonymous": "Anonymous Skin",
      "Skater": "Skater Skin",
      "Spiderman": "Spiderman Skin",
      "RayoMcQueen": "Lightning McQueen Skin",
      "desconocida": "Unknown Skin"
    }
  };

  return skinNames[language][skinId] || skinNames[language]["desconocida"];
}

function showConfirmation(message, onConfirm, isNotEnoughBalance = false) {
  document.getElementById("overlay").style.display = "flex";
  document.getElementById("confirmationText").innerText = message;

  if (isNotEnoughBalance) {
    document.getElementById("confirmButton").innerText = getMessage("accept");
    document.getElementById("cancelButton").style.display = "none";
  } else {
    document.getElementById("confirmButton").innerText = getMessage("confirm");
    document.getElementById("cancelButton").style.display = "inline-block";
  }

  document.getElementById("confirmButton").onclick = function() {
    onConfirm();
    closeConfirmation();
  };

  document.getElementById("cancelButton").onclick = closeConfirmation;
}

function closeConfirmation() {
  document.getElementById("overlay").style.display = "none";
}

loadSkins();
