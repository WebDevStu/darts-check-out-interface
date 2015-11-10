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
        _.$('dScore').innerHTML = this.okiScore.reduce(function (memory, number) {
            return (+memory) + (+number);
        });
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
     *
     * @TODO make a recursive function
     */
    checkForFinish: function (score, maxDarts) {

        score = score || this.score;

        var accumulative = score,
            darts = 0,
            len = this.scores.length,
            i,
            j,
            k,
            checkouts = [];

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
                    checkouts.push(['BULL']);
                } else {
                    checkouts.push(['D' + this.scores[i]]);
                }

                i = len;

            } else {

                // trebles
                for (k = 0; k < len; k += 1) {

                    if (accumulative - (this.scores[k] * 3) === 0) {
                        // a single treble does it
                        if (this.scores[i] === 25) {
                            checkouts.unshift(['T' + this.scores[k], 'BULL']);
                        } else {
                            checkouts.unshift(['T' + this.scores[k], 'D' + this.scores[i]]);
                        }

                    } else if (accumulative - (this.scores[k] * 6) === 0) {
                        // lets try x2 trebles
                        if (this.scores[i] === 25) {
                            checkouts.unshift(['T' + this.scores[k], 'T' + this.scores[k], 'BULL']);
                        } else {
                            checkouts.unshift(['T' + this.scores[k], 'T' + this.scores[k], 'D' + this.scores[i]]);
                        }

                    }

                }
            }
        }

        // lets sort and trim the results
        checkouts.sort(function (checkoutA, checkoutB) {

            if (checkoutA.length < checkoutB.length) {
                return -1;
            }

            return 1;
        });

        // log results
        this.printResults(checkouts);
    },


    /**
     * printResults
     *
     * @param checkouts
     */
    printResults: function (checkouts) {

        var unOrderedList = document.createElement('ul'),
            softLimit = 9,
            listItem;

        checkouts.forEach(function (array, index) {

            if (index > softLimit) {
                return;
            }

            listItem = document.createElement('li');

            listItem.innerHTML = array.join(', ');
            unOrderedList.appendChild(listItem);
        });

        _.$('checkout').innerHTML = '';
        _.$('checkout').appendChild(unOrderedList);
    }
});