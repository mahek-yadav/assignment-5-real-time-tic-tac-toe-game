# 🎮 Real-Time Multiplayer Tic Tac Toe

A real-time multiplayer Tic Tac Toe game built using **Node.js, Express.js, Socket.io, MongoDB, Mongoose, HTML, CSS, and JavaScript**.

Players can join the game using a username, get automatically assigned **X or O**, play against another connected player in real time, and have completed games saved in MongoDB as game history.

## 🔗 Live Demo

Live Application: https://tic-tac-toe-gm7d.onrender.com


## 📌 Features

* 👤 Username-based player login
* ❌ First player automatically gets **X**
* ⭕ Second player automatically gets **O**
* 👥 Maximum **2 players** per game
* 🎯 Real-time multiplayer gameplay using Socket.io
* 🔄 Instant synchronization of moves
* 🏆 Automatic winner detection
* 🤝 Draw detection
* ✨ Winner announcement with animation
* 💾 Game history stored in MongoDB
* 📊 Game history displayed on the frontend
* 🔢 Total moves recorded for each game
* 🔌 Connection status indicator
* 👥 Active player count
* 🔄 Game reset functionality
* 🚪 Graceful player disconnection handling
* 📱 Responsive user interface

## 🛠️ Technologies Used

### Backend

* Node.js
* Express.js
* Socket.io
* Mongoose
* MongoDB
* CORS
* dotenv

### Frontend

* HTML5
* CSS3
* JavaScript

### Database

* MongoDB Atlas
* Mongoose ODM

### Deployment

* Render

## 📁 Project Structure

```text
tic-tac-toe/
│
├── server.js
├── package.json
├── package-lock.json
├── .env
├── .gitignore
├── README.md
│
├── models/
│   └── Game.js
│
└── public/
    ├── index.html
    ├── style.css
    └── script.js
```

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/tic-tac-toe.git
```

Move into the project folder:

```bash
cd tic-tac-toe
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure MongoDB

Create a MongoDB Atlas database and obtain the MongoDB connection string.

Create a `.env` file in the root directory:

```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
```

Replace `your_mongodb_connection_string` with your actual MongoDB Atlas connection string.

**Do not upload the `.env` file to GitHub.**

### 4. Start the Server

```bash
npm start
```

The application will run at:

```text
http://localhost:3000
```

## 🎮 How to Play

1. Open the application.
2. Enter a username.
3. Click **Join Game**.
4. The first player is assigned **X**.
5. The second player is assigned **O**.
6. Once two players join, the game starts.
7. Players take turns clicking an empty cell.
8. The first player to get three symbols in a row wins.
9. If all cells are filled without a winner, the game ends in a draw.
10. The game result is saved to MongoDB.
11. The game automatically resets after the game ends.
12. Players must log in again for a new game.

## 🔌 Socket.io Events

The application uses the following Socket.io events:

| Event            | Purpose                                   |
| ---------------- | ----------------------------------------- |
| `user-login`     | Sends username from client to server      |
| `login-success`  | Confirms successful login and assigns X/O |
| `login-error`    | Sends validation/error messages           |
| `players-update` | Updates connected player information      |
| `game-start`     | Starts the game when two players join     |
| `make-move`      | Sends a player's move to the server       |
| `move-made`      | Broadcasts the move to all players        |
| `game-over`      | Announces winner or draw                  |
| `reset-game`     | Requests a game reset                     |
| `game-reset`     | Confirms game reset                       |
| `disconnect`     | Handles player disconnection              |

## 🗄️ Database Structure

Completed games are stored in MongoDB in the `games` collection.

Each game record contains:

```text
playerX
playerO
winner
totalMoves
playedAt
```

Example:

```json
{
  "playerX": "Mahek",
  "playerO": "Player2",
  "winner": "Mahek",
  "totalMoves": 7,
  "playedAt": "2026-08-27T10:30:00.000Z"
}
```

## 🔗 Game History API

The backend provides an API to retrieve previous games:

```text
GET /api/games
```

Local:

```text
http://localhost:3000/api/games
```

The API returns previously completed games stored in MongoDB.

## 🧠 Game Logic

The server maintains the complete game state, including:

* Current players
* Player symbols
* Board state
* Current turn
* Game status
* Winner detection

The server validates every move before broadcasting it to connected clients. This prevents invalid moves, occupied-cell moves, and out-of-turn moves.

## 🚀 Deployment

The application is deployed using **Render**.

The production environment uses:

* Render for backend hosting
* MongoDB Atlas for database storage
* Socket.io for real-time communication

### Environment Variable

The following environment variable must be configured on Render:

```text
MONGODB_URI
```

Render automatically provides the `PORT` environment variable.

## 📱 Responsive Design

The frontend is designed to work across:

* 💻 Desktop
* 💻 Laptop
* 📱 Mobile
* 📱 Tablet

## 🔒 Security

Sensitive environment variables such as the MongoDB connection string are stored in `.env` and are excluded from GitHub using `.gitignore`.

```text
node_modules/
.env
```

## 👨‍💻 Author

**Mahek Yadav**

B.Tech CSE Student

## 📄 License

This project was created for educational purposes as part of a Backend Development / Socket Programming assignment.
