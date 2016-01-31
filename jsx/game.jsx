'use strict';

/**
 * LPD.game
 * this class takes care of all the game logic
 *
 * @constructor
 */
class Game {


    constructor () {

        // set ups
        this.score = 501;
        this.gameDarts = 0;
        // a score count for the three darts you are throwing
        this.okiScore = [];
        // create scores array and populate with available scores
        this.scores = [];
        // possibles array for storing possible finishes
        this.possibles = [];

        this.scores.push(25);

        for (var i = 20; i > 0; i -= 1) {
            this.scores.push(i);
        }

        // reset checkout - display message that one isn't ready yet
        this.resetCheckout();

        // listen to dart events
        _.listen('dart:thrown', this.registerScore, this);
    }

    /**
     * resetCheckout
     */
    static resetCheckout () {
        _.$('checkout').innerHTML = 'Checkout will appear here when available';
    }

    /**
     * registerScore
     * callback from event register, accepts the score that has been thrown and
     * increases the dart throw count.
     *
     * @param score
     */
    registerScore (score) {

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
            this.lastOkiScore()
                .checkForFinish();

        } else if (this.score <= 170) {
            // check for finish
            this.checkForFinish();
        }

        // update board
        this.updateDOM();
    }


    /**
     * resetOki
     * resets the score for this set of darts
     */
    resetOki () {

        this.okiScore.length = 0;
        _.$('.toThrow').className = 'toThrow';
    }


    /**
     * updateDOM
     * method to separate the dom manipulation, simply prints the stored values
     * to the DOM
     */
    updateDOM () {

        _.$('score').innerHTML = this.score;
        _.$('darts').innerHTML = this.gameDarts;
        _.$('dScore').innerHTML = this.getOkiScore();
        _.$('.toThrow').className += ' throw' + this.okiScore.length;
    }


    /**
     * getOkiScore
     * returns the current oki score
     * @returns {Number}
     */
    getOkiScore () {

        if (this.okiScore.length) {
            return this.okiScore.reduce(function (memory, number) {
                return (+memory) + (+number);
            });
        } else {
            return 0;
        }
    }


    /**
     * lastOkiScore
     * if the user has gone bust then, we re-calc the previous score
     *
     * @returns {Game}
     */
    lastOkiScore () {

        this.score = this.score + this.getOkiScore();

        this.resetOki();

        return this;
    }


    /**
     * accumulator
     * method for checking a score finish given an array of multipliers and many
     * scores. returns true if the iterator needs to continue
     *
     * @param multipliers {Array}
     * @param score {Number}
     * @returns {boolean}
     */
    accumulator (multipliers, score) {

        var args = _.toArray(arguments).slice(2),
            values = args.reduce(function (value, memory) {
                return memory + value;
            }),
            checkout = [],
            one,
            two;

        if (score - values === 0) {

            args.forEach(function (value, index) {
                checkout.push({
                    value: value / multipliers[index],
                    multiplier: multipliers[index],
                    score: value
                });
            });

            one = checkout[1];
            two = checkout[2];

            if ((one && two) && (one.score < two.score)) {
                checkout[1] = two;
                checkout[2] = one;
            }

            this.possibles.push(checkout);

            return false;
        }

        return true;
    }


    /**
     * checkForFinish
     * main method for resolving the checkout score based on dart left to throw
     */
    checkForFinish (score) {

        score = score || this.score;

        var singles = _.toArray(this.scores),
            doubles = _.toArray(this.scores).map(function (score) {
                return score * 2;
            }),
            trebles = _.toArray(this.scores).map(function (score) {
                return score * 3;
            }).slice(1);

        this.possibles.length = 0;

        // start with finding doubles
        doubles.forEach(function (double) {

            // finish on this double - we're done
            if (this.accumulator([2], score, double)) {

                // go forward and remove a single
                singles.forEach(function (single) {

                    if (this.accumulator([2, 1], score, double, single)) {

                        // finish with this double, this single and this single
                        singles.forEach(function (single2) {
                            this.accumulator([2, 1, 1], score, double, single, single2);
                        }, this);

                        // finish with this double, this single and this double
                        doubles.forEach(function (double2) {
                            this.accumulator([2, 1, 2], score, double, single, double2);
                        }, this);

                        // finish with this double, this single and this treble
                        trebles.forEach(function (treble) {
                            this.accumulator([2, 1, 3], score, double, single, treble);
                        }, this);
                    }
                }, this);


                // lets try doubles
                doubles.forEach(function (double2) {

                    if (this.accumulator([2, 2], score, double, double2)) {

                        // third double deep
                        doubles.forEach(function (double3) {
                            this.accumulator([2, 2, 2], score, double, double2, double3);
                        }, this);
                    }
                }, this);

                // finally try trebles and trebles
                trebles.forEach(function (treble) {

                    // we have a finish with this double and this treble
                    if (this.accumulator([2, 3], score, double, treble)) {

                        doubles.forEach(function (double2) {
                            this.accumulator([2, 3, 2], score, double, treble, double2);
                        }, this);

                        trebles.forEach(function (treble2) {
                            this.accumulator([2, 3, 3], score, double, treble, treble2);
                        }, this);
                    }
                }, this);
            }
        }, this);

        // log results
        this.printResults();
    }


    /**
     * printResults
     * updates the DOM with all possible finishes
     */
    printResults () {

        var checkouts = this.convertPossibles(),
            unOrderedList = document.createElement('ul'),
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


    /**
     * convertPossibles
     * converts the possibles array into human readable
     *
     * @returns {Array}
     */
    convertPossibles () {

        var checkouts = [],
            notation = [null, null, 'D', 'T'],
            checkout;

        this.possibles.forEach((finishArray) => {

            finishArray.reverse();
            checkout = [];

            finishArray.forEach((finish) => {

                if (finish.value === 25 && finish.multiplier === 2) {
                    checkout.push('BULL');
                } else {
                    checkout.push(notation[finish.multiplier] + finish.value);
                }
            });

            checkouts.push(checkout);
        });

        // lets sort and trim the results
        checkouts.sort(function (checkoutA, checkoutB) {

            var firstCharA,
                firstCharB;

            if (checkoutA.length < checkoutB.length) {
                return -1;
            }

            if (_.isString(checkoutA[0]) && _.isString(checkoutB[0])) {

                firstCharA = checkoutA[0].charAt(0).toLowerCase();
                firstCharB = checkoutB[0].charAt(0).toLowerCase();

                if (firstCharA === firstCharB) {

                    if (+checkoutA[0].slice(1) > +checkoutB[0].slice(1)) {
                        return -1;
                    }
                    return 1;
                }

                if (firstCharA > firstCharB) {
                    return -1;
                }

                return 1;
            }

            return -1;
        });

        return checkouts;
    }
}