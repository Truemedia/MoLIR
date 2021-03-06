//Constructor to load intents
function Molir(intents, minimumConfidence) {
    this.intents = intents;
    this.minimumConfidence = minimumConfidence;
}

Molir.prototype.classify = function (input) {
    return new Promise((resolve, reject) => {

        if (!this.intents || !this.minimumConfidence) {
            reject("Either 'Intents' or 'Minimum Confidence' not set");
        } else {
            returnRankedIntents(input, this.intents)
            .then((results) => {
                let selectedResult = results[0];
    
                if (selectedResult.score < 100 && selectedResult.confidence >= this.minimumConfidence) {
                    resolve({
                        classified: false
                    });
                } else {
                    resolve({
                        classified: true,
                        intentName: selectedResult.intentName,
                        confidence: selectedResult.confidence
                    });
                }
            });
        }

        
    });
}


//Function to classify input based on loaded intents
function returnRankedIntents(input, intents) {
    return new Promise((resolve, reject) => {
        let lowerCase = input.toLowerCase();
        let totalScore = 0;

        //loop through all loaded intents
        intents.forEach((intent) => {
            intent.score = 0;
            intent.utterences.forEach((utterence) => {

                let words = utterence.toLowerCase().split(" ");
                let utterenceMatch = 0;
                let ppw = 100 / words.length;


                //how many words in input match intent samples
                words.forEach((word) => {
                    if (lowerCase.includes(word)) {
                        utterenceMatch = utterenceMatch + ppw;
                    }
                });

                if (intent.score < utterenceMatch) {
                    intent.score = utterenceMatch
                }

            });

            //each intent keyword in the input multiplies the intent score by 2
            intent.keywords.forEach((keyword) => {
                if (input.includes(keyword.toLowerCase())) {
                    intent.score = intent.score * 2
                }
            });

            //add intent score to totalscore
            totalScore = totalScore + intent.score;
        });


        //work out confident by deviding each intents score by the total
        intents.forEach((intent) => {
            intent.confidence = intent.score / totalScore
        });

        //Sort intents
        let sorted = intents.sort((a, b) => {
            return b.confidence - a.confidence
        });

        //sent back the classified intents
        resolve(sorted);
    }
    )
};


//export module
module.exports = Molir;


