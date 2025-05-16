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
    // You might want to handle follows differently
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

// Rest of your existing functions (getRandomPokemonID, formatName, fetchPokemonData, generateCard, updateCounters)
// ... keep all these functions exactly as they were ...

// Modified start game function
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
        connect(); // Start WebSocket connection
    } else {
        alert("Please enter your TikTok username to start the game.");
    }
});

// Keep your existing simulation buttons
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

// Initialize connection when page loads
window.addEventListener('load', function() {
    // Don't auto-connect - wait for start game button
});
