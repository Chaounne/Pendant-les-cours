const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Serve static files from the 'front-end' directory
app.use(express.static(path.join(__dirname, 'front-end')));

// Define a route to handle the initial HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/front-end/index.html'));
});

// Handle incoming WebSocket connections
io.on('connection', (socket) => {
  console.log('A user connected');

  // Handle incoming messages from clients
  socket.on('message', (data) => {
    console.log('Message from client:', data);

    // Broadcast the message to all connected clients
    io.emit('message', data);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Start the server on port 3000
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
