'use strict';

/**
 * LPD.game
 * @constructor
 */
LPD.Game = function () {

    this.score       = 501;
    this.gameDarts   = 0;

    this.okiScore    = [];

    this.scoreEl     = _.$('score');
    this.dartCountEl = _.$('darts');
    this.toThrowEl   = _.$('.toThrow');


    // create scores array and populate with available scores
    this.scores = [];

    for (var i = 0; i <= 20; i += 1) {
        this.scores.push(i);
    }
    this.scores.push(25, 50);

    // listen to events
    _.listen('dart:thrown', this.registerScore.bind(this));
};


// extend the prototype
_.extend(LPD.Game.prototype, {



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



    resetOki: function () {
        this.okiScore.length = 0;
        this.toThrowEl.className = 'toThrow';
    },



    updateDOM: function () {

        this.scoreEl.innerHTML = this.score;
        this.dartCountEl.innerHTML = this.gameDarts;
        this.toThrowEl.className += ' throw' + this.okiScore.length;
    },



    lastOkiScore: function () {

        var score = this.okiScore.reduce(function (memory, score) {
            return memory + score;
        });

        this.score = this.score + score;
        this.resetOki();
    },

    checkForFinish: function () {


    }
});