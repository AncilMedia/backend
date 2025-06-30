const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const connectedClients = new Set();

io.on('connection', (socket) => {
  console.log(`🟢 Client connected: ${socket.id}`);

  socket.on('register_admin', () => {
    connectedClients.add(socket.id);
    console.log(`✅ Admin registered: ${socket.id}`);
  });

  socket.on('disconnect', () => {
    connectedClients.delete(socket.id);
    console.log(`🔴 Client disconnected: ${socket.id}`);
  });
});

// Health check route
app.get('/status', (req, res) => {
  res.json({
    status: 'ok',
    connectedClients: connectedClients.size,
    totalClients: io.engine.clientsCount
  });
});

// Emit event externally (e.g., from Vercel API)
app.post('/emit', (req, res) => {
  try {
    const { event, data } = req.body;
    if (!event || typeof event !== 'string') {
      return res.status(400).json({ error: 'Invalid event' });
    }

    io.emit(event, data);
    console.log(`📢 Emitted event "${event}" to all clients.`);
    res.json({ message: 'Event emitted' });
  } catch (err) {
    console.error('Emit error:', err.message);
    res.status(500).json({ error: 'Emit failed' });
  }
});

// Optional: 404 fallback
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Socket.IO server running on port ${PORT}`);
});
