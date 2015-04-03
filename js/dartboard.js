'use strict';

/**
 * DartBoard
 * this class contains all logic for building the interface, has methods for
 * returning the value of the dart based on teh co-ordinates of the throw in
 * the dartboard
 *
 * @param canvasId
 * @constructor
 */
LPD.DartBoard = function (canvasId) {

    this.canvas = _.$(canvasId);

    if (!this.canvas) {
        throw new Error('No canvas element found!');
    }

    this.context = this.canvas.getContext('2d');

    this.labels = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5];

    this.start = -99;
    this.segment = 18;
    this.dim = false;

    // draw the board
    this.drawBoard()
};

// prototype extends
_.extend(LPD.DartBoard.prototype, {


    /**
     * drawBoard
     *
     * @returns {*}
     */
    drawBoard: function (highlight) {

        var onoff = false,
            value,
            color,
            double,
            start,
            end,
            i;

        // set dim for this pass
        this.dim = (_.isNumber(highlight));

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
                    position: start + (this.segment / 2)
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
    },


    /**
     * toRadians
     *
     * @param deg
     * @returns {number}
     */
    toRadians: function (deg) {
        return deg * Math.PI / 180;
    },


    /**
     * fillStroke
     *
     * @param fill
     * @param stroke
     */
    fillStroke: function (fill, stroke) {

        var ctx = this.context;

        ctx.fillStyle = fill || '#000';
        ctx.fill();
        ctx.strokeStyle = stroke || '#fff';
        ctx.stroke();
    },


    /**
     * circle
     *
     * @param config
     * @returns {DartBoard}
     */
    circle: function (config) {

        var ctx = this.context,
            x = 200,
            y = 200;

        ctx.beginPath();
        ctx.arc(x, y, config.radius, 0, Math.PI * 2, true);
        this.fillStroke(config.color);
        ctx.closePath();

        return this;
    },


    /**
     * arc
     *
     * @param config
     * @returns {DartBoard}
     */
    arc: function (config) {

        var ctx = this.context,
            start = this.toRadians(config.startAngle),
            end = this.toRadians(config.endAngle),
            x = 200,
            y = 200;

        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.arc(x, y, config.radius, start, end);
        ctx.lineTo(x, y);
        this.fillStroke(config.color);
        ctx.closePath();

        return this;
    },


    /**
     * text
     *
     * @param config
     * @returns {DartBoard}
     */
    text: function (config) {

        var ctx = this.context,
            calc = (Math.PI * 2) / 360 * config.position,
            x = Math.round(185 * Math.cos(calc)) + 192,
            y = Math.round(185 * Math.sin(calc)) + 204;

        ctx.font = '16px Helvetica, Arial';
        ctx.fillStyle = '#ccc';
        ctx.fillText(config.text, x, y);

        return this;
    },


    /**
     * getAngle
     *
     * @param x
     * @param y
     * @param radius
     * @returns {number}
     */
    getAngle: function (x, y, radius) {

        var angle = Math.round(Math.atan((y - 200) / ((x - 200) - radius)) * (360 / Math.PI) + 180);

        if (angle === 360 || isNaN(angle)) {
            angle = 0;
        }

        return angle;
    },


    /**
     * getRadius
     *
     * @param x
     * @param y
     * @returns {number}
     */
    getRadius: function (x, y) {

        var x0 = Math.pow(x - 200, 2),
            y0 = Math.pow(y - 200, 2),
            sqrt = Math.sqrt(x0 + y0);

        return Math.round(sqrt);
    },

    /**
     * findValue
     *
     * @param x
     * @param y
     * @param getSegment
     * @returns {number}
     */
    findValue: function (x, y, getSegment) {

        var radius = this.getRadius(x, y),
            angle = this.getAngle(x, y, radius),
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
});