const strings = require('./strings.json');
const util = require('util');
const config = require('../config.js');

module.exports.NoGameRunning = function () {
    return util.format(strings.NoGameRunning, config.get("commandPrefix"));
}

module.exports.GameAlreadyStarted = function () {
    return util.format(strings.GameAlreadyStarted, config.get("commandPrefix"));
}

module.exports.NumberOfQuestions = function (count) {
    return util.format(strings.NumberOfQuestions, count);
}

module.exports.GameStopped = function () {
    return util.format(strings.GameStopped, config.get("commandPrefix"));
}

module.exports.GameStarted = function () {
    return util.format(strings.GameStarted, config.get("commandPrefix"));
}

module.exports.Hint = function (text, secondsLeft) {
    return util.format(strings.Hint, text, secondsLeft);
}

module.exports.Timeout = function (answer) {
    return util.format(strings.Timeout, answer);
}

module.exports.InactivityShutdown = function () {
    return text.InactivityShutdown;
}

module.exports.CorrectAnswer = function (winnerMention, answer, timeToAnswer, score) {
    return util.format(strings.CorrectAnswer, winnerMention, answer, winnerMention, timeToAnswer, score);
}

module.exports.Ask = function (text) {
    return util.format(strings.Ask, text);
}

module.exports.Reconfigured = function (key, value) {
    return util.format(strings.Reconfigured, key, value);
}

module.exports.LeaderboardLine = function (place, playerMention, score) {
    return util.format(strings.LeaderboardLine, place, playerMention, score);
}

module.exports.EscapeForDiscord = function (str) {
    return str.replace(/_/g, "\\_");
}

/* I'm so lazy */
module.exports.Help = function () {
    var prefix = config.get("commandPrefix")
    return util.format(strings.Help, prefix, prefix, prefix, prefix);
}