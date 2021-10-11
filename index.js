// Importing all dependicies
const express = require("express");
const cors = require("cors");
const socketIO = require("socket.io");
const http = require("http");

// Defines PORT for which the server listens
// Is either 5000 or specified port by hosting provider
const PORT = process.env.PORT | 5000;
// Initialises express app
const app = express();

// Global variables
let rooms = {
    placeholder: {} // Placeholder
}
let codes = [] // Holds all codes in use
let queue = [] // Holds all player sockets queueing for game PLACEHOLDER

// Specifiying middleware to use JSON makes all incoming msg's json
// cors allows me to host the frontend on a different server
app.use(express.json());
app.use(cors());

// Placeholder Room Function 
// - Generates Unique Code
// - Create Basic Room With code and players empty attributes
// - Return the code
function CreateRoom_PLACEHOLDER_() {
    let code = GenerateRandomCode();
    while (codes.includes(code)) {
        code = GenerateRandomCode();
    }

    rooms.placeholder[code] = {
        code: code,
        players: []
    }

    return code;
}

// Generates A Random Code
// - Change codeLength for longer or shorter codes
// - Selects random character from string and repeats for how long the codelength is
// - Returns the code
function GenerateRandomCode() {
    let characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let codeLength = 5;
    let code = "";
    for (let i = 0; i<codeLength; i++) {
        code += characters.charAt(Math.floor(Math.random()*characters.length))
    }
    return code;
}

// Join Room Function
// - Check if theres room for the player
// - 

function JoinRoom(code, game, playerSocket) {
    let idx = 2;
    if (rooms[game][code].players[0] === undefined) {
        idx = 0;
    }
    else if (rooms[game][code].players[1] === undefined) {
        idx = 1;
    }
    else return false;

    playerSocket.join(code);

    rooms[game][code].players[idx] = {
        id: playerSocket.id
    }

    return true;
} 

function UpdateQueue() {
    let pairs = Math.floor(queue.length/2);
    for (let i = 0; i<pairs; i++) {
        let code = CreateRoom_PLACEHOLDER_();
        JoinRoom(code, "placeholder", queue[i*2])
        JoinRoom(code, "placeholder", queue[i*2+1])
        sendRoomInfo(code, "placeholder");
    }
}

function GetGameFromCode(code) {
    for (let game in rooms) {
        for (let room in rooms[game]) {
            if (rooms[game][room].code === code) {
                return game;
            }
        }
    }
    return false;
}

function sendRoomInfo(code, game) {
    io.to(code).emit("roomInfo", rooms[game][code]);
}

// Create http server for socket.io
const server = http.createServer(app);
// Initalise socket with server passed, the extra statement is for cors as well
const io = socketIO(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

// When a client connections to the server this runs
io.on("connection", (socket) => {
    console.log(`${socket.id} Has Connected :)`);
    console.log(`Connected Clients: ${io.engine.clientsCount}`);
    socket.emit("testserver");
    socket.on("joinRandom", () => {
        queue.push(socket)
        UpdateQueue();
    })

    socket.on("joinLink", (code) => {
        let game = GetGameFromCode(code);
        if (game === false) {
            socket.emit("failedJoin");
        }
        else {
            JoinRoom(code, game, socket);
            sendRoomInfo(code, game);
        }
    })

    socket.on("createPrivate", () => {
        let code = CreateRoom_PLACEHOLDER_();
        JoinRoom(code, "placeholder", socket);
        console.log(code);
        socket.emit("privateLobby", code);
    })
    socket.on("test", () => {
        console.log("test");
    })
})

server.listen(PORT, () => console.log(`Server Listening On Port ${PORT}`));