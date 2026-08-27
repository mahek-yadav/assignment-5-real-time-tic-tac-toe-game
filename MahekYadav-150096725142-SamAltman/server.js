const express = require("express");
const http = require("http");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const { Server } = require("socket.io");

const Game = require("./models/Game");

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const PORT = process.env.PORT || 4000;

let players = [];

let board = [
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    ""
];

let currentTurn = "X";
let gameStarted = false;
let gameOver = false;

const winningCombinations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],

    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],

    [0, 4, 8],
    [2, 4, 6]
];

function checkWinner() {

    for (const combination of winningCombinations) {

        const [a, b, c] = combination;

        if (
            board[a] !== "" &&
            board[a] === board[b] &&
            board[a] === board[c]
        ) {
            return board[a];
        }
    }

    return null;
}

function resetGameState() {

    board = [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        ""
    ];

    currentTurn = "X";
    gameStarted = false;
    gameOver = false;
}

app.get("/api/games", async (req, res) => {

    try {

        const games = await Game.find()
            .sort({ playedAt: -1 });

        res.status(200).json(games);

    } catch (error) {

        console.error("Error fetching game history:", error);

        res.status(500).json({
            message: "Error fetching game history"
        });
    }
});

io.on("connection", (socket) => {

    console.log("User connected:", socket.id);

    socket.on("user-login", (username) => {

        username = username.trim();

        if (!username) {

            socket.emit(
                "login-error",
                "Username cannot be empty."
            );

            return;
        }


        if (username.length < 2) {

            socket.emit(
                "login-error",
                "Username must contain at least 2 characters."
            );

            return;
        }


        if (username.length > 20) {

            socket.emit(
                "login-error",
                "Username must be less than 20 characters."
            );

            return;
        }

        if (players.length >= 2) {

            socket.emit(
                "login-error",
                "Game is full. Only 2 players are allowed."
            );

            return;
        }

        const existingPlayer = players.find(
            player =>
                player.username.toLowerCase() ===
                username.toLowerCase()
        );


        if (existingPlayer) {

            socket.emit(
                "login-error",
                "Username is already taken."
            );

            return;
        }

        const symbol = players.length === 0
            ? "X"
            : "O";


        const player = {

            id: socket.id,

            username: username,

            symbol: symbol
        };


        players.push(player);


        console.log(
            `${username} joined as ${symbol}`
        );

        socket.emit("login-success", {

            username: username,

            symbol: symbol
        });

        io.emit("players-update", players);

        if (players.length === 2) {

            gameStarted = true;

            gameOver = false;

            currentTurn = "X";

            io.emit("game-start", {

                players: players,

                board: board,

                currentTurn: currentTurn
            });


            console.log("Game started!");
        }
    });


    socket.on("make-move", (data) => {

        if (!data) {
            return;
        }


        const index = Number(data.index);

        const symbol = data.symbol;


        if (!gameStarted || gameOver) {

            socket.emit(
                "login-error",
                "The game is not currently active."
            );

            return;
        }


        const player = players.find(
            player => player.id === socket.id
        );


        if (!player) {

            socket.emit(
                "login-error",
                "You are not part of this game."
            );

            return;
        }


        if (player.symbol !== symbol) {

            socket.emit(
                "login-error",
                "Invalid player symbol."
            );

            return;
        }


        if (symbol !== currentTurn) {

            socket.emit(
                "login-error",
                "It is not your turn."
            );

            return;
        }


        if (
            !Number.isInteger(index) ||
            index < 0 ||
            index > 8
        ) {

            return;
        }

        if (board[index] !== "") {

            socket.emit(
                "login-error",
                "That position is already occupied."
            );

            return;
        }


        board[index] = symbol;


        console.log(
            `${player.username} (${symbol}) played at ${index}`
        );


        const winner = checkWinner();


        if (winner) {

            io.emit("move-made", {

                index: index,

                symbol: symbol,

                board: board,

                currentTurn: currentTurn
            });


            awaitGameOver(winner);

            return;
        }


        if (!board.includes("")) {

            io.emit("move-made", {

                index: index,

                symbol: symbol,

                board: board,

                currentTurn: currentTurn
            });


            awaitGameOver("Draw");

            return;
        }


        currentTurn =
            currentTurn === "X"
                ? "O"
                : "X";


        io.emit("move-made", {

            index: index,

            symbol: symbol,

            board: board,

            currentTurn: currentTurn
        });
    });


    socket.on("reset-game", () => {

        console.log(
            "Reset requested by:",
            socket.id
        );


        resetGameState();

        io.emit("game-reset", {

            board: board,

            currentTurn: currentTurn
        });


        io.emit("players-update", players);


        if (players.length === 2) {

            gameStarted = true;

            io.emit("game-start", {

                players: players,

                board: board,

                currentTurn: currentTurn
            });
        }
    });

    socket.on("disconnect", () => {

        console.log(
            "User disconnected:",
            socket.id
        );


        const disconnectedPlayer =
            players.find(
                player => player.id === socket.id
            );


        players = players.filter(
            player => player.id !== socket.id
        );


        resetGameState();


        io.emit(
            "players-update",
            players
        );


        io.emit("game-reset", {

            board: board,

            currentTurn: currentTurn
        });


        if (disconnectedPlayer) {

            console.log(
                `${disconnectedPlayer.username} left the game.`
            );
        }
    });
});


async function awaitGameOver(result) {

    gameOver = true;

    gameStarted = false;


    const playerX =
        players.find(
            player => player.symbol === "X"
        );


    const playerO =
        players.find(
            player => player.symbol === "O"
        );


    let winnerName = "Draw";


    if (result !== "Draw") {

        const winner =
            players.find(
                player => player.symbol === result
            );


        if (winner) {

            winnerName = winner.username;
        }
    }

    const totalMoves =
        board.filter(
            cell => cell !== ""
        ).length;


    try {

        const game = new Game({

            playerX:
                playerX
                    ? playerX.username
                    : "Unknown",

            playerO:
                playerO
                    ? playerO.username
                    : "Unknown",

            winner: winnerName,

            totalMoves: totalMoves
        });


        await game.save();


        console.log(
            "Game history saved to MongoDB."
        );

    } catch (error) {

        console.error(
            "Error saving game:",
            error
        );
    }


    io.emit("game-over", {

        winner: winnerName,

        symbol: result,

        board: board,

        totalMoves: totalMoves
    });



    setTimeout(() => {

        players = [];

        resetGameState();


        io.emit("game-reset", {

            board: board,

            currentTurn: currentTurn,

            requireLogin: true
        });


        io.emit(
            "players-update",
            players
        );


        console.log(
            "Game automatically reset."
        );

    }, 5000);
}

mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {

        console.log(
            "MongoDB connected successfully"
        );


        server.listen(PORT, () => {

            console.log(
                `Server running on http://localhost:${PORT}`
            );
        });

    })
    .catch((error) => {

        console.error(
            "MongoDB connection failed:",
            error
        );
    });
