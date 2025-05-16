let likeCounter = 0;
let viewerCounter = 0;
let goalLikes = 10;
let goalJoins = 5;

let gameStarted = false;
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

function getRandomPokemonID(tier) {
  const [min, max] = tierRanges[tier] || [1, 151];
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function formatName(name) {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

async function fetchPokemonData(id) {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
  const data = await res.json();
  return {
    name: formatName(data.name),
    types: data.types.map(t => formatName(t.type.name)),
    image: data.sprites.other["official-artwork"].front_default || data.sprites.front_default
  };
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
  document.getElementById("card-container").innerHTML = "";
  document.getElementById("card-container").appendChild(card);
}

function updateCounters() {
  document.getElementById("like-count").textContent = `Likes: ${likeCounter}`;
  document.getElementById("viewer-count").textContent = `Viewers Joined: ${viewerCounter}`;
}

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
    document.getElementById("connection-status").textContent = `Connected to TikTok as @${username}`;
    document.getElementById("connection-status").style.color = "green";
  } else {
    alert("Please enter your TikTok username to start the game.");
  }
});

document.getElementById("send-gift").addEventListener("click", () => {
  if (!gameStarted) return;
  const username = document.getElementById("username").value.trim() || `viewer${Math.floor(Math.random()*9999)}`;
  const giftId = parseInt(document.getElementById("gift-type").value);
  generateCard(giftId, username);
});

document.getElementById("simulate-like").addEventListener("click", () => {
  if (!gameStarted) return;
  likeCounter++;
  updateCounters();
  if (likeCounter % goalLikes === 0) {
    generateCard(1, `liker${likeCounter}`);
  }
});

document.getElementById("simulate-join").addEventListener("click", () => {
  if (!gameStarted) return;
  viewerCounter++;
  updateCounters();
  if (viewerCounter % goalJoins === 0) {
    generateCard(5, `joiner${viewerCounter}`);
  }
});
