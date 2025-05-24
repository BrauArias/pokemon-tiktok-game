const { WebcastPushConnection } = require('tiktok-live-connector');
const WebSocket = require('ws');

// TikTok Live Connection
// ¡IMPORTANTE! Reemplaza "braxargg" con tu propio nombre de usuario de TikTok
const tiktokUsername = "braxargg"; 
const tiktokConnection = new WebcastPushConnection(tiktokUsername);

// WebSocket Server
const wss = new WebSocket.Server({ port: 21213 }); // Puerto donde el frontend se conectará

// Handle TikTok events
async function startTikTokConnection() {
    try {
        await tiktokConnection.connect();
        console.log("Connected to TikTok LIVE");

        // Listener para regalos de TikTok
        tiktokConnection.on('gift', data => {
            console.log(`${data.uniqueId} sent gift ${data.giftId} (${data.giftName})`);
            
            // Broadcast to all connected clients
            broadcastToClients({
                event: 'gift',
                data: {
                    uniqueId: data.uniqueId,
                    giftId: data.giftId,
                    giftName: data.giftName, // TikTok-live-connector ya proporciona giftName
                    timestamp: Date.now()
                }
            });
        });

        // Opcional: Listener para nuevos espectadores (si quieres rastrearlos)
        tiktokConnection.on('viewerCountUpdate', (data) => {
            console.log(`New viewer count: ${data.viewerCount}`);
            broadcastToClients({
                event: 'viewerCount',
                data: {
                    viewerCount: data.viewerCount,
                    timestamp: Date.now()
                }
            });
        });

        tiktokConnection.on('error', (err) => {
            console.error('TikTok Connection Error:', err);
        });

        tiktokConnection.on('disconnected', () => {
            console.log('TikTok LIVE disconnected.');
            // Aquí podrías intentar reconectar si lo deseas
        });


    } catch (err) {
        console.error("Error connecting to TikTok:", err.message);
        console.error("Please ensure the TikTok username is correct and the account is LIVE.");
    }
}

// Broadcast to all WebSocket clients
function broadcastToClients(message) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message));
        }
    });
}

// Inicia la conexión con TikTok
startTikTokConnection();

console.log('WebSocket server started on port 21213');
console.log(`Attempting to connect to TikTok user: ${tiktokUsername}`);