'use strict';

/**
 * LPD.game
 * this class takes care of all the game logic
 *
 * @constructor
 */
LPD.Game = function () {

    // set ups
    this.score       = 501;
    this.gameDarts   = 0;

    // a score count for the three darts you are throwing
    this.okiScore    = [];

    // create scores array and populate with available scores
    this.scores = [];

    this.scores.push(25);
    for (var i = 20; i > 0; i -= 1) {
        this.scores.push(i);
    }

    // reset checkout - display message that one isn't ready yet
    this.resetCheckout();

    // listen to events
    _.listen('dart:thrown', this.registerScore.bind(this));
};


// extend the prototype
_.extend(LPD.Game.prototype, {


    resetCheckout: function () {
        _.$('checkout').innerHTML = 'Checkout will appear here when available';
    },

    /**
     * registerScore
     * callback from event register, accepts the score that has been thrown and
     * increases the dart throw count.
     *
     * @param score
     */
    registerScore: function (score) {

        // if three have been thrown, reset array
        if (this.okiScore.length === 3) {
            this.resetOki();
        }

        // register score
        this.okiScore.push(score);

        // amend counters
        this.score -= score;
        this.gameDarts += 1;

        if (this.score < 0) {
            // bust, go back to start of three dart throw
            this.lastOkiScore();

        } else if (this.score <= 170) {
            // check for finish
            this.checkForFinish();
        }

        // update board
        this.updateDOM();
    },


    /**
     * resetOki
     * resets the score
     */
    resetOki: function () {

        this.okiScore.length = 0;
        _.$('.toThrow').className = 'toThrow';
    },


    /**
     * updateDOM
     * method to separate the dom manipulation, simply prints the stored values
     * to the DOM
     */
    updateDOM: function () {

        _.$('score').innerHTML = this.score;
        _.$('darts').innerHTML = this.gameDarts;
        _.$('.toThrow').className += ' throw' + this.okiScore.length;
    },


    /**
     * lastOkiScore
     * if the user has gone bust then, we re-calc the previous score
     */
    lastOkiScore: function () {

        var score = this.okiScore.reduce(function (memory, score) {
            return memory + score;
        });

        this.score = this.score + score;
        this.resetOki();
    },


    /**
     * checkForFinish
     * ...
     */
    checkForFinish: function (score, maxDarts) {

        score = score || this.score;

        console.log(score);

        var accumulative = score,
            darts = 0,
            len = this.scores.length,
            i,
            j,
            k,
            results = [];

        for (i = 0; i < len; i += 1) {

            // resets
            accumulative = score;
            darts = 0;

            // first lets check all doubles
            accumulative -= (this.scores[i] * 2);

            // straight double finish jump out now
            if (accumulative === 0) {
                // accommodate `bull`
                if (this.scores[i] === 25) {
                    results.push('BULL');
                } else {
                    results.push('D' + this.scores[i]);
                }

                i = len;
            } else {

                // continue checking score against

                // doubles and trebles




            }



            // temp cut short
            if (results.length > 4) {
                i = len;
            }
        }


        console.log(results);





    }
});