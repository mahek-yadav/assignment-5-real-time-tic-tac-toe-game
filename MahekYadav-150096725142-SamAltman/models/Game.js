const mongoose = require("mongoose");

const gameSchema = new mongoose.Schema({

    playerX: {
        type: String,
        required: true,
        trim: true
    },

    playerO: {
        type: String,
        required: true,
        trim: true
    },

    winner: {
        type: String,
        required: true,
        trim: true
    },

    totalMoves: {
        type: Number,
        required: true,
        min: 0
    },

    playedAt: {
        type: Date,
        default: Date.now
    }

});


module.exports = mongoose.model(
    "Game",
    gameSchema
);
