const fs = require('fs');
const Discord = require('discord.js');
const model = require('./model');
const data_adapter = require('./data_adapter.js');
const game_manager = require('./game_manager.js');
const config = require('./config.js');

(function main() {
    const client = new Discord.Client();

    client.on('ready', () => {
        console.log("Discord login successful.");
        game_manager.listenTo(client);
    });

    data_adapter.load(function (err, questions) {
        if (err) throw err;

        model.Game.setQuestionSet(questions);
        console.log("Attempting to login...");
        client.login(config.get("botToken"));
    });
})();