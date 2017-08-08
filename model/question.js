const moment = require('moment');
const config = require('../config.js');
const _ = require('underscore');

var Question = function (question, answer) {
    this._question = question
    this._answer = answer
    this._hintTicks = 0;
    this._timeRef = null;
    this._hintRef = null;
    this._startTime = null;
    this._timeLimit = null;
    this.hints = [];

    this._generateNextHint = function (replaceCharCount, lastHint) {
        var newHint = lastHint;
        if (replaceCharCount == 0) {
            for (var i = 0; i < newHint.length && newHint[i] === '_'; i++) { }
            newHint = this._replaceAtIndex(newHint, i, '_');
        } else {
            for (replaced = 0; replaced < replaceCharCount;) {
                var i = _.random(newHint.length - 1);
                if (newHint[i] !== '_') {
                    newHint = this._replaceAtIndex(newHint, i, '_');
                    replaced++;
                }
            }
        }    
        return newHint;
    };

    this._replaceAtIndex = function(str, index, replacement) {
        return str.substr(0, index) + replacement + str.substr(index + replacement.length);
    }
};

Question.prototype.text = function () {
    return this._question;
};

Question.prototype.answer = function () {
    return this._answer;
};

Question.prototype.getHintTicks = function () {
    return this._hintTicks;
}

Question.prototype.getHint = function (hintNumber = this._hintTicks) {
    console.log("Giving hint", hintNumber);
    return this.hints[hintNumber - 1];
}

Question.prototype.start = function (timeoutCallback, hintCallback) {
    const maxHints = config.get("maxHints");
    var replaceCount = Math.floor(this._answer.length / maxHints);
    for (var hint = maxHints - 1; hint >= 0; hint--) {
        this.hints[hint] = this.hints[hint + 1] ? this._generateNextHint(replaceCount, this.hints[hint + 1]) : this._answer;
    }
    console.log(this.hints);

    this._timeLimit = config.get("questionTimeLimit") * 1000;
    this._timeRef = setTimeout(function (q) { q.stop(); timeoutCallback(q); }, this._timeLimit, this);
    this._startTime = moment();
    this._hintRef = setInterval(function (q) {
        q._hintTicks++; if (q._hintTicks <= config.get("maxHints")) { hintCallback(q); }
    }, config.get("hintInterval") * 1000, this);
};

Question.prototype.stop = function () {
    clearTimeout(this._timeRef);
    clearInterval(this._hintRef);
    if (this._startTime) {
        return moment().diff(this._startTime);
    }
};

Question.prototype.getTimeRemainingMs = function () {
    if (this._startTime && this._timeLimit) {
        return this._timeLimit - moment().diff(this._startTime);
    }
}

module.exports = Question;