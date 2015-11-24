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


    /**
     * resetCheckout
     */
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

        var dartsThrown;

        // if three have been thrown, reset array
        if (this.okiScore.length === 3) {
            this.resetOki();
        }

        // register score
        this.okiScore.push(score);

        dartsThrown = (3 - this.okiScore.length) || 3;

        // amend counters
        this.score -= score;
        this.gameDarts += 1;

        if (this.score < 0) {
            // bust, go back to start of three dart throw
            this.lastOkiScore();

        } else if (this.score <= 170) {
            // check for finish
            this.checkForFinish(null, dartsThrown);
        }

        // update board
        this.updateDOM();
    },


    /**
     * resetOki
     * resets the score for this set of darts
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
        _.$('dScore').innerHTML = this.getOkiScore();
        _.$('.toThrow').className += ' throw' + this.okiScore.length;
    },


    /**
     * getOkiScore
     * returns the current oki score
     * @returns {Number}
     */
    getOkiScore: function () {

        if (this.okiScore.length) {
            return this.okiScore.reduce(function (memory, number) {
                return (+memory) + (+number);
            });
        } else {
            return 0;
        }
    },


    /**
     * lastOkiScore
     * if the user has gone bust then, we re-calc the previous score
     */
    lastOkiScore: function () {

        this.score = this.score + this.getOkiScore();

        this.resetOki();
    },


    /**
     * checkForFinish
     * main method for resolving the checkout score based on dart left to throw
     *
     * @TODO MASSIVE OPTIMISATION NEEDED - proof of concept proved!
     */
    checkForFinish: function (score) {

        score = score || this.score;

        var singles = this.scores.slice.call(this.scores),
            doubles = this.scores.slice.call(this.scores).map(function (score) {
                return score * 2;
            }),
            trebles = this.scores.slice.call(this.scores).map(function (score) {
                return score * 3;
            }).slice(1),
            possibles = [];


        // start with finding doubles
        doubles.forEach(function (double) {

            // finish on this double
            if ((score - double) === 0) {
                possibles.push([{
                    value: double / 2,
                    multiplier: 2
                }]);

            } else {

                // go forward and remove a single
                singles.forEach(function (single) {

                    // finish on this double and this single
                    if ((score - double - single) === 0) {
                        possibles.push([{
                            value: double / 2,
                            multiplier: 2
                        }, {
                            value: single,
                            multiplier: 1
                        }]);

                    } else {

                        // keep going to see if trebles play a part
                        trebles.forEach(function (treble) {

                            // finish with this double, this single and this treble
                            if ((score - double - single - treble) === 0) {
                                possibles.push([{
                                    value: double / 2,
                                    multiplier: 2
                                }, {
                                    value: single,
                                    multiplier: 1
                                }, {
                                    value: treble / 3,
                                    multiplier: 3
                                }]);
                            }
                        });
                    }
                });

                // finally try trebles and trebles
                trebles.forEach(function (treble) {

                    // we have a finish with this double and this treble
                    if ((score - double - treble) === 0) {
                        possibles.push([{
                            value: double / 2,
                            multiplier: 2
                        }, {
                            value: treble / 3,
                            multiplier: 3
                        }]);

                    } else {

                        trebles.forEach(function (treble2) {

                            if ((score - double - treble - treble2) === 0) {
                                possibles.push([{
                                    value: double / 2,
                                    multiplier: 2
                                }, {
                                    value: treble / 3,
                                    multiplier: 3
                                }, {
                                    value: treble2 / 3,
                                    multiplier: 3
                                }]);
                            }
                        });

                        doubles.forEach(function (double2) {
                            if ((score - double - treble - double2) === 0) {
                                possibles.push([{
                                    value: double / 2,
                                    multiplier: 2
                                }, {
                                    value: treble / 3,
                                    multiplier: 3
                                }, {
                                    value: double2 / 2,
                                    multiplier: 2
                                }]);
                            }
                        });
                    }
                });
            }
        });

        // log results
        this.printResults(this.convertPossibles(possibles));
    },


    /**
     * convertPossibles
     * converts the possibles array into human readable
     *
     * @param possibles {Array}
     * @returns {Array}
     */
    convertPossibles: function (possibles) {

        var checkouts = [],
            notation = [null, null, 'D', 'T'],
            part;

        possibles.forEach(function (finishArray) {

            finishArray.reverse();
            part = [];

            finishArray.forEach(function (finish) {

                if (finish.value === 25 && finish.multiplier === 2) {
                    part.push('BULL');
                } else {
                    part.push(notation[finish.multiplier] + finish.value);
                }
            });

            checkouts.push(part);
        });

        // lets sort and trim the results
        checkouts.sort(function (checkoutA, checkoutB) {

            if (checkoutA.length < checkoutB.length) {
                return -1;
            }

            return 1;
        });

        return checkouts;
    },



    /**
     * printResults
     * updates the DOM with all possible finishes
     *
     * @param checkouts
     */
    printResults: function (checkouts) {

        var unOrderedList = document.createElement('ul'),
            listItem;

        checkouts.forEach(function (array) {

            listItem = document.createElement('li');

            listItem.innerHTML = array.join(', ');
            unOrderedList.appendChild(listItem);
        });

        unOrderedList.className = 'checkouts';

        _.$('checkout').innerHTML = '';
        _.$('checkout').appendChild(unOrderedList);
    }
});