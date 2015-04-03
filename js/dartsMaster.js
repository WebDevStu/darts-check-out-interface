/**
 * dartsMaster
 * basically a controller, all logic to be kept out of the global scope
 */
(function () {

    'use strict';

    // instantiate a new dartboard
    var dartboard = new LPD.DartBoard('dartBoard'),
        game = new LPD.Game(dartboard.labels);

    // highlight some stuff
    dartboard.canvas.addEventListener('mousemove', function (evt) {

        var value = dartboard.findValue(evt.clientX, evt.clientY, true);

        if (value) {
            dartboard.canvas.classList.add('pointer');
        } else {
            dartboard.canvas.classList.remove('pointer');
        }

        dartboard.drawBoard(value);
    }, false);

    // throw some darts
    dartboard.canvas.addEventListener('click', function (evt) {
        _.trigger('dart:thrown', dartboard.findValue(evt.clientX, evt.clientY));
    }, false);





    // info logger
    console.info(LPD, dartboard, game);
} ());