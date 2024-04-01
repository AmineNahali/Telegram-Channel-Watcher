const { TelegramClient } = require("telegram");
const { NewMessage } = require("telegram/events");
const { StringSession } = require("telegram/sessions");
const WebSocket = require('ws');
const input = require("input");

const apiId = 'YOUR_API_ID';
const apiHash = 'YOUR_API_HASH';
let stringSession = new StringSession("YOUR_STRING_SESSION");

// WebSocket server setup
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', ws => {
 console.log('Client connected');
 ws.on('close', () => console.log('Client disconnected'));
});

(async () => {
 const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
 });

 await client.start({
    phoneNumber: async() => await input.text("Please enter your number: "),
    password: async() => await input.text("Please enter your password: "),
    phoneCode: async() => await input.text("Please enter the code you received: "),
    onError: (err) => console.log(err),
 });

 console.log("You should now be connected.");

 const session = client.session.save();
 stringSession = new StringSession(session);

 // Replace CHANNEL_ID with the actual ID of the channel you want to listen to
 const CHANNEL_ID = 1234567890;

 async function handler(event) {
    console.log("[newmessage]", event);
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(event.message));
      }
    });
 }

 // Listen to new messages only from the specified channel
 client.addEventHandler(handler, new NewMessage({ chats: [CHANNEL_ID] }));
})();
