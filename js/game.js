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

    for (var i = 0; i <= 20; i += 1) {
        this.scores.push(i);
    }
    this.scores.push(25, 50);

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
    checkForFinish: function () {




    }
});