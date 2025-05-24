console.log("Script loaded"); // Verify script is loading

// Test card generation immediately
window.addEventListener('load', function() {
  console.log("DOM loaded");
  // Test if elements exist
  console.log("Start button exists:", !!document.getElementById("start-game"));
  console.log("App container exists:", !!document.getElementById("app"));
  
  // Test card generation
  setTimeout(() => {
    if (gameStarted) return;
    console.log("Testing card generation");
    generateCard(1, "testuser");
  }, 2000);
});

// ===== GAME STATE =====
let likeCounter = 0;
let viewerCounter = 0;
let goalLikes = 10;
let goalJoins = 5;
let gameStarted = false;
let websocket = null;
let cardHistory = [];
const maxCards = 5;

// ===== CONFIGURATION =====
const tiktokUsernames = [
  "gamergirl42", "pokefan99", "streamqueen", 
  "battlemaster", "cardcollector", "livelover", 
  "tiktoktrainer", "pokemonpro", "giftgiver", 
  "viewervibes", "superfan", "ultraplayer",
  "legendaryhunter", "shinylover", "pokedexmaster", 
  "gymleader", "elitefour", "champion", 
  "pokemonwhisperer", "tradingking"
];

// Gift tiers and corresponding Pokémon generations
const giftTiers = {
  1: 1,   // Rose - Gen 1
  5: 1,   // TikTok - Gen 1
  10: 2,  // Diamond - Gen 2
  100: 3, // Galaxy - Gen 3
  1000: 4 // Universe - Gen 4
};

const tierRanges = {
  1: [1, 151],   // Gen 1
  2: [152, 386], // Gen 2
  3: [387, 649], // Gen 3
  4: [650, 1010] // Gen 4+
};

// ===== UTILITY FUNCTIONS =====
function getRandomPokemonID(tier) {
  const [min, max] = tierRanges[tier] || [1, 151];
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function formatName(name) {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function getRandomUsername() {
  return tiktokUsernames[Math.floor(Math.random() * tiktokUsernames.length)] + 
         Math.floor(Math.random() * 100);
}

// ===== POKEMON DATA FETCHING =====
async function fetchPokemonData(id) {
  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    if (!res.ok) throw new Error('Pokemon not found');
    const data = await res.json();
    
    return {
      name: formatName(data.name),
      types: data.types.map(t => formatName(t.type.name)),
      image: data.sprites.other["official-artwork"].front_default || 
             data.sprites.front_default
    };
  } catch (error) {
    console.error("Error fetching Pokemon:", error);
    return {
      name: "Missingno",
      types: ["Normal"],
      image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png"
    };
  }
}

// ===== CARD MANAGEMENT =====
async function generateCard(giftId, username = "Viewer") {
  const tier = giftTiers[giftId] || 1;
  const id = getRandomPokemonID(tier);
  const pokemon = await fetchPokemonData(id);
  
  // Create card element
  const card = document.createElement("div");
  card.className = "pokemon-card card-enter";
  card.innerHTML = `
    <img src="${pokemon.image}" class="pokemon-img" alt="${pokemon.name}" />
    <div class="pokemon-name">${pokemon.name}</div>
    <div class="pokemon-types">
      ${pokemon.types.map(t => `<span class="type" data-type="${t}">${t}</span>`).join('')}
    </div>
    <div class="user-tag">Gifted by @${username}</div>
  `;
  
  // Add to beginning of array
  cardHistory.unshift({ element: card, pokemon });
  
  // Remove oldest card if we exceed max
  if (cardHistory.length > maxCards) {
    const removedCard = cardHistory.pop();
    removedCard.element.classList.add("card-exit");
    setTimeout(() => {
      if (removedCard.element.parentNode) {
        removedCard.element.parentNode.removeChild(removedCard.element);
      }
    }, 600);
  }
  
  // Update positions of all cards
  updateCardPositions();
}

function updateCardPositions() {
  const container = document.getElementById("card-container");
  if (!container) return;
  
  // Remove all cards from DOM
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
  
  // Add cards back with proper positioning classes
  cardHistory.forEach((card, index) => {
    if (index < maxCards) {
      // Remove animation classes if they exist
      card.element.classList.remove("card-enter", "card-exit");
      
      // Add position class
      card.element.className = `pokemon-card card-${index}`;
      
      // Add to DOM
      container.appendChild(card.element);
    }
  });
}

// ===== COUNTER UPDATES =====
function updateCounters() {
  document.getElementById("like-count").textContent = `❤️ Likes: ${likeCounter}`;
  document.getElementById("viewer-count").textContent = `👥 Viewers: ${viewerCounter}`;
}

// ===== EVENT HANDLERS =====
function handleLike(username) {
  likeCounter++;
  updateCounters();
  if (likeCounter % goalLikes === 0) {
    generateCard(1, username || `liker${likeCounter}`);
  }
}

function handleGift(username, giftId) {
  generateCard(giftId, username || `gifter${Math.floor(Math.random()*9999)}`);
}

function handleFollow(username) {
  viewerCounter++;
  updateCounters();
  if (viewerCounter % goalJoins === 0) {
    generateCard(5, username || `follower${viewerCounter}`);
  }
}

function handleJoin(username) {
  viewerCounter++;
  updateCounters();
  if (viewerCounter % goalJoins === 0) {
    generateCard(5, username || `joiner${viewerCounter}`);
  }
}

// ===== UI EVENT LISTENERS =====
document.getElementById("start-game").addEventListener("click", function() {
  const username = document.getElementById("tiktok-username").value.trim();
  const likes = parseInt(document.getElementById("goal-likes").value);
  const joins = parseInt(document.getElementById("goal-joins").value);
  
  if (username) {
    goalLikes = likes || 10;
    goalJoins = joins || 5;
    gameStarted = true;
    document.getElementById("start-panel").style.display = "none";
    document.getElementById("app").style.display = "flex";
    document.body.classList.remove("start-panel-visible");
    connect();
  } else {
    alert("Please enter your TikTok username to start the game.");
  }
});

document.getElementById("send-gift").addEventListener("click", () => {
  if (!gameStarted) return;
  const username = document.getElementById("username").value.trim() || getRandomUsername();
  const giftId = parseInt(document.getElementById("gift-type").value);
  generateCard(giftId, username);
});

document.getElementById("simulate-like").addEventListener("click", () => {
  if (!gameStarted) return;
  handleLike(getRandomUsername());
});

document.getElementById("simulate-join").addEventListener("click", () => {
  if (!gameStarted) return;
  handleJoin(getRandomUsername());
});

// ===== WEBSOCKET CONNECTION =====
function connect() {
  if (websocket) return;

  websocket = new WebSocket("ws://localhost:21213/");

  websocket.onopen = function() {
    document.getElementById("connection-status").textContent = "✅ Connected to TikTok";
    document.getElementById("connection-status").className = "connection-connected";
  };

  websocket.onclose = function() {
    document.getElementById("connection-status").textContent = "⚠️ Disconnected - retrying...";
    document.getElementById("connection-status").className = "connection-error";
    websocket = null;
    setTimeout(connect, 1000);
  };

  websocket.onerror = function() {
    document.getElementById("connection-status").textContent = "⚠️ Connection failed - retrying...";
    document.getElementById("connection-status").className = "connection-error";
    websocket = null;
    setTimeout(connect, 1000);
  };

  websocket.onmessage = function(event) {
    const data = JSON.parse(event.data);
    console.log("TikTok event:", data);
    
    switch(data.event) {
      case 'like':
        handleLike(data.data.uniqueId);
        break;
      case 'gift':
        handleGift(data.data.uniqueId, data.data.giftId);
        break;
      case 'follow':
        handleFollow(data.data.uniqueId);
        break;
      case 'join':
        handleJoin(data.data.uniqueId);
        break;
    }
  };
}

// Initialize
window.addEventListener('load', function() {
  // Preload some data
  console.log("Pokémon Gift Collector initialized");

  document.getElementById("start-panel").style.display = "none";
    document.getElementById("app").style.display = "flex";
    document.body.classList.remove("start-panel-visible");

    try {
      connect();
    } catch (e) {
      console.log("WebSocket not available, using simulator");
    }
});