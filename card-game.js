let likeCounter = 0;
let viewerCounter = 0;
let goalLikes = 10;
let goalJoins = 5;
let gameStarted = false;
let websocket = null;

const giftTiers = {
  1: 1,
  5: 1,
  10: 2,
  100: 3,
  1000: 4
};

const tierRanges = {
  1: [1, 151],
  2: [152, 386],
  3: [387, 649],
  4: [650, 1010]
};

// Connect to WebSocket server
function connect() {
    if (websocket) return; // Already connected

    websocket = new WebSocket("ws://localhost:21213/");

    websocket.onopen = function() {
        document.getElementById("connection-status").textContent = "Connected to TikTok";
        document.getElementById("connection-status").style.color = "green";
    };

    websocket.onclose = function() {
        document.getElementById("connection-status").textContent = "Disconnected - retrying...";
        document.getElementById("connection-status").style.color = "red";
        websocket = null;
        setTimeout(connect, 1000);
    };

    websocket.onerror = function() {
        document.getElementById("connection-status").textContent = "Connection failed - retrying...";
        document.getElementById("connection-status").style.color = "red";
        websocket = null;
        setTimeout(connect, 1000);
    };

    websocket.onmessage = function(event) {
        const data = JSON.parse(event.data);
        console.log("TikTok event:", data);
        
        // Handle different TikTok events
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

function getRandomPokemonID(tier) {
  const [min, max] = tierRanges[tier] || [1, 151];
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function formatName(name) {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

async function fetchPokemonData(id) {
  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    if (!res.ok) throw new Error('Pokemon not found');
    const data = await res.json();
    return {
      name: formatName(data.name),
      types: data.types.map(t => formatName(t.type.name)),
      image: data.sprites.other["official-artwork"].front_default || data.sprites.front_default
    };
  } catch (error) {
    console.error("Error fetching Pokemon:", error);
    // Return a default Pokemon if there's an error
    return {
      name: "Missingno",
      types: ["Normal"],
      image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png"
    };
  }
}

async function generateCard(giftId, username = "Viewer") {
  const tier = giftTiers[giftId] || 1;
  const id = getRandomPokemonID(tier);
  const pokemon = await fetchPokemonData(id);
  
  const card = document.createElement("div");
  card.className = "pokemon-card";
  card.innerHTML = `
    <img src="${pokemon.image}" class="pokemon-img" alt="${pokemon.name}" />
    <div class="pokemon-name">${pokemon.name}</div>
    <div class="pokemon-types">
      ${pokemon.types.map(t => `<span class="type">${t}</span>`).join('')}
    </div>
    <div class="user-tag">@${username}</div>
  `;
  
  const container = document.getElementById("card-container");
  container.innerHTML = "";
  container.appendChild(card);
}

function updateCounters() {
  document.getElementById("like-count").textContent = `Likes: ${likeCounter}`;
  document.getElementById("viewer-count").textContent = `Viewers Joined: ${viewerCounter}`;
}

// Event handlers for TikTok events
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

// Start game function
document.getElementById("start-game").addEventListener("click", () => {
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
        connect(); // Start WebSocket connection
    } else {
        alert("Please enter your TikTok username to start the game.");
    }
});

// Simulation buttons
document.getElementById("send-gift").addEventListener("click", () => {
    if (!gameStarted) return;
    const username = document.getElementById("username").value.trim() || `viewer${Math.floor(Math.random()*9999)}`;
    const giftId = parseInt(document.getElementById("gift-type").value);
    generateCard(giftId, username);
});

document.getElementById("simulate-like").addEventListener("click", () => {
    if (!gameStarted) return;
    handleLike(`simulated_user${likeCounter+1}`);
});

document.getElementById("simulate-join").addEventListener("click", () => {
    if (!gameStarted) return;
    handleJoin(`simulated_user${viewerCounter+1}`);
});

// Initialize
window.addEventListener('load', function() {
    // Don't auto-connect - wait for start game button
});
