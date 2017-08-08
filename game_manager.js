const _ = require('underscore');
const model = require('./model');
const strings = require('./data/strings.js');
const config = require('./config.js');
const package = require('./package.json');

var GameManager = function () {
    var self = this;

    this._currentGame = null;
    this._pauseRef = null;
    this._sentVowels = false;

    this.listenTo = function (discordClient) {
        discordClient.on('message', self.receiveMessage);
        console.log("Registered chat commands.");
        discordClient.channels.filter(function (c) {
            return c.name.toUpperCase() === config.get("channel").toUpperCase() &&
                c.type == 'text';
        }).forEach(function (channel) {
            channel.send(strings.Hello(package.version));
        })
    };

    this.receiveMessage = function (message) {
        if (message.channel.name.toUpperCase() !== config.get("channel").toUpperCase()) {
            return;
        }

        if (message.content.startsWith(config.get("commandPrefix"))) {
            console.log("Received command", message.content);
            var text = message.content.substring(config.get("commandPrefix").length);
            switch (text.split(" ")[0]) {
                case "trivia":
                case "start":    
                    self.startGame(message);
                    break;

                case "stop":
                    self.stopGame(message);
                    break;
                    
                case "repeat":
                    self.repeatQuestion(message);
                    break;
                
                case "score":
                    self.reportScore(message);
                    break;
                    
                case "vowels":
                    self.sendVowels(message);
                    break;

                case "qcount":
                    self.reportQuestionCount(message);
                    break;

                case "help":
                    self.sendHelp(message);
                    break;

                case "cfg":
                    self.reconfigure(message, text.substring(3).trim());
                    break;
            }
        } else if (self._currentGame) {
            self.checkAnswer(message);
        }
    };

    this.sendHelp = function (message) {
        message.reply(strings.Help());
    }

    this.sendVowels = function (message) {
        if (!self._currentGame || !self._currentGame.getCurrentQuestion() || self._sentVowels) {
            return;
        }

        Self._sentVowels = true;
        message.reply(strings.Hint(
            self._currentGame.getCurrentQuestion().getVowels(),
            Math.ceil(question.getCurrentQuestion().getTimeRemainingMs() / 1000)));
    }

    this.startGame = function (message) {
        if (self._currentGame) {
            message.reply(strings.GameAlreadyStarted());
            return;
        }

        self._currentGame = new model.Game(message.channel);
        self._currentGame.addPlayer(message.author);

        message.channel.send(strings.GameStarted());
        self.askQuestion();
    };

    this.askQuestion = function () {
        if (!self._currentGame) {
            return;
        }

        self._sentVowels = false;
        if (self._pauseRef) {
            self._pauseRef = null;
        }

        var question = self._currentGame.advanceQuestion();
        self._currentGame.getChannel().send(strings.Ask(question.text()));
        question.start(self.timeout, self.giveHint);
    }

    this.giveHint = function (question) {
        self._currentGame.getChannel().send(strings.Hint(
            strings.EscapeForDiscord(question.getHint()),
            Math.ceil(question.getTimeRemainingMs() / 1000)));
    };

    this.timeout = function (question) {
        self._currentGame.getChannel().send(strings.Timeout(question.answer()));
        self.chillOutAndThen(self.askQuestion);
    };

    this.chillOutAndThen = function (nextCallback) {
        if (self._pauseRef) {
            clearTimeout(self._pauseRef);
        }    
        self._pauseRef = setTimeout(nextCallback, config.get("restPeriod") * 1000);
    };

    this.stopGame = function (message) {
        if (!self._currentGame) {
            message.reply(strings.NoGameRunning());
            return;
        }

        if (self._pauseRef) {
            clearTimeout(self._pauseRef);
        }

        if (self._currentGame.getCurrentQuestion()) {
            self._currentGame.getCurrentQuestion().stop();
        }

        self.reportScore(message);
        self._currentGame = null;
        message.channel.send(strings.GameStopped());
    };

    this.repeatQuestion = function (message) {
        if (!self._currentGame) {
            message.reply(strings.NoGameRunning());
            return;
        }

        var currentQuestion = _currentGame.getCurrentQuestion();
        if (currentQuestion) {
            message.reply(strings.Ask(currentQuestion.text()));
        }    
    };

    this.reportScore = function (message) {
        if (!self._currentGame) {
            message.reply(strings.NoGameRunning());
            return;
        }

        var place = 0;
        var lastScore = -1;
        _.sortBy(self._currentGame.getPlayerIds(), function (id) {
            return self._currentGame.getScoreById(id);
        }).reverse().forEach(function (id) {
            self._currentGame.getChannel().send(strings.LeaderboardLine(
                place += lastScore == self._currentGame.getScoreById(id) ? 0 : 1,
                '<@' + id + '>',
                lastScore = self._currentGame.getScoreById(id)));
        });
    };

    this.reportQuestionCount = function (message) {
        message.reply(
            strings.NumberOfQuestions(
                model.Game.getQuestionSet().length));
    };

    this.checkAnswer = function (message) {
        if (!self._currentGame || !self._currentGame.getCurrentQuestion()) {
            return;
        }

        console.log("Checking", message.content, "for an answer...");

        if (message.content.toUpperCase() === self._currentGame.getCurrentQuestion().answer().toUpperCase()) {
            var timeToAnswerMs = self._currentGame.getCurrentQuestion().stop();
            var newScore = self._currentGame.addPointsToPlayer(message.author, 1);
            self._currentGame.getChannel().send(strings.CorrectAnswer(
                message.author.toString(),
                self._currentGame.getCurrentQuestion().answer(),
                Math.ceil(timeToAnswerMs / 1000),
                newScore
            ));
            self._currentGame.clearCurrentQuestion();
            self.chillOutAndThen(self.askQuestion);
        }
    };

    /* I will regret adding this */
    this.reconfigure = function (message, parameterText) {
        var params = parameterText.match(/\S+/g) || []
        if (params.length == 2) {
            self.stopGame(message);
            config.set(params[0], params[1]);
            message.reply(strings.Reconfigured(params[0], params[1]));
        }
    }
}

module.exports = new GameManager();