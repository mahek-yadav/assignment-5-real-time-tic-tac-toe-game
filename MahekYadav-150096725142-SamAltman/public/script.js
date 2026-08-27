const socket = io();

let myUsername = "";
let mySymbol = "";

let currentTurn = "X";

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

const loginSection =
    document.getElementById("loginSection");

const gameSection =
    document.getElementById("gameSection");

const loginForm =
    document.getElementById("loginForm");

const usernameInput =
    document.getElementById("username");

const loginMessage =
    document.getElementById("loginMessage");

const connectionDot =
    document.getElementById("connectionDot");

const connectionText =
    document.getElementById("connectionText");

const playersCount =
    document.getElementById("playersCount");

const playerXName =
    document.getElementById("playerXName");

const playerOName =
    document.getElementById("playerOName");

const turnMessage =
    document.getElementById("turnMessage");

const resetButton =
    document.getElementById("resetButton");

const winnerModal =
    document.getElementById("winnerModal");

const winnerTitle =
    document.getElementById("winnerTitle");

const winnerText =
    document.getElementById("winnerText");

const winnerIcon =
    document.getElementById("winnerIcon");

const closeModal =
    document.getElementById("closeModal");

const historyContainer =
    document.getElementById("historyContainer");

const refreshHistory =
    document.getElementById("refreshHistory");

const cells =
    document.querySelectorAll(".cell");


socket.on("connect", () => {

    connectionDot.classList.remove("offline");

    connectionDot.classList.add("online");

    connectionText.textContent =
        "Connected";

});


socket.on("disconnect", () => {

    connectionDot.classList.remove("online");

    connectionDot.classList.add("offline");

    connectionText.textContent =
        "Disconnected";

});


loginForm.addEventListener(
    "submit",
    (event) => {

        event.preventDefault();

        const username =
            usernameInput.value.trim();


        if (!username) {

            showLoginMessage(
                "Please enter a username."
            );

            return;
        }


        socket.emit(
            "user-login",
            username
        );
    }
);


socket.on(
    "login-success",
    (data) => {

        myUsername = data.username;

        mySymbol = data.symbol;


        loginMessage.textContent = "";


        loginSection.classList.add(
            "hidden"
        );


        gameSection.classList.remove(
            "hidden"
        );


        updateTurnMessage();


        console.log(
            `Logged in as ${mySymbol}`
        );
    }
);


socket.on(
    "login-error",
    (message) => {

        showLoginMessage(message);

    }
);


function showLoginMessage(message) {

    loginMessage.textContent =
        message;
}


socket.on(
    "players-update",
    (updatedPlayers) => {

        players = updatedPlayers;

        updatePlayersUI();

    }
);


function updatePlayersUI() {

    playersCount.textContent =
        players.length;


    const playerX =
        players.find(
            player => player.symbol === "X"
        );


    const playerO =
        players.find(
            player => player.symbol === "O"
        );


    playerXName.textContent =
        playerX
            ? playerX.username
            : "Waiting...";


    playerOName.textContent =
        playerO
            ? playerO.username
            : "Waiting...";
}


socket.on(
    "game-start",
    (data) => {

        board = data.board;

        currentTurn =
            data.currentTurn;


        players =
            data.players;


        updatePlayersUI();

        updateBoard();

        updateTurnMessage();

    }
);


cells.forEach(cell => {

    cell.addEventListener(
        "click",
        () => {

            const index =
                Number(
                    cell.dataset.index
                );

            if (!mySymbol) {

                showLoginMessage(
                    "Please login first."
                );

                return;
            }


            if (
                mySymbol !== currentTurn
            ) {

                turnMessage.textContent =
                    "⏳ Wait for your turn!";

                return;
            }


            if (board[index] !== "") {

                return;
            }


            socket.emit(
                "make-move",
                {
                    index: index,
                    symbol: mySymbol
                }
            );

        }
    );
});


socket.on(
    "move-made",
    (data) => {

        board = data.board;

        currentTurn =
            data.currentTurn;


        updateBoard();

        updateTurnMessage();

    }
);


function updateBoard() {

    cells.forEach(
        (cell, index) => {

            cell.textContent =
                board[index];


            cell.classList.remove(
                "x",
                "o"
            );


            if (board[index] === "X") {

                cell.classList.add("x");

            }


            if (board[index] === "O") {

                cell.classList.add("o");

            }
        }
    );
}

function updateTurnMessage() {

    if (players.length < 2) {

        turnMessage.textContent =
            "Waiting for another player...";

        return;
    }


    if (currentTurn === mySymbol) {

        turnMessage.textContent =
            "🎯 Your turn!";

    } else {

        turnMessage.textContent =
            `⏳ ${currentTurn}'s turn`;
    }
}


socket.on(
    "game-over",
    (data) => {

        board = data.board;

        updateBoard();


        if (data.symbol === "Draw") {

            winnerIcon.textContent =
                "🤝";

            winnerTitle.textContent =
                "It's a Draw!";

            winnerText.textContent =
                "Great game! Nobody won.";

        } else {

            winnerIcon.textContent =
                "🏆";

            winnerTitle.textContent =
                "Game Over!";

            winnerText.textContent =
                `${data.winner} wins!`;

        }


        winnerModal.classList.remove(
            "hidden"
        );

        highlightWinningCells();


        setTimeout(
            loadGameHistory,
            1000
        );
    }
);

function highlightWinningCells() {

    const combinations = [

        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],

        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],

        [0, 4, 8],
        [2, 4, 6]

    ];


    for (
        const combination
        of combinations
    ) {

        const [a, b, c] =
            combination;


        if (
            board[a] &&
            board[a] === board[b] &&
            board[a] === board[c]
        ) {

            cells[a].classList.add(
                "winner"
            );

            cells[b].classList.add(
                "winner"
            );

            cells[c].classList.add(
                "winner"
            );

            break;
        }
    }
}


resetButton.addEventListener(
    "click",
    () => {

        socket.emit(
            "reset-game"
        );

    }
);


socket.on(
    "game-reset",
    (data) => {

        board = data.board;

        currentTurn =
            data.currentTurn;


        updateBoard();

        updateTurnMessage();


        cells.forEach(
            cell => {
                cell.classList.remove(
                    "winner"
                );
            }
        );


        winnerModal.classList.add(
            "hidden"
        );

        if (data.requireLogin) {

            myUsername = "";

            mySymbol = "";

            usernameInput.value = "";


            gameSection.classList.add(
                "hidden"
            );


            loginSection.classList.remove(
                "hidden"
            );


            loginMessage.textContent =
                "Game reset. Please login again.";

        }
    }
);


closeModal.addEventListener(
    "click",
    () => {

        winnerModal.classList.add(
            "hidden"
        );

    }
);

async function loadGameHistory() {

    try {

        const response =
            await fetch("/api/games");


        if (!response.ok) {

            throw new Error(
                "Failed to load history"
            );
        }


        const games =
            await response.json();


        displayGameHistory(games);

    } catch (error) {

        console.error(
            "History error:",
            error
        );


        historyContainer.innerHTML =
            `<p class="no-history">
                Unable to load game history.
            </p>`;
    }
}


function displayGameHistory(games) {

    if (!games.length) {

        historyContainer.innerHTML =
            `<p class="no-history">
                No games played yet.
            </p>`;

        return;
    }


    let html = `

        <table class="history-table">

            <thead>

                <tr>

                    <th>Player X</th>

                    <th>Player O</th>

                    <th>Winner</th>

                    <th>Moves</th>

                    <th>Date & Time</th>

                </tr>

            </thead>

            <tbody>
    `;


    games.forEach(game => {

        const date =
            new Date(
                game.playedAt
            );


        html += `

            <tr>

                <td>
                    ${escapeHTML(game.playerX)}
                </td>

                <td>
                    ${escapeHTML(game.playerO)}
                </td>

                <td class="winner">
                    ${escapeHTML(game.winner)}
                </td>

                <td>
                    ${game.totalMoves}
                </td>

                <td>
                    ${date.toLocaleString()}
                </td>

            </tr>

        `;
    });


    html += `

            </tbody>

        </table>

    `;


    historyContainer.innerHTML =
        html;
}


function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value;

    return div.innerHTML;
}


refreshHistory.addEventListener(
    "click",
    loadGameHistory
);


loadGameHistory();
