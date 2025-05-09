const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(express.static(path.join(__dirname, 'public')));

const users = {};

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('join', (username) => {
        users[socket.id] = username;
        socket.broadcast.emit('user-connected', socket.id);
        console.log(`${username} joined with ID: ${socket.id}`);
    });

    socket.on('signal', ({ to, from, signal }) => {
        io.to(to).emit('signal', { from, signal });
    });

    socket.on('disconnect', () => {
        const username = users[socket.id] || socket.id;
        console.log(`${username} disconnected`);
        delete users[socket.id];
        socket.broadcast.emit('user-disconnected', socket.id);
    });
});

const PORT = process.env.PORT || 5872;
server.listen(PORT, () => {
    console.log(`Server running on port http://localhost:${PORT}`);
});