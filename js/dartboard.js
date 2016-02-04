'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * DartBoard
 * this class contains all logic for building the interface, has methods for
 * returning the value of the dart based on the co-ordinates of the throw in
 * the dartboard
 *
 * @param canvasId
 * @constructor
 */

var DartBoard = function () {
    function DartBoard(canvasId) {
        _classCallCheck(this, DartBoard);

        // register canvas
        this.canvas = _.$(canvasId);

        // throw error
        if (!this.canvas) {
            throw new Error('No canvas element found!');
        }

        // canvas context
        this.context = this.canvas.getContext('2d');

        // the available scores on a dartboard in order of how they appear
        this.labels = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5];

        // set up
        this.start = -99;
        this.segment = 18;
        this.dim = false;

        // draw the board immediately
        this.drawBoard();
    }

    /**
     * toRadians
     *
     * @param deg {number}
     * @returns {number}
     */

    _createClass(DartBoard, [{
        key: 'drawBoard',

        /**
         * drawBoard
         * iterates through the predefined scores in order and draws the canvas
         * segments
         *
         * @returns {DartBoard} for chaining
         */
        value: function drawBoard(highlight) {

            var onoff = false,
                value,
                color,
                double,
                start,
                end,
                i;

            // set dim for this pass
            this.dim = _.isNumber(highlight);

            // base board
            this.circle({
                radius: 200,
                color: '#111'
            });

            // loop segments
            for (i = 0; i < 20; i += 1) {

                if (highlight === this.labels[i]) {
                    this.dim = false;
                }

                // colors
                if (onoff) {
                    color = this.dim ? '#959379' : "#e3e1c8";
                    double = this.dim ? 'darkGreen' : 'green';
                } else {
                    color = "#000";
                    double = this.dim ? 'darkRed' : 'red';
                }

                // value
                value = this.labels[i];
                start = this.start;
                end = this.start + this.segment;

                // draw
                this
                // doubles
                .arc({
                    radius: 170,
                    startAngle: start,
                    endAngle: end,
                    color: double
                })

                // singles
                .arc({
                    radius: 160,
                    startAngle: start,
                    endAngle: end,
                    color: color
                })

                // treble
                .arc({
                    radius: 100,
                    startAngle: start,
                    endAngle: end,
                    color: double
                })

                // inner singles
                .arc({
                    radius: 90,
                    startAngle: start,
                    endAngle: end,
                    color: color
                })

                // label
                .text({
                    text: this.labels[i].toString(),
                    position: start + this.segment / 2
                });

                this.start += this.segment;
                onoff = !onoff;

                if (highlight === this.labels[i]) {
                    this.dim = true;
                }
                // end loop
            }

            // bulls eye (green then red)
            this.circle({
                radius: 16,
                color: this.dim ? 'darkGreen' : 'green'
            }).circle({
                radius: 6,
                color: this.dim ? 'darkRed' : 'red'
            });

            return this;
        }
    }, {
        key: 'fillStroke',

        /**
         * fillStroke
         * takes a fill and stroke value and applyes to the current context
         *
         * @param fill {string} hash hex colour
         * @param stroke {string} hash hex colour
         */
        value: function fillStroke(fill, stroke) {

            var ctx = this.context;

            ctx.fillStyle = fill || '#000';
            ctx.fill();
            ctx.strokeStyle = stroke || '#fff';
            ctx.stroke();
        }
    }, {
        key: 'circle',

        /**
         * circle
         * draws a circle on the current context
         *
         * @param config {object} config object
         * @returns {DartBoard} for chaining
         */
        value: function circle(config) {

            var ctx = this.context,
                x = 200,
                y = 200;

            ctx.beginPath();
            ctx.arc(x, y, config.radius, 0, Math.PI * 2, true);
            this.fillStroke(config.color, null);
            ctx.closePath();

            return this;
        }
    }, {
        key: 'arc',

        /**
         * arc
         * draw an arc on the current context
         *
         * @param config {object} config object
         * @returns {DartBoard}
         */
        value: function arc(config) {

            var ctx = this.context,
                start = DartBoard.toRadians(config.startAngle),
                end = DartBoard.toRadians(config.endAngle),
                x = 200,
                y = 200;

            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.arc(x, y, config.radius, start, end);
            ctx.lineTo(x, y);
            this.fillStroke(config.color, null);
            ctx.closePath();

            return this;
        }
    }, {
        key: 'text',

        /**
         * text
         * draws text to the current context
         *
         * @param config {object} config object
         * @returns {DartBoard}
         */
        value: function text(config) {

            var ctx = this.context,
                calc = Math.PI * 2 / 360 * config.position,
                x = Math.round(185 * Math.cos(calc)) + 192,
                y = Math.round(185 * Math.sin(calc)) + 204;

            ctx.font = '16px Helvetica, Arial';
            ctx.fillStyle = '#ccc';
            ctx.fillText(config.text, x, y);

            return this;
        }
    }, {
        key: 'findValue',

        /**
         * findValue
         * from the angle and radius this method returns the value that the dart has
         * fallen into
         *
         * @param x {number}
         * @param y {number}
         * @param getSegment {boolean} (optional)
         * @returns {number}
         */
        value: function findValue(x, y, getSegment) {

            var radius = DartBoard.getRadius(x, y),
                angle = DartBoard.getAngle(x, y, radius),
                segment = Math.round(angle / 18) + 5,
                multiplier = 1;

            if (segment >= 20) {
                segment -= 20;
            }

            if (radius <= 6) {
                return 50;
            } else if (radius <= 16) {
                return 25;
            } else if (_.between(radius, 90, 100)) {
                multiplier = 3;
            } else if (_.between(radius, 160, 170)) {
                multiplier = 2;
            } else if (radius >= 170) {
                return null;
            }

            // if get segment if passed return the segment number here
            if (getSegment) {
                return this.labels[segment];
            }

            return this.labels[segment] * multiplier;
        }
    }], [{
        key: 'toRadians',
        value: function toRadians(deg) {
            return deg * Math.PI / 180;
        }
    }, {
        key: 'getAngle',

        /**
         * getAngle
         * method to return the angle of a point on the board given the x and y
         * co-ordinates
         *
         * @param x {number}
         * @param y {number}
         * @param radius {number}
         * @returns {number}
         */
        value: function getAngle(x, y, radius) {

            var angle = Math.round(Math.atan((y - 200) / (x - 200 - radius)) * (360 / Math.PI) + 180);

            if (angle === 360 || isNaN(angle)) {
                angle = 0;
            }

            return angle;
        }
    }, {
        key: 'getRadius',

        /**
         * getRadius
         * gets the radius of a point on the board given the x & y co-ordinates
         *
         * @param x {number}
         * @param y {number}
         * @returns {number}
         */
        value: function getRadius(x, y) {

            var x0 = Math.pow(x - 200, 2),
                y0 = Math.pow(y - 200, 2),
                sqrt = Math.sqrt(x0 + y0);

            return Math.round(sqrt);
        }
    }]);

    return DartBoard;
}();
