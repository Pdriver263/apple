const WebSocket = require('ws');
const jwt = require('jsonwebtoken');

const setupWebSocket = (server) => {
  const wss = new WebSocket.Server({ server });

  wss.on('connection', (ws, req) => {
    // অথেন্টিকেশন
    const token = req.url.split('token=')[1];
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      ws.userId = decoded.user.id;
      
      ws.on('message', (message) => {
        console.log(`Received: ${message}`);
      });

      ws.send(JSON.stringify({ type: 'connection', message: 'Connected successfully' }));
    } catch (err) {
      ws.close(1008, 'Unauthorized');
    }
  });

  return wss;
};

// রিয়েল-টাইম নোটিফিকেশন পাঠানোর ফাংশন
const sendNotification = (wss, userId, notification) => {
  wss.clients.forEach((client) => {
    if (client.userId === userId && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(notification));
    }
  });
};

module.exports = { setupWebSocket, sendNotification };