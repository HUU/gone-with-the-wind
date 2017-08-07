const convict = require('convict');

var config = convict({
    botToken: {
        doc: "The discord bot secret token",
        default: "",
        format: String,
        env: "TRIVIA_SECRET"
    },
    commandPrefix: {
        doc: "The chat command prefix string",
        default: "!",
        env: "TRIVIA_PREFIX"
    },
    questionTimeLimit: {
        doc: "The time limit (in seconds) to answer a question.",
        default: 60,
        format: Number,
        env: "TRIVIA_TIME_LIMIT"
    },
    hintInterval: {
        doc: "The number of seconds between hints.",
        default: 15,
        format: Number,
        env: "TRIVIA_HINT_INTERVAL"
    },
    maxHints: {
        doc: "The maximum number of hints.",
        default: 3,
        format: Number,
        env: "TRIVIA_HINT_COUNT"
    },
    restPeriod: {
        doc: "The nubmer of seconds to wait between questions.",
        default: 10,
        format: Number,
        env: "TRIVIA_PAUSE_FOR"
    },
    unansweredStop: {
        doc: "The number of unanswered questions to ask before stopping.",
        default: 5,
        format: Number,
        env: "TRIVIA_STOP_AT"
    }
});

config.validate({ allowed: 'strict' });

module.exports = config;