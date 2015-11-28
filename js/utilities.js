'use strict';

/**
 * utilities
 * wrapper for containing useful methods to save time later, also defines the
 * LPD global variable as a namespace for the app to run under
 */
var LPD = {},
    _ = {

        /**
         * $
         * retrieves elements in the dom, like a light weight jquery selector
         * engine takes an string and from the suffix `.` | `#` decides how to
         * select the element has internal caching
         *
         * @param id {string}
         * @returns {object}
         */
        $: function (id) {

            _.$.cache = _.$.cache || {};

            if (id.charAt(0) === '.') {
                _.$.cache[id] = _.$.cache[id] || document.querySelectorAll(id);

                if (_.$.cache[id].length === 1) {
                    _.$.cache[id] = _.$.cache[id][0];
                }
            } else {
                _.$.cache[id] = _.$.cache[id] || document.getElementById(id);
            }

            return _.$.cache[id];
        },


        /**
         * events object for storing subscribed methods
         */
        events: {},


        /**
         * listen
         *
         * @param listenId {String} identifier
         * @param callback {Function} callback method
         * @param scope {Object} !optional - the scope you want the callback to
         * be called upon
         */
        listen: function (listenId, callback, scope) {

            // if scope given store on callback method
            if (scope) {
                callback._scope = scope;
            }

            _.events[listenId] = _.events[listenId] || [];
            _.events[listenId].push(callback);
        },


        /**
         * trigger
         * trigger method for invoking any subscribed method within the events
         * object under the event listener trigger
         *
         * @param triggerId {string}
         */
        trigger: function (triggerId) {

            var events = _.events[triggerId],
                len = events.length,
                i,
                args = _.toArray(arguments).slice(1);

            for (i = 0; i < len; i += 1) {
                if (typeof events[i] === 'function') {

                    if (events[i]._scope) {
                        events[i].apply(events[i]._scope, args);
                    } else {
                        events[i].apply(this, args);
                    }
                }
            }
        },


        /**
         * extend
         * similar to underscore extend, simply copies the properties from a
         * second object to the first
         *
         * @param object {object}
         * @param extend {object}
         * @returns {object} the original object populated with the extend props
         */
        extend: function (object, extend) {

            var prop;

            for (prop in extend) {
                if (extend.hasOwnProperty(prop)) {
                    object[prop] = object[prop] || extend[prop];
                }
            }

            return object;
        },


        /**
         * between
         * shorthand method for evaluating a number is between two provided ints
         *
         * @param num {number}
         * @param first {number}
         * @param last {number}
         * @returns {boolean}
         */
        between: function (num, first, last) {
            return (num >= first && num <= last);
        },


        /**
         * isNumber
         * shorthand method for type of number
         *
         * @param number {*}
         * @returns {boolean}
         */
        isNumber: function (number) {
            return (typeof number === 'number');
        },


        /**
         * toArray
         * turns array-like objects into arrays i.e. arguments
         *
         * @param array {Object}
         * @returns {Array}
         */
        toArray: function (array) {
            return Array.prototype.slice.call(array);
        }
    };