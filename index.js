const express = require("express");
const cors = require("cors");
const socketIO = require("socket.io");
const http = require("http");

const PORT = process.env.PORT | 5000;
const app = express();

app.use(express.json());
app.use(cors());

const server = http.createServer(app);
const io = socketIO(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

io.on("connection", (socket) => {
    console.log(`${socket.id} Has Connected :)`);
    console.log(`Connected Clients: ${io.engine.clientsCount}`);
})

server.listen(PORT, () => console.log(`Server Listening On Port ${PORT}`));