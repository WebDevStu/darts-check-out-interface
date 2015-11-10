/**
 * dartsMaster
 * basically a controller, all logic to be kept out of the global scope
 */
(function () {

    'use strict';

    // instantiate a new dartboard and new game
    // @TODO new game to instantiate on users command
    var dartboard = new LPD.DartBoard('dartBoard'),
        game = new LPD.Game(dartboard.labels);

    /**
     * mouse move event to re-draw the canvas with only the segment score you
     * are hovering over as highlighted
     */
    dartboard.canvas.addEventListener('mousemove', function (evt) {

        // get value for where the mouse currently is
        var value = dartboard.findValue(evt.clientX, evt.clientY, true);

        // if your over a score position add pointer
        if (value) {
            dartboard.canvas.classList.add('pointer');
        } else {
            dartboard.canvas.classList.remove('pointer');
        }

        // re-draw the board passing in the value
        dartboard.drawBoard(value);
    }, false);


    /**
     * double check to make sure the board is reset
     */
    dartboard.canvas.addEventListener('mouseout', function () {
        dartboard.drawBoard();
    }, false);


    /**
     * throw some darts
     */
    dartboard.canvas.addEventListener('click', function (evt) {
        // trigger event, so if no game running it doesn't matter
        if (game.score) {
            _.trigger('dart:thrown', dartboard.findValue(evt.clientX, evt.clientY));
        }
    }, false);
} ());