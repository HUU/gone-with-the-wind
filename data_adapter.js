const fs = require('fs')
const model = require('./model')

module.exports.load = function (callback) {
    fs.readFile('./data/questions.json', 'utf8', function (err, data) {
        if (err) {
            callback(err, null);
        } else {
            rawQuestions = JSON.parse(data);
            questions = []

            rawQuestions.forEach(function (element) {
                questions.push(new model.Question(element.question, element.answer))
            }, this);

            console.log("Loaded", questions.length, "questions.");
            callback(null, questions);
        }    
    });
}

