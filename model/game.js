const _ = require('underscore');
const Question = require('./question.js');

var questionSet = [];

var Game = function (channel) {
    this._scores = {};
    this._channel = channel;
    this._questionCount = 0;
    this._recentQuestions = []
    this._questionMemoryDepth = 10;
    this._currentQuestion = new Question();
};

Game.prototype.getScoreById = function (discordUserId) {
    console.log(this._scores);
    return this._scores[discordUserId];
};

Game.prototype.getPlayerIds = function () {
    return Object.keys(this._scores);
};

Game.prototype.addPointsToPlayer = function (discordUser, points) {
    this.addPlayer(discordUser);
    return this._scores[discordUser.id] += points
};

Game.prototype.addPlayer = function (discordUser) {
    if (!_.has(this._scores, discordUser.id)) {
        this._scores[discordUser.id] = 0;
    }
};

Game.prototype.advanceQuestion = function () {
    do {
        var next = _.sample(questionSet);
    } while (_.contains(this._recentQuestions, next));

    this._recentQuestions.push(next);
    if (this._recentQuestions.length > this._questionMemoryDepth) {
        this._recentQuestions.shift();
    }

    return this._currentQuestion = next;
};

Game.prototype.clearCurrentQuestion = function () {
    if (this._currentQuestion) {
        this._currentQuestion.stop();
        this._currentQuestion = null;
    }
}

Game.prototype.getCurrentQuestion = function () {
    return this._currentQuestion;
};

Game.prototype.getChannel = function () {
    return this._channel;
};

Game.setQuestionSet = function (questions) {
    questionSet = questions;
};

Game.getQuestionSet = function () {
    return questionSet;
};

module.exports = Game;