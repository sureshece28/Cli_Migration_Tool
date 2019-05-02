/*
    json2.js
    2011-10-19

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    See http://www.JSON.org/js.html


    This code should be minified before deployment.
    See http://javascript.crockford.com/jsmin.html

    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    NOT CONTROL.


    This file creates a global JSON object containing two methods: stringify
    and parse.

        JSON.stringify(value, replacer, space)
            value       any JavaScript value, usually an object or array.

            replacer    an optional parameter that determines how object
                        values are stringified for objects. It can be a
                        function or an array of strings.

            space       an optional parameter that specifies the indentation
                        of nested structures. If it is omitted, the text will
                        be packed without extra whitespace. If it is a number,
                        it will specify the number of spaces to indent at each
                        level. If it is a string (such as '\t' or '&nbsp;'),
                        it contains the characters used to indent at each level.

            This method produces a JSON text from a JavaScript value.

            When an object value is found, if the object contains a toJSON
            method, its toJSON method will be called and the result will be
            stringified. A toJSON method does not serialize: it returns the
            value represented by the name/value pair that should be serialized,
            or undefined if nothing should be serialized. The toJSON method
            will be passed the key associated with the value, and this will be
            bound to the value

            For example, this would serialize Dates as ISO strings.

                Date.prototype.toJSON = function (key) {
                    function f(n) {
                        // Format integers to have at least two digits.
                        return n < 10 ? '0' + n : n;
                    }

                    return this.getUTCFullYear()   + '-' +
                         f(this.getUTCMonth() + 1) + '-' +
                         f(this.getUTCDate())      + 'T' +
                         f(this.getUTCHours())     + ':' +
                         f(this.getUTCMinutes())   + ':' +
                         f(this.getUTCSeconds())   + 'Z';
                };

            You can provide an optional replacer method. It will be passed the
            key and value of each member, with this bound to the containing
            object. The value that is returned from your method will be
            serialized. If your method returns undefined, then the member will
            be excluded from the serialization.

            If the replacer parameter is an array of strings, then it will be
            used to select the members to be serialized. It filters the results
            such that only members with keys listed in the replacer array are
            stringified.

            Values that do not have JSON representations, such as undefined or
            functions, will not be serialized. Such values in objects will be
            dropped; in arrays they will be replaced with null. You can use
            a replacer function to replace those with JSON values.
            JSON.stringify(undefined) returns undefined.

            The optional space parameter produces a stringification of the
            value that is filled with line breaks and indentation to make it
            easier to read.

            If the space parameter is a non-empty string, then that string will
            be used for indentation. If the space parameter is a number, then
            the indentation will be that many spaces.

            Example:

            text = JSON.stringify(['e', {pluribus: 'unum'}]);
            // text is '["e",{"pluribus":"unum"}]'


            text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
            // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

            text = JSON.stringify([new Date()], function (key, value) {
                return this[key] instanceof Date ?
                    'Date(' + this[key] + ')' : value;
            });
            // text is '["Date(---current time---)"]'


        JSON.parse(text, reviver)
            This method parses a JSON text to produce an object or array.
            It can throw a SyntaxError exception.

            The optional reviver parameter is a function that can filter and
            transform the results. It receives each of the keys and values,
            and its return value is used instead of the original value.
            If it returns what it received, then the structure is not modified.
            If it returns undefined then the member is deleted.

            Example:

            // Parse the text. Values that look like ISO date strings will
            // be converted to Date objects.

            myData = JSON.parse(text, function (key, value) {
                var a;
                if (typeof value === 'string') {
                    a =
/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
                    if (a) {
                        return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
                            +a[5], +a[6]));
                    }
                }
                return value;
            });

            myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
                var d;
                if (typeof value === 'string' &&
                        value.slice(0, 5) === 'Date(' &&
                        value.slice(-1) === ')') {
                    d = new Date(value.slice(5, -1));
                    if (d) {
                        return d;
                    }
                }
                return value;
            });


    This is a reference implementation. You are free to copy, modify, or
    redistribute.
*/

/*jslint evil: true, regexp: true */

/*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
    call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
    getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
    lastIndex, length, parse, prototype, push, replace, slice, stringify,
    test, toJSON, toString, valueOf
*/


// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.

var JSON;
if (!JSON) {
    JSON = {};
}

(function () {
    'use strict';

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function (key) {

            return isFinite(this.valueOf())
                ? this.getUTCFullYear()     + '-' +
                    f(this.getUTCMonth() + 1) + '-' +
                    f(this.getUTCDate())      + 'T' +
                    f(this.getUTCHours())     + ':' +
                    f(this.getUTCMinutes())   + ':' +
                    f(this.getUTCSeconds())   + 'Z'
                : null;
        };

        String.prototype.toJSON      =
            Number.prototype.toJSON  =
            Boolean.prototype.toJSON = function (key) {
                return this.valueOf();
            };
    }

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        rep;


    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        escapable.lastIndex = 0;
        return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
            var c = meta[a];
            return typeof c === 'string'
                ? c
                : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '"' : '"' + string + '"';
    }


    function str(key, holder) {

// Produce a string from holder[key].

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
        case 'string':
            return quote(value);

        case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

            return isFinite(value) ? String(value) : 'null';

        case 'boolean':
        case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

            return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

        case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

            if (!value) {
                return 'null';
            }

// Make an array to hold the partial results of stringifying this object value.

            gap += indent;
            partial = [];

// Is the value an array?

            if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                v = partial.length === 0
                    ? '[]'
                    : gap
                    ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']'
                    : '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }

// If the replacer is an array, use it to select the members to be stringified.

            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    if (typeof rep[i] === 'string') {
                        k = rep[i];
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            } else {

// Otherwise, iterate through all of the keys in the object.

                for (k in value) {
                    if (Object.prototype.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

            v = partial.length === 0
                ? '{}'
                : gap
                ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}'
                : '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                    typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

            return str('', {'': value});
        };
    }


// If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with '()' and 'new'
// because they can cause invocation, and '=' because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (/^[\],:{}\s]*$/
                    .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
                        .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                        .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = eval('(' + text + ')');

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function'
                    ? walk({'': j}, '')
                    : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };
    }
}());
(function (global) {
    /**
     * fruit util collection
     * @class fruit.util
     * @namespace fruit
     * @singleton
     */
    var rootName = "fruit" ,core , origCore = global[rootName];
     core = global[rootName] = {
        $:{},
        version:"0.2.1",
        global:global,
        $package:rootName,
        noConflict:function () {
        	global[rootName] = origCore;
            return core;
        },
        config:{
            debug:window.location.search.match('(\\?|&)debug') !== null
        }
    };
    var toString = Object.prototype.toString, slice = Array.prototype.slice;

    function isObject(obj) {
        return   typeof(obj) == 'object' && obj === Object(obj);
    }

    function isArray(obj) {
        return Array.isArray ? Array.isArray(obj) : toString.call(obj) === "[object Array]";
    }

    function _extend() {
        var args = arguments, count = args.length, target = args[0], i = 0 , source , key;
        //support extend self if only input one parameter
        if (count == 1) {
            target = this;
        }
        for (; i < count; i++) {
            source = args[i];
            if (target && (isObject(source) || isFunction(source))) {
                for (key in source) {
                    target[key] = source[key];
                }
            }
        }
        return target;
    }

    function _each(obj, fn, context) {
        var key, context = context || global;
        if (isArray(obj)) {
            var length = obj.length;
            for (key = 0; key < length; key++) {
                if (fn.call(context, obj[key], key) === false) {
                    break;
                }
            }
        } else {
            for (key in obj) {
                if (fn.call(context, obj[key], key) === false) {
                    break;
                }
            }
        }
    }

    core.util = {
        /**
         * extend a object
         * @param {Object} target
         * @param {Object} object (optional)
         * @param {Object} object (optional)
         * @param  ...
         Example usage:
         * <pre><code>
         var obj = fruit.util.extend({},{name:'table',width:100},{height:30});
         //obj = {name:'table',width:100,height:30}
         </code></pre>
         * @return {Object} target
         */
        extend:_extend,
        /**
         * Iterates an iterable value or an array and invoke the given callback function for each item
         * @param {Array/NodeList/Object} obj the value to be iterable
         * @param {Function} callback the callback function
         Example usage:
         <pre><code>
         var list = ['Dialog','Menu','Button']
         fruit.util.each(list,function(name, index){
                console.log(name);
          })
         //if  return false in the function callback, the iteration will be stopped.
         fruit.util.each(list,function(name, index){
               if(index>1){
                    return false // break here
               }
          })
         </code></pre>
         */
        each:_each,
        /**
         * Return true if the passed value is an Array.
         * @param {Object} obj the target to test
         * @return {Boolean}
         */
        isArray:isArray,
        /**
         * Return true if the passed value is Object.
         * @param {Object} obj the target to test
         * @return {Boolean}
         */
        isObject:isObject,
        /**
         * Return true if the passed value is undefined.
         * @param {Object} obj the target to test
         * @return {Boolean}
         */
        isUndef:function (obj) {
            return typeof (obj) === "undefined";
        },
        /**
         * Return true if the passed value is Null
         * @param {Object} obj the target to test
         * @return {Boolean}
         */
        isNull:function (obj) {
            return obj === null;
        },
        /**
         * Return true if the passed value is not undefined and Null.
         * @param {Object} obj the target to test
         * @return {Boolean}
         */
        isDefine:function (obj) {
            return !this.isUndef(obj) && !this.isNull(obj);
        },
        emptyFun:function () {
        }
    }
    /**
     * Return true if the passed value is Function
     * @method isFunction
     * @param {Object} obj the target to test
     * @return {Boolean}
     */
    /**
     * Return true if the passed value is String
     * @method isString
     * @param {Object} obj the target to test
     * @return {Boolean}
     */
    /**
     * Return true if the passed value is Boolean
     * @method isBoolean
     * @param {Object} obj the target to test
     * @return {Boolean}
     */
    /**
     * Return true if the passed value is Date
     * @method isDate
     * @param {Object} obj the target to test
     * @return {Boolean}
     */
    /**
     * Return true if the passed value is Number
     * @method isNumber
     * @param {Object} obj the target to test
     * @return {Boolean}
     */

    _each(['Function', 'String', 'Boolean', 'Date', 'Number'], function (name) {
        fruit.util['is' + name] = function (obj) {
            return toString.call(obj) === "[object " + name + "]";
        }
    })
    var util = fruit.util;
    util.createObject=  function (obj) {
        return Object.create ? Object.create(obj.prototype) : new obj
    }

    util.extendClass =function(constructor, parent, mark) {
        var prototype = function () {
        }, parentPrototype, clsPrototype;

        parentPrototype = parent.prototype;
        prototype.prototype = parentPrototype;
        clsPrototype = util.createObject(prototype);

        if (mark) {
            clsPrototype.$super = parentPrototype;
            clsPrototype.$fullname = mark.$fullname;
            clsPrototype.$namespace = mark.$namespace;
            clsPrototype.$name = mark.$name
        }
        constructor.prototype = clsPrototype;
        constructor.constructor = constructor;
        return constructor;
    }
    isFunction = fruit.util.isFunction;
})(window);
/**
 * @class fruit.util.logger
 * @namespace fruit.util
 */
(function (fruit, util) {
    /**
     * Log warning infomation
     * @method warn
     * @param {String} info
     */

    /**
     *  Log common infomation
     * @method info
     * @param {String} info
     */

    /**
     * Log error information
     * @method error
     * @param {String} info
     */

    /**
     *  Log debug information
     * @method debug
     * @param {String} info
     */

    var writer, slice = Array.prototype.slice, ie = eval("''+/*@cc_on" + " @_jscript_version@*/-0");
    var Logger = util.logger = {
        setLogger:function (fn) {
            if (!util.isFunction(fn)) {
                return;
            }
            writer = fn;
        }
    };
    writer = function (type) {
        var args = slice.call(arguments[1], 0);
        //printStackTrace()
        if (ie) {
            type = 'info';
        }
        if (typeof console == "object" && util.isFunction(console[type])) {
            console[type].apply(console, args);
        }
    }
    var getFnName = function (callee) {
        var _callee = callee.toString().replace(/[\s\?]*/g, ""), comb = _callee.length >= 50 ? 50 : _callee.length;
        _callee = _callee.substring(0, comb);
        var name = _callee.match(/^function([^\(]+?)\(/);
        if (name && name[1]) {
            return name[1];
        }
        if (callee.caller) {
            var caller = callee.caller, _caller = caller.toString().replace(/[\s\?]*/g, "");
            var last = _caller.indexOf(_callee), str = _caller.substring(last - 30, last);
            name = str.match(/var([^\=]+?)\=/);
            if (name && name[1]) {
                return name[1];
            }
        }
        return '';
    };
    var debugPool = {};
    util.each(['warn', 'info', 'error', 'debug', 'log'], function (type) {
        Logger[type] = function (info) {
            var level = fruit.config.debug;
            //1 - normal
            if (this.$name) {
                level = debugPool[this.$fullname] || level;
            }
            if (type != 'error' && type != 'warn' && !level) {
                return;
            }
            if (util.isString(info) && info.indexOf("{0}") >= 0) {
                var args = slice.call(arguments, 1);
                info = fruit.util.format(info, args);
                args = [info];
            } else {
                var args = slice.call(arguments, 0);
            }
            var fn = arguments.callee.caller, clsName = '' , methodName = '';
            if (this.$fullname) {
                clsName = this.$fullname
            }
            if (fn && fn.$name) {
                if (!clsName && fn.$owner) {
                    clsName = fn.$owner.prototype.$fullname;
                }
                methodName = fn.$name;
            } else {
                methodName = getFnName(arguments.callee);
            }
            method = ( clsName ? clsName + '->' : '') + (methodName ? methodName + ': ' : '  ');
            if (method) {
                info = method + info;
            }
            args[0] = info;
            writer.call(fruit.log, type, args);
        }
    });
    Logger.listen = function (name) {
        util.each(arguments, function (name) {
            debugPool[name] = 1;
        })
    }
    fruit.global.logger = Logger;
})(fruit, fruit.util);
/**
 * fruit util collection
 * @ignore
 * @class fruit.util
 */
(function (fruit, doc, util) {
    var string = {
        /**
         * trim string.
         * @param {String} sourceStr source string
         * @return {String} trimed string
         */
        trim:(function () {
            trim = String.prototype.trim, rnotwhite = /\S/, trimLeft = /^\s+/, trimRight = /\s+$/;
            // IE doesn't match non-breaking spaces with \s
            if (rnotwhite.test("\xA0")) {
                trimLeft = /^[\s\xA0]+/;
                trimRight = /[\s\xA0]+$/;
            }
            return trim ? function (text) {
                return util.isDefine(text) ? trim.call(text) : "";
            } : function (text) {
                return util.isDefine(text) ? text.toString().replace(trimLeft, "").replace(trimRight, "") : "";
            }
        })(),

        /**
         * camelize string.
         * @param {String} sourceStr source string
         * @return {String} camelized string
         */
        camelize:function (s) {
            return s.replace(/\-(\w)/ig, function (a, b) {
                return b.toUpperCase();
            });
        },

        /**
         * decamelize string.
         * @param {String} sourceStr source string
         * @return {String} decamelized string
         */
        decamelize:function (s) {
            return s.replace(/[A-Z]/g, function (a) {
                return "-" + a.toLowerCase();
            });
        },

        /**
         * upper first char.
         * @param {String} sourceStr source string
         * @return {String} result string
         */
        upperFirstChar:function (inStr) {
            return inStr.replace(/\b[a-z]/g, function ($1) {
                return $1.toLocaleUpperCase();
            });
        },
        /**
         * Allows you to define a tokenized string and pass an arbitrary number of arguments to replace the tokens.  Each
         * token must be unique, and must increment in the format {0}, {1}, etc.  Example usage:
         * <pre><code>
         var cls = 'my-class', text = 'Some text';
         var s = fruit.util.format('&lt;div class="{0}">{1}&lt;/div>', cls, text);
         // s now contains the string: '&lt;div class="my-class">Some text&lt;/div>'
         * </code></pre>
         * @param {String} string The tokenized string to be formatted
         * @param {String} value1 The value to replace token {0}
         * @param {String} value2 Etc...
         * @return {String} The formatted string
         * @static
         */
        format:function (s, d) {
            var args;
            if (arguments.length == 2 && util.isArray(arguments[1])) {
                args = arguments[1];
            }
            else {
                args = Array.prototype.slice.call(arguments, 1);
            }
            return s.replace(/\{(\d+)\}/g, function (m, i) {
                return args[i];
            });
        },
        /**
         * Converts the first character only of a string to upper case
         * @param {String} v The text to convert
         * @return {String} The converted text
         */
        capitalize : function(v) {
            return !v ? v : v.charAt(0).toUpperCase() + v.substr(1).toLowerCase();
        },
        /**
         * Convert  characters (&, <, >, and ') to HTML character equivalents .
         * @param {String} v The string to encode
         * @return {String} The encoded text
         */
        htmlEncode : function(v) {
            return !v ? v : String(v).replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/'/g, "&#39;").replace(/"/g, "&quot;");
        },
        /**
         * Convert characters (&, <, >, and ') from  HTML character equivalents.
         * @param {String} v The string to decode
         * @return {String} The decoded text
         */
        htmlDecode : function(v) {
            return !v ? v : String(v).replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&");
        },
        /**
         * encodes a URI component.This function encodes special characters. In addition, it encodes the following characters: , / ? : @ & = + $ #
         * @param {String} v
         */
        urlEncode : function(v) {
            return encodeURIComponent(v);
        },
        /**
         * decodes a URI component
         * @param {String} v
         */
        urlDecode : function(v) {
            return decodeURIComponent(v);
        }
    };
    util.extend(util,string);
})(fruit, document, fruit.util);
(function (fruit, util) {
    /**
     * fruit util collection
     * @ignore
     * @class fruit.util
     */
    var array = {
        /**
         * Get the index of the provided item in the array.
         * @param {Array} obj the Array to check
         * @param {Object} val the item
         * @return {Number} The index of item in the array (not found return -1)
         */
        indexOf:function (arr, val) {
            var i, index = -1;
            if (arr.indexOf) {
                return arr.indexOf(val);
            }
            if (util.isUndef(val)) {
                return index;
            }
            for (i = 0; i < arr.length; i++) {
                if (arr[i] === val) {
                    index = i;
                    break;
                }
            }
            return index;
        },
        /**
         * TODO:
         * Remove the duplication element from array
         * @param inArray
         * @return {Array}
         */
        arrayUniq:function (inArray) {
            for (var i = 0; i < inArray.length; i++) {
                for (var j = i + 1; j < inArray.length; j++) {
                    if (inArray[i] === inArray[j]) {
                        inArray.splice(j, 1);
                        j--;
                    }
                }
            }
            return inArray;
        },
        /**
         * Delete an element from an array.
         * @param inEl
         * @param inArray
         * @return {Array}
         */
        delFromArray:function (inEl, inArray) {
            var len = inArray.length;
            var tmp = this.clone(inArray);
            while (len--) {
                //TODO:bug for object el
                if (inEl == tmp[len]) {
                    tmp.splice(len, 1);
                }
            }
            return tmp;
        },
        /**
         * Clone a object or an array
         * @param inObj
         * @return {Array}
         */
        clone:function (inObj) {
            var obj = this.isArray(inObj) ? [] : {}, value;
            for (var name in inObj) {
                value = inObj[name];
                if (typeof value == 'object' && value != null) {
                    obj[name] = this.clone(value);
                } else {
                    obj[name] = value;
                }
            }
            return obj;
        }
    }
    util.extend(util,array);

})(fruit, fruit.util);
(function (fruit, util) {
    /**
     * fruit util collection
     * @ignore
     * @class fruit.util
     */
    var  toString = Object.prototype.toString;
    var lang  = {
        /**
         * get the object type
         * @param {Mixture} obj
         * @return {String}
         */
        getType:function (obj) {
           
            // toString always return "Object" however the Object is null or Undefined
            if (obj === null) {
                return 'Null';
            }
            if (obj === undefined) {
                return 'Undefined';
            }           
            var type = toString.call(obj);
            return type.substr(8, type.length - 9);
        },
        /**
         * Return true if the value is empty,arguments type is null/undefined/[]/""
         * @param {Mixture} value
         * @return {Boolean|*|Boolean}
         */
        isEmpty:function (value) {
            return (value === null) || (value === undefined) || (value === '') || (fruit.util.isArray(value) && value.length === 0);
        },
        /**
         * Get a object keys array
         * @param inObj
         * @return {Array}
         */
        getObjectKeys:function (inObj) {
            var ret = [];
            for (var key in inObj) {
                if (inObj.hasOwnProperty(key)) {
                    ret.push(key);
                }
            }
            return ret;
        },
        /**
         * Get a object value array
         * @param inObj
         * @return {Array}
         */
        getObjectVals:function (inObj) {
            var ret = [];
            for (var key in inObj) {
                if (inObj.hasOwnProperty(key)) {
                    ret.push(inObj[key]);
                }
            }
            return ret;
        },
        /**
         * Convert a value to an int
         * @param inObj
         * @return {Number}
         */
        toInt:function (inObj) {
            return parseInt(inObj, 10);
        },
        /**
         * Convert a value to float
         * @param inObj
         * @return {Number}
         */
        toFloat:function (inObj) {
            return parseFloat(inObj);
        },
        /**
         * If the value is an float number
         * @param inObj
         * @return {Boolean}
         */
        isNumeric:function (inObj) {
            return !isNaN(parseFloat(inObj)) && isFinite(inObj);
        },

        /**
         * If the object is empty.
         * @param obj
         * @return {Boolean}
         */
        isEmptyObject:function (obj) {
            var name;
            for (name in obj) {
                return false;
            }
            return true;
        },


        /**
         * Mixin
         * @param inObj1
         * @param inObj2
         * @param isClone
         * @return {*|Object}
         */
        mixin:function (inObj1, inObj2, isClone) {
            var obj1 = inObj1 || {}, obj2 = inObj2 || {};
            if (isClone) {
                obj1 = this.clone(obj1);
                obj2 = this.clone(obj2);
            }
            for (var name in obj2) {
                obj1[name] = obj2[name];
            }
            return obj1;
        },
        /**
         * Merge
         * @param inObj1
         * @param inObj2
         * @param isClone
         * @return {*|Object}
         */
        merge:function (inObj1, inObj2, isClone) {
            var obj1 = inObj1 || {}, obj2 = inObj2 || {};
            if (isClone) {
                obj1 = this.clone(obj1);
                obj2 = this.clone(obj2);
            }
            for (var name in obj2) {
                if (typeof obj1[name] == 'undefined') {
                    obj1[name] = obj2[name];
                }
            }
            return obj1;
        }
    };
    util.extend(util,lang);
})(fruit, fruit.util);
(function (fruit, util) {
    /**
     * fruit util collection
     * @ignore
     * @class fruit.util
     */
    var ua = window.navigator.userAgent;
    function getName(s, abbr) {
        var nameMap = {
            MSIE:'IE',
            AppleWebKit:'WebKit',
            Firefox:'FF'
        };
        if (!util.isDefine(s)) {
            return '';
        }
        var name = util.trim(s.replace('/', ''));
        if (abbr) {
            name = nameMap[name] || name;
        }
        return name;
    }

    function getVersion(s) {
        if (!util.isDefine(s)) {
            return 0;
        }
        if (s.indexOf('.') > 0) {
            s = s.split('.');
            return Number(s[0])
        } else {
            return parseInt(s, 10);
        }
    }

    /**
     * True if the detected browser is Internet Explorer.
     * @type {Boolean}
     * @property isIE
     */
    /**
     * True if the detected browser is Internet Explorer 6.x.
     * @type {Boolean}
     * @property isIE6
     */
    /**
     * True if the detected browser is Internet Explorer 7.x.
     * @type {Boolean}
     * @property isIE7
     */
    /**
     * True if the detected browser is Internet Explorer 8.x.
     * @type {Boolean}
     * @property isIE8
     */
    /**
     * True if the detected browser is Internet Explorer 9.x.
     * @type {Boolean}
     * @property isIE9
     */
    /**
     * True if the detected browser is Internet Explorer 10.x.
     * @type {Boolean}
     * @property isIE10
     */
    /**
     * True if the detected browser is Firefox.
     * @type {Boolean}
     * @property isFF
     */
    /**
     * True if the detected browser is Firefox 3.x.
     * @type {Boolean}
     * @property isFF3
     */
    /**
     * True if the detected browser is Firefox 4.x.
     * @type {Boolean}
     * @property isFF4
     */
    /**
     * True if the detected browser is Firefox5.x.
     * @type {Boolean}
     * @property isFF5
     */
    /**
     * True if the detected browser is Firefox 8.x.
     * @type {Boolean}
     * @property isFF8
     */
    /**
     * True if the detected browser is Chrome.
     * you also can use isChrome10~ isChrome19
     * @type {Boolean}
     * @property isChrome
     */

    /**
     * True if the detected browser is Safari .
     * you also can use isSafari3~ isSafari5
     * @type {Boolean}
     * @property isSafari
     */

    /**
     * True if the detected browser is Opera .
     * you also can use isOpera5~ isOpera10
     * @type {Boolean}
     * @property isOpera
     */

    /**
     * True if the detected browser engine is WebKit.
     * @type {Boolean}
     * @property isWebKit
     */
    /**
     * True if the detected browser engine is Gecko.
     * @type {Boolean}
     * @property isGecko
     */
    /**
     * True if the detected browser engine is Presto.
     * @type {Boolean}
     * @property isPresto
     */
    /**
     * True if the detected browser engine is Trident.
     * @type {Boolean}
     * @property isTrident
     */
    /**
     * the browser name ,value should be Firefox, MSIE, Safari, Chrome or Opera
     * @type {String}
     * @property browserName
     */
    /**
     * the browser version
     * @type {Number}
     * @property browserVersion
     */
    /**
     * the browser engine version
     * @type {Number}
     * @property engineVersion
     */
    /**
     * the browser engine name ,value should be Webkit, Gecko, Presto or Trident
     * @type {String}
     * @property engineName
     */
    function detectBrowser(ua) {
        var expr_browser = ['MSIE ', 'Firefox/', 'Chrome/', 'Opera/', 'Safari/'], expr_engine = ['AppleWebKit/', 'Gecko/', 'Presto/', 'Trident/'];
        var result = ua.match(new RegExp('((?:' + expr_browser.join(')|(?:') + '))([\\d\\._]+)')), name, env = {};

        if (result && result.length == 3) {
            name = getName(result[1], true);
            env.browserName = getName(result[1], true);
            env['is' + name] = true;
            if (name == 'Safari') {
                result = ua.match(/(Version)[ \/]([\w.]+)/);
            }
            env.browserVersion = getVersion(result[2]);
        } else {
            env.isOtherBrowser = true;
            env.browserVersion = 0;
        }
        result = ua.match(new RegExp('((?:' + expr_engine.join(')|(?:') + '))([\\d\\._]+)'));
        if (result && result.length) {
            name = getName(result[1], true);
            env.engineName = name;
            env['is' + name] = true;
            env.engineVersion = getVersion(result[2]);
        }
        return env;
    }
	util.detectBrowser = detectBrowser;
    util.extend(util,detectBrowser(ua));
    util['is' + util.browserName + util.browserVersion] = true;


})(fruit, fruit.util);
(function (fruit, util) {
    /**
     * fruit util collection
     * @ignore
     * @class fruit.util
     */
    var nav = window.navigator, ua = nav.userAgent, pf = nav.platform, result,
        expr_pf = ['Win', 'Android', 'iPhone', 'iPad', 'iPod', 'Linux', 'X11', 'Mac','BlackBerry','MacIntel'],
        expr_pc = /Win|Linux|Unix|Mac|MacIntel/, nameMap = {
            X11 : 'Unix'
        };
    function detectOS(pf) {
        var result = pf.match(new RegExp('((?:' + expr_pf.join(')|(?:') + '))|([\\d\\._]+)')), name, env = {};
        if(result) {
            name = nameMap[result[1]] || result[1];
        }
        if(!name) {
            name = 'Other';
        }
        env.OSName = name;
        if(name.substr(0,1)=='i'){
            env[name] = true;
        }else{
            env['is' + name] = true;
        }
        if(expr_pc.test(name) && !env.isAndroid) {
            env['isDesktop'] = true;
        } else {
            env['isMobile'] = true;
        }
        env.OSVersion = parseInt(navigator.appVersion.split(' ')[0],10);
        //env['isPhone'] = !env.isDesktop && !env.isTablet;
        return env;
    }
	util.detectOS = detectOS;
    util.extend(util,detectOS(pf));

    /**
     * True if the detected user os is Windows.
     * @type {Boolean}
     * @property isWin
     */
    /**
     * True if the detected user os is Linux.
     * @type {Boolean}
     * @property isLinux
     */
    /**
     * True if the detected user os is Unix.
     * @type {Boolean}
     * @property isUnix
     */
    /**
     * True if the detected user os is Mac.
     * @type {Boolean}
     * @property isMac
     */
    /**
     * True if the detected user os is iPod.
     * @type {Boolean}
     * @property iPod
     */

    /**
     * True if the detected user os is iPhone.
     * @type {Boolean}
     * @property iPhone
     */
    /**
     * True if the detected user os is iPad.
     * @type {Boolean}
     * @property iPad
     */
    /**
     * True if the detected user os is Android.
     * @type {Boolean}
     * @property isAndroid
     */
    /**
     * True if the detected user os is BlackBerry.
     * @type {Boolean}
     * @property isBlackBerry
     */
    /**
     * True if the detected user is Desktop platform .
     * @type {Boolean}
     * @property isDesktop
     */
    /**
     * True if the detected user is Mobile platform .
     * @type {Boolean}
     * @property isMobile
     */
    /**
     * the user os name
     * @type {String}
     * @property OSName
     */
    /**
     * the user os version
     * @type {Number}
     * @property OSVersion
     */

})(fruit, fruit.util);
/**
 * fruit util collection
 * @ignore
 * @class fruit.util
 */
(function (fruit, util) {
    //[TODO] i18n
    var dateLabelNames = {
        dayNames:[
            "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
            "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
        ],
        monthNames:[
            "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
            "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
        ]
    };
    var dateObj = {
        formatDate:function () {
            var token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
                timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
                timezoneClip = /[^-+\dA-Z]/g,
                pad = function (val, len) {
                    val = val;
                    len = len || 2;
                    while (val.length < len) val = "0" + val;
                    return val;
                };

            return function (date, mask, utc) {
                var dF = this.formatDate;

                // You can't provide utc if you skip other args (use the "UTC:" mask prefix)
                if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
                    mask = date;
                    date = undefined;
                }

                // Passing date through Date applies Date.parse, if necessary
                date = date ? new Date(date) : new Date;

                if (!date) {
                    throw "invalid date";
                }

                mask = this.dateMasks[mask] || mask || this.dateMasks["default"];

                // Allow setting the utc argument via the mask
                if (mask.slice(0, 4) == "UTC:") {
                    mask = mask.slice(4);
                    utc = true;
                }

                var _ = utc ? "getUTC" : "get",
                    d = date[_ + "Date"](),
                    D = date[_ + "Day"](),
                    m = date[_ + "Month"](),
                    y = date[_ + "FullYear"](),
                    H = date[_ + "Hours"](),
                    M = date[_ + "Minutes"](),
                    s = date[_ + "Seconds"](),
                    L = date[_ + "Milliseconds"](),
                    o = utc ? 0 : date.getTimezoneOffset(),
                    flags = {
                        d:d,
                        dd:pad(d),
                        ddd:dateLabelNames.dayNames[D],
                        dddd:dateLabelNames.dayNames[D + 7],
                        m:m + 1,
                        mm:pad(m + 1),
                        mmm:dateLabelNames.monthNames[m],
                        mmmm:dateLabelNames.monthNames[m + 12],
                        yy:String(y).slice(2),
                        yyyy:y,
                        h:H % 12 || 12,
                        hh:pad(H % 12 || 12),
                        H:H,
                        HH:pad(H),
                        M:M,
                        MM:pad(M),
                        s:s,
                        ss:pad(s),
                        l:pad(L, 3),
                        L:pad(L > 99 ? Math.round(L / 10) : L),
                        t:H < 12 ? "a" : "p",
                        tt:H < 12 ? "am" : "pm",
                        T:H < 12 ? "A" : "P",
                        TT:H < 12 ? "AM" : "PM",
                        Z:utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
                        o:(o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
                        S:["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
                    };

                return mask.replace(token, function ($0) {
                    return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
                });
            };
        }(),
        dateMasks:{
            "default":"ddd mmm dd yyyy HH:MM:ss",
            shortDate:"m/d/yy",
            mediumDate:"mmm d, yyyy",
            longDate:"mmmm d, yyyy",
            fullDate:"dddd, mmmm d, yyyy",
            shortTime:"h:MM TT",
            mediumTime:"h:MM:ss TT",
            longTime:"h:MM:ss TT Z",
            isoDate:"yyyy-mm-dd",
            isoTime:"HH:MM:ss",
            isoDateTime:"yyyy-mm-dd'T'HH:MM:ss",
            isoUtcDateTime:"UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
        },
        newDate:function (inDateString) {
            if (inDateString) {
                if (util.isIE) {
                    var date = new Date();
                    var dataAry = inDateString.split("-");
                    date.setUTCFullYear(dataAry[0], dataAry[1] - 1, dataAry[2]);
                    date.setUTCHours(0, 0, 0);
                } else {
                    var date = new Date(inDateString);
                }
            } else {
                var date = new Date();
            }
            return date;
        },
        getDayNames:function (type) {
            if (type == "ddd") {
                return dateLabelNames.dayNames.slice(0, 7);
            } else {
                return dateLabelNames.dayNames.slice(7)
            }
        }
    };
    util.extend(util, dateObj);
})(fruit, fruit.util);
(function (fruit, util) {
    /**
     * fruit util collection
     * @ignore
     * @class fruit.util
     */
    func = {
        /**
         * Creates an interceptor function. The passed function will called before the original one
         * @param {Function} origFn
         * @param {Function} newFn
         * @param {Object} scope
         * @return {Function}
         */
        intercept:function (origFn, newFn, scope, returnValue) {
            if (!util.isFunction(newFn)) {
                return origFn;
            } else {
                return function (arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10) {
                    var me = this;
                    newFn.target = me;
                    newFn.method = origFn;
                    return (newFn.call(scope || me || window, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10) !== false) ? origFn.call(me || window, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10) : returnValue || null;
                };
            }
        },
        /**
         * Create a new function from the provided function, change the "this" object to the provided scope
         * @param {Function} fn
         * @param {Object} scope
         * @return {Function}
         */
        bind:function (fn, scope) {
            if (util.isString(fn)) {
                fn = scope[fn];
            }
            return fn.bind ? fn.bind(scope) : function () {
                return fn.apply(scope, arguments);
            }
        },
        /**
         *
         * @param obj
         * @return {*}
         */
        objectCreate:function (obj) {
            return Object.create ? Object.create(obj.prototype) : new obj
        },
        /**
         *
         * @param callback
         * @param context
         */
        defer:function (callback, context) {
            var timeoutID = window.setTimeout(function () {
                callback.call(context || this);
            }, 0);
            return timeoutID;
        },
        /**
         *
         * @param inSecond
         * @param callback
         * @param context
         */
        delay:function (inSecond, callback, context) {
            var timeoutID = window.setTimeout(function () {
                callback.call(context || this);
            }, inSecond * 1000);
            return timeoutID;
        }
    };
    util.extend(util, func);
})(fruit, fruit.util);
(function (fruit, util) {
    /**
     * @class fruit.util.i18n
     * @namespace fruit.util
     */
    var _localLang = "en_US", _langResource = {}, slice = Array.prototype.slice;

    var i18n = util.i18n = {

        /**
         * get the language resource
         * @param {String} key the language resource key
         * Example usage:
         * <pre><code>
         //at first you need set language resource
         fruit.i18n.add('en_US',{'system.dialog.title':'Information'});
         //you can get the lang in your code by below code
         WWF.lang("system.dialog.title")
         //use variable in language
         fruit.i18n.add('en_US',{'system.dialog.info':'Please Input {0} and {1}.'});
         //you can get the lang by
         Fruit.i18n.get("system.dialog.info","username","password");
         // it will return "Please Input username and password."
         *</code></pre>
         */
        get:function (key) {
            var s, args = slice.call(arguments, 1), lang = fruit.config.lang || _localLang;
            args.unshift(lang, key);
            return this.getByLang.apply(this, args);
        },
        /**
         * get by language
         * @param {String} lang
         * @param {String} key
         * @return {String}
         */
        getByLang:function (lang, key) {
            var s, args = slice.call(arguments, 2);

            if (_langResource[lang]) {
                s = _langResource[lang][key];
            }
            if (!s) {
                util.logger.log(fruit.util.format("not define language variable of [{0}] in {1}", key, lang));
                return "";
            }
            if (args.length == 0) {

                return s;
            } else {
                return fruit.util.format(s, args);
            }
        },
        /**
         * set the current language
         * @param {Object} lang
         * the language key values are us_EN , zh_CN, zn_TW etc.. (default is us_EN)
         * Example usage:
         * <pre><code>
         fruit.i18n.setLang('us_EN');
         *</code></pre>
         */
        setLang:function (lang) {
            _localLang = lang;
        },
        /**
         * add language resource
         * @param {String} lang language name
         * @param {String} module module name ()
         * @param {Object} res language resource
         * Example usage:
         * <pre><code>
         fruit.i18n.add('en_US',{'system.dialog.title':'Information'});
         //or
         fruit.i18n.add('en_US','system',{'dialog.title':'Information',
		 'error.info':'please enter the password'
		 });
         // the second parameter is module , It will serve as key prefix.
         //after set you can get by below code
         fruit.i18n.get('system.dialog.title');
         *</code></pre>
         */
        add:function (lang) {
            var k;
            if (!_langResource[lang]) {
                _langResource[lang] = {};
            }
            var module, data;
            if (arguments.length == 2) {
                data = arguments[1];
                for (k in data) {
                    _langResource[lang][k] = data[k];
                }
            }
            if (arguments.length == 3) {
                module = $.trim(arguments[1]);
                data = arguments[2];
                if (fruit.util.isString(data)) {
                    _langResource[lang][module] = $.trim(data);
                } else {
                    for (k in data) {
                        _langResource[lang][module + "." + k] = data[k];
                    }
                }
            } else {
                $.extend(_langResource[lang], arguments[1]);
            }
        }
    };
})(fruit, fruit.util);
/**
 * fruit util collection
 * @ignore
 * @class fruit.util
 */
(function (fruit, util) {
    var urlObj = {
        /**
         * Browser url
         * @return {String}
         */
        getURL:function(){
            return window.location.href;
        },
        /**
         * Get url params
         * @param {String} url
         *
         * @return {Object}
         */
         getURLParams:function (url) {
            var params = {},
                string,
                i = 0,
                j = 0,
                key = [],
                val = [],
                url = url || this.getURLHash();

            if (/\?/.test(url)) {
                string = url.split('?').slice(1);
                string = string.join('').split(/[&=]/ig);
                for (; i < string.length; i++) {
                    if (i % 2 === 0) {
                        key.push(string[i]);
                    } else {
                        val.push(string[i]);
                    }
                }

                for (; j < key.length; j++) {
                    params[key[j]] = val[j];
                }
            }
            return params;
        },
        /* Get url hash
         *
         * @param {String} url
         *
         * @return {String}
         */
        getURLHash:function (urlstring) {

            urlstring = urlstring || this.getURL();
            if (/\#/.test(urlstring)) {
                urlstring = urlstring.split('#').slice(1).join('');
            }
            else {
                urlstring = "";
            }
            return urlstring;
        },
        /**
         * Get url param for name.
         * @param {Object} name
         * @param {String} url
         *
         * @return {String}
         */
        getURLParam:function (name, url) {
            var params = this.getURLParams(url);

            return params[name];
        },
        /**
         *Get base url
         *
         * @param {object} urlstring
         *
         * @return {string}
         */
        baseURL:function (urlstring) {
            urlstring = urlstring || this.getURL();
            if (/#/.test(urlstring)) {
                urlstring = urlstring.substr(0, urlstring.indexOf('#'));
            }
            if (/\/$/.test(urlstring)) {
                urlstring = urlstring.substr(0, urlstring.length - 1);
            }
            return urlstring;
        },
        /*
         * Get url string with param
         *
         * @param {Object} param
         * @param {String} url
         *
         * @return {String}
         */
        generateURLString:function (param, url) {
            var
                hashUrl = this.getURLHash(url),
                key,
                urlString,
                urlArr = [];

            for (key in param) {
                urlArr.push(key + '=' + param[key]);
            }

            if (urlArr.length === 0) {
                return hashUrl;
            }

            //check url has "?"
            if (/\?/.test(hashUrl)) {
                urlString = hashUrl + '&' + urlArr.join('&');
            }
            else {
                urlString = hashUrl + '?' + urlArr.join('&');
            }

            return urlString;
        }
    };
    util.extend(util,urlObj);
})(fruit, fruit.util);
(function (fruit, util) {
   util.keys = {
        // summary:
        //		Definitions for common key values
        BACKSPACE:8,
        TAB:9,
        CLEAR:12,
        ENTER:13,
        SHIFT:16,
        CTRL:17,
        ALT:18,
        META:util.isWebKit ? 91 : 224, // the apple key on macs
        PAUSE:19,
        CAPS_LOCK:20,
        ESCAPE:27,
        SPACE:32,
        PAGE_UP:33,
        PAGE_DOWN:34,
        END:35,
        HOME:36,
        LEFT_ARROW:37,
        UP_ARROW:38,
        RIGHT_ARROW:39,
        DOWN_ARROW:40,
        INSERT:45,
        DELETE:46,
        HELP:47,
        LEFT_WINDOW:91,
        RIGHT_WINDOW:92,
        SELECT:93,
        NUMPAD_0:96,
        NUMPAD_1:97,
        NUMPAD_2:98,
        NUMPAD_3:99,
        NUMPAD_4:100,
        NUMPAD_5:101,
        NUMPAD_6:102,
        NUMPAD_7:103,
        NUMPAD_8:104,
        NUMPAD_9:105,
        NUMPAD_MULTIPLY:106,
        NUMPAD_PLUS:107,
        NUMPAD_ENTER:108,
        NUMPAD_MINUS:109,
        NUMPAD_PERIOD:110,
        NUMPAD_DIVIDE:111,
        F1:112,
        F2:113,
        F3:114,
        F4:115,
        F5:116,
        F6:117,
        F7:118,
        F8:119,
        F9:120,
        F10:121,
        F11:122,
        F12:123,
        F13:124,
        F14:125,
        F15:126,
        NUM_LOCK:144,
        SCROLL_LOCK:145
    };
})(fruit, fruit.util);
(function (fruit, util) {

    var cssObj = {
        /**
         *
         * fruit.util.createCSS({".txt":{"colore":"#fff"}})
         * @param inName
         * @param inCSSObj
         */
        createCSS:function (inName,inCSSObj) {
            var cssText = JSON.stringify(inCSSObj);
            var styleEl = document.createElement("style");
            styleEl.setAttribute("type", "text/css");
            document.head.appendChild(styleEl);
            if (styleEl.styleSheet && styleEl.styleSheet.cssText) {
                styleEl.styleSheet.cssText += cssText;
            } else {
                styleEl.appendChild(document.createTextNode(cssText));
            }
        }
    }

    util.extend(util, cssObj);

})(fruit, fruit.util);


(function (fruit, util, global) {

    /**
     * create a namespace
     * @method ns
     * @param packageName
     * sample code
     <pre><code>
     fruit.ns('common.meeting').extend({
        schedule:function(){
        // do something
        }
     })
     //use
     common.meeting.schedule();
     </code></pre>
     * @return {Object}
     */
    var onReadFn = [];
    fruit.ns = function (packageName) {
        if (arguments.length > 1 && !util.isUndef(arguments[1]) && arguments[1] !== true) {
            util.each(arguments, function (packageName) {
                fruit.ns(packageName);
            });
        }
        var names = packageName.split('.'),
            _rootName = names.shift(),
            pack = global[_rootName] , parentPackageName, onlyGet = arguments[1];

        if (!pack) {
            if (onlyGet) {
                return null;
            } else {
                pack = global[_rootName] = {$package:_rootName, extend:util.extend};
            }
        }
        util.each(names, function (name) {
            if (onlyGet && !pack[name]) {
                pack = null;
                return false;
            }
            parentPackageName = pack.$package;
            pack = pack[name] = pack[name] || {
                $package:parentPackageName + '.' + name,
                extend:util.extend
            };
        });
        return pack;
    }

    util.extend(fruit, {
        ready:function (fn) {
            if (onReadFn) {
                onReadFn.push(fn);
            } else {
                fn.call(fruit.global);
            }
        },
        execReadyFn:function () {
            util.each(onReadFn, function (fn) {
                fn();
            }, this);
            onReadFn = null;
        }
    });
})(fruit, fruit.util, window);
(function () {
    var util = fruit.util , isUndef = util.isUndef, isFunction = util.isFunction, defaultID = 'defaultValue';


    var mirrorPool = {};
    window.mirrorPool = mirrorPool;
    function Mirror() {
    }

    Mirror.get = function (name, id) {
        var entity = id ? this.instance : this.prototype;
        if (!entity) {
            logger.error('need parameter of id.');
            return null;
        }
        if (id) {
            entity = entity[name];
            if(entity){
                return entity.map[id] || entity[defaultID];
            }
        } else {
            return entity[name].defaultValue;
        }
    }
    Mirror.set = function (name, value, id) {
        if (isUndef(value)) {
            return;
        }
        var entity = id ? this.instance : this.prototype;
        if (!entity) {
            logger.error('need parameter of id.');
            return null;
        }
        if (id) {
                entity = entity[name];
            if(entity){
                entity.map[id] = value;
            }
        } else {
            entity[name] = {
                defaultValue:value,
                map:[]
            };
        }
    }
    Mirror.filter = function (fn, id) {
        var entity = id ? this.instance : this.prototype;
        if (!entity) {
            logger.error('need parameter of id.');
            return null;
        }
        var obj = {}, value;
        util.each(entity, function (val, key) {
            value = val.map[id] || val[defaultID];
            if (!isFunction(value) && fn(value, key)) {
                obj[key] = value;
            }
        });
        return obj;
    }
    fruit.ns('fruit.manager');
    var MirrorManager = fruit.manager.MirrorManager = function () {

    }
    MirrorManager.create = function (name, extend) {
        var parent = this.get(extend);
        if (!parent) {
            parent = Mirror;
        }
        var cls = util.extendClass(function () {}, parent);

        util.extend(cls, Mirror);
        cls.$name = name;

        mirrorPool[name] = cls;
        return cls;
    }
    MirrorManager.get = function (obj) {
        if(!obj){
            return null;
        }
        if (util.isString(obj)) {
            return mirrorPool[obj];
        }

        var name = obj.$fullname  , id = obj.$id , cls;
        if(!name && obj.prototype){
            name = obj.prototype.$fullname;
        }
        cls = mirrorPool[name];
        if (!cls.instance) {
            cls.instance = new cls;
            cls.shell = {};
        }
        if (!cls.shell[id]) {
            cls.shell[id] = {
                get:function (name) {
                    return cls.get(name, id);
                },
                set:function (name, value) {
                    return cls.set(name, value, id);
                },
                filter:function (fn) {
                    return cls.filter(fn, id);
                }
            }
        }
        return cls.shell[id];
    }


})();
(function(fruit, util) {
	var cache = {
		preprocessors : {},
		postprocessors : {},
		order : {}
	}, identity = 1 , MM = fruit.manager.MirrorManager,OM = fruit.manager.OptionManager;
	/**
	 * fruit basic class
	 * @class fruit.Class
	 */
	fruit.Class = function() {
	};
     MM.create('fruit.Class');
	//add static method
	util.extend(fruit.Class, {
		init:function(){
		},
		/**
		 * Register processor
		 * @static
		 * @param name
		 * @param fn
		 * @param isPostprocessing
		 * @return {*}
		 */
		regProcessor : function(name, fn, isPostprocessing) {
            var mm = MM.get(this.prototype.$fullname);
            var key = isPostprocessing?'postprocessing':'preprocessing';
            mm.set(key+'_'+name,fn);
			return isPostprocessing ? regPostprocessing.call(this, name, fn) : regPreprocessing.call(this, name, fn);
		},
		/**
		 * Set processor orders
		 * @static
		 * @param order
		 */
		setProcessorOrder : function(order) {
            var mm = MM.get(this.prototype.$fullname);
            mm.set('processing_order',order);
			cache.order[this.$fullname || this.prototype.$fullname] = order;
		}
	});
	//add public method
	util.extend(fruit.Class.prototype, {
		$fullname : 'fruit.Class',
		/**
		 * call super method
		 * @param {Array} args
		 */
		superMethod : function(args) {
			var method = this.superMethod.caller, parentClass, methodName;
			if(method.$orig) {
				parentClass = method.$orig;
			}
			if(!method.$owner) {
				method = method.caller;
			}
			if(!parentClass) {
				parentClass = method.$owner.prototype.$super;
			}
			methodName = method.$name;

			return (parentClass[methodName] || parentClass.prototype[methodName]).apply(this, args || []);
		},
		/**
		 * get current class name
		 * @return {String}
		 */
		getClassName : function() {
			return this.$name;
		},
		/**
		 * get the statics attribute
		 * @return {Object}
		 */
		getStatics : function() {
			return this.$self || fruit.getClass(this.$fullname);
		}
	});

	function applyToPrototype(members) {
		var prototype = this.prototype, name, i, member;

		for(name in members) {
			if(members.hasOwnProperty(name)) { member = members[name], sourceFn = prototype[name];
				if(util.isFunction(member)) {
					//init method could not be rewrite.
					if((name == 'init' || name == 'destroy') && sourceFn) {
						member = util.intercept(member, sourceFn);
					}
					if(sourceFn && sourceFn.$owner && sourceFn.$owner != this.prototype.$super) {
						member.$orig = sourceFn.$owner;
					}
					member.$owner = this;
					member.$name = name;
				}
				prototype[name] = member;
			}
		}
	}

	function getCache(name, useArray) {
		var key = this.$fullname || this.prototype.$fullname;
		if(!cache[name][key]) {
			cache[name][key] = useArray ? [] : {};
		}
		return cache[name][key];
	}

	function regPostprocessing(name, fn) {
		var processors = getCache.call(this, 'postprocessors');
		processors[name] = fn;
	}

	function regPreprocessing(name, fn) {
		var processors = getCache.call(this, 'preprocessors');
		processors[name] = fn;
	}

	function copyProcessing(parent) {
		var selfProcessors = getPreprocessing.call(this), processors = getPreprocessing.call(parent);
		util.extend(selfProcessors, processors);
		cache.preprocessors[this.$fullname] = selfProcessors; selfProcessors = getPostprocessing.call(this), processors = getPostprocessing.call(parent);
		util.extend(selfProcessors, processors);
		cache.postprocessors[this.$fullname] = selfProcessors;
	}

	function getPostprocessing(ordered) {
		var processors = getCache.call(this, 'postprocessors');
		if(ordered) {
			return getOrderProcessing.call(this, processors);
		}
		return processors;
	}

	function getOrderProcessing(list) {
		var preprocessors = cache.order[this.extend], index;
		if(preprocessors) {
			preprocessors = [].concat(preprocessors);
		} else {
			preprocessors = [];
		}
		util.each(list, function(fn, name) {
			index = util.indexOf(preprocessors, name);
			if(index >= 0) {
				preprocessors[index] = list[name];
			} else {
				preprocessors.slice(index, 1);
				preprocessors.push(fn);
			}
		});
		return preprocessors;
	}

	function getPreprocessing(ordered) {
		var processors = getCache.call(this, 'preprocessors');
		if(ordered) {
			return getOrderProcessing.call(this, processors);
		}
		return processors;
	}

	function prepareProcessing() {
		var parent;
		if(this.extend) {
			parent = fruit.getClass(this.extend);
		} else {
			parent = fruit.Class;
		}
		copyProcessing.call(this, parent);
	}

	function onBeforeCreated(cls, data) {
		var onClassCreated = data._onClassCreated;
		delete data._onClassCreated;
		delete data._onBeforeCreated;
		//TODO: need remove entity support in next version
		applyToPrototype.call(cls, data.methods || data.entity);
		return onClassCreated.call(cls, cls, data);
	}

	function createClass(newClass, props, onClassCreated) {
		if(!util.isFunction(newClass)) {
			onClassCreated = props;
			props = newClass;
			newClass = function(arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10) {
				if(util.isFunction(this.init)) {
					this.initialized = true;
					this.$id = identity++;
					// use direct call replace apply for performance
					//the test result in  http://jsperf.com/function-versus-function-call-versus-function-apply/
					this.init(arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10);
					delete this.initialized
				}
				return this;
			}
		}
		if(!props) {
			props = {
				props : {}
			};
		}

		props._onClassCreated = onClassCreated || fruit.emptyFun;
		props._onBeforeCreated = onBeforeCreated;
		var index = 0, preprocessors = getPreprocessing.call(props, true);

		var process = function(cls, data) {
			var preprocessor = preprocessors[index++];
			if(!preprocessor) {
				return data._onBeforeCreated.call(this, cls, data);
			}
			if(preprocessor.call(this, cls, data, process) !== false) {
				return process.call(this, cls, data);
			}

		};
		process.call(this, newClass, props);
		return newClass;
	}

	function markingClass(props, clsName) {
		var names, namespace = '', root;
		if(clsName.indexOf('.') >= 0) {
			names = clsName.split('.');
			clsName = names.pop();
			namespace = names.join('.');
		}
		if(!props.extend) {
			props.extend = 'fruit.Class';
		}
		util.extend(props, {
			$namespace : namespace,
			$name : clsName,
			$fullname : namespace == '' ? clsName : namespace + '.' + clsName
		});

	}

	function getRoot(fullName, onlyGet) {
		if(fullName.indexOf('.') < 0) {
			return fruit.global;
		} else {
			var offset = fullName.lastIndexOf('.'), packageName = fullName.substr(0, offset);
			return fruit.ns(packageName, onlyGet);
		}
	}

	/**
	 * fruit basic class
	 * @class fruit
	 * @constructor
	 */
	/**
	 * get a class object by className
	 * @param {String} className
	 * @return {Object}
	 */
	fruit.getClass = function(classFullName) {
		var root = getRoot(classFullName, true), offset, name;
		if(root) { offset = classFullName.lastIndexOf('.'), name = classFullName.substr(offset + 1);
			return root[name];
		} else {
			return root;
		}
	}
	/**
	 * get a class object by object Name
	 * @param {String} objectName
	 * @return {Object}
	 */
	fruit.getObject = fruit.getClass;
	/**
	 * define a new class
	 * @param {String} className  The class name to create , need a string and  dot-namespaced format
	 * @param {Object} props the properties to apply to this class
	 *  the props support below attributes:
	 <ul><li><b>methods:{Object}</b> the defined property</li>
	 <li><b>mixins:{String}</b> specify the mixin class</li>
	 <li><b>statics{Object}</b> specify the statics property</li>
	 <li><b>extend{String}</b> specify the inherit class</li>
	 <li><b>singleton{Boolean}</b> specify the class is singleton class</li>
	 <li><b>options{Object}</b> specify some options for the class</li></li>
	 <li><b>requires{Array}</b> specify some required class like ['fruit.ui.Button']</li></li>
	 Example usage:
	 <pre><code>
	 fruit.define('demo.Test',{
	 methods:{
	 init:function(){
	 console.log('init Test');
	 }
	 }
	 })
	 </code></pre>
	 * @return {fruit.Class} the created class
	 */
	fruit.define = function(clsName, props, createdFn) {

		if(!util.isString(clsName)) {
			return null;
		}

		if(util.isFunction(props)) {
			props = props();
		}
		if(!props) {
			props = {};
		}
		markingClass(props, clsName);
		//copy the processing form parent class;

		prepareProcessing.call(props);
		var root = getRoot(props.$fullname);
		createClass(props, function(cls, data) {
			var processors = getPostprocessing.call(cls, true), me = this, index = 0;

			var process = function(cls, data) {
				var processor = processors[index++];

				if(!processor) {
					if(util.isFunction(createdFn)) {
						createdFn.call(me, cls, data);
					}
					root[data.$name] = cls;
					return cls;
				}
				if(processor.call(this, cls, data, process) !== false) {
					return process.call(this, cls, data);
				}

			};
			return process.call(this, this, data);

		});
		return root[props.$name];
	}
	/**
	 * create a class
	 * @param {String} className the class name
	 * @param {Object} options the class options
	 Example usage:
	 <pre><code>
	 fruit.create('fruit.ui.Button',{
	 text:'Save',
	 listerents:{
	 click:function(){
	 alert('you clicked')
	 }
	 }
	 })
	 </code></pre> */
	fruit.create = function(name, options) {
		var cls = fruit.getClass(name), obj;
		return new cls(options);
	}


	fruit.Class.regProcessor('extend', function(cls, data) {
		var parentName = data.extend, parent;
		if(!parentName) {
			parent = fruit.Class;
		} else {
			parent = fruit.getClass(parentName);
		}
		if(!parent) {
			throw 'Not find class ' + parentName;
		}
		//copy static method
		util.extend(cls, parent);
        MM.create(data.$fullname , parent.prototype.$fullname);
        util.extendClass(cls,parent,data);
	});
	function _mixin(target, source, scope) {
		var mixin = source.prototype, my = target.prototype, key, fn, member, mixinMember;
		for(key in mixin) {
			if(mixin.hasOwnProperty(key)) { member = my[key], mixinMember = mixin[key];
				if(util.isFunction(mixinMember)) {
					if(scope) {
						mixinMember = util.bind(mixinMember, scope);
					}
					if((key == 'init' || key == 'destroy') && member) {
						fn = util.intercept(member, mixinMember);
					} else {
						fn = mixinMember;
					}
					fn.$owner = source;
					fn.$name = key;
					my[key] = fn;
				} else {
					if(key.indexOf('$')==0) {
						continue;
					} else {						
						my[key] = mixinMember;
					}
				}
			}
		}
	}
    util.mixinClass = _mixin;
	fruit.Class.regProcessor('mixins', function(cls, data) {
		var mixins = data.mixins
		if(mixins) {
			var list = util.isArray(mixins) ? mixins : [mixins];
			util.each(list, function(name, i) {
				var source = fruit.getClass(name);
				_mixin(cls, source);
				var fn = source.prototype.init;
				if(util.isFunction(fn)) {
					if(data.init) {
						//data.init = util.intercept(data.init, fn);
					} else {
						data.init = fn;
					}

				}
			});
		}
	});

	fruit.Class.regProcessor('singleton', function(cls, data, fn) {
		if(data.singleton) {
			var newcls = new cls({});
			newcls._$self = cls;
			fn.call(this, newcls, data);
			return false;
		}
	}, true);

	fruit.Class.regProcessor('statics', function(cls, data) {
		var fns = data.statics;
		if(fns) {
			for(var name in fns) {
				if(fns.hasOwnProperty(name)) {
					cls[name] = fns[name];
				}
			}
		}
	});

})(fruit, fruit.util);
(function (util,MM) {
    var oPrefix = 'options_';

    function initOption(mirror, name, obj) {
        if (!util.isObject(obj) || util.isUndef(obj.defaultValue)) {
            obj = {
                defaultValue:obj,
                readOnly:false
            };
        }
        mirror.set(oPrefix + name, obj);
    }

    function setOption(mirror, name, value, initialized) {
        if (util.isUndef(value)) {
            return false;
        }
        var obj = mirror.get(oPrefix + name);
        if (!obj) {
            logger.warn('the option of {0} is not support! ', name);
            return false;
        }
        if (!initialized && obj.readOnly) {
            logger.error('the option {0} is readonly, cannot be set!', name);
            return false
        }
        var types = obj.acceptTypes;
        if (types) {
            types = util.isArray(types) ? types : [types];
            if (util.indexOf(types, util.getType(value)) < 0) {
                logger.warn('option "' + name + '" only accepts value of type [' + types + ']');
                return false;
            }
        }
        if (obj.hidden) {
            logger.warn('Cannot access hidden option "' + name + '".');
            return false;
        }
        if (obj.defaultValue === value) {
            return false;
        }
        obj = util.extend({}, obj);
        obj.defaultValue = value;
        mirror.set(oPrefix + name, obj);
        return true;
    }

    function getOptionEntity(mirror, name) {
        return mirror.get(oPrefix + name);
    }

    function OptionManager() {
    }

    util.extend(OptionManager.prototype, {
        init:function (options) {
            if (options && util.isObject(options)) {
                var that = MM.get(this);
                util.each(options, function (val, name) {
                    setOption(that, name, val, true)
                });
            }
        },
        /**
         * get class option
         * @param {String} name the option name
         * @return {Object} option value
         */
        getOption:function (name) {

            var obj = getOptionEntity(MM.get(this), name);
            if (obj && !obj.hidden) {
                return obj.defaultValue;
            }
        },
        /**
         * set class option
         * @param {String} name the option name
         * @param {Mixture} val the option value
         * @return {Boolean} true if setOption success or false if setOption failure.
         */
        setOption:function (name, val,init) {
            return setOption(MM.get(this), name, val,init);
        },
        /**
         * get class all options
         * @return {object} option object
         */
        getAllOptions:function () {
            var result = {}, opts = MM.get(this).filter(function (val, key) {
                if (key.indexOf(oPrefix) == 0) {
                    key = key.replace(oPrefix, '');
                    result[key] = val.defaultValue;
                }
                ;
            });
            return result;
        },
        /**
         * get option's structure.
         * @param {String} name the option name
         * @return {Object} option's structure..
         */
        getOptionEntity:function (name) {
            return getOptionEntity(MM.get(this), name);
        }
    });

    fruit.Class.regProcessor('options', function (cls, data) {
        var opts = data.options, parent = data.extend, mirror = MM.get(data);

        util.each(opts, function (v, k) {
            initOption(mirror, k, v);
        });
        if (opts && !cls.prototype.getOption) {
            util.mixinClass(cls, OptionManager);
        }
    });

})(fruit.util,fruit.manager.MirrorManager);
/**
 * @class fruit
 * @namespace fruit
 * @singleton
 * @ignore
 */

(function (fruit,util) {

    var pool = {};

    /**
     * define a interface.
     * @param {String} name interface name
     * @param {Array} fun  required method names.
       Example usage:
    <pre><code>
    fruit.defineInterface('furit.IComponent',['show','hide']);
    
    fruit.define('fruit.Component', {
    //use the interface
    implement:'furit.IComponent',
    // you need define two method , otherwise will throw error.
    methods: {
        hide : function() {

        },
        show : function() {
            logger.debug('show in component');
        }
    }
});
      </code></pre>
     */
    fruit.defineInterface = function (name, fun, prop) {
        pool[name] = {
            prop:prop,
            fun:fun,
            cls:{}
        }
    }
    function checkInterface(name, cls) {
        var obj = pool[name];
        //todo : bug
//        if (obj.prop) {
//
//        }
        if (obj.fun) {
            util.each(obj.fun, function (method) {
                if (!util.isFunction(cls.prototype[method])) {
                    util.logger.error(cls.prototype.$fullname + ' need method ' + method + ' for interface ' + name);
                }
            })
        }
    }
    function regInterface(clsName,interfaceName){
    	var opts = pool[interfaceName];    	
    	if(opts){
    		opts.cls[clsName] = true;
    	}
    }
 /**
     * return true if the class implement the passed interface
     * @param {String} interfaceName
     * @return {Boolean}
     */
	fruit.Class.prototype.interfaceOf = function(interfaceName){
		var opts = pool[interfaceName] || {cls:{}};    	
    	return opts.cls[this.$fullname];
	}
    fruit.Class.regProcessor('implement', function (cls, data) {
    	var interfaceName = data.implement;
        if (interfaceName) {
            checkInterface(interfaceName, cls);
            regInterface(data.$fullname,interfaceName)
            delete data.implement;
        }        
    }, true)
})(fruit,fruit.util);
/**
 * @class Observable
 * Custom event class. Every class wants to use custom event must 'mixins' the 'fruit.Observable' when it is defined. The example code is as follow:
 * <pre><code>
 fruit.define('fruit.data.Reader', {
        mixins:'fruit.Observable',
        ...
     });
 * </code></pre>
 * @namespace fruit
 */
(function (fruit, util) {
    fruit.define('fruit.Observable', function () {

        function getEventName(name) {
            if (name) {
                return name.toLowerCase();
            } else {
                return null;
            }
        }

        function getEvents(obj, name) {
            name = getEventName(name);
            if (!obj._$events) {
                obj._$events = {};
            }
            if (!obj._$events[name]) {
                obj._$events[name] = [];
            }
            return obj._$events[name];
        }

        function clearEvents(obj, name) {
            obj._$events[name] = [];
        }

        return {
            option:{
                listeners:null
            },
            methods:{
                init:function (option) {
                    var listeners = option && option.listeners;
                    if (listeners) {
                        this.on(listeners);
                    }
                },
                /**
                 * add event handler to this object
                 * @param {String} name event name
                 * @param {Function} fn specify callback function
                 * @param {Object} context specify the scope of  callback function
                 * @param {Object} data the event data
                 */
                on:function (name, fn, scope, data) {
                    if (arguments.length == 1) {
                        /*
                         *  for object parameter
                         *
                         obj.on({
                         scope:this,
                         click:function () {},
                         move:function(){}
                         })
                         */
                        var me = this, obj = name, scope = obj.scope || this, itemScope;
                        delete obj.scope;
                        util.each(obj, function (fn, name) {
                            itemScope = scope;
                            if (util.isObject(fn)) {
                                fn.scope && ( itemScope = fn.scope);
                                data = fn.data;
                                fn = fn.fn;
                            }
                            if (util.isFunction(fn)) {
                                me.on(name, fn, itemScope, data);
                            }
                        });
                    } else {
                        var events = getEvents(this, name);
                        events.push({
                            scope:scope,
                            fn:fn,
                            data:data
                        });
                    }
                    return this;
                },
                /**
                 * remove an event handler
                 * @param {String} name event name
                 * @param {Function} fn call back function
                 */
                off:function (name, fn, scope) {
                    var events = getEvents(this, name), me = this;
                    //remove all event if fn is undefined or null
                    if (!util.isDefine(fn)) {
                        clearEvents(this, name);
                        return;
                    }
                    util.each(events, function (obj, i) {
                        if (obj.fn == fn && (util.isUndef(scope) || (obj.scope == scope))) {
                            events.splice(i, 1);
                            util.logger.info.call(me, name);
                            return false;
                        }
                    });
                    return this;
                },
                /**
                 * remove an event handler
                 * @param {String} name event name
                 * @param {Array} args the arguments for the callback function
                 * @param {Object} scope specify the scope for the callback function
                 * @param trigger
                 */
                trigger:function (name, args, scope, disableSender) {
                    var events = getEvents(this, name), me = this, result = true;
                    util.logger.log.call(this, name);
                    util.each(events, function (obj, i) {
                        var innerScope = scope || obj.scope || me, innerResult;
                        if (disableSender) {
                            innerResult = obj.fn.apply(innerScope, args);
                        } else {
                            innerResult = obj.fn.call(innerScope, me, args);
                        }
                        if (innerResult === false) {
                            result = false;
                        }

                        return result;
                    });
                    return result;
                }
            }
        };
    });
})(fruit, fruit.util);

/**
 * @class fruit.interfaces.IRequest
 * @namespace fruit.interfaces
 */
fruit.defineInterface('fruit.interfaces.IRequest', [
/**
 * @method send
 */
    'send',
/**
 * @method abort
 */
    'abort',
/**
 * @method setRequestHeader
 * @param header
 * @param value
 * Appends an header to the list of author request headers, or if header is already in the list of author request headers, combines its value with value.
 */
    'setRequestHeader',
/**
 * @method getResponseHeader
 * @param header
 * Returns the header field value from the response of which the field name matches header.
 */
    'getResponseHeader',

/**
 * @method getAllResponseHeaders
 * @param header
 * Returns all headers from the response.	
 */
    'getAllResponseHeaders'
]
);


/**
 * @ignore
 * @class fruit.io
 * @namespace fruit.io
 * @singleton
 */
(function(fruit) {
	fruit.ns("fruit.io");

	fruit.util.extend(fruit.io, {
		/**EVENT_SESSION_TIMEOUT constant name of request time out event
		 * @static
		 */
		EVENT_SESSION_TIMEOUT : 'session_timeout',

		/**REQUEST_COMPLETE constant name of every request complete event
		 * @static
		 */
		REQUEST_COMPLETE : 'request_complete',

		/**GLOBAL_PAGE_ERROR constant name of page request error event
		 * @static
		 */
		GLOBAL_PAGE_ERROR : 'global_page_error'
	});

	/**
	 * Ajax request
	 * @param {Object} options
	 * @return {Object} request
	 */

	/**
	 * @cfg {Function} beforeSend
	 * A pre-request callback function
	 */

	/**
	 * @cfg {Function} complete
	 * A function to be called when the request finishes (after success and error callbacks are executed).
	 */

	/**
	 * @cfg {Object} data
	 * Data to be sent to the server.
	 */

	/**
	 * @cfg {String} responseType
	 * The type of data that you're expecting back from the server. Including xml, json, script, html, jsonp or text.
	 */

	/**
	 * @cfg {Function} error
	 * A function to be called if the request fails.
	 */

	/**
	 * @cfg {Function} success
	 * A function to be called if the request succeeds.
	 */

	/**
	 * @cfg {String} method
	 * The request method ("POST" or "GET").
	 */

	/**
	 * @cfg {String} url
	 * A string containing the URL to which the request is sent.
	 */

	/**
	 * @cfg {Boolean} async
	 * Default is true. By default, all requests are sent asynchronously
	 */

	fruit.io.ajax = function(options) {
		var opts = fruit.util.extend({}, options), req;
		var beforeSend = opts.beforeSend, success = opts.success, error = opts.error, complete = opts.complete;
		if (!opts.method && opts.type) {
			opts.method = opts.type;
			delete opts.type;
		}
		if (!opts.responseType && opts.dataType) {
			opts.responseType = opts.dataType;
			delete opts.dataType;
		}
		opts.listeners = {
			beforeSend : beforeSend,
			success : success,
			error : error,
			complete : complete
		};

		//delete event handler options
		delete opts.beforeSend;
		delete opts.success;
		delete opts.error;
		delete opts.complete;
		
		req = new fruit.io.Request(opts).send();
		return req;
	}
})(fruit);
(function(fruit, util) {
	var readyState = {
		UNSENT : 0,
		OPENED : 1,
		HEADERS_RECEIVED : 2,
		LOADING : 3,
		DONE : 4
	};
	var listener = new fruit.Observable();

	fruit.define('fruit.io.Request', {
		implement : 'fruit.interfaces.IRequest',
		mixins : 'fruit.Observable',
		options : {
			/**
			 * @cfg {String} url
			 * specify the request url
			 */
			url : {
				defaultValue : '',
				acceptTypes : ['String']
			},

			/**
			 * @cfg {Boolean} async
			 * Default is true. By default, all requests are sent asynchronously
			 */
			async : {
				defaultValue : true,
				acceptTypes : ['Boolean']
			},

			/**
			 * @cfg {String} method
			 * The request method ("POST" or "GET").
			 */
			method : {
				defaultValue : 'GET',
				acceptTypes : ['String', 'Null']
			},

			/**
			 * @cfg {String} responseType
			 * specify the response data type.
			 */
			responseType : {
				defaultValue : '',
				acceptTypes : ['String', 'Null']
			},

			/**
			 * @cfg {Object} data
			 * specify the request data
			 */
			data : {
				defaultValue : null,
				acceptTypes : ['Object', 'String', 'Null']
			},

			/**
			 * @cfg {Object} headers
			 * A list consisting of HTTP header name/value pairs to be used in the request.
			 */
			headers : {
				defaultValue : {},
				acceptTypes : ['Object', 'Null']

			},

			/**
			 * @cfg {Number} timeout
			 * The amount of milliseconds a request can take before being terminated. Default is 60s.
			 */
			timeout : {
				defaultValue : 60000,
				acceptTypes : ['Number', 'Null']
			},

			/**
			 * @cfg {Object} listeners
			 * The event listeners, including beforeSend, success, error and complete.
			 */
			listeners : {
				defaultValue : {},
				acceptTypes : ['Object', 'Null']
			}
		},
		statics : {
			/**bind the specified event handler
			 * @param {String} eventName
			 * @param {function} fn event handler
			 * @static
			 */
			on : function(name, fn) {
				listener.on(name, fn);
			},

			/**unbind the specified event handler
			 * @param {String} eventName
			 * @param {function} fn
			 * @static
			 */
			off : function(name, fn) {
				listener.off(name, fn);
			},

			/**trigger the specified event
			 * @param {String} name
			 * @param {Array}args  event arguments
			 * @static
			 */
			trigger : function(name, data) {
				listener.trigger(name, data, null, true);
			}
		},
		methods : {
			init : function() {
				this.__cloneOptions();
				this.readyState = readyState.UNSENT;
				// HTTP status code
				this.status = 0;
				// HTTP status text.
				this.statusText = '';
				this.responseText = '';
				this.responseXML = '';
				this.aborted = false;

				this._xhr = this.__createxhr();
				this._isTimeout = false;
				this._timeoutTimer = null;
			},

			__cloneOptions : function() {
				var option = this.getAllOptions();
				this.async = option.async;
				this.url = option.url;
				this.method = option.method;
				this.timeout = option.timeout;
				this.responseType = option.responseType;
				this.headers = option.headers;

				this.listeners = {
					success : option.success,
					error : option.error,
					complete : option.complete,
					beforeSend : option.beforeSend
				};
			},

			__cloneAttribute : function(xhr) {
				this.readyState = xhr.readyState;
				this.statusText = xhr.statusText;
				this.responseText = xhr.responseText;
				this.responseXML = xhr.responseXML;
				this.status = xhr.status;
			},

			setOption : function(name, value) {
				this.superMethod([name, value]);
				this.name = value;
			},

			__createxhr : function() {
				if (window.ActiveXObject) {
					return new ActiveXObject('Microsoft.XMLHTTP');
				} else {
					return new XMLHttpRequest();
				}
			},
			__clean : function() {
				var xhr = this._xhr;
				if ('onreadystatechange' in xhr) {
					delete xhr['onreadystatechange'];
				}
				if ('onload' in xhr) {
					delete xhr['onload'];
				}
				xhr = null;
			},

			__success : function(xhr) {
				this.__cloneAttribute(xhr);
				var _listeners = this.getOption('listeners');
				if (_listeners) {
					var successFN = _listeners.success;
					if (successFN) {
						var __responseType = this.getOption('responseType');
						switch (__responseType) {
							case 'html':
							case 'text':
								successFN.call(this, this.responseText, this.statusText, this);
								break;
							case 'json':
								successFN.call(this, JSON.parse(this.responseText), this.statusText, this);
								break;
							case "javascript":
								try {
									eval(this.responseText);
								} catch(e) {
								}
								break;
							case 'xml':
								successFN.call(this, this.responseXML, this.statusText, this);
								break;
							default:
								var ct = this.getResponseHeader("Content-Type");
								if (ct && util.isString(ct)) {
									if (ct.indexOf('json') > -1) {
										successFN.call(this, JSON.parse(this.responseText), this.statusText, this);
									} else if (ct.indexOf('xml') > -1) {
										successFN.call(this, this.responseXML, this.statusText, this);
									} else {
										successFN.call(this, this.responseText, this.statusText, this);
									}
								} else {
									successFN.call(this, this.responseText, this.statusText, this);
								}
								break;
						}
					}
				}
			},
			__error : function(xhr) {
				this.__cloneAttribute(xhr);
				this.__checkAbort();

				var _listeners = this.getOption('listeners');
				if (_listeners) {
					var errorFN = _listeners.error;
					if (errorFN) {
						errorFN.call(this, this, this.statusText);
					}
				}
			},
			__complete : function(xhr) {
				this.__checkAbort();
				var _listeners = this.getOption('listeners');
				if (_listeners) {
					var completeFN = _listeners.complete;
					if (completeFN) {
						completeFN.call(this, this, this.statusText);
					}
					this.__clean();
				}
			},
			__beforeSend : function(xhr) {
				var _listeners = this.getOption('listeners');
				if (_listeners) {
					var beforeSendFN = _listeners.beforeSend;
					if (beforeSendFN) {
						beforeSendFN.call(this, this, this.headers);
					}
				}
			},

			__timeOutAbort : function() {
				this._isTimeout = true;
				this.abort();
			},

			__clearTimeout : function() {
				if (this._timeoutTimer) {
					clearTimeout(this._timeoutTimer);
					this._isTimeout = false;
				}
			},

			__readyStateChange : function(event) {
				var xhr = (event && event.target) || this._xhr;
				if (!this.aborted) {
					if (xhr.readyState === readyState.DONE) {
						this.__clearTimeout();
						if (xhr.status >= 200 && xhr.status < 300 || xhr.status === 304) {
							this.__success(xhr);
						} else {
							this.__error(xhr);
						}
						this.__complete(xhr);
					}
				}

				if (this.aborted && xhr.readyState > 1) {
					this.__error(xhr);
					this.__complete(xhr);
				}
			},

			__checkAbort : function() {
				if (this.aborted) {
					this.statusText = "abort";
					this.readyState = readyState.UNSENT;
				}
				if (this._isTimeout) {
					this.statusText = 'timeout';
				}
			},

			__req : function(xhr) {
				var me = this;
				var __method = this.getOption('method');
				var __url = encodeURI(this.getOption('url'));
				if (__method != 'GET') {
					xhr.open(__method, __url, this.getOption('async'));

					if (!this.headers["Content-Type"]) {
						this.headers["Content-Type"] = "application/x-www-form-urlencoded; charset=UTF-8";
					}
					
					if (!this.headers["X-Requested-With"]) {
						this.headers["X-Requested-With"] = "XMLHttpRequest";
					}
					
					for (var h in this.headers ) {
						xhr.setRequestHeader(h, this.headers[h]);
					}
					this.__beforeSend(xhr, this.headers);

					var __data = this.getOption('data');
					if (__data) {
						__data = this.__toString(__data);
						//xhr.setRequestHeader('Content-Length', __data.length);
						xhr.send(__data);
					} else {
						xhr.send(null);
					}

				} else {
					xhr.open('GET', __url, this.getOption('async'));
					this.__beforeSend(xhr);
					xhr.send(null);
				}

				// Timeout
				if (this.async && this.timeout > 0) {
					this._timeoutTimer = setTimeout(function() {
						xhr.abort();
					}, me.timeout);
				}
			},

			__toString : function(obj) {
				if (util.isString(obj)) {
					return obj;
				}
				var strArr = [];
				strArr = this.__convertObj(obj, strArr);
				return strArr.join("&").replace("/%20/g", "+");
			},

			__convertObj : function(obj, strArr) {
				var me = this;
				var add = function(key, value) {
					strArr[strArr.length] = encodeURIComponent(key) + "=" + encodeURIComponent(value);
				};
				if (obj) {
					util.each(obj, function(value, name) {
						if (util.isObject(value)) {
							me.__convertObj(value, strArr);
						} else {
							add(name, value);
						}
					});
				}
				return strArr;
			},

			__send : function(xhr) {
				if (!(/^http/i.test(document.location))) {
					try {
						this.__clean();
						this.__req(xhr);
						this.__success(xhr);
					} catch (e) {
						this.__error(xhr);
					}
				} else {
					if (!util.isUndef(xhr.onload) && !this.getOption('async')) {
						xhr.onload = util.bind(this.__readyStateChange, this);
					} else {
						xhr.onreadystatechange = util.bind(this.__readyStateChange, this);
					}
					this.__clean();
					this.__req(xhr);
				}
			},

			send : function() {
				this.__send(this._xhr);
			},

			/**
			 * abort ajax call
			 */
			abort : function() {
				if (this._xhr) {
					if (this._xhr.readyState > readyState.UNSENT) {
						this.aborted = true;
						this._xhr.abort();
					}
				}
			},

			/**
			 * set request header
			 * @param {String} header
			 * @param {Object} headerValue
			 */
			setRequestHeader : function(header, value) {
				this.headers[header] = value;
				this._xhr.setRequestHeader(header, value);
			},

			/**
			 * get response header
			 * @param {String} header
			 * @return {Object} headerValue
			 */
			getResponseHeader : function(header) {
				return this._xhr.getResponseHeader(header);
			},

			/**
			 * get all responseHeaders
			 * @return {Object} allResponseHeaders
			 */
			getAllResponseHeaders : function() {
				return this._xhr.getAllResponseHeaders();
			}
		}
	});

})(fruit, fruit.util);
/**

 * @namespace fruit.io
 * @class fruit.io.websocket
 * fruit Web Socket class
 * @mixins fruit.Observable
 * @singleton
 */
(function (fruit, util) {
    fruit.define("fruit.io.websocket", {
        singleton:true,
        mixins:['fruit.Observable'],
        methods:{
            __wachList:{},
            /**
             * connect to a websocket server
             * @param url
             */
            connect:function (url) {
                if (url && ("WebSocket" in window)) {
                    var host = this.host = url;
                    this.ws = new WebSocket(host);
                    this._registerEvent();
                }
            },
            /**
             * @event open
             * Fires when websocket is connected.
             */
            /**
             * @event message
             * Fires when recive message.
             */
            /**
             * @event close
             * Fires when websocket is closed.
             */
            _registerEvent:function () {
                var ws = this.ws;
                ws.onopen = function () {
                    this.trigger("open", {state:socket.readyState});
                }
                ws.onmessage = function (msg) {
                    this.trigger("message", {data:msg.data});
                }
                ws.onclose = function () {
                    this.trigger("close", {state:socket.readyState});
                }
            },
            /**
             * Watch a value from message
             * @param key
             * @param callback
             */
            watch:function (key, callback) {

            },
            /**
             *
             * @param text
             */
            sent:function (text) {
                var ws = this.ws;
                if (text != "") {
                    ws.send(text);
                    /**
                     * @event sent
                     * Fires when sent data.
                     */
                    this.trigger("sent", {data:text});
                }

            }
        }

    })
})(fruit, fruit.util);
/**
 * @namespace fruit.io
 * @class fruit.io.REST
 * A simple implementation of RESTful API
 * @singleton
 * //http://www.developer.nokia.com/Community/Wiki/Accessing_RESTful_Web_Services_with_JavaScript
 */
(function (fruit, util) {
    fruit.define("fruit.io.REST", {
        singleton:true,
        mixins:['fruit.Observable'],
        methods:{
            /**
             *
             * @param url
             * @param data
             * @param callback
             */
            "put":function (url, data, callback) {
                this.__req("PUT", url, data, callback)
            },
            /**
             *
             * @param url
             * @param data
             * @param callback
             */
            "get":function (url, data, callback) {
                this.__req("GET", url, data, callback)

            },
            /**
             *
             * @param url
             * @param data
             * @param callback
             */
            "post":function (url, data, callback) {
                this.__req("POST", url, data, callback)
            },
            /**
             *
             * @param url
             * @param data
             * @param callback
             */
            "delete":function (url, data, callback) {
                this.__req("DELETE", url, data, callback)
            },
            __req:function (type, url, data, callback) {
                if (!util.isUndef(url)) {
                    fruit.io.ajax({
                        contentType:"application/json",
                        type:type,
                        connection:"close",
                        url:url,
                        data:data || "",
                        success:callback || ""
                    });
                }
            }
        }
    })
})(fruit, fruit.util);
/**
 * fruit IFX class
 * @namespace fruit
 * @class fruit.fx
 * @ignore
 */
fruit.defineInterface('fruit.interfaces.IEffects', [
    /**
     * show en element
     * @method show
     * @param {Element} el
     */
    'show',
    'hide',
    'fadeOut',
    'fadeIn',
    'animation'
]
);
(function (fruit, util) {
    /**
     * @link http://webstuff.nfshost.com/anim-timing/Overview.html
     * @link https://developer.mozilla.org/en/DOM/window.requestAnimationFrame
     * @link http://dev.chromium.org/developers/design-documents/requestanimationframe-implementation
     */
    var requestAnimationFrame = ( function()
        {
            return window.requestAnimationFrame
                || window.webkitRequestAnimationFrame
                || window.mozRequestAnimationFrame
                || window.oRequestAnimationFrame
                || window.msRequestAnimationFrame
                || function( callback )
            {return window.setTimeout( callback, 1000 / 60 );};
        })(),
        cancelAnimationFrame = ( function()
        {
            return window.cancelAnimationFrame
                || window.cancelRequestAnimationFrame
                || window.webkitCancelAnimationFrame
                || window.webkitCancelRequestAnimationFrame
                || window.mozCancelAnimationFrame
                || window.mozCancelRequestAnimationFrame
                || window.msCancelAnimationFrame
                || window.msCancelRequestAnimationFrame
                || window.oCancelAnimationFrame
                || window.oCancelRequestAnimationFrame
                || window.clearTimeout;
        })();

    fruit.define('fruit.effect.Animator',{
        mixins:'fruit.Observable',
        options:{
            duration:null,
            interval:0,
            fn:null
        },
        methods:{
            stop:function(){
                cancelAnimationFrame(this.requestFn);
            },
            start:function(fn){
                var startTime = new Date().getTime(),
                    me = this,
                    beforeTime = startTime;

                var duration = this.getOption('duration'),
                    fn = fn || this.getOption('fn'),
                    interval = this.getOption('interval');


                function _step(timestamp){
                    timestamp = timestamp || new Date().getTime();
                    var progress = timestamp - startTime;

                    //check interval
                    if(timestamp - beforeTime > interval){
                        fn();
                        beforeTime = timestamp;
                    }

                    //check duration
                    //always
                    if (duration === 0){
                        me.requestFn = requestAnimationFrame(_step);
                    }
                    //less option duration
                    else if(progress < duration){
                        me.requestFn = requestAnimationFrame(_step);
                    }
                    else{
                        me.stop();
                        return false;
                    }
                }

                this.requestFn = requestAnimationFrame(_step);
            }
        }
    })
})(fruit, fruit.util);
/**
 * fruit dom element class
 * @namespace fruit
 * @class fruit.Element
 */
fruit.defineInterface('fruit.interfaces.IElement', [
/**
 * Convert dom element to fruit element
 * @method wrap
 * @param {Element} inElement
 */
    'wrap',
/**
 * Appends the passed element(s) to this element
 * @method appendChild
 * @param {Element} el
 */
    'appendChild',
/**
 * Appends this element to the passed element
 * @method appendTo
 * @param {Element/Selector} el
 */
    'appendTo',
/**
 * Insert passed content to the beginning of childs in this element.
 * @method prependChild
 * @param {Element/Selector} el
 */
    'prependChild',
/**
 * Insert this element to the beginning of childs in the passed content.
 * @method prependTo
 * @param {Element/Selector} el
 */
    'prependTo',
/**
 * Insert passed content to the index of childs in this element.
 * @method insertChild
 * @param {Element/Selector} el
 * @param {Number} index
 */
    'insertChild',
/**
 * Insert this element to passed content.
 * @method insertTo
 * @param {Element/Selector} el
 * @param {Number} index
 */
    'insertTo',
/**
 * remove the passed child from this element.
 * @method removeChild
 * @param {Element} el
 */
    'removeChild',
/**
 * remove this element from dom tree.
 * @method remove
 */
    'remove',
/**
 * remove all childrens from this element.
 * @method empty
 */
    'empty',
/**
 * return a clear copy of this element
 * @method clone
 * @return {fruit.dom.Element}
 */
    'clone',
/**
 * return the html element object in this Class
 * @method getElement
 * @return {Element}
 */
    'getElement',
/**
 * bind an event
 * @param {String} eventName the event name
 * @param {Function} callback the event callback
 */
    'on',
/**
 * unbind an event
 * @param {String} eventName the event name
 * @param {Function} callback the event callback
 */
    'off',
/**
 * returns true if this element contain the passed element.
 * @param {DomElement} el
 * @return {Boolean}
 */
    'contains',
/**
 *  returns the position of the passed element in the children.
 * @param {DomElement} el the element to search
 * @return {Number} The position where the specified element occurs, or -1 if it never occurs
 */
    'getIndex',
/**
 * returns the value of the style with the specified name.
 * @param {String} name The name of the style you want to get the value from.
 * @return {String} The specified style's value.
 */
    'getStyle',
/**
 * adds the specified style, and gives it the specified value.
 * If the specified style allready exists, only the value is set/changed
 * @param {String} name The name of the style you want to add
 * @param {String} value  The value of the style you want to add
 * @return {String} The specified style's value.
 */
    'setStyle',
/**
 * remove the element style
 * @param {String} style name
 */
    'removeStyle',
/**
 * adds the specified style className.
 * @param {String} name The className of the style you want to add
 * @param {String} value  The value of the style you want to add
 */

    'addClass',
/**
 * remove the specified style className.
 * @param {String} name The className of the style you want to remove
 */
    'removeClass',
/**
 * return true if this element contain the specified style className.
 * @param {String} name The className of the style you want to test
 * @return {Boolean}
 */
    'hasClass',
/**
 * replace the specified style className to new className.
 * @param {String} name The className of the style you want to replaced
 * @param {String} newName  The new className of the style
 */
    'replaceClass',
/**
 * adds the specified attribute, and gives it the specified value.
 *  @param {String} name The name of the attribute you want to add.
 * @param {String} value The value of the attribute you want to add
 */
    'setAttribute',
/**
 * returns the value of the attribute with the specified name.
 * @param {String} name The name of the attribute you want to get the value from
 */
    'getAttribute',
/**
 * removes the specified attribute.
 * @param {String} name The name of the attribute you want to removed.
 */
    'removeAttribute',

    'setText',
    'getText',
    'setHtml',
    'getHtml',
    'setValue',
    'getValue',
    'find',
    'children',
    'childAt',
    'closest',
    'firstChild',
    'lastChild',
    'parent',
    'nextSibling',
    'previousSibling',
    'getWidth',
    'setWidth',
    'getHeight',
    'setHeight',
    'offset',
    'position',
    'setScroll',
    'getScroll',
    'getAttrWidth',
    'getXY',
    'setXY',
    'getSize',
    'setSize',
    'setInnerSize']);
(function (fruit, util, dom, document, undefined, window) {
    var attrMap = {
        'class':'className',
        'for':'htmlFor',
        'tabindex':'tabIndex',
        'maxlength':'maxLength',
        'readonly':'readOnly'
    };
    var cssNoUnit = [ 'fontWeight', 'zIndex', 'zoom', 'lineHeight', 'opacity', 'tabIndex' ];
    var borderMap = {
        thin:2,
        medium:4,
        thick:6
    };
    var rstripStyleSpace = /(?:^\s*|\s*$|\s+(?=;|:)|;\s*$|(;|:)\s+)/g;
    var boxAttrs = {
        'margin':[ 'marginTop', 'marginRight', 'marginBottom', 'marginLeft'],
        'padding':[ 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'],
        'border':['borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth']
    };
    var attrHooks = (function () {
        var hooks = {
            'value':{
                get:function (el) {
                    return el.value
                },
                set:function (el, val) {
                    el.value = val;
                    return el;
                },
                remove:function () {
                    // throw ('value is a required attribute!');
                }
            },
            'text':{
                get:function (el) {
                    return el.innerText || el.textContent;
                },
                set:function (el, val) {
                    (el.textContent != null) ? (el.textContent = val)
                        : (el.innerText = val);
                    return el;
                },
                remove:function (el) {
                    this.set(el, "");
                    return el;
                }
            },
            'html':{
                get:function (el) {
                    return el.innerHTML;
                },
                set:(function () {
                    var mustAppend = /<(?:object|embed|option|style)/i,
                        append = function (inElement, inValue) {
                            //fruit.util.dom.empty(inElement);
                            var elem = new fruit.Element(inElement);
                            elem.empty();
                            inElement.appendChild(fruit.dom.create(inValue));
                        };
                    return function (inElement, inValue) {
                        if (!mustAppend.test(inValue)) {
                            try {
                                inElement.innerHTML = inValue;
                            } catch (ex) {
                                append(inElement, inValue);
                            }
                        } else {
                            append(inElement, inValue);
                        }
                    };
                }()),
                remove:function (el) {
                    el.innerHTML = "";
                    return el;
                }
            },
            // TODO:merge the disabled/readonly/checked and so on..
            'checked':{
                get:function (el) {
                    return el.checked;
                },
                set:function (el, val) {
                    var isChecked = val;
                    el.checked = isChecked;
                    if (isChecked) {
                        el.setAttribute('checked', 'checked');
                    } else {
                        el.removeAttribute('checked');
                    }
                    return el;
                },
                remove:function (el) {
                    if (el) {
                        el.removeAttribute('checked');
                    }
                    return el;
                }
            },
            'disabled':{
                get:function (el) {
                    return el.disabled;
                },
                set:function (el, val) {
                    var isDisabled = val;
                    el.disabled = isDisabled;
                    if (isDisabled) {
                        el.setAttribute('disabled', 'disabled');
                    } else {
                        el.removeAttribute('disabled');
                    }
                    return el;
                },
                remove:function (el) {
                    if (el) {
                        el.removeAttribute('disabled');
                    }
                    return el;
                }
            },
            'readonly':{
                get:function (el) {
                    return el.readOnly;
                },
                set:function (el, val) {
                    var isReadOnly = val;
                    el.readOnly = isReadOnly;
                    if (isReadOnly) {
                        el.setAttribute('readOnly', 'readonly');
                    } else {
                        el.removeAttribute('readOnly');
                    }
                    return el;
                },
                remove:function (el) {
                    var isReadOnly = this.get(el);
                    if (isReadOnly) {
                        el.removeAttribute('readOnly');
                        el.readOnly = false;
                        return el;
                    }
                }
            },
            'selected':{
                // TODO:wating....
                // console.log('selected.')
            },
            'aria-disabled':{
                get:function (el) {
                    return el.getAttribute("aria-disabled");
                },
                set:function (el, val) {
                    var isDisabled = !!val;
                    if (isDisabled) {
                        el.setAttribute('aria-disabled', isDisabled);
                    } else {
                        el.removeAttribute('aria-disabled');
                    }
                    return el;
                },
                remove:function (el) {
                    el.removeAttribute('aria-disabled');
                    return el;
                }
            },
            'aria-checked':{
                get:function (el) {
                    return el.getAttribute("aria-checked");
                },
                set:function (el, val) {
                    var isDisabled = !!val;
                    /*if (isDisabled) {
                     el.setAttribute('aria-checked', isDisabled);
                     } else {
                     el.removeAttribute('aria-checked');
                     }*/
                    el.setAttribute('aria-checked', isDisabled);
                    return el;
                },
                remove:function (el) {
                    el.removeAttribute('aria-checked');
                    return el;
                }
            }
        };
        if (util.isIE) {
            hooks.href = {
                get:function (el) {
                    return el.getAttribute('href', 2);
                },
                set:function (el, val) {
                    return el.setAttribute('href', val);
                }
            };
            hooks.type = {
                get:function (el, attr) {
                    el.getAttribute(el, attr);
                },
                set:function (el, val) {
                    el.type = val;
                    // throw new Error("Can't set the 'type' attribute!");
                },
                remove:function () {
                    //throw new Error("Can't remove the 'type' attribute!");
                }
            }
        }
        return hooks;
    })();
    var cssHooks = (function () {
        var hooks = {
            'float':{
                get:function (el, current) {
                    if (current) {
                        var style = el.ownerDocument.defaultView
                            .getComputedStyle(el);
                        return style ? style.getPropertyValue('cssFloat')
                            : null;
                    } else {
                        return el.style.cssFloat;
                    }
                },
                set:function (el, value) {
                    el.style.cssFloat = value;
                },
                remove:function (el) {
                    el.style.removeProperty('float');
                }
            }
        };
        if (util.isIE) {
            hooks['float'] = {
                get:function (el, current) {
                    return el[current ? 'currentStyle' : 'style'].styleFloat;
                },
                set:function (el, value) {
                    el.style.styleFloat = value;
                },
                remove:function (el) {
                    el.style.removeAttribute('styleFloat');
                }
            };
            hooks.opacity = {
                get:function (el) {
                    var opacity;
                    if (el.filters['alpha']) {
                        opacity = el.filters['alpha'].opacity / 100;
                    } else if (el.filters['DXImageTransform.Microsoft.Alpha']) {
                        opacity = el.filters['DXImageTransform.Microsoft.Alpha'].opacity / 100;
                    }
                    if (isNaN(opacity)) {
                        opacity = 1;
                    }
                    return opacity;
                },
                set:function (el, value) {
                    try {
                        if (el.filters['alpha']) {
                            el.filters['alpha'].opacity = value * 100;
                        } else {
                            el.style.filter += 'alpha(opacity=' + (value * 100)
                                + ')';
                        }
                    } catch (ex) {
                        // ie filter may broken by browser plugins
                    }
                    el.style.opacity = value;
                },
                remove:function (el) {
                    el.style.filter = '';
                    el.style.removeAttribute('opacity');
                }
            };
        }
        return hooks;
    }());
    var _$utils = {
        getRealAttr:function (inAttrName) {
            var attrName = inAttrName.toLowerCase();
            return util.isIE7 ? attrMap[attrName] || attrName : attrName;
        },
        getCssText:function (inElement, attr, value) {
            if (util.isEmpty(value)) {
                return this.removeStyle(inElement, attr);
            }
            var tmpCss = "",
                attrName = util.decamelize(attr),
                attrValue = parseFloat(value),
                attrUnit = this.getUnit(attr, value),
                hook = cssHooks[attr];
            if (!util.isNumeric(attrValue)) {
                attrValue = value;
            }
            if (hook) {
                if('set' in hook){
                    hook.set(inElement, value);
                }
            } else {
                tmpCss = attrName + ":" + attrValue + attrUnit;
            }
            return tmpCss;
        },
        getUnitFromVal:function (val) {
            return val.toString().replace(/^[+-]?[\d\.]+/g, '');
        },
        getUnitFromAttr:function (attr) {
            var attrName = util.camelize(attr);
            if (util.indexOf(cssNoUnit, attrName) === -1) {
                return 'px';
            } else {
                return '';
            }
        },
        getUnit:function (inAttr, inVal) {
            var attrUnit = this.getUnitFromVal(inVal);
            if (attrUnit == inVal) {
                attrUnit = '';
            } else if (!attrUnit) {
                attrUnit = this.getUnitFromAttr(inAttr);
            }
            return attrUnit;
        },
        removeStyle:function (inElement, inStyleName) {
            var name = util.decamelize(inStyleName);
            var hook = cssHooks[name];
            if (hook) {
                if('remove' in hook){
                    hook.remove(this.element);
                }
            } else if (inElement.style.removeAttribute) {
                //ie7/8
                inElement.style.removeAttribute(name);
            } else {
                //w3c+ie9
                inElement.style.removeProperty(name);
            }
        },
        getSize:function (inElement) {
            return {
                width:inElement.offsetWidth,
                height:inElement.offsetHeight
            };
        }
    };
    fruit.define('fruit.Element', {
        implement:'fruit.interfaces.IElement',
        methods:{
            init:function (inElement) {
                this.element = this.__getDomElement(inElement);
            },
            wrap:function (inMix) {
                if (!inMix) return null;
                if (inMix instanceof fruit.Element) return inMix;
                var result = (typeof inMix === 'string') ? document.getElementById(inMix) : inMix;
                return new fruit.Element(result);
            },
            appendChild:function (inElement) {
                this.element.appendChild(this.__getDomElement(inElement));
                return this;
            },
            appendTo:function (inElement) {
                this.__getDomElement(inElement).appendChild(this.element);
                return this;
            },
            insertChild:function (inElement, index) {
                var childNds = this.children();
                var indexElement = childNds[index].element;
                var elem = this.__getDomElement(inElement);
                if (elem && indexElement) {
                    this.element.insertBefore(elem, indexElement);
                }
                return this;
            },
            insertBefore:function (newchild, refchild) {
                this.element.insertBefore(this.__getDomElement(newchild), this.__getDomElement(refchild));
                return this;
            },
            prependChild:function (inElement) {
                return this.insertChild(this.__getDomElement(inElement), 0);
            },
            prependTo:function (inElement) {
                return this.wrap(inElement).insertChild(this.element, 0);
            },
            insertTo:function (inElement, index) {
                var childNds = this.children();
                return this.__getDomElement(inElement).insertBefore(this.element, childNds[index]);
            },
            removeChild:function (inElement) {
                this.element.removeChild(this.__getDomElement(inElement));
                return this;
            },
            remove:function () {
                var parent = this.parent();
                parent ? parent.removeChild(this.element) : null;
                return this;
            },
            empty:function () {
                while (this.element.firstChild) {
                    this.element.removeChild(this.element.firstChild);
                }
                return this;
            },
            //TODO:has some bug when the element has object attributes.
            clone:function (inIsDeep) {
                var node = this.element.cloneNode(inIsDeep);
                return this.wrap(node);
            },
            getElement:function () {
                return this.element;
            },
            __getDomElement:function (inElement) {
                return (inElement instanceof fruit.Element) ? inElement.element : inElement;
            },
            focus:function () {
                this.element.focus();
            },
            blur:function () {
                this.element.blur();
            },
            //TODO:Maybe can remove the event-core 'addEvent' function
            on:(function () {
                return document.addEventListener ? function (inType, inHandler, inUseCapture) {
                    this.element.addEventListener(inType, inHandler, inUseCapture || false);
                } : function (inType, inHandler) {
                    var element = this.element;
                    element.attachEvent("on" + inType, function () {
                        inHandler.call(element, window.event);
                    });
                }
            }()),
            //TODO:Maybe can remove the event-core 'removeEvent' function
            off:(function () {
                return document.removeEventListener ? function (inType, inHandler, inUseCapture) {
                    this.element.removeEventListener(inType, inHandler, inUseCapture || false);
                } : function (inType, inHandler) {
                    var element = this.element;
                    element.detachEvent('on' + inType, function () {
                        inHandler.call(element, window.event);
                    });
                };
            }()),
            contains:function (inElement) {
                var a = this.element;
                inElement = this.__getDomElement(inElement);
                return a.contains ? a != inElement && a.contains(inElement) : !!(a.compareDocumentPosition(inElement) & 16);
            },
            getIndex:function (inElement) {
                var children = this.children();
                var i = children.length;
                inElement = this.__getDomElement(inElement);
                while (i--) {
                    if (children[i].element === inElement) {
                        return ++i;
                    }
                }
                return -1;
            },
            /*******************dom operate***********************/
            getStyle:function (inStyleName) {
                var hook = cssHooks[inStyleName], result;
                if (hook) {
                    if('get' in hook){
                        result = hook.get(this.element, true);
                    }
                } else if (util.isIE) {
                    result = this.element.currentStyle[util.camelize(inStyleName)];
                    result = borderMap[result] || result;
                } else {
                    var style = this.element.ownerDocument.defaultView.getComputedStyle(this.element, null);
                    result = style ? style.getPropertyValue(util.decamelize(inStyleName)) : null;
                }
                return (!result || (util.toInt(result) === 0) || result == 'auto') ? 0 : result;
            },
            setStyle:function (attr, value) {
                if (util.isEmpty(attr)) return;
                var tempCss = "",
                    i,
                    tempArr = [];
                if (typeof value !== 'undefined') {
                    tempCss = _$utils.getCssText(this.element, attr, value);
                } else {
                    var resObj = {};
                    if (!util.isString(attr)) {
                        resObj = attr;
                    } else {
                        //parseStyle:"width:100px; height:200px; font-size:12px; font-family:'sumei','yaihei';"
                        var resArr = attr.replace(rstripStyleSpace, "$1").split(/[;:](?=[\w\s])/);
                        var len = resArr.length;
                        for (i = 0; i < len; i++) {
                            resObj[resArr[i]] = resArr[++i];
                        }
                    }
                    for (i in resObj) {
                        tempArr.push(_$utils.getCssText(this.element, i, resObj[i]));
                    }
                    tempCss = tempArr.join(";");
                }
                this.element.style.cssText += ";" + tempCss;
                var curStyle = this.element.getAttribute("style");
                if (util.isEmpty(curStyle) && curStyle !== null) {
                    this.removeStyle(curStyle);
                }
                return this;
            },
            hasStyle:function (inStyle) {
                var i, styles = this.element.style.cssText.split(";");
                var rexp = /^([\w-]+):(.*)$/;
                for (i = 0; i < styles.length; i++) {
                    if (rexp.test(styles[i]) && styles[i].replace(rexp, "$1") === inStyle) {
                        return true;
                    }
                }
                return false;
            },
            measure:function (name) {
                var result;
                // measure a element's dimension of given key
                switch (name) {
                    case ":padding-box-width":
                        // TODO
                        break;
                    case ":padding-box-height":
                        // TODO
                        break;
                    case ":border-box-width":
                        // TODO
                        break;
                    case ":border-box-height":
                        // TODO
                        break;
                    case ":margin-box-width":
                        // TODO
                        break;
                    case ":margin-box-height":
                        // TODO
                        break;
                    default:
                        result = (this.getStyle(name) || '0px').replace(/auto/, '0px').replace(/px/g, '');
                }
                return result;
            },
            removeStyle:function (inStyleName) {
                var styleName = (inStyleName && (util.isArray(inStyleName) ? inStyleName
                    : [ inStyleName ])) || false;
                if (styleName) {
                    var len = styleName.length;
                    while (len--) {
                        _$utils.removeStyle(this.element, styleName[len]);
                    }
                } else {
                    // TODO:testing removeAttribute(this.element,"style");
                    if (this.element.removeAttribute) {
                        this.element.removeAttribute("style");
                    } else {
                        //this.element.style.cssText = "";
                    }
                }
                return this;
            },
            addClass:function (inClassName) {
                if (inClassName && !this.hasClass(inClassName)) {
                    this.element.className = this.element.className ? this.element.className
                        + ' ' + inClassName : inClassName;
                }
                return this;
            },
            toggleClass:function (className1, className2) {
                className2 = className2 || '';
                if (this.hasClass(className1)) {
                    this.replaceClass(className1, className2);
                } else {
                    this.replaceClass(className2, className1);
                }
            },
            removeClass:function (inClassName) {
                if (inClassName && this.hasClass(inClassName)) {
                    this.element.className = this.element.className.replace(new RegExp(
                        '(?:^|\\s)' + inClassName + '(?=\\s|$)', 'ig'), '');
                } else if (util.isEmpty(inClassName)) {
                    this.element.className = "";
                }
                //todo:
                var cls = _$utils.getRealAttr("class");
                var hasCls = this.element.getAttribute(cls);
                if (util.isEmpty(hasCls) && hasCls !== null) {
                    this.removeAttribute("class");
                }
                return this;
            },
            setClass:function (inClassName) {
                this.setAttribute('class', inClassName);
            },
            hasClass:function (inClassName) {
                var className = this.element.className;
                if (!className) return false;
                var names = className.split(/\s+/),
                    len = names.length;
                while (len--) {
                    if (inClassName === names[len]) {
                        return true;
                    }
                }
                return false;
            },
            replaceClass:function (inOldClassName, inNewClassName) {
                if (inOldClassName) {
                    var oldNames = inOldClassName.split(/\s+/),
                        newNames = inNewClassName.split(/\s+/),
                        i = oldNames.length,
                        j = newNames.length;
                    while (i--) {
                        this.removeClass(oldNames[i]);
                    }
                    while (j--) {
                        this.addClass(newNames[j]);
                    }
                } else {
                    this.addClass(inNewClassName);
                }
                //todo:
                var cls = _$utils.getRealAttr("class");
                var hasCls = this.element.getAttribute(cls);
                if (util.isEmpty(hasCls) && hasCls !== null) {
                    this.removeAttribute("class");
                }
                return this;
            },
            getClass:function () {
                return this.getAttribute('class');
            },
            setAttribute:function (inName, inValue) {
                var name, val;
                if (typeof inName !== 'object') {
                    this.__setAttribute(this.element, inName, inValue);
                } else {
                    for (name in inName) {
                        val = inName[name];
                        this.__setAttribute(this.element, name, val);
                    }
                }
                return this;
            },
            __setAttribute:function (inElement, inName, inValue) {
                var name = _$utils.getRealAttr(inName);
                var hook = attrHooks[name];
                if (inValue !== undefined && inValue !== null) {
                    if (hook) {
                        if('set' in hook){
                            hook.set(inElement, inValue);
                        }
                    } else {
                        inElement.setAttribute(name, inValue);
                    }
                } else {
                    this.removeAttribute(name);
                }
            },
            getAttribute:function (inName) {
                var hook = attrHooks[inName];
                if (hook && 'get' in hook) {
                    return hook.get(this.element);
                }
                var name = _$utils.getRealAttr(inName);
                return this.element.getAttribute(name);
            },
            removeAttribute:function (inName) {
                var hook = attrHooks[inName];
                if (hook) {
                    if('remove' in hook){
                        hook.remove(this.element, inName);
                    }
                } else {
                    this.element.removeAttribute(_$utils.getRealAttr(inName));
                }
            },
            setText:function (inText) {
                this.setAttribute('text', inText);
            },
            getText:function () {
                return this.getAttribute('text')
            },
            setHtml:function (inHtml) {
                this.setAttribute('html', inHtml);
            },
            getHtml:function () {
                return this.getAttribute('html');
            },
            setValue:function (inValue) {
                this.setAttribute('value', inValue);
            },
            getValue:function () {
                return this.getAttribute('value');
            },
            find:function (selector) {
            },
            closest:function (selector) {
            },
            children:function () {
                var fChild = this.firstChild();
                if (null === fChild) return [];
                return Array.prototype.concat(fChild, fChild.__sibling(true, true));
            },
            childAt:function (inIndex) {
                return this.children()[inIndex];
            },
            firstChild:function () {
                return this.__findChild('firstChild', 'nextSibling');
            },
            lastChild:function () {
                return this.__findChild('lastChild', 'previousSibling');
            },
            parent:function () {
                var parent = this.element.parentNode;
                return parent && !this.isSpecialElement() && parent.nodeType !== 11 ? this.wrap(parent) : null;
            },
            nextSibling:function () {
                return this.__sibling(true);
            },
            previousSibling:function () {
                return this.__sibling(false);
            },
            isSpecialElement:function () {
                var element = this.element;
                return element && ((element === document) || (element === window) || /^(?:html)$/i.test(element.tagName));
            },
            getWidth:function (inBoxModel) {
                var sizeObj = this.getSize(inBoxModel);
                return sizeObj.width;
            },
            setWidth:function (inWidth) {
                this.setSize(inWidth, null);
            },
            getHeight:function (inBoxModel) {
                var sizeObj = this.getSize(this.element, inBoxModel);
                return sizeObj.height;
            },
            setHeight:function (inHeight) {
                this.setSize(null, inHeight);
            },
            offset:function () {
                return {
                    left:this.element.offsetLeft,
                    top:this.element.offsetTop
                };
            },
            position:function (inIsAbs) {
                var xyInfo = this.getXY(this.element, inIsAbs);
                return {
                    left:xyInfo.x,
                    top:xyInfo.y
                };
            },
            setScroll:function (inObj) {
                //TODO:Maybe must use jquery getWindow function for get window
                window.scrollTo(inObj.x, inObj.y);
            },
            getScroll:function () {
                var docInfo = this.getDocRect();
                return {
                    left:docInfo.scrollX,
                    top:docInfo.scrollY
                };
            },
            getAttrWidth:function (attrType) {
                var type = attrType || 'padding';
                var attrs = boxAttrs[type];
                return {
                    top:util.toFloat(this.getStyle(attrs[0])),
                    right:util.toFloat(this.getStyle(attrs[1])),
                    bottom:util.toFloat(this.getStyle(attrs[2])),
                    left:util.toFloat(this.getStyle(attrs[3]))
                };
            },
            //Thanks qwrap,yui
            getXY:function (inIsAbs) {
                var isAbs = inIsAbs || false;
                var xyInfo = this.__getXY(this.element);
                var xy = {};
                if (!isAbs) {
                    xy = {
                        x:xyInfo[0],
                        y:xyInfo[1]
                    };
                } else {
                    var docInfo = this.getDocRect();
                    xy = {
                        x:xyInfo[0] - docInfo.scrollX,
                        y:xyInfo[1] - docInfo.scrollY
                    };
                }
                return xy;
            },
            setXY:function (el, x, y) {
                var left = util.toFloat(x, 10);
                var top = util.toFloat(y, 10);
                this.setStyle({
                    left:left,
                    top:top
                });
            },
            getSize:function (inBoxModel) {
                var sizeObj = _$utils.getSize(this.element),
                    boxModel = inBoxModel || false;
                if (this.getStyle("display") === "none" /*|| this.getStyle("display") === "inline"*/) {
                    var oldVisible = this.getStyle("visibility");
                    var oldPosition = this.getStyle("position");
                    this.setStyle({
                        "display":"block",
                        "visibility":"hidden",
                        "position":"absolute"
                    });
                    sizeObj = _$utils.getSize(this.element);
                    this.setStyle({
                        "display":"none",
                        "visibility":oldVisible,
                        "position":oldPosition
                    });
                }
                if (boxModel) {
                    var borders = this.getAttrWidth('border');
                    var paddings = this.getAttrWidth('padding');
                    sizeObj = {
                        width:sizeObj.width - borders.left - borders.right - paddings.left - paddings.right,
                        height:sizeObj.height - borders.top - borders.bottom - paddings.top - paddings.bottom
                    };
                }
                return sizeObj;
            },
            setSize:function (inWidth, inHeight) {
                var width = parseFloat(inWidth);
                var height = parseFloat(inHeight);
                var borders = this.getAttrWidth('border');
                var paddings = this.getAttrWidth('padding');
                if (!isNaN(width)) {
                    this.setStyle({'width':Math.max(width - borders.right - borders.left - paddings.right - paddings.left, 0)});
                }
                if (!isNaN(height)) {
                    this.setStyle({'height':Math.max(height - borders.top - borders.bottom - paddings.top - paddings.bottom, 0)});
                }
            },
            getBound:function (inIsAbs) {
                var xyInfo = this.getXY(inIsAbs),
                    size = this.getSize(inIsAbs);
                return {
                    x:xyInfo.x,
                    y:xyInfo.y,
                    width:size.width,
                    height:size.height
                };
            },
            getRect:function (inIsAbs) {
                var p = this.getXY(inIsAbs);
                var x = p.x;
                var y = p.y;
                var w = this.element.offsetWidth;
                var h = this.element.offsetHeight;
                return {
                    'width':w,
                    'height':h,
                    'left':x,
                    'top':y,
                    'bottom':y + h,
                    'right':x + w
                };
            },
            setInnerSize:function (inWidth, inHeight) {
                var width = parseFloat(inWidth);
                var height = parseFloat(inHeight);
                if (!isNaN(width)) {
                    this.setStyle({'width':width});
                }
                if (!isNaN(height)) {
                    this.setStyle({'height':height});
                }
            },
            __findChild:function (inChildType, inFindMethod) {
                var node = this.element[inChildType];
                while (node && node.nodeType != 1) {
                    node = node[inFindMethod];
                }
                return this.wrap(node);
            },
            __sibling:function (isNext, isArrs) {
                var arr = isArrs ? [] : null;
                var next = isNext || null;
                var arrs = isArrs || null;
                var prop = (next) ? "nextSibling" : "previousSibling";
                var tmpNode = this.element && this.element[prop];
                while (tmpNode) {
                    if (tmpNode && tmpNode.nodeType === 1) {
                        if (arrs) {
                            arr.push(this.wrap(tmpNode));
                        } else {
                            return this.wrap(tmpNode);
                        }
                    }
                    tmpNode = tmpNode[prop];
                }
                return arr;
            },
            __getXY:(function () {
                var calcBorders = function (node, xy) {
                    var t = parseInt(this.wrap(node).getStyle('borderTopWidth'), 10) || 0,
                        l = parseInt(this.wrap(node).getStyle('borderLeftWidth'), 10) || 0;
                    if (util.isGecko) {
                        if (/^t(?:able|d|h)$/i.test(node.tagName)) {
                            t = l = 0;
                        }
                    }
                    xy[0] += l;
                    xy[1] += t;
                    return xy;
                };
                return document.documentElement.getBoundingClientRect ?
                    function (node) {
                        var doc = node.ownerDocument,
                            docRect = fruit.dom.getDocRect(doc),
                            scrollLeft = docRect.scrollX,
                            scrollTop = docRect.scrollY,
                            box = node.getBoundingClientRect(),
                            xy = [box.left, box.top],
                            mode,
                            off1,
                            off2;
                        if (util.isIE) {
                            off1 = doc.documentElement.clientLeft;
                            off2 = doc.documentElement.clientTop;
                            mode = doc.compatMode;
                            if (mode == 'BackCompat') {
                                off1 = doc.body.clientLeft;
                                off2 = doc.body.clientTop;
                            }
                            xy[0] -= off1;
                            xy[1] -= off2;
                        }
                        if (scrollTop || scrollLeft) {
                            xy[0] += scrollLeft;
                            xy[1] += scrollTop;
                        }
                        return xy;
                    } : function () {
                    var node = this.element,
                        xy = [node.offsetLeft, node.offsetTop],
                        parentNode = node.parentNode,
                        doc = node.ownerDocument,
                        docRect = this.getDocRect(doc),
                        bCheck = !!(util.isGecko || parseFloat(util.isSafari) > 519),
                        scrollTop = 0,
                        scrollLeft = 0;
                    while ((parentNode = parentNode.offsetParent)) {
                        xy[0] += parentNode.offsetLeft;
                        xy[1] += parentNode.offsetTop;
                        if (bCheck) {
                            xy = calcBorders(parentNode, xy);
                        }
                    }
                    if (this.getStyle('position') != 'fixed') {
                        parentNode = node;
                        while (parentNode = parentNode.parentNode) {
                            scrollTop = parentNode.scrollTop;
                            scrollLeft = parentNode.scrollLeft;
                            if (util.isGecko && (this.wrap(parentNode).getStyle('overflow') !== 'visible')) {
                                xy = calcBorders(parentNode, xy);
                            }
                            if (scrollTop || scrollLeft) {
                                xy[0] -= scrollLeft;
                                xy[1] -= scrollTop;
                            }
                        }
                    }
                    xy[0] += docRect.scrollX;
                    xy[1] += docRect.scrollY;
                    return xy;
                };
            }())
        }
    });
})(fruit, fruit.util, fruit.dom, document, undefined, window);
/**
 * fruit dom element collection class
 * @namespace fruit
 * @class fruit.ElementCollection
 */
fruit.defineInterface('fruit.interfaces.IElementCollection', [
    'each'
]);


fruit.define('fruit.ElementCollection', {
    implement:'fruit.interfaces.IElementCollection',
    methods:{
        init:function (inDomArray) {
            var domArray = this.domArray = [];
            fruit.util.each(inDomArray,function(el){
                domArray.push(new new fruit.implementations.Element(el));
            });
        },
        each:function(){

        }
    }
});
/**
 * fruit dom element collection class
 * @namespace fruit
 * @class fruit.dom
 */
fruit.defineInterface('fruit.interfaces.IElementFactory', [
/**
 * @method byId
 */
    'byId',
/**
 * @method byClass
 */
    'byClass',
/**
 * @method create
 */
    'create',
/**
 * @method clearSelection
 */
    'clearSelection'
]);
(function (fruit, util) {
    fruit.define("fruit.ElementFactory", {
        //singleton:true,
        implement:'fruit.interfaces.IElementFactory',
        methods:{
            byId:function (inElement) {
                var fElement;
                if (typeof inElement === 'string') {
                    fElement = new fruit.Element(document.getElementById(inElement));
                } else {
                    fElement = new fruit.Element(inElement);
                }
                return fElement;
            },
            getByClass:function (inClassName) {
                return document.querySelector && new fruit.Element(document.querySelector(inClassName));
            },
            isElement:function (inElement) {
                return !!inElement && inElement.nodeType == 1;
            },
            'create':(function () {
                var temp = document.createElement('div'),
                    wrap = {
                        option:[1, '<select multiple="multiple">', '</select>'],
                        optgroup:[1, '<select multiple="multiple">', '</select>'],
                        legend:[1, '<fieldset>', '</fieldset>'],
                        thead:[1, '<table>', '</table>'],
                        tbody:[1, '<table>', '</table>'],
                        tfoot:[1, '<table>', '</table>'],
                        tr:[2, '<table><tbody>', '</tbody></table>'],
                        td:[3, '<table><tbody><tr>', '</tr></tbody></table>'],
                        th:[3, '<table><tbody><tr>', '</tr></tbody></table>'],
                        col:[2, '<table><tbody></tbody><colgroup>', '</colgroup></table>'],
                        _default:[0, '', '']
                    };
                return function (inHtml) {
                    var htmlTag = inHtml.match(/<(\w+)/i); // match tag
                    if (!htmlTag) return;
                    var wraper = wrap[htmlTag[1]] || wrap._default,
                        dep = wraper[0];
                    temp.innerHTML = wraper[1] + inHtml + wraper[2];
                    if (dep) {
                        while (dep--) {
                            temp = temp.firstChild;
                        }
                    }
                    var frag = document.createDocumentFragment(), node = null;
                    while (node = temp.firstChild) {
                        frag.appendChild(node);
                    }
                    return frag;
                };
            }()),
            clearSelection:function () {
                return ('getSelection' in window ? function () {
                    window.getSelection().removeAllRanges();
                } : function () {
                    try {
                        document.selection.empty();
                    } catch (e) {
                    }
                })();
            },
            getDocRect:function (doc) {
                doc = doc || document;
                var win = doc.defaultView || doc.parentWindow,
                    mode = doc.compatMode,
                    root = doc.documentElement,
                    h = win.innerHeight || 0,
                    w = win.innerWidth || 0,
                    scrollX = win.pageXOffset || 0,
                    scrollY = win.pageYOffset || 0,
                    scrollW = root.scrollWidth,
                    scrollH = root.scrollHeight;
                if (mode != 'CSS1Compat') { // Quirks
                    root = doc.body;
                    scrollW = root.scrollWidth;
                    scrollH = root.scrollHeight;
                }
                if (mode) { // IE, Gecko
                    w = root.clientWidth;
                    h = root.clientHeight;
                }
                scrollW = Math.max(scrollW, w);
                scrollH = Math.max(scrollH, h);
                scrollX = Math.max(scrollX, doc.documentElement.scrollLeft, doc.body.scrollLeft);
                scrollY = Math.max(scrollY, doc.documentElement.scrollTop, doc.body.scrollTop);
                return {
                    width:w,
                    height:h,
                    scrollWidth:scrollW,
                    scrollHeight:scrollH,
                    scrollX:scrollX,
                    scrollY:scrollY
                };
            },
            createElement:function (inTag) {
                return new fruit.Element(document.createElement(inTag));
            },
            getBody:function () {
                return  new fruit.Element(document.body);
            },
            createTextNode:function (inText) {
                return new fruit.Element(document.createTextNode(inText));
            }
        }
    });
    /**
     * fruit.dom is a instance of fruit.ElementFactory
     * @type {fruit.ElementFactory}
     */
    fruit.dom = util.extend({}, new fruit.ElementFactory());
})(fruit, fruit.util);
/**
 * fruit cache class
 * @namespace fruit
 * @class fruit.cache
 * @ignore
 */
(function (fruit, util) {
    var expando = "fruit" + (new Date).getTime(),
        cacheData = {},
        hasOwnProperty = Object.prototype.hasOwnProperty;
    fruit.cache = {
        __hasCache:function (obj) {
            return hasOwnProperty.call(obj, expando);
        },
        __isEmptyObject:function (obj) {
            var name;
            for (name in obj) {
                return false;
            }
            return true;
        },
        __removeAttr:function (obj, attr) {
            try {
                delete obj[attr];
            }
            catch (e) {
                obj.removeAttribute(attr);
            }
        },
        __dataStr:function (str, data) {
            if (data !== undefined) {
                cacheData[str] = data;
            } else {
                return cacheData[str];
            }
        },
        __dataObj:function (obj, name, data) {
            var thisCache;
            if (!this.__hasCache(obj)) {
                obj[ expando ] = {};
            }
            thisCache = obj[ expando ];
            if (typeof name === "string") {
                if (data !== undefined) {
                    thisCache[ name ] = data;
                }
                return thisCache[ name ];
            }
            return thisCache;
        },
        /**
         * Cache date to obj
         * @param obj
         * @param name
         * @param data
         * @return {*}
         * @ignore
         */
        data:function (obj, name, data) {
            if (util.isString(obj)) {
                return this.__dataStr(obj, name);
            } else {
                return this.__dataObj(obj, name, data);
            }
        },
        /**
         * Remove date from obj
         * @param obj
         * @param name
         * @ignore
         */
        remove:function (obj, name) {
            if (name) {
                if (this.__hasCache(obj)) {
                    //delete obj[ expando ][ name ];
                    this.__removeAttr(obj[expando], name);
                    if (this.__isEmptyObject(obj[expando])) {
                        this.__removeAttr(obj, expando);
                        //delete obj[ expando ];
                    }
                }
            } else {
                //delete obj[ expando ];
                //this.__removeAttr(obj,expando);
                this.__removeAttr(cacheData, obj);
            }
        },
        /**
         * Save date to element
         * @param elem
         * @param data
         * @param dataString
         * @ignore
         */
        queue:function (elem, data, dataString) {
            var dataStr = dataString || "fruit";
            var animQueue = this.data(elem, dataStr) || this.data(elem, dataStr, []);
            if (data) {
                animQueue.push(data);
                this.dequeue(elem);
            }
        },
        /**
         * Call queue function and remove it.
         * @param elem
         * @ignore
         */
        dequeue:function (elem) {
            var me = this,
                animQueue = this.data(elem, dataStr) || this.data(elem, dataStr, []),
                fn = animQueue.shift();
            if (fn && typeof fn === 'function') {
                fn.call(elem, function () {
                    me.dequeue(elem);
                });
            }
            //lenght=0;
            if (!animQueue.length) {
                this.remove(elem, dataStr);
            }
        }
    };

})(fruit, fruit.util);
(function(fruit, dom, util) {
    var boxAttrs = {
        'margin':[ 'marginTop', 'marginRight', 'marginBottom', 'marginLeft'],
        'padding':[ 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'],
        'border':['borderTopWidth','borderRightWidth','borderBottomWidth','borderLeftWidth']
    };

    /**
     * @namespace fruit.dom
     * @constructor
     * @class fruit.dom.position
     */
    fruit.ns('fruit.dom.position').extend({
        /**
         *
         */
        getDocRect: function(doc) {
            doc = doc || document;

            var win = doc.defaultView || doc.parentWindow,
                mode = doc.compatMode,
                root = doc.documentElement,
                h = win.innerHeight || 0,
                w = win.innerWidth || 0,
                scrollX = win.pageXOffset || 0,
                scrollY = win.pageYOffset || 0,
                scrollW = root.scrollWidth,
                scrollH = root.scrollHeight;

            if (mode != 'CSS1Compat') { // Quirks
                root = doc.body;
                scrollW = root.scrollWidth;
                scrollH = root.scrollHeight;
            }

            if (mode) { // IE, Gecko
                w = root.clientWidth;
                h = root.clientHeight;
            }

            scrollW = Math.max(scrollW, w);
            scrollH = Math.max(scrollH, h);

            scrollX = Math.max(scrollX, doc.documentElement.scrollLeft, doc.body.scrollLeft);
            scrollY = Math.max(scrollY, doc.documentElement.scrollTop, doc.body.scrollTop);

            return {
                width: w,
                height: h,
                scrollWidth: scrollW,
                scrollHeight: scrollH,
                scrollX: scrollX,
                scrollY: scrollY
            };
        },
        /**
         *
         */
        getAttrWidth:function(el, attrType) {
            var type = attrType || 'padding';
            var attrs = boxAttrs[type];
            return {
                top:util.toFloat(dom.getCurrentStyle(el, attrs[0])),
                right:util.toFloat(dom.getCurrentStyle(el, attrs[1])),
                bottom:util.toFloat(dom.getCurrentStyle(el, attrs[2])),
                left:util.toFloat(dom.getCurrentStyle(el, attrs[3]))
            };
        },
        /**
         *
         */

        __getXY: (function() {
            var calcBorders = function(node, xy) {
                var t = parseInt(dom.getCurrentStyle(node, 'borderTopWidth'), 10) || 0,
                    l = parseInt(dom.getCurrentStyle(node, 'borderLeftWidth'), 10) || 0;

                if (util.isGecko) {
                    if (/^t(?:able|d|h)$/i.test(node.tagName)) {
                        t = l = 0;
                    }
                }
                xy[0] += l;
                xy[1] += t;
                return xy;
            };

            return document.documentElement.getBoundingClientRect ?
                function(node) {
                    var doc = node.ownerDocument,
                        docRect = this.getDocRect(doc),
                        scrollLeft = docRect.scrollX,
                        scrollTop = docRect.scrollY,
                        box = node.getBoundingClientRect(),
                        xy = [box.left, box.top],
                        mode,
                        off1,
                        off2;
                    if (util.isIE) {
                        off1 = doc.documentElement.clientLeft;
                        off2 = doc.documentElement.clientTop;
                        mode = doc.compatMode;

                        if (mode == 'BackCompat') {
                            off1 = doc.body.clientLeft;
                            off2 = doc.body.clientTop;
                        }

                        xy[0] -= off1;
                        xy[1] -= off2;

                    }

                    if (scrollTop || scrollLeft) {
                        xy[0] += scrollLeft;
                        xy[1] += scrollTop;
                    }

                    return xy;

                } : function(node) {
                var xy = [node.offsetLeft, node.offsetTop],
                    parentNode = node.parentNode,
                    doc = node.ownerDocument,
                    docRect = this.getDocRect(doc),
                    bCheck = !!(util.isGecko || parseFloat(util.isSafari) > 519),
                    scrollTop = 0,
                    scrollLeft = 0;

                while ((parentNode = parentNode.offsetParent)) {
                    xy[0] += parentNode.offsetLeft;
                    xy[1] += parentNode.offsetTop;
                    if (bCheck) {
                        xy = calcBorders(parentNode, xy);
                    }
                }

                if (dom.getCurrentStyle(node, 'position') != 'fixed') {
                    parentNode = node;

                    while (parentNode = parentNode.parentNode) {
                        scrollTop = parentNode.scrollTop;
                        scrollLeft = parentNode.scrollLeft;

                        if (util.isGecko && (dom.getCurrentStyle(parentNode, 'overflow') !== 'visible')) {
                            xy = calcBorders(parentNode, xy);
                        }
                        if (scrollTop || scrollLeft) {
                            xy[0] -= scrollLeft;
                            xy[1] -= scrollTop;
                        }
                    }
                }
                xy[0] += docRect.scrollX;
                xy[1] += docRect.scrollY;
                return xy;
            };

        }()),

        getXY:function(inElement,inIsAbs){
            var isAbs=inIsAbs || false;
            var xyInfo=this.__getXY(inElement);
            var xy={};
            if(!isAbs){
                xy={
                    x:xyInfo[0],
                    y:xyInfo[1]
                };
            }else{
                var docInfo=this.getDocRect();
                xy={
                    x:xyInfo[0]-docInfo.scrollX,
                    y:xyInfo[1]-docInfo.scrollY
                };
            }
            return xy;
        },
        //margin || postion layout exsit one.
        /**
         *
         */
        setXY : function(el, x, y) {
            var left = util.toFloat(x, 10);
            var top = util.toFloat(y, 10);
            dom.setStyle(el, {
                left : left,
                top:top
            });
        },

        getVisibleElSize:function(inElement) {
            return {
                width: inElement.offsetWidth,
                height: inElement.offsetHeight
            };
        },
        /**
         *
         */
        getSize: function(el, inBoxModel) {
            var sizeObj;
            var boxModel = inBoxModel || false;
            if (dom.getCurrentStyle(el, "display") != "none" && dom.getCurrentStyle(el, "display") != "inline") {
                sizeObj = this.getVisibleElSize(el);
            } else {
                var oldVisible = dom.getCurrentStyle(el, "visibility");
                var oldPosition = dom.getCurrentStyle(el, "position");
                dom.setStyle(el, {
                    "display":"block",
                    "visibility":"hidden",
                    "position":"absolute"
                });
                sizeObj = this.getVisibleElSize(el);
                dom.setStyle(el, {
                    "display":"none",
                    "visibility":oldVisible,
                    "position":oldPosition
                });
            }

            if (boxModel) {
                var borders = this.getAttrWidth(el, 'border');
                var paddings = this.getAttrWidth(el, 'padding');
                sizeObj = {
                    width:sizeObj.width - borders.left - borders.right - paddings.left - paddings.right,
                    height:sizeObj.height - borders.top - borders.bottom - paddings.top - paddings.bottom
                };
            }

            return sizeObj;
        },
        /**
         *
         */
        setSize: function(el, w, h) {
            var width = parseFloat(w);
            var height = parseFloat(h);
            var borders = this.getAttrWidth(el, 'border');
            var paddings = this.getAttrWidth(el, 'padding');
            if (!isNaN(width)) {
                dom.setStyle(el, {'width': Math.max(width - borders.right - borders.left - paddings.right - paddings.left, 0)});
            }
            if (!isNaN(height)) {
                dom.setStyle(el, {'height': Math.max(height - borders.top - borders.bottom - paddings.top - paddings.bottom, 0)});
            }
        },
        /**
         *
         */
        setInnerSize: function(el, w, h) {
            var width = parseFloat(w);
            var height = parseFloat(h);
            if (!isNaN(width)) {
                dom.setStyle(el, {'width':width});
            }
            if (!isNaN(height)) {
                dom.setStyle(el, {'height':height});
            }
        },
        //rename:@refer:getBoundingClientRect()
        //http://ejohn.org/blog/getboundingclientrect-is-awesome/
        /**
         *
         */
        getRect: function(el) {
            var p = this.getXY(el);
            var x = p.x;
            var y = p.y;
            var w = el.offsetWidth;
            var h = el.offsetHeight;
            return {
                'width': w,
                'height': h,
                'left': x,
                'top': y,
                'bottom': y + h,
                'right': x + w
            };
        },
        getBound:function(inElement,inIsAbs) {
            var p = this.getXY(inElement,inIsAbs);
            var x = p.x;
            var y = p.y;
            var w = inElement.offsetWidth;
            var h = inElement.offsetHeight;
            return {
                'width': w,
                'height': h,
                'x': x,
                'y': y
            };
        },
        /**
         *
         */
        setRect: function(el, x, y, w, h) {
            this.setXY(el, x, y);
            this.setSize(el, w, h);
        }
    });

})(fruit, fruit.dom, fruit.util);
(function(fruit, util,dom) {
	dom.ellipsis= {
		/**
         * @ignore
		 * Ellipsis the text inside an element if overflow.
		 * Example usage:
		 * <pre>
		 * jasa.dom.util.hack.ellipsis(el, {
		 * 	height: 300, // Optional. Set the height of the element, default to current height of element.
		 * 	lines: 10, // Optional. Set the lines shown at last, doesn't take effect if options.height specified.
		 * 	text: "$%^&U*()", // Optional. used to update the element's content; default to current element content.
		 * 	symbol: "..", // Optional. The ellipsis symbol; default to "...".
		 * 	keepInTail: 6 // Optional. Characters in tail will be kept(e.g. 'a-long-long-name.pdf' may be shown as 'a-l...me.pdf'); default to 0. 
		 * }
		 * </pre> 
		 * @param el The target element
		 * @param options The ellipsis options
		 */
		ellipsis : (function() {
			var TRY_ONE = "W";
			var TRY_BIG = "W W W W W W W W W W W W W W W W W W W W W W W W W W W W W W W W W W W W W W W W W W W W W W W W W W W W W W W W W W W W W W W W W W W W W W W W W W W W W W W W W W W W W W W W W W W W W W W W W W W W W W W W W W W W W W W W W W W W W W W W";
			function get_line_height(el) {
				var h1 = set_content(el, TRY_BIG);
				if (h1 == 0) {
					throw 'Cannot get line height';
				}
				var h2 = set_content(el, TRY_ONE + " " + TRY_BIG);
				if (h2 > h1) {
					return h2 - h1;
				}
				var h0 = set_content(el, TRY_ONE);
				var h2 = set_content(el, TRY_BIG + " " + TRY_BIG);
				if (h2 == h1) {
					throw 'Cannot get line height';
				}
				return h2 + h0 - h1 * 2;
			}
			function set_content(el, text) {
				var h;
				el.textContent = text;
				h = dom.measure(el, "height");
				if (text && !h) {
					throw 'Cannot get height';
				}
				return h;
			}
			return function(el, options) {
				options = options || {};
				var exception = null;
				var origin_text = options.text || el.textContent;
				var text = options.keepInTail ? origin_text.substring(0, origin_text.length - options.keepInTail) : origin_text;
				var tail = options.keepInTail ? origin_text.substring(origin_text.length - options.keepInTail) : "";
				var symbol = options.symbol || "...";
				// remember the current style of target element, and reset them
				var styleOverflow = dom.hasStyle(el, "overflow") && dom.getStyle(el, "overflow");
				var styleWidth = dom.hasStyle(el, "width") && dom.getStyle(el, "width");
				var styleHeight = dom.hasStyle(el, "height") && dom.getStyle(el, "height");
				try {
					// find out the destine height and line height
					var height, line_height, pad_height;
					if (options.lines) {
						// set it auto extend height
						dom.setStyle(el, "width", dom.measure(el, "width") + 'px');
						dom.setStyle(el, "height", "auto");
						// get the line height
						line_height = get_line_height(el);
						// get the pad height
						pad_height = set_content(el, "|") - line_height;
						// calculate the height
						height = line_height * options.lines;
					} else {
						// get the height
						height = options.height || dom.measure(el, "height");
						// set it auto extend height
						dom.setStyle(el, "width", dom.measure(el, "width") + 'px');
						dom.setStyle(el, "height", "auto");
						// get the line height
						line_height = get_line_height(el);
						// get the pad height
						pad_height = set_content(el, "|") - line_height;
						// calculate the height
						height -= pad_height;
					}
					// start to check the height iteratively
					var i, h, collapsing = false;
					var p = text.length, q = 0, n;
					// estimate a area [p, q] containing the right separate point
					while (true) {
						h = set_content(el, text.substring(0, p) + (q ? symbol : "") + tail) - pad_height;
						if (h <= height) {
							// we got the area of [p, q]
							break;
						}
						// if too many rows overflowed
						q = p;
						if ((h - height) / line_height >= 2) {
							p = Math.floor(p * height / h);
						} else {
							p = Math.floor(p * height / (height + line_height));
						}
					}
					// q==0 means ellipsis isn't required
					if (q) {
						// binary search the separate point
						while (q > p) {
							n = Math.ceil((p + q) / 2);
							h = set_content(el, text.substring(0, n) + symbol + tail) - pad_height;
							if (h > height) {
								q = n - 1;
							} else {
								p = n;
							}
						}
						// now the point is 'q'
						if (q <= 0) {
							// the ellipsis will always fail, so it is okay if we show the symbol only
							set_content(el, symbol);
						} else {
							// so we finally get the separate point
							set_content(el, text.substring(0, q) + symbol + tail);
						}
					}
				} catch (e) {
					// reset the content if failed
					set_content(el, origin_text);
					throw e;
				} finally {
					// set styles back
					if (styleOverflow) {
						dom.setStyle(el, "overflow", styleOverflow);
					} else {
						dom.removeStyle(el, "overflow");
					}
					if (styleWidth) {
						dom.setStyle(el, "width", styleWidth);
					} else {
						dom.removeStyle(el, "width");
					}
					if (styleHeight) {
						dom.setStyle(el, "height", styleHeight);
					} else {
						dom.removeStyle(el, "height");
					}
				}
			}
		})()
	};
})(fruit, fruit.util,fruit.dom);
/**
 * fruit util collection
 * @ignore
 * @class fruit.util
 */
(function (fruit,dom, util,doc) {
    util.isHighContrastMode = function() {
        var el=new fruit.Element(doc.createElement('div'));
        var body=dom.getBody();

        el.setAttribute('style', 'position:absolute;top:-100;left:-100px;background-color:#878787;');
		el.setHtml( 'Test');
		//var xx = doc.body.appendChild(el.getElement());

        el.appendTo(body);
		var color = el.getStyle('background-color');
        body.removeChild(el);
		return (color != "#878787" && color != "rgb(135, 135, 135)");
	};
	fruit.ready(function(){
		if(util.isHighContrastMode()) {
			dom.getBody().addClass('f-hcm');
		}
	});
})(fruit,fruit.dom, fruit.util, document);
(function (fruit, util, cache, dom, document, window) {
    var processors = {},
        subscribers = {};
    /**
     * fruit event Engine
     */
    var engine = fruit.define('fruit.event.Engine', {
        singleton:true,
        methods:{
            addProcessor:function (inEventType, inProcessor) {
                processors[inEventType] = inProcessor;
                if (this.isReady && !inProcessor['isAttached']) {
                    inProcessor.attachEvent();
                    inProcessor['isAttached'] = true;
                }
            },
            isReady:false,
            __readyHandlers:[],
            domReady:function (inHandler) {
                var self = engine;
                var doc = document;
                self.__addReadyHandler(inHandler);
                if (doc.addEventListener) {
                    doc.addEventListener("DOMContentLoaded", function () {
                        doc.removeEventListener("DOMContentLoaded", arguments.callee, false);//clear the lod function
                        self.__fireReady();
                    }, false);
                } else if (document.attachEvent) {
                    if (this.isReady) return;
                    // Ensure firing before onload,maybe late but safe also for iframes
                    doc.attachEvent("onreadystatechange", function () {
                        var docRs = doc.readyState;
                        if (docRs === "loaded" || docRs === "complete") {
                            doc.detachEvent("onreadystatechange", arguments.callee);
                            self.__fireReady();
                        }
                    });



                    var isTopWin = false;
                    try {
                        isTopWin = window.frameElement == null;
                    } catch (e) {
                    }
                    // If IE and not an iframe,continually check to see if the document is ready
                    if (document.documentElement.doScroll && isTopWin) {
                        (function () {
                            if (self.isReady) return;
                            try {
                                // If IE is used, use the trick by Diego Perini
                                // http://javascript.nwbox.com/IEContentLoaded/
                                document.documentElement.doScroll("left");
                            } catch (error) {
                                return setTimeout(arguments.callee, 0);
                            }
                            // and execute any waiting functions
                            self.__fireReady();
                        })();
                    }
                } else {
                    // A fallback to window.onload, that will always work
                    this.__addLoadEvent(inHandler);
                }
            },
            __fireReady:function () {
                if (this.isReady) return;
                this.isReady = true;
                var len = this.__readyHandlers.length;
                while (len--) {
                    this.__readyHandlers.shift()();
                }
            },
            __addReadyHandler:function (inHandler) {
                if (util.isFunction(inHandler)) {
                    if (this.isReady) {
                        inHandler();
                    } else {
                        this.__readyHandlers.push(inHandler);//save the event
                    }
                }
            },
            __addLoadEvent:function (inHandler) {
                var oldonload = window.onload;
                if (typeof window.onload != 'function') {
                    window.onload = inHandler;
                } else {
                    window.onload = function () {
                        if (oldonload) {
                            oldonload();
                        }
                        inHandler();
                    }
                }
            },
            addEvent:(function () {
                return document.addEventListener ? function (inElement, inType, inHandler, inUseCapture) {
                    inElement.addEventListener(inType, inHandler, inUseCapture || false);
                } : function (inElement, inType, inHandler) {
                    inElement.attachEvent("on" + inType, function () {
                        inHandler.call(inElement, window.event);
                    });
                }
            }()),
            removeEvent:(function () {
                return document.removeEventListener ? function (inElement, inType, inHandler, inUseCapture) {
                    inElement.removeEventListener(inType, inHandler, inUseCapture || false);
                } : function (inElement, inType, inHandler) {
                    inElement.detachEvent('on' + inType, function () {
                        inHandler.call(inElement, window.event);
                    });
                };
            }()),
            subscribe:function (inFid, inCallback) {
                subscribers[inFid] = inCallback;
            },
            unsubscribe:function (inFid) {
                delete subscribers[inFid];
            },
            executeHandler:function (inEvent, inTarget) {
                var eventTarget = new fruit.Element(inTarget || inEvent.target);
                if (!eventTarget.element || eventTarget.element.nodeType !== 1) return;
                var fid = this.__findIndex(eventTarget),
                    method = subscribers[fid];
                if (!eventTarget.getAttribute || eventTarget.getAttribute("disabled") || !method) return;
                method.call(null, inEvent);
            },
            hasId:function (inElement) {
                return inElement.getAttribute("data-fruit-id");
            },
            __initEvents:function () {
                for (var key in processors) {
                    processors[key].attachEvent();
                }
            },
            __seekElement:function (inElement) {
                var elem = inElement.parent();
                while (elem && !this.hasId(elem) && !elem.isSpecialElement()) {
                    elem = elem.parent();
                }
                return elem;
            },
            __findIndex:function (inElement) {
                var fid, element;
                if (!(fid = this.hasId(inElement)) && !inElement.isSpecialElement()) {
                    element = this.__seekElement(inElement);
                    fid = this.hasId(element);
                }
                return fid || "document";
            }
        }
    });
    /**
     * fruit event DefaultProcessor
     */
    fruit.define('fruit.event.DefaultProcessor', {
        entity:{
            init:function (inEventType) {
                this.eventType = inEventType;
            },
            attachEvent:function () {
                var engine = fruit.event.Engine;
                var self = this;
                engine.addEvent(document, this.eventType, function (inEvent) {
                    return engine.executeHandler(self.normalize(inEvent));
                }, false);
            },
            normalize:function (inEvent) {
                var original = this.__getEvent(inEvent);
                return {
                    originalEvent:original,
                    eventDoc:this.__getEventDoc(inEvent),
                    type:original.type,
                    pageX:this.__getPageX(inEvent),
                    pageY:this.__getPageY(inEvent),
                    detail:this.__getDetail(inEvent),
                    keyCode:this.__getKeyCode(inEvent),
                    keyChar:this.__getKeyChar(inEvent),
                    target:this.__getTarget(inEvent),
                    hasSystemKey:this.__hasSystemKey(inEvent),
                    button:original.button,
                    relatedTarget:this.__getRelatedTarget(inEvent),
                    stopPropagation:this.__stopPropagation,
                    preventDefault:this.__preventDefault,
                    stop:this.__stop
                };
            },
            __getEvent:function (inEvent) {
                return inEvent || window.event;
            },
            __getEventDoc:function (inEvent) {
                var event = this.__getEvent(inEvent);
                var target = this.__getTarget(inEvent);
                return target.ownerDocument || document;
            },
            __getPageX:function (inEvent) {
                var event = this.__getEvent(inEvent);
                var doc = this.__getEventDoc(inEvent);
                return ('pageX' in event) ? event.pageX : (event.clientX + (doc.documentElement.scrollLeft || doc.body.scrollLeft) - 2);
            },
            __getPageY:function (inEvent) {
                var event = this.__getEvent(inEvent);
                var doc = this.__getEventDoc(inEvent);
                return ('pageY' in event) ? event.pageY : (event.clientY + (doc.documentElement.scrollTop || doc.body.scrollTop) - 2);
            },
            __getDetail:function (inEvent) {
                var event = this.__getEvent(inEvent);
                return event.detail || -(event.wheelDelta || 0);
            },
            __getKeyCode:function (inEvent) {
                var event = this.__getEvent(inEvent);
                return ('keyCode' in event) ? event.keyCode : (event.charCode || event.which || 0);
            },
            __getTarget:function (inEvent) {
                var target = inEvent.target || window.event.srcElement || document;//thanks jquery
                if (target.nodeType === 3) {
                    target = target.parentNode;
                }
                return target;
            },
            __getRelatedTarget:function (inEvent) {
                var event = this.__getEvent(inEvent);
                if ('relatedTarget' in event) return event.relatedTarget;
                if ('mouseover' === event.type) return event.fromElement;
                if ('mouseout' === event.type) return event.toElement;
            },
            __stop:function () {
                this.__stopPropagation();
                this.__preventDefault();
            },
            __stopPropagation:function () {
                var event = this.originalEvent;
                if ('stopPropagation' in event) {
                    event.stopPropagation();
                } else {
                    event.cancelBubble = true;
                }
            },
            __preventDefault:function () {
                var event = this.originalEvent;
                if ('preventDefault' in event) {
                    event.preventDefault();
                } else {
                    event.returnValue = false;
                }
            },
            __getKeyChar:function (inEvent) {
                return String.fromCharCode(inEvent.keyCode);
            },
            __hasSystemKey:function (inEvent) {
                return (inEvent.ctrlKey || inEvent.altKey);
            }
        }
    });
    var events = ["mousedown", "mousemove", "mouseup", "mouseover", "mouseout", "click", "dblclick", "keydown", "keyup", "keypress", "cut", "copy", "select", "contextmenu"];
    var i = events.length,
        eventName;
    /*do {
     eventName = events[i--];
     engine.addProcessor(eventName, new fruit.event.DefaultProcessor(eventName));
     } while (i);*/
    while (i--) {
        eventName = events[i];
        engine.addProcessor(eventName, new fruit.event.DefaultProcessor(eventName));
    }
    engine.domReady(function () {
        engine.__initEvents();
    });
    engine.domReady(fruit.execReadyFn);
    delete fruit.execReadyFn;
})(fruit, fruit.util, fruit.cache, fruit.dom, document, window);
(function (fruit, util, cache, dom, engine, document, window) {
    var simpleFileds = /^(?:text|password|textarea|file)$/i;
    var __fnDrag = {
        callback:null,
        draging:false,
        dragElem:null
    };
    var monitor = {
        __getValue:function (inElement) {
            var type = inElement.type,
                val = inElement.value,
                prop,
                resArr;
            switch (type) {
                case "select-multiple":
                    resArr = inElement.options;
                    prop = "selected";
                    break;
                case "radio":
                case "checkbox":
                    resArr = inElement.name ? inElement.ownerDocument.getElementsByName(inElement.name) : [inElement];
                    break;
                case "select-one":
                    val = inElement.selectedIndex;
                    break;
            }
            if (resArr) {
                prop || (prop = "checked");
                for (var i = 0, ri = 0, re = [], elem; elem = resArr[i++];) {
                    re[ri++] = elem[prop];
                }
                val = re.join("-");
            }
            return val;
        },
        __initChangeData:function (inDataString) {
            var dataString = inDataString || "__changeData";
            var self = this;
            document.attachEvent("onbeforeactivate", function (inEvent) {
                var el;
                if (el = inEvent.srcElement) {
                    cache.data(el, dataString, self.__getValue(el));
                }
            });
        },
        __hasChange:function (inEvent, inType, inDataString) {
            var el;
            var dataString = inDataString || "__changeData";
            if (el = inEvent.target) {
                var cacheData = cache.data(el, dataString);
                var nowData = this.__getValue(el);
                if (nowData !== cacheData) {
                    cache.data(el, dataString, nowData);
                    inEvent.type = inType;
                    return engine.executeHandler(inEvent);
                }
            }
        }
    };
    fruit.define('fruit.event.EnterLeaveProcessor', {
        extend:'fruit.event.DefaultProcessor',
        entity:{
            attachEvent:function () {
                var self = this;
                engine.addEvent(document, this.eventType, function (inEvent) {
                    var event = self.normalize(inEvent),
                        target = event.target,
                        type = event.type,
                        related = event.relatedTarget;
                    var fid = engine.hasId(target);
                    var events;
                    if (fid && fruit.$[fid]) {
                        events = fruit.$[fid]["_$events"];
                    }
                    if (events && type in events) {
                        var el = fruit.$[fid].element;
                    }
                    if (!(target && target === el && !dom.contains(target, related) && target !== related)) return;
                    return engine.executeHandler(event);
                });
            },
            normalize:function (inEvent) {
                var event = this.superMethod(arguments);
                event.type = (inEvent.type === "mouseover") ? "mouseenter" : "mouseleave";
                return event;
            }
        }
    });
    fruit.define('fruit.event.DragProcessor', {
        extend:'fruit.event.DefaultProcessor',
        entity:{
            attachEvent:function () {
                var self = this;
                var type = this.eventType;
                switch (type) {
                    case "mousedown":
                        engine.addEvent(document, type, function (inEvent) {
                            __fnDrag.dragElem = inEvent.target || inEvent.srcElement;
                            __fnDrag.draging = true;
                            return engine.executeHandler(self.normalize(inEvent));
                        });
                        break;
                    case "mousemove":
                        engine.addEvent(document, type, function (inEvent) {
                            if (__fnDrag.draging) {
                                return engine.executeHandler(self.normalize(inEvent), __fnDrag.dragElem);
                            }
                        });
                        break;
                    case "mouseup":
                        engine.addEvent(document, type, function (inEvent) {
                            __fnDrag.draging = false;
                            return engine.executeHandler(self.normalize(inEvent), __fnDrag.dragElem);
                        });
                        break;
                }
            },
            normalize:function (inEvent) {
                var event = this.superMethod(arguments);
                switch (event.type) {
                    case "mousedown":
                        event.type = "dragstart";
                        break;
                    case "mousemove":
                        event.type = "dragmove";
                        break;
                    case "mouseup":
                        event.type = "dragend";
                        break;
                }
                return event;
            }
        }
    });
    fruit.define('fruit.event.ChangeProcessor', {
        extend:'fruit.event.DefaultProcessor',
        entity:{
            attachEvent:function () {
                var self = this;
                var type = this.eventType;
                if (document.addEventListener) {
                    engine.addEvent(document, type, function (inEvent) {
                        return engine.executeHandler(self.normalize(inEvent));
                    }, true);
                } else {
                    document.attachEvent("onbeforeactivate", function (inEvent) {
                        monitor.__initChangeData("__changeData");
                        if (simpleFileds.test(inEvent.srcElement.type)) {
                            document.attachEvent('onfocusout', function (inEvent) {
                                monitor.__hasChange(self.normalize(inEvent), type);
                            });
                        } else {
                            document.attachEvent('onclick', function (inEvent) {
                                monitor.__hasChange(self.normalize(inEvent), type);
                            });
                        }
                        document.attachEvent('onkeydown', function (inEvent) {
                            if (inEvent.keyCode == 13) {
                                monitor.__hasChange(self.normalize(inEvent), type);
                            }
                        });
                    });
                }
            }
        }
    });
    fruit.define('fruit.event.InputProcessor', {
        extend:'fruit.event.DefaultProcessor',
        entity:{
            attachEvent:function () {
                var self = this;
                if (!util.isIE || util.browserVersion >= 10) {
                    engine.addEvent(document, this.eventType, function (inEvent) {
                        return engine.executeHandler(self.normalize(inEvent));
                    }, true);
                } else {
                    document.attachEvent("onbeforeactivate", function () {
                        monitor.__initChangeData("__inputData");
                        document.attachEvent('onkeyup', function (inEvent) {
                            monitor.__hasChange(self.normalize(inEvent), self.eventType, "__inputData");
                        });
                    });
                }
            }
        }
    });
    fruit.define('fruit.event.FocusBlurProcessor', {
        extend:'fruit.event.DefaultProcessor',
        entity:{
            attachEvent:function () {
                var self = this;
                engine.addEvent(document, this.eventType, function (inEvent) {
                    return engine.executeHandler(self.normalize(inEvent));
                }, true);
            },
            normalize:function (inEvent) {
                var event = this.superMethod(arguments);
                if (!document.addEventListener) {
                    event.type = (inEvent.type === "focusin") ? "focus" : "blur";
                }
                return event;
            }
        }
    });
    fruit.define('fruit.event.MouseWheelProcessor', {
        extend:'fruit.event.DefaultProcessor',
        entity:{
            attachEvent:function () {
                var self = this;
                var isFirefox = fruit.util.browserName === "FF";
                engine.addEvent(document, isFirefox ? 'DOMMouseScroll' : 'mousewheel', function (inEvent) {
                    return engine.executeHandler(self.normalize(inEvent));
                }, true);
            },
            normalize:function (inEvent) {
                var event = this.superMethod(arguments);
                var isFirefox = fruit.util.browserName === "FF";
                if (isFirefox) {
                    event.type = 'mousewheel';
                }
                return event;
            }
        }
    });
    //mouseenter-leave
    engine.addProcessor('mouseenter', new fruit.event.EnterLeaveProcessor('mouseover'));
    engine.addProcessor('mouseleave', new fruit.event.EnterLeaveProcessor('mouseout'));
    engine.addProcessor('input', new fruit.event.InputProcessor('input'));
    engine.addProcessor('change', new fruit.event.ChangeProcessor('change'));
    //focus-blur
    if (document.addEventListener) {
        engine.addProcessor('focus', new fruit.event.FocusBlurProcessor('focus'));
        engine.addProcessor('blur', new fruit.event.FocusBlurProcessor('blur'));
    } else {
        engine.addProcessor('focus', new fruit.event.FocusBlurProcessor('focusin'));
        engine.addProcessor('blur', new fruit.event.FocusBlurProcessor('focusout'));
    }
    //drag
    engine.addProcessor('dragstart', new fruit.event.DragProcessor('mousedown'));
    engine.addProcessor('dragmove', new fruit.event.DragProcessor('mousemove'));
    engine.addProcessor('dragend', new fruit.event.DragProcessor('mouseup'));
    engine.addProcessor('mousewheel', new fruit.event.MouseWheelProcessor('mousewheel'));
})(fruit, fruit.util, fruit.cache, fruit.dom, fruit.event.Engine, document, window);
(function (fruit, util, cache, engine) {
    var eventProcessors = (function () {
        var processors = {
            'default':processDefault,
            'change':processChange,
            'input':processInput,
            'focus':processFocusBlur,
            'blur':processFocusBlur,
            'dragstart':processDrag,
            'dragmove':processDrag,
            'dragend':processDrag
        };
        return processors;
    }());

    var domEvents = {
        normalize:function () {
        }
    };

    function processDefault() {
    }

    function processChange() {
    }

    function processInput() {
    }

    function processFocusBlur() {
    }

    function processDrag() {
    }

    //register hooks/xxx for eventEngine
    //register hooks/xxx for eventEngine
    //engine.addProcessor('processors', eventProcessors);
    //engine.addProcessor('normalize', domEvents.normalize);

})(fruit, fruit.util, fruit.cache, fruit.event.Engine);
(function (fruit, util) {

    /**
     * @class fruit.ui.data.ModelManager
     */
    fruit.define('fruit.ui.data.ModelManager', {
        singleton:true,
        entity:{
            setValue:function (target, path, value) {
                var parsedPath = this.parsePath(path);

                if (parsedPath) {
                    var tokens = parsedPath.split('.');
                    var length = tokens.length;
                    var context = target;
                    for (var i = 0; i < (length - 1) && context; i++) {
                        context = context[tokens[i]];
                    }

                    if (util.isObject(context)) {
                        var token = tokens[length - 1];
                        var oldValue = context[token];
                        var newValue = value;

                        if (oldValue !== newValue) {
                            if (oldValue) {
                                if (util.isFunction(oldValue.set)) {
                                    oldValue.set.call(target, newValue);
                                }
                                else if (util.isFunction(oldValue.get)) {
                                    //readonly property
                                    return false;
                                } else {
                                    context[token] = newValue;
                                }
                            }
                            else {
                                context[token] = newValue;
                            }

                            return true;
                        }
                    }
                }

                return false;
            },
            getValue:function (target, path) {
                var result = target;
                var parsedPath = this.parsePath(path);
                if (parsedPath) {
                    var tokens = parsedPath.split('.');
                    var length = tokens.length;
                    for (var i = 0; i < length && result; i++) {
                        result = result[tokens[i]];
                    }
                }

                if (result && util.isFunction(result.get)) {
                    result = result.get.call(target);
                }

                return result;
            },
            combinePath:function (path1, path2) {
                var pathArray = [], combinedPath;

                if (path1) {
                    pathArray.push(path1);
                }

                if (path2) {
                    pathArray.push(path2);
                }
                return pathArray.join('.');
            },
            parsePath:function (path) {
                var parsedPath;
                if (util.isString(path)) {
                    var tokens = path.split(".");
                    for (var i = 0; i < tokens.length;) {
                        var token = tokens[i];
                        switch (token) {
                            case '@self':
                                tokens.splice(i, 1);
                                break;
                            case '@parent':
                                tokens.splice(i - 1, 2);
                                i--;
                                break;
                            case '@root':
                                tokens.splice(0, i + 1);
                                i = 0;
                                break;
                            default:
                                i++;
                                break;
                        }
                    }

                    parsedPath = tokens.join(".");
                }

                return parsedPath;
            }
        }
    });
})(fruit, fruit.util);
(function (fruit, util, mgr, logger) {
    /**
     * @class fruit.ui.data.ViewModel
     * @extends fruit.Observable
     */
    fruit.define('fruit.ui.data.ViewModel', {
        extend:'fruit.Observable',
        properties:{},
        entity:{
            init:function (model, manualSave) {
                if (!util.isObject(model)) {
                    logger.error('Cannot initialize ViewModel, parameter "model" must be of type "Object".');
                }

                this.savedModel = model;
                this.manualSave = manualSave;
                if (manualSave) {
                    this.model = util.clone(model);
                }
                else {
                    this.model = model;
                }
                this.isDirty = false;
                this.__registerDependencies();
            },
            getSavedValue:function (path) {
                var props = this.$properties;

                if (props && props[path] && props[path].get) {
                    return props[path].get.call(this.savedModel);
                } else {
                    return mgr.getValue(this.savedModel, path);
                }
            },
            getValue:function (path) {
                var props = this.$properties;

                if (props && props[path] && props[path].get) {
                    return props[path].get.call(this);
                } else {
                    return mgr.getValue(this.model, path);
                }
            },
            setValue:function (path, value) {
                var result;
                var props = this.$properties;

                if (props && props[path] && props[path].set) {
                    result = props[path].set.call(this, value);
                } else {
                    result = mgr.setValue(this.model, path, value);
                }

                if (result) {
                    this.trigger('edit', {
                        item:this,
                        path:path,
                        value:this.getValue(path)
                    });

                    var dep = this.__findDependency(path);

                    if (dep) {
                        util.each(dep, function (item) {
                            this.trigger('edit', {
                                item:this,
                                path:item,
                                value:this.getValue(item)
                            });
                        }, this);
                    }

                    if (this.manualSave) {
                        this.isDirty = true;
                    }
                }
            },
            refresh:function () {
                this.trigger('refresh');
            },
            getJSON:function () {
                return this.model;
            },
            isModified:function (path) {
                return this.getSavedValue(path) !== this.getValue(path);
            },
            save:function () {
                if (this.manualSave) {
                    this.savedModel = util.clone(this.model);
                    this.isDirty = false;
                }
            },
            restore:function () {
                if (this.manualSave) {
                    this.model = util.clone(this.savedModel);
                    this.isDirty = false;
                }
            },
            __registerDependencies:function () {
                var deps = this.__dependencies = {};
                util.each(this.$properties, function (prop, key) {
                    var dependencies = prop.dependencies;
                    if (dependencies) {
                        util.each(dependencies, function (item) {
                            var dep = deps[item] = deps[item] || [];
                            dep.push(key);
                        });
                    }
                });
            },
            __findDependency:function (path) {
                var key = path, index, dep;

                dep = this.__dependencies[key];
                if (dep) {
                    return dep;
                }
                else {
                    while ((index = key.lastIndexOf('.')) >= 0) {
                        key = key.substr(0, index);
                        dep = this.__dependencies[key + '.*'];
                        if (dep) {
                            return dep;
                        }
                    }

                    return this.__dependencies['*'];
                }
            }
        }
    });

    fruit.ui.data.ViewModel.regProcessor('properties', function (cls, data) {
        var properties , proto;
        if (data.properties) {
            proto = cls.prototype;
            properties = data.properties;

            while (proto) {
                if (proto.$properties) {
                    properties = util.merge(properties, proto.$properties);
                }
                proto = proto.$super;
            }

            cls.prototype.$properties = properties;
        }
    });

})(fruit, fruit.util, fruit.ui.data.ModelManager, fruit.util.logger);
(function (fruit, util, mgr, logger) {

    /**
     * @class fruit.ui.data.ViewModelCollection
     * @extends fruit.Observable
     */
    fruit.define('fruit.ui.data.ViewModelCollection', {
        extend:'fruit.Observable',
        entity:{
            init:function (items, modelType) {
                modelType = modelType || 'fruit.ui.data.ViewModel';
                this.originalItems = items = items || [];
                this.modelClass = fruit.getClass(modelType);
                this.setItems(items);
            },
            wrapItem:function (item) {
                if (item instanceof this.modelClass) {
                    return item;
                }
                else {
                    return new this.modelClass(item);
                }
            },
            setItems:function (items) {
                if (!util.isArray(items)) {
                    logger.error('Cannot initialize ViewModelCollection, parameter "items" must be of type "Array".');
                }

                var vms = this.items = [];
                var i = 0, length = items.length;
                this.length = 0;

                for (; i < length; i++) {
                    var wrappedItem = this.wrapItem(items[i])
                    vms.push(wrappedItem);
                    wrappedItem.on('edit', this.__edit, this);
                    this.length++;
                }

                this.trigger('reset');
            },
            getItem:function (index) {
                var items = this.items;
                var length = items.length;

                if (index < length) {
                    return this.items[index];
                }
            },
            appendItem:function (item) {
                var items = this.items;
                var originalItems = this.originalItems;
                var length = items.length;
                var wrappedItem = this.wrapItem(item);
                originalItems.push(item);
                items.push(wrappedItem);
                this.length++;
                this.trigger('add', {
                    index:length,
                    item:wrappedItem
                });

                wrappedItem.on('edit', this.__edit, this);

                return wrappedItem;
            },
            insertItem:function (item, index) {
                var items = this.items;
                var originalItems = this.originalItems;
                var wrappedItem = this.wrapItem(item);
                originalItems.splice(index, 0, item);
                items.splice(index, 0, wrappedItem);
                this.length++;
                this.trigger('add', {
                    index:index,
                    item:wrappedItem
                });

                wrappedItem.on('edit', this.__edit, this);

                return wrappedItem;
            },
            removeItem:function (item) {
                var items = this.items;
                var originalItems = this.originalItems;
                var index = util.indexOf(items, item);
                if (index >= 0) {
                    originalItems.splice(index, 1);
                    items.splice(index, 1);
                    this.length--;
                    this.trigger('remove', {
                        index:index,
                        item:item
                    });

                    item.off('edit', this.__edit, this);
                }
            },
            removeItemAt:function (index) {
                this.originalItems.splice(index, 1);
                var result = this.items.splice(index, 1);
                if (result.length > 0) {
                    this.length--;
                    this.trigger('remove', {
                        index:index,
                        item:result[0]
                    });
                }
            },
            empty:function (fn) {
                this.items = [];
                this.originalItems = [];
                this.trigger('reset');
            },
            each:function (fn) {
                if (util.isFunction(fn)) {
                    var items = this.items, item, i = 0, length = items.length;
                    for (; i < length; i++) {
                        item = items[i];
                        if (false === fn(item)) {
                            return;
                        }
                    }
                }
            },
            any:function (fn) {
                if (util.isFunction(fn)) {
                    var result = false;
                    this.each(function (item) {
                        if (fn(item)) {
                            result = true;
                            return false;
                        }
                    });

                    return result;
                }
            },
            all:function (fn) {
                if (util.isFunction(fn)) {
                    var result = true;
                    this.each(function (item) {
                        if (!fn(item)) {
                            result = false;
                            return false;
                        }
                    });

                    return result;
                }
            },
            count:function (fn) {
                var count = 0;
                if (util.isFunction(fn)) {
                    this.each(function (item) {
                        if (fn(item)) {
                            count++;
                        }
                    });
                }
                else {
                    count = this.length;
                }

                return count;
            },
            first:function (fn) {
                var firstItem = null;
                if (util.isFunction(fn)) {
                    this.each(function (item) {
                        if (fn(item)) {
                            firstItem = item;
                            return false;
                        }
                    });
                }
                else {
                    firstItem = this.items[0];
                }

                return firstItem;
            },
            sum:function (key) {
                var sum = 0;
                var result = 0;

                this.each(function (item) {
                    result = item.getValue(key);
                    if (util.isNumeric(result)) {
                        sum += result;
                    }
                });

                return sum;
            },
            average:function (key) {
                return this.sum(key) / this.length;
            },
            max:function (key) {
                var maxValue = Number.NEGATIVE_INFINITY;
                var result = NaN;

                this.each(function (item) {
                    result = item.getValue(key);
                    if (result > maxValue) {
                        maxValue = result;
                    }
                });

                return maxValue;
            },
            min:function (key) {
                var minValue = Number.POSITIVE_INFINITY;
                var result = NaN;

                this.each(function (item) {
                    result = item.getValue(key);
                    if (result < minValue) {
                        minValue = result;
                    }
                });

                return minValue;
            },
            where:function (fn) {
                var items = [];
                if (util.isFunction(fn)) {
                    this.each(function (item) {
                        if (fn(item)) {
                            items.push(item);
                        }
                    });
                }

                return items;
            },
            select:function (key) {
                var items = [];
                var result;
                if (util.isString(key)) {
                    this.each(function (item) {
                        result = item.getValue(key);
                        items.push(result);
                    });
                } else if (util.isFunction(key)) {
                    this.each(function (item) {
                        result = key(item);
                        items.push(result);
                    });
                }

                return items;
            },
            groupBy:function (key) {
                var groups = {}, group, groupName;

                this.each(function (item) {
                    groupName = item.getValue(key);
                    if (!util.isUndef(groupName)) {
                        group = groups[groupName] = groups[groupName] || [];
                        group.push(item);
                    }
                });

                return groups;
            },
            orderBy:function (key) {
                if (util.isString(key)) {
                    this.items.sort(this.__defaultComparator(key));
                }
                else if (util.isFunction(key)) {
                    this.items.sort(key);
                }

                this.trigger('reset');
            },
            toArray:function () {
                return this.items;
            },
            __defaultComparator:function (key) {
                return function (a, b) {
                    var valueA = a.getValue(key), valueB = b.getValue(key);
                    if (valueA > valueB) {
                        return 1;
                    }
                    else if (valueA < valueB) {
                        return -1;
                    }
                    else {
                        return 0;
                    }
                }
            },
            __edit:function (sender, event) {
                this.trigger('edit', event);
            }
        }
    });
})(fruit,fruit.util, fruit.ui.data.ModelManager, fruit.util.logger);
(function (fruit, util, dom, logger) {
    function getFullName(inName) {
        return inName.indexOf('.') < 0 ? ('fruit.ui.' + inName) : inName;
    }

    function extractPath(value) {
        if (util.isString(value)) {
            return value.match(/^{([^:]*)}$/);
        } else {
            return null;
        }
    }

    fruit.define('fruit.ui.ViewManager', {
        singleton:true,
        methods:{
            viewInfoTable:{},
            registerView:function (type, view, regions) {
                this.viewInfoTable[type] = {
                    view:view,
                    regions:regions,
                    dynamic:view.dynamic || false,
                    nameMap:{}
                }
            },
            getElement:function (type) {
                var viewInfo = this.viewInfoTable[type];
                if (viewInfo) {
                    if (util.isUndef(viewInfo.root) || viewInfo.dynamic) {
                        viewInfo.root = this.generateElement(viewInfo.view, type, "0");
                    }
                    var el = viewInfo.root.clone(true);
                    el.setAttribute('data-fruit-type', type);

                    var nameMap = util.clone(viewInfo.nameMap);
                    for (var i in nameMap) {
                        nameMap[i] = this.__getElementByPath(el, nameMap[i]);
                    }
                    return {
                        element:el,
                        nameMap:nameMap
                    }
                } else {
                    logger.error('Error generating element for component "' + type + '".');
                    return null;
                }
            },
//            _getElement:function (type) {
//                var el;
//                var viewInfo = this.viewInfoTable[type];
//                if (viewInfo) {
//                    if (viewInfo.root) {
//                        el = viewInfo.root;
//                    } else {
//                        if (type == 'fruit.ui.Popup') {
//                            el = this.generateElement(viewInfo.view);
//                        }
//                        else {
//                            el = viewInfo.root = this.generateElement(viewInfo.view, type);
//                        }
//                        el.setAttribute('data-fruit-type', type);
//                    }
//                } else {
//                    logger.error('Error generating element for component "' + type + '".');
//                    return null;
//                }
//                debugger;
//                return el.element;
//            },
            generateElement:function (view, rootType, level) {
                if (util.isString(view)) {
                    return dom.createTextNode(view);
                }

                var type = view.type;
                var viewInfo = this.viewInfoTable[type] || {};
                var tag = view.tag || 'div';
                var attr = view.attr || {};
                var name = view.name;
                var container = view.container;
                var content = view.content;
                var options = view.options;
                var model = view.model;
                var template = view.template;
                var bindings = [];
                var regions = viewInfo.regions || null;
                var path;
                var el;
                var i, key, value;

                if (!type) {
                    var type = attr && attr.type;
                    if (util.isIE && util.browserVersion <= 8) {
                        if (type) {
                            el = dom.createElement('<' + tag + ' type="' + type + '" />');
                        } else {
                            el = dom.createElement(tag);
                        }
                    } else {
                        el = dom.createElement(tag);
                        el.setAttribute('type', type);
                    }
                } else {
                    var fullName = getFullName(type);
                    var el_obj = this.getElement(fullName);
                    var nameMap = el_obj.nameMap;
                    el = el_obj.element;

                }

                if (name) {
                    el.setAttribute('data-fruit-name', name);
                }

                if (model) {
                    el.setAttribute('data-fruit-model', JSON.stringify(model));
                }

                if (template) {
                    el.setAttribute('data-fruit-template', JSON.stringify(template));
                }
                
                if (!fruit.util.isUndef(container)) {
                    el.setAttribute('data-fruit-container', container);
                }  

                for (key in attr) {
                    value = attr[key];
                    path = extractPath(value);
                    if (path) {
                        bindings.push({
                            prop:key,
                            expr:value
                        });
                    } else {
                        switch (key) {
                            case 'class':
                                el.addClass(value);
                                break;
                            case 'style':
                                el.setStyle(value);
                                break;
                            case 'type':
                                break;
                            default:
                                el.setAttribute(key, value);
                                break;
                        }
                    }
                }

                if (options) {
                    var opts = {};
                    for (var optionKey in options) {
                        var optionValue = options[optionKey];
                        path = extractPath(optionValue);
                        if (path) {
                            bindings.push({
                                prop:'options.' + optionKey,
                                expr:optionValue
                            });
                        } else {
                            opts[optionKey] = optionValue;
                        }
                    }

                    el.setAttribute('data-fruit-options', JSON.stringify(opts));
                }

                if (content) {
                    if (util.isString(content)) {
                        path = extractPath(content);
                        if (path) {
                            bindings.push({
                                prop:'content',
                                expr:content
                            });
                        } else {
                            var targetName = view.region || 'default';
                            if (regions && regions[targetName]) {
                                var targetElement = nameMap[regions[targetName].target];
                                targetElement.setAttribute('data-fruit-xowner', rootType || "");
                                targetElement.setHtml(content);
                            } else {
                                el.setHtml(content);
                            }

                        }
                    } else {
                        content = util.isArray(content) ? content : [content];
                        contentDom = dom.createElement("div");
                        var contentLength = content.length;
                        for (i = 0; i < contentLength; i++) {
                            var parentEl = el;
                            var sublevel = level + "." + i ;
                            var sub = content[i];
                            var subEl = this.generateElement(sub, rootType || "", sublevel);
                            var targetName = sub.region || 'default';
                            if (regions && regions[targetName]) {
                                var targetElement = nameMap[regions[targetName].target];
                                targetElement.setAttribute('data-fruit-owner', rootType || "");
                                targetElement.appendChild(subEL);
                            } else {
                                el.appendChild(subEl);
                            }
                        }
                    }
                }

                if (bindings.length > 0) {
                    el.setAttribute('data-fruit-bindings', JSON.stringify(bindings));
                }

                if (name && rootType) {
                    this.viewInfoTable[rootType].nameMap[name] = level;
                }
                return el;


            },
            __setContent:function(){

            },

            __getElementByPath:function (el, path) {

                if(path == 0){
                    return el;
                }
                var pathAry = path.split(".");
                var element = el;
                pathAry.shift();
                for (var i = 0; i < pathAry.length; i++) {
                    var index = pathAry[i];
//                    element = element.$firstChild;
//                    for (var j = 1; j < index; j++) {
//                        element = element.$nextSibling;
//                    }
                    element = element.childAt(index); // issue
                }
                return element;

            }
        }
    })
})(fruit, fruit.util, fruit.dom, fruit.util.logger);
(function (fruit, util,  logger) {
    fruit.define('fruit.ui.OptionManager', {
        singleton:true,
        methods:{
            optionTable:{},
            registerOption:function (type, optionName, optionDefinition) {
                var compTable = this.optionTable[type] = this.optionTable[type] || {};
                var option = compTable[optionName] = optionDefinition;
                option.localValues = {};
                option.lastValues = {};
            },
            initOptions:function (comp) {
                var baseClass = comp;
                var initializedOptions = {};
                var optionTable = this.optionTable;

                var optionEntry, option;

                while (baseClass) {
                    optionEntry = optionTable[baseClass.$fullname];
                    for (option in optionEntry) {
                        if (!initializedOptions[option]) {
                            initializedOptions[option] = true;
                            comp.evaluateTriggers('option.' + option, optionEntry[option].defaultValue);
                        }
                    }

                    baseClass = baseClass.$super;
                }
            },
            getOption:function (comp, optionName) {
                var option = this.findOption(comp, optionName);

                if (!option) {
                    logger.warn('Cannot find option "' + optionName + '".');
                    return;
                } else if (option.hidden) {
                    logger.warn('Cannot access hidden option "' + optionName + '".');
                    return
                }

                return this.getComputedOptionValue(comp, option);
            },
            setOption:function (comp, optionName, optionValue, init) {
                var option = this.findOption(comp, optionName);

                if (util.isUndef(optionValue)) {
                    return false;
                }
                if (!option) {
                    logger.warn('Cannot find option "' + optionName + '".');
                    return false;
                } else if (option.hidden) {
                    logger.warn('Cannot access hidden option "' + optionName + '".');
                    return false;
                } else if (!init && option.readonly) {
                    logger.warn('Cannot set readonly option "' + optionName + '".');
                    return false;
                } else if (option.acceptTypes) {
                    var types = option.acceptTypes;
                    types = util.isArray(types) ? types : [types];
                    if (util.indexOf(types, util.getType(optionValue)) < 0) {
                        logger.warn('option "' + optionName + '" only accepts value of type [' + types + ']');
                        return false;
                    }
                }

                var lastValue = this.getComputedOptionValue(comp, option);

                if (lastValue !== optionValue) {
                    option.lastValues[comp.$id] = lastValue;
                    option.localValues[comp.$id] = optionValue;

                    comp._$onPropertyChanged('options.' + optionName, optionValue, lastValue);

                    if (option.inherits) {
                        comp.traverse(function (node) {
                            node.evaluateTriggers('option.' + optionName, optionValue);
                        });
                    }

                    return true;
                } else {
                    return false;
                }
            },
            findOption:function (comp, optionName) {
                var option, baseClass = comp, optionTable = this.optionTable, compTable;
                while (baseClass) {
                    compTable = optionTable[baseClass.$fullname];
                    if (compTable) {
                        option = compTable[optionName];
                        if (typeof option != 'undefined') {
                            break;
                        }
                    }
                    baseClass = baseClass.$super;
                }

                return option;
            },
            getComputedOptionValue:function (comp, option) {
                var value;
                if (option) {
                    var localValue = option.localValues[comp.$id];
                    if (typeof localValue != 'undefined') {
                        value = localValue;
                    } else if (option.inherits) {
                        var parent = comp.$parent;
                        while (parent) {
                            value = option.localValues[parent.$id];
                            if (typeof value != 'undefined') {
                                break;
                            }
                            parent = parent.$parent;
                        }
                    }

                    if (typeof value == 'undefined') {
                        value = option.defaultValue;
                    }
                }

                return value;
            }
        }
    });
})(fruit, fruit.util,fruit.util.logger);
(function (fruit) {
    /**
     * @class fruit.Node
     * To achieve the object of tree structure
     * @extends fruit.Class
     */
    fruit.define('fruit.Node', {
        methods:{
            init:function () {
                this.$parent = null;
                this.$firstChild = null;
                this.$lastChild = null;
                this.$previousSibling = null;
                this.$nextSibling = null;
            },
            /**
             * Prepend child
             * @param node
             */
            prependChild:function (node) {
                var target = this.childAt(0);
                if (target) {
                    this.insertBefore(node, target);
                } else {
                    this.appendChild(node);
                }
            },
            /**
             *
             * @param node
             */
            appendChild:function (node) {
                if (!this.$firstChild) {
                    this.$firstChild = node;
                }

                if (this.$lastChild) {
                    node.$previousSibling = this.$lastChild;
                    this.$lastChild.$nextSibling = node;
                }

                this.$lastChild = node;
                node.$parent = this;
            },
            /**
             *
             * @param node
             * @param target
             */
            insertBefore:function (node, target) {
                var prevSibling = target.$previousSibling;

                node.$parent = this;
                node.$nextSibling = target;
                target.$previousSibling = node;

                if (prevSibling) {
                    node.$previousSibling = prevSibling;
                    prevSibling.$nextSibling = node;
                }
                else {
                    this.$firstChild = node;
                }
            },
            /**
             *
             * @param node
             * @param index
             */
            insertAt:function (node, index) {
                if (index == 0) {
                    this.prependChild(node);
                }
                else {
                    var target = this.childAt(index);
                    if (target) {
                        this.insertBefore(node, target);
                    }
                    else {
                        if (index > 0) {
                            this.appendChild(node);
                        }
                        else if (index < 0) {
                            this.prependChild(node);
                        }
                    }
                }
            },
            /**
             *
             * @param node
             */
            removeChild:function (node) {
                if (node && node.$parent == this) {
                    node.isolate();
                }
            },
            /**
             *
             * @return {Number}
             */
            getIndex:function () {
                var node = this, index = -1;

                while (node) {
                    index++;
                    node = node.$previousSibling;
                }

                return index;
            },
            /**
             *
             * @param index
             * @return {*}
             */
            childAt:function (index) {
                var child = null, i = index;

                if (index >= 0) {
                    child = this.$firstChild;
                    while (child && i > 0) {
                        child = child.$nextSibling;
                        i--;
                    }
                }
                else {
                    child = this.$lastChild;
                    while (child && i < -1) {
                        i++;
                        child = child.$previousSibling;
                    }
                }

                return child;
            },
            /**
             *
             * @param fn
             * @return {*}
             */
            children:function (fn) {
                var i = 0, node = this.$firstChild;

                if (fn) {
                    while (node) {
                        if (fn(node, i++) === false) {
                            return;
                        }
                        node = node.$nextSibling;
                    }
                } else {
                    var childNodes = [];
                    while (node) {
                        childNodes.push(node);
                        node = node.$nextSibling;
                    }
                    return childNodes;
                }
            },
            /**
             *
             * @param fn
             * @return {*}
             */
            ancestors:function (fn) {
                var node = this.$parent;

                if (fn) {
                    while (node) {
                        if (fn(node) === false) {
                            return;
                        }
                        node = node.$parent;
                    }
                } else {
                    var ancestors = [];
                    while (node) {
                        ancestors.push(node);
                        node = node.$parent;
                    }
                    return ancestors;
                }
            },
            /**
             *
             */
            isolate:function () {
                var prevNode = this.$previousSibling;
                var nextNode = this.$nextSibling;
                var parentNode = this.$parent;

                if (prevNode) {
                    prevNode.$nextSibling = nextNode;
                }
                else if (parentNode) {
                    parentNode.$firstChild = nextNode;
                }

                if (nextNode) {
                    nextNode.$previousSibling = prevNode;
                }
                else if (parentNode) {
                    parentNode.$lastChild = prevNode;
                }

                this.$parent = this.$previousSibling = this.$nextSibling = null;
            },
            /**
             *
             * @param fn
             */
            traverse:function (fn) {
                var child;
                fn(this);
                child = this.$firstChild;
                while (child) {
                    child.traverse(fn);
                    child = child.$nextSibling;
                }
            },
            /**
             *
             * @param node
             * @return {Boolean}
             */
            isChildOf:function (node) {
                return this.$parent == node;
            },
            /**
             *
             * @param node
             * @return {Boolean}
             */
            isParentOf:function (node) {
                return node.$parent == this;
            },
            /**
             *
             * @param node
             * @return {Boolean}
             */
            isAncestorOf:function (node) {
                var result = false, self = this;
                node.ancestors(function (ancestor) {
                    if (ancestor == self) {
                        result = true;
                        return false;
                    }
                });

                return result;
            },
            /**
             *
             * @param node
             * @return {Boolean}
             */
            isDescendantOf:function (node) {
                var result = false;
                this.ancestors(function (ancestor) {
                    if (ancestor == node) {
                        result = true;
                        return false;
                    }
                });

                return result;
            }
        }
    });
})(fruit);
(function (fruit) {
    fruit.define('fruit.ui.Behavior', {
        entity:{
            init:function (comp, config) {
                this.component = comp;
                this.config = config || {};
            },
            onAttached:function () {
            },
            onDettached:function () {
            }
        }
    });
})(fruit);
(function (fruit, util, dom, engine, position, modelMgr, logger, viewManager, optionManager) {

    var ui = fruit.ns('fruit.ui');
    var identity = 1;
    fruit.$ = {};

    /**
     * Option Manager (Internal)
     * @type {Object}
     * @ignore
     */

    var propertyManager = {

    };


    function getIdentity() {
        return identity++;
    }

    function getFullName(inName) {
        return inName.indexOf('.') < 0 ? ('fruit.ui.' + inName) : inName;
    }

    function extractPath(value) {
        if (util.isString(value)) {
            return value.match(/^{([^:]*)}$/);
        } else {
            return null;
        }
    }

    function combinePath(path1, path2) {
        var pathArray = [], combinedPath;

        if (path1) {
            pathArray.push(path1);
        }

        if (path2) {
            pathArray.push(path2);
        }
        return pathArray.join('.');
    }

    function getComponentById(id) {
        var el = dom.getById(id);
        var fid;
        if (el) {
            fid = dom.getAttribute(el, 'data-fruit-id');
            return fruit.$[fid];
        }
    }

    function attachProperty(target, key, value) {
        if (typeof target[key] == 'undefined') {
            target[key] = value;
        } else {
            target[key] = value;
            logger.warn('Duplicated prop "' + key + '"  detected.');
        }
    }

    function createComponent(type, opts, el, ctx) {
        var typeName, element, className, classObject;

        if (util.isObject(type)) {
            element = el || viewManager.generateElement(type);
            typeName = type.type;
        } else {
            element = el;
            typeName = type;
        }

        className = getFullName(typeName || 'Component');
        classObject = fruit.getObject(className);

        return new classObject(opts, element, ctx);
    }


    var propertyHooks = (function () {
        function arrayToObject(inArray, inValue) {
            var result, resObj;
            result = resObj = {};
            var lastEl = inArray.pop();
            var len = inArray.length;
            for (var i = 0; i < len; i++) {
                resObj[inArray[i]] = {};
                resObj = resObj[inArray[i]];
            }
            resObj[lastEl] = inValue;
            return result;
        }

        function arrayValFromObj(inArray, inObj) {
            var lastEl = inArray.pop();
            var len = inArray.length;
            if (!len) {
                //todo:throw error
                for (var i = 0; i < len; i++) {
                    inObj = inObj[inArray[i]];
                }
            }
            return inObj[lastEl];
        }

        var hooks = {
            'class':{
                set:function (inCompoent, inPath, inValue, inOldValue) {
                    inCompoent.replaceClass(inOldValue, inValue);
                },
                get:function (inCompoent, inPath) {
                    return inCompoent.getClass();
                }
            },
            'style':{
                set:function (inCompoent, inPath, inValue, inOldValue) {
                    var attrObj = {};
                    if (inPath) {
                        attrObj[inPath] = inValue;
                    } else {
                        attrObj = inValue;
                    }
                    inCompoent.setStyle(attrObj);
                },
                get:function (inCompoent, inPath) {
                    if (inPath) {
                        return inCompoent.getStyle(inPath);
                    } else {
                        return inCompoent.getAttribute("style");
                    }
                }
            },
            'options':{
                set:function (inCompoent, inPath, inValue, inOldValue) {
                    if (!inPath) {
                        //inPath:"options"
                        for (var option in inValue) {
                            inCompoent.setOption(option, inValue[option]);
                        }
                    }
                    var resArr = inPath.split(".");
                    var len = resArr.length;
                    switch (len) {
                        case 0:
                            throw new Error("Options can not be setted!");
                            break;
                        case 1:
                            resObj = inValue;
                            break;
                        default:
                            var lastArr = resArr.slice(1);
                            var resObj;
                            resObj = arrayToObject(lastArr, inValue);
                    }
                    inCompoent.setOption(resArr[0], resObj);
                },
                get:function (inCompoent, inPath) {
                    if (!inPath)
                        return;
                    var attrs = inPath.split(".");
                    var options = inCompoent.getOption(attrs.shift());
                    if (attrs.length) {
                        return arrayValFromObj(attrs, options);
                    } else {
                        return options;
                    }
                }
            },
            'content':{
                set:function (inCompoent, inPath, inValue, inOldValue) {
                    inCompoent.setContent(inValue, inCompoent);
                },
                get:function (inCompoent, inPath) {
                    return inCompoent.getHtml();
                }
            },
            'model':{
                set:function (inCompoent, inPath, inValue, inOldValue) {
                    inCompoent.setModel(inValue, inPath);
                },
                get:function (inCompoent, inPath) {
                    return inCompoent.getModel();
                }
            },
            'default':{
                set:function (inCompoent, inPath, inValue, inOldValue) {
                    inCompoent.setAttribute(inPath, inValue)
                },
                get:function (inCompoent, inPath) {
                    return inCompoent.getAttribute(inPath);
                }
            }
        };
        return hooks;
    })();


    /**
     * @class fruit.Controller
     * @extend fruit
     * @namespace fruit
     * @mixins fruit.Node , fruit.Observable
     */
    fruit.define('fruit.Controller', {
        mixins:['fruit.Node', 'fruit.Observable'],
        entity:{
            /**
             * The constructor method
             * @method init
             */
            init:function () {
                var id = getIdentity();
                //this.$id = id;
                this.$parent = fruit.Application;
                this.$owner = fruit.Application;
                fruit.$[this.$id] = this;
                this._triggers = {};
            },
            /**
             * The destructor method
             * @method destroy
             */
            destroy:function () {
                var id = this.$id;
                var children = this.children(), child;
                var i = 0, length = children.length;

                for (i = 0; i < length; i++) {
                    child = children[i];
                    child.destroy();
                }

                util.each(this.eventRefs, function (item) {
                    item.target.off(item.etype, item.fn);
                });

                this.isolate();
                delete fruit.$[id];
            },
            /**
             * Register the controller in global object
             * @method register
             */
            register:function () {
                if (arguments.length === 0) {
                    logger.warn('can not inject null object');
                }
                if (arguments.length === 1) {
                    util.mixin(this, arguments[0]);
                } else {
                    var name = arguments[0];
                    var property = arguments[1];
                    attachProperty(this, name, property);
                }
                return this;
            },
            /**
             * Unregister the controller from the global object
             * @method unregister
             */
            unregister:function (name) {
                if (this[name]) {
                    delete this[name];
                }
            },
            attachEvents:function () {
                var events = this.$config.events || {};
                var comp, compName, eventEntry, eventName, methodName;

                events = events.subscribe || {};

                for (compName in events) {
                    comp = compName == 'this' ? this : this[compName];
                    if (comp) {
                        eventEntry = events[compName];
                        for (eventName in eventEntry) {
                            methodName = eventEntry[eventName];
                            comp.on(eventName, this[methodName], this);
                        }
                    }

                }
            },
            /**
             * Get published events
             * @method getPublishedEvents
             */
            getPublishedEvents:function () {
                var events = this.$config.events;
                if (events) {
                    return events.publish || [];
                }
                return [];
            },
            /**
             *
             */
            attachTriggers:function () {
                var triggers = this.$triggers || {};
                var expr, group, name, triggerGroup, triggerEntry, trigger, _trigger;
                var source, target, action, params;
                var i, length;

                for (group in triggers) {
                    triggerGroup = triggers[group];
                    for (name in triggerGroup) {
                        triggerEntry = triggerGroup[name];
                        triggerEntry = util.isArray(triggerEntry) ? triggerEntry : [triggerEntry];
                        expr = group + '.' + name;
                        length = triggerEntry.length;
                        for (i = 0; i < length; i++) {
                            trigger = triggerEntry[i];
                            source = trigger.source ? this[trigger.source] : this;
                            target = trigger.target ? this[trigger.target] : this;

                            if (!source) {
                                logger.warn('Cannot find trigger source "' + trigger.source + '".');
                                break;
                            }

                            if (!target) {
                                logger.warn('Cannot find trigger target "' + trigger.target + '".');
                                break;
                            }

                            action = target[trigger.action];
                            params = trigger.params;

                            if (!action) {
                                logger.warn('Cannot find trigger action "' + trigger.action + '".');
                                break;
                            }

                            _trigger = source._triggers[expr] = source._triggers[expr] || [];
                            _trigger.push({
                                target:target,
                                actionName:trigger.action,
                                action:action,
                                params:util.isUndef(params) ? null : (util.isArray(params) ? params : [params])
                            });
                        }
                    }
                }
            },
            /**
             *
             * @param expr
             * @param data
             */
            evaluateTriggers:function (expr, data) {
                var triggers = this._triggers;
                var _trigger = triggers[expr], trigger, _params, params, param;
                var i, length;
                var isEvent = expr.indexOf('event') == 0;

                if (_trigger) {
                    for (i = 0, length = _trigger.length; i < length; i++) {
                        trigger = _trigger[i];
                        _params = trigger.params;
                        params = [];
                        if (_params) {
                            var paramLength = _params.length;
                            for (var j = 0; j < paramLength; j++) {
                                param = _params[j];
                                if (param == '#value#') {
                                    params.push(data);
                                } else if (param == '#!value#') {
                                    params.push(!data);
                                } else {
                                    params.push(_params[j]);
                                }
                            }
                        } else {
                            params = [data];
                        }

                        if (isEvent) {
                            trigger.action.call(trigger.target, this, data, trigger.param);
                        } else {
                            trigger.action.apply(trigger.target, params);
                        }
                    }
                }
            },
            /**
             *
             * @param type
             * @param event
             */
            trigger:function (type, event) {
                event = event || {};
                this.evaluateTriggers('event.' + type, event);
                var routing = (event && event.routing) || 'bubble';

                if (routing == 'none') {
                    return;
                }
                else {
                    this.superMethod([type, event]);
                }

                if (routing == 'bubble') {
                    var parent = this.$parent;
                    if (parent) {
                        parent.trigger(type, event);
                    }
                } else if (routing == 'tunnel') {
                    this.children(function (child) {
                        child.trigger(type, event);
                    });
                }
            },
            hasEvent:function (name) {
                return util.indexOf(this.$events.publish, name) >= 0;
            }
        }
    });

    fruit.Controller.regProcessor('triggers', function (cls, data) {
        var triggers, proto;
        if (data.triggers) {
            proto = cls.prototype;
            triggers = data.triggers;

            while (proto) {
                if (proto.$triggers) {
                    triggers.option = util.merge(triggers.option, proto.$triggers.option);
                    triggers.event = util.merge(triggers.event, proto.$triggers.event);
                }
                proto = proto.$super;
            }

            cls.prototype.$triggers = triggers;
        }
    });

//    fruit.Controller.regProcessor('options', function (cls, data) {
//        if (data.options) {
//            util.each(data.options, function (optionDefinition, optionName) {
//                if (!optionDefinition || util.isUndef(optionDefinition.defaultValue)) {
//                    optionDefinition = {
//                        defaultValue:optionDefinition
//                    };
//                }
//
//                optionManager.registerOption(cls.prototype.$fullname, optionName, optionDefinition);
//            });
//        }
//    });

    /**
     * @class fruit.ui.Component
     * @extends fruit.Controller
     * @param {Object}
     *
     */
    fruit.define('fruit.ui.Component', {
        extend:'fruit.Controller',
        options:{
            /**
             * @cfg {String} id
             * Get or set the id of the Component
             * @example component1
             */
            id:{
                defaultValue:null,
                acceptTypes:['String', 'Number', 'Null']
            },
            /**
             * @cfg {String} disabled
             * Get or set a value indicates whether the Component is disabled
             * @example true
             */
            disabled:{
                defaultValue:false,
                inherits:true,
                acceptTypes:['Boolean']
            },
            /**
             * @cfg {String} hidden
             * Get or set a value indicates whether the Component is hidden
             * @example true
             */
            hidden:{
                defaultValue:false,
                acceptTypes:['Boolean']
            },
            /**
             * @cfg {String} visible
             * Get or set a value indicates whether the Component is visible
             * @example true
             */
            visible:{
                defaultValue:true,
                acceptTypes:['Boolean']
            },
            /**
             * @cfg {String} title
             * Get or set the title of the Component
             * @example component1
             */
            title:{
                defaultValue:null,
                acceptTypes:['String', 'Null']
            }/*,
            */
        },
        triggers:{
            option:{
                id:{
                    action:'setAttribute',
                    params:['id', '#value#']
                },
                disabled:[
                    {
                        action:'setAttribute',
                        params:['disabled', '#value#']
                    },
                    {
                        action:'setAttribute',
                        params:['aria-disabled', '#value#']
                    }
                ],
                title:{
                    action:'setAttribute',
                    params:['title', '#value#']
                },
                hidden:{
                    action:'toggleClass',
                    params:['hidden', '#value#']
                }
            }
        },
        entity:{
            init:function (opts, el, ctx) {
                var subNode, subComp, subName, subType, container, key, self = this, context = ctx || this;
                var element = el || viewManager.getElement(this.$fullname).element;


                this.initializing = true;
                //TODO:
                this.element = new fruit.Element(element);
                subNode = this.element.firstChild();


                while (subNode) {
                    if (dom.isElement(subNode.element)) {
                        subType = subNode.getAttribute('data-fruit-type');
                        subName = subNode.getAttribute('data-fruit-name');
                        container = subNode.getAttribute('data-fruit-container');
                        subComp = createComponent(subType, null, subNode, subType && !container ? null : context);
                        this.appendChild(subComp);

                        if (subName) {
                            subComp.name = subName;
                            subComp.$owner = context;
                            attachProperty(context, subName, subComp);
                        }
                    }
                    subNode = subNode.nextSibling();
                }

                this.attachTriggers();

                /*
                 var viewInfo = viewManager.viewInfoTable[this.$fullname];

                 if (viewInfo && !viewInfo.initialized) {
                 optionManager.initOptions(this);
                 if (this.$fullname != 'fruit.ui.Popup') {
                 var cachedElement = element.cloneNode(true);
                 dom.removeAttribute(cachedElement, 'data-fruit-options');
                 viewInfo.root = cachedElement;
                 }
                 viewInfo.initialized = true;
                 }
                 */

                //optionManager.initOptions(this);

                this.setAttribute('data-fruit-id', this.$id);

                var modelAttr = this.getAttribute('data-fruit-model');
                var templateAttr = this.getAttribute('data-fruit-template');
                var optionsAttr = this.getAttribute('data-fruit-options');
                var bindingsAttr = this.getAttribute('data-fruit-bindings');

                if (templateAttr) {
                    this.setTemplate(JSON.parse(templateAttr));
                    //this.removeAttribute('data-fruit-template');
                }

                if (modelAttr) {
                    var model = JSON.parse(modelAttr);
                    if (util.isString(model)) {
                        var path = extractPath(model);
                        if (path) {
                            this.__nodePath = path[1];
                        } else {
                            this.model = model;
                        }
                    } else {
                        this.setModel(model);
                    }

                    //this.removeAttribute('data-fruit-model');
                }

                if (optionsAttr) {
                    var options = JSON.parse(optionsAttr);
                    opts = opts || options;
                    //this.removeAttribute('data-fruit-options');
                }

                if (bindingsAttr) {
                    var bindings = JSON.parse(bindingsAttr);
                    for (var i = 0; i < bindings.length; i++) {
                        var binding = bindings[i];
                        this.setBinding(binding.prop, extractPath(binding.expr)[1]);
                    }
                    //this.removeAttribute('data-fruit-bindings');
                }

                var allOptions = this.getAllOptions();
                util.each(allOptions, function (value, key) {
                    this.evaluateTriggers('option.' + key, value);
                }, this);

                if (opts) {
                    for (key in opts) {
                        this.setOption(key, opts[key], true);
                    }
                }

                engine.subscribe(this["$id"], function (event) {
                    if (event.target) {
                        var targetId = event.target.getAttribute('data-fruit-id');
                        event.target = fruit.$[targetId];
                    }
                    self.trigger(event.type, event);
                });
                delete this.initializing;
            },
            /**
             *
             */
            destroy:function () {
                this.superMethod(arguments);
                var name = this.name;
                if (name && this.$owner[name]) {
                    delete this.$owner[name];
                }

                engine.unsubscribe(this.$id);
                this.element.remove();
            },
            getElement:function () {
                return this.element;
            },
            /**
             *
             * @param target
             */
            renderTo:function (target) {
                fruit.Application.load(this, target);
            },
            __parseProperty:function (inCompoent, inPath, inValue, inOldValue, inMethod) {
                var hookParser = inPath.match(/^(\w+)(?:\.)*(.*)/);
                var hook = propertyHooks[hookParser[1]];
                if (hook) {
                    return hook[inMethod](inCompoent, hookParser[2], inValue, inOldValue);
                } else {
                    return propertyHooks['default'][inMethod](inCompoent, inPath, inValue, inOldValue);
                }
            },
            /**
             * Set property of the component
             * @param {String} inPath
             * @param {Mixed} inValue
             * @param {Mixed} inOldValue
             * @method setProperty
             */
            setProperty:function (inPath, inValue, inOldValue) {
                this.__parseProperty(this, inPath, inValue, inOldValue, "set");
            },
            /**
             * Get property of the component
             * @method getProperty
             */
            getProperty:function (inPath, inValue, inOldValue) {
                return this.__parseProperty(this, inPath, inValue, inOldValue, "get");
            },
            /**
             *
             */
            initOptions:function () {
                optionManager.initOptions(this);
            },
            /**
             * Set option of the component
             * @param {String} name
             * @param {Mixed} value
             * @method setOption
             */
            setOption:function (name, value, __init) {
//                if (optionManager.setOption(this, name, value, __init)) {
//                    this.evaluateTriggers('option.' + name, value);
//                }

                if (this.superMethod(arguments)) {
                    this._$onPropertyChanged('options.' + name, value);
                    this.evaluateTriggers('option.' + name, value);
                }

                if (name == 'disabled') {
                    this.children(function (child) {
                        child.setOption('disabled', value);
                    });
                }
            },
            /**
             * Get option of the component
             * @method getOption
             */
            getOption:function (name) {
                return this.superMethod(arguments);
//                return optionManager.getOption(this, name);
            },
            /**
             * Get bound of the component
             * @method getBound
             */
            getBound:function () {
                return this.element.getBound();
            },
            /**
             * Set content of the component
             * @param {Object} comp
             * @param {Object} contentDef
             * @method setContent
             */
            setContent:function (contentDef, comp) {
                comp = comp || this;
                if (contentDef != null) {
                    var contentArray = util.isArray(contentDef) ? contentDef : [contentDef];
                    var i, length = contentArray.length, content;
                    this.empty();
                    for (i = 0; i < length; i++) {
                        content = contentArray[i];
                        this.__setContent(content, comp);
                    }
                }
            },
            __setContent:function (contentDef, comp) {
                var regionName = contentDef.region || '';
                var regionsInfo = {};
                //comp.$config.regions || {};
                var regionInfo = regionsInfo[regionName] || regionsInfo['default'] || {};

                var region = regionInfo.target && comp != this ? comp[regionInfo.target] : comp;

//                if (!regionInfo.multiple) {
//                    region.empty();
//                }

                if (util.isObject(contentDef)) {
                    if (contentDef instanceof fruit.ui.Component) {
                        region.appendChild(contentDef);
                        return;
                    }

                    var subComp = createComponent(contentDef);
                    var subContent = contentDef.content;
                    var name = contentDef.name;

                    region.appendChild(subComp);

                    if (name) {
                        subComp.setAttribute('data-fruit-name', name);
                        this[name] = subComp;
                    }

                    if (subContent) {
                        this.setContent(subContent, subComp);
                    }
                } else {
                    region.empty();
                    region.setHtml(contentDef.toString());
                }
            },
            /**
             * Set text of the component
             * @param {String} inText
             * @method setText
             */
            setText:function (inText) {
                this.element.setText(inText);
            },
            /**
             * Get text of the component
             * @method getText
             */
            getText:function () {
                return this.element.getText();
            },
            /**
             * Set html of the component
             * @param {String} inHtml
             * @method setHtml
             */
            setHtml:function (inHtml) {
                this.element.setHtml(inHtml);
            },
            /**
             * Get html of the component
             * @method getHtml
             */
            getHtml:function () {
                return this.element.getHtml();
            },
            /**
             * Get attribute of the component
             * @method getAttribute
             */
            getAttribute:function (inName) {
                return this.element.getAttribute(inName);
            },
            /**
             * Set attribute of the component
             * @param {String} inName
             * @param {String} inValue
             * @method setAttribute
             */
            setAttribute:function (inName, inValue) {
                this.element.setAttribute(inName, inValue);
            },
            /**
             * Remove attribute of the component
             * @method removeAttribute
             */
            removeAttribute:function (inName) {
                this.element.removeAttribute(inName);
            },
            /**
             * Get class of the component
             * @method getClass
             */
            getClass:function () {
                return this.element.getClass();
            },
            /**
             * Set class of the component
             * @param {String} inClassName
             * @method setClass
             */
            setClass:function (inClassName) {
                this.element.setAttribute('class', inClassName);
            },
            /**
             * Whether the component has class
             * @param {String} inClassName
             * @method hasClass
             */
            hasClass:function (inClassName) {
                return this.element.hasClass(inClassName);
            },
            /**
             * Add class of the component
             * @param {String} inClassName
             * @method addClass
             */
            addClass:function (inClassName) {
                this.element.addClass(inClassName);
            },
            /**
             * Remove class of the component
             * @param {String} inClassName
             * @method removeClass
             */
            removeClass:function (inClassName) {
                this.element.removeClass(inClassName);
            },
            /**
             * Replace class of the component
             * @param {String} oldClass
             * @param {String} newClass
             * @method removeClass
             */
            replaceClass:function (oldClass, newClass) {
                this.element.replaceClass(oldClass, newClass);
            },
            /**
             * Toggle class of the component
             * @param {String} className1
             * @param {String} className2
             * @method toggleClass
             */
            toggleClass:function (className, onoff) {
                if (onoff === true) {
                    this.element.addClass(className);
                } else if (onoff === false) {
                    this.element.removeClass(className);
                } else {
                    this.element.toggleClass(className);
                }
            },
            /**
             *
             * @param inKey
             * @param inObj
             */
            switchClass:function (inKey, inObj) {
                this.__switchClass(this.element, inKey, inObj);
            },
            __switchClass:function (inElement, inKey, inObj) {
                var curCls = inObj[inKey];
                var otherCls = this.__getOtherCls(inKey, inObj);
                if (curCls === null || curCls === undefined || !otherCls) return;
                var reg = [];
                for (var i = 0, item, len = otherCls.length; i < len; i++) {
                    item = otherCls[i];
                    if ("" !== item) {
                        reg.push('((?:^|\\s)' + item + '(?=\\s|$))');
                    }
                }
                reg = new RegExp(reg.join('|'), 'ig');
                var compCls = inElement.getClass();
                var matchRs = compCls ? compCls.match(reg) : null
                var keyCls;
                if (matchRs) {
                    keyCls = util.trim(matchRs[0]);
                } else {
                    keyCls = "";
                }
                inElement.replaceClass(keyCls, curCls);
            },
            __getOtherCls:function (inKey, inObj) {
                var rsArr = [],
                    tempObj;
                if (inObj.splice) {
                    tempObj = [].concat(inObj);
                    tempObj.splice(inKey, 1);
                    rsArr = inObj;
                } else {
                    tempObj = util.clone(inObj);
                    delete tempObj[inKey];
                    rsArr = util.getObjectVals(tempObj);
                }
                return rsArr;
            },
            /**
             *
             * @param inAttrName
             * @param inKey
             * @param inObj
             */
            switchAttribute:function (inAttrName, inKey, inObj) {
                this.element.setAttribute(inAttrName, inObj[inKey]);
            },
            /**
             *
             */
            hide:function () {
                this.setOption('hidden', true);
            },
            /**
             * Show the component
             * @method show
             */
            show:function () {
                this.setOption('hidden', false);
            },
            /**
             *
             * @param prop
             * @return {*}
             */
            getModel:function (prop) {
                var path = (prop && this.__propMap) ? this.__propMap[prop] : '';
                if (this.model) {
                    if (this.model instanceof fruit.ui.data.ViewModel) {
                        return this.model.getValue(combinePath(this.__modelPath, path));
                    } else if (this.model instanceof fruit.ui.data.ViewModelCollection) {
                        return this.model.originalItems;
                    } else {
                        return modelMgr.getValue(this.model, combinePath(this.__modelPath, path));
                    }
                }
            },
            setBinding:function (prop, path) {
                var propMap = this.__propMap = this.__propMap || {};
                var pathMap = this.__pathMap = this.__pathMap || {};
                var pathArray = pathMap[path] = pathMap[path] || [];

                propMap[prop] = path;
                pathArray.push(prop);
            },
            /**
             *
             * @param template
             */
            setTemplate:function (template) {
                this.template = template;
                if (this.model) {
                    this._$onModelReset();
                }
            },
            /**
             * Set model of the component
             * @param {Object} model
             * @param {String} path
             * @method setModel
             */
            setModel:function (model, path, __inherited, __noUpdate) {
                if (!__inherited) {
                    this.__nodePath = '';
                }

                var combinedPath = combinePath(path, this.__nodePath);
                this.modelType = 'M';

                this.__modelPath = combinedPath;
                this.hasOwnModel = !__inherited;

                if (this.model) {
                    if (this.model instanceof fruit.ui.data.ViewModel) {
                        this.model.off('refresh', this._$onModelRefresh, this);
                        this.model.off('edit', this._$onModelEdit, this);
                    } else if (this.model instanceof fruit.ui.data.ViewModelCollection) {
                        this.model.off('reset', this._$onModelReset, this);
                        this.model.off('add', this._$onModelAdd, this);
                        this.model.off('remove', this._$onModelRemove, this);
                    }
                }

                this.model = model;

                if (this.model) {
                    if (this.model instanceof fruit.ui.data.ViewModel) {
                        this.model.on('refresh', this._$onModelRefresh, this);
                        this.model.on('edit', this._$onModelEdit, this);
                        this.modelType = 'VM';
                    } else if (this.model instanceof fruit.ui.data.ViewModelCollection) {
                        this.model.on('reset', this._$onModelReset, this);
                        this.model.on('add', this._$onModelAdd, this);
                        this.model.on('remove', this._$onModelRemove, this);
                        this.modelType = 'VMC';
                    }
                }

                this._$onModelRefresh();
                this._$onModelReset();
            },
            /**
             *
             */
            syncModel:function () {
                var model = this.model;
                var modelPath = this.__modelPath;
                util.each(this.__pathMap, function (prop, path) {
                    util.each(prop, function (p) {
                        var tpath = combinePath(modelPath, path);
                        var value;
                        switch (this.modelType) {
                            case 'M':
                                value = modelMgr.getValue(model, tpath);
                                break;
                            case 'VM':
                                value = model.getValue(tpath);
                                break;
                            case 'VMC':
                                value = model;
                                break;
                        }
                        this.setProperty(p, value);
                    }, this);
                }, this);
            },
            _$onModelRefresh:function (sender, event) {
                this.syncModel();
            },
            _$onModelReset:function (sender, event) {
                var model = this.model;
                var template = this.template;
                var path = this.__modelPath;
                if (template) {
                    var items;
                    //model.getValue(combinedPath);

                    switch (this.modelType) {
                        case 'M':
                            items = modelMgr.getValue(model, path);
                            break;
                        case 'VM':
                            items = model.getValue(path);
                            break;
                        case 'VMC':
                            items = model.items;
                            break;
                    }

                    if (items instanceof fruit.ui.data.ViewModelCollection) {
                        this.model = items;
                        this.modelType = 'VMC';
                        items.on('add', this._$onModelAdd, this);
                        items.on('remove', this._$onModelRemove, this);
                        items.on('reset', this._$onModelReset, this);
                        items = items.items;
                    }

                    this.empty();

                    if (!util.isArray(items)) {
                        return;
                    }

                    util.each(items, function (item, key) {
                        var subPath = path ? path + '.' + key : key.toString();
                        var compDef = util.clone(template);
                        //TODO: Reimplement the template binding mechanism
                        if (util.isString(compDef.type)) {
                            var typePath = extractPath(compDef.type);
                            if (typePath) {
                                typePath = combinePath(subPath, typePath[1]);
                                compDef.type = modelMgr.getValue(model, typePath);
                            }
                        }
                        //END

                        var subComp = createComponent(compDef);
                        this.appendChild(subComp);
                        subComp.__nodePath = this.modelType == 'VMC' ? '' : '' + key;
                        subComp.trigger('ready', {
                            routing:'tunnel'
                        });
                        subComp.setModel(this.modelType == 'VMC' ? item : model, this.modelType == 'VMC' ? '' : path, true, true);
                    }, this);
                } else {
                    this.children(function (child) {
                        if (!child.hasOwnModel) {
                            child.setModel(model, path, true, true);
                        }
                    });
                }
            },
            _$onModelEdit:function (sender, event) {
                var path = event.path;
                var value = event.value;
                var modelPath = this.__modelPath;

                if (path && this.__pathMap) {
                    if (modelPath) {
                        var index = path.indexOf(modelPath);
                        if (index != 0) {
                            return;
                        } else {
                            path = path.substr(modelPath.length + 1);
                        }
                    }
                    var prop = this.__pathMap[path || ''];
                    if (prop) {
                        util.each(prop, function (p) {
                            this.setProperty(p, value, this.getProperty(p));
                        }, this);
                    }
                }
            },
            _$onModelAdd:function (sender, event) {
                var index = event.index;
                var item = event.item;
                var path = event.path;
                var template = this.template;

                if (template) {
                    var subComp = createComponent(template);
                    var subPath = path ? path + '.' + index : index.toString();
                    this.insertAt(subComp, index);
                    subComp.trigger('ready', {
                        routing:'tunnel'
                    });
                    subComp.setModel(item, '');
                }
            },
            _$onModelRemove:function (sender, event) {
                var path = event.path;
                var index = event.index;
                var modelPath = this.__modelPath;
                var template = this.template;

                if (template) {
                    var child = this.childAt(index);
                    var modelPath = this.__modelPath;
                    var i = 0;
                    if (child) {
                        child.destroy();
                    }
                }
            },
            _$onPropertyChanged:function (prop, newValue, oldValue) {
                var model = this.model;

                if (model && this.__propMap) {
                    var path = this.__propMap[prop || ''];
                    var combinedPath = combinePath(this.__modelPath, path);

                    if (model instanceof fruit.ui.data.ViewModel) {
                        model.setValue(combinedPath, newValue);
                    } else {
                        modelMgr.setValue(model, combinedPath, newValue);
                    }
                }
            },
            /**
             * Set style of the component
             * @param key
             * @param value
             * @method setStyle
             */
            setStyle:function (key, value) {
                this.element.setStyle(key, value);
            },
            /**
             * Get style of the component
             * @param key
             * @method getStyle
             */
            getStyle:function (key) {
                return this.element.getStyle(key);
            },
            /**
             * Remove style of the component
             * @param inStyleName
             * @method removeStyle
             */
            removeStyle:function (inStyleName) {
                this.element.removeStyle(inStyleName);
            },
            /**
             * Empty style of the component
             * @method emptyStyle
             */
            emptyStyle:function () {
                this.element.removeStyle();
            },
            /**
             * Empty all child components of the component
             * @method empty
             */
            empty:function () {
                var children = this.children(), child;
                var i = 0, length = children.length;

                for (; i < length; i++) {
                    child = children[i];
                    child.destroy();
                }

                this.element.empty();
            },
            /**
             * Focus the component
             * @method focus
             */
            focus:function () {
                this.element.focus();
            },
            /**
             * Blur the component
             * @method focus
             */
            blur:function () {
                this.element.blur();
            },
            /**
             * Attach behavior to the component
             * @param inArray
             * @method attachBehavior
             */
            attachBehavior:function (inArray) {
                var arr = util.isArray(inArray) ? inArray : [inArray],
                    len = arr.length,
                    item,
                    behaviorName,
                    behaviorParams,
                    behaviorItem;
                while (len--) {
                    item = arr[len];
                    behaviorName = item['behavior'];
                    behaviorParams = item['params'];
                    behaviorItem = new fruit.ui[behaviorName + 'Behavior'](this, behaviorParams);
                    if (util.isFunction(behaviorItem.onAttached)) {
                        behaviorItem.onAttached(this);
                    }
                }
            },
            /**
             * Detach behavior from the component
             * @param {Object} behavior
             * @method detachBehavior
             */
            detachBehavior:function (behavior) {
                if (util.isFunction(behavior.onDettached)) {
                    behavior.onDettached(this);
                }
            },
            appendChild:function (child) {
                this.superMethod(arguments);
                var el = this.element;
                var childEl = child.element;

                //child.setOption('disabled', this.getOption('disabled'));

                if (el && childEl && !childEl.parent()) {
                    el.appendChild(childEl);
                    child.trigger('ready', {routing:'tunnel'});
                }
            },
            insertBefore:function (child, target) {
                this.superMethod(arguments);

                var el = this.element;
                var childEl = child.element;
                var targetEl = target.element;

                //child.setOption('disabled', this.getOption('disabled'));

                if (el && targetEl && targetEl.parent()) {
                    el.insertBefore(childEl, targetEl);
                    child.trigger('ready', {routing:'tunnel'});
                }
            },
            __refreshModelPath:function (path) {
                var modelPath = this.__modelPath = combinePath(path, this.__nodePath);
                this.children(function (child) {
                    child.__refreshModelPath(modelPath);
                });
            }
        }
    });

    fruit.ui.Component.regProcessor('view', function (cls, data) {
        if (data.view) {
            viewManager.registerView(cls.prototype.$fullname, data.view, data.regions);
        } else {
            // TODO:
            var superObj = cls.prototype.$super;
            if (superObj) {
                viewManager.viewInfoTable[cls.prototype.$fullname] = util.clone(viewManager.viewInfoTable[superObj.$fullname]);
            }
        }
    });


    fruit.ns('fruit.ui').extend({
        getComponentById:getComponentById,
        createComponent:createComponent
    });

})(fruit, fruit.util, fruit.dom, fruit.event.Engine, fruit.dom.position, fruit.ui.data.ModelManager, fruit.util.logger, fruit.ui.ViewManager, fruit.ui.OptionManager);
(function (fruit, util, engine, dom) {

    function attachProperty(target, key, value) {
        if (typeof target[key] == 'undefined') {
            target[key] = value;
        } else {
            target[key] = value;
            logger.warn('Duplicated prop "' + key + '"  detected.');
        }
    }
    /**
     * @class fruit.Application
     * @extends fruit
     * @param {Object}
     *
     */
    fruit.define('fruit.Application', {
        extend:'fruit.Controller',
        singleton:true,
        methods:{
            init:function () {
                this.document = document;
                var self = this;

                fruit.ready(function () {
                    engine.subscribe("document", function (event) {
                        self.trigger(event.type, event);
                    });
                    this.element = document.body;
                });
            },
            getBody:function () {
                return this._body = this._body || document.body;
            },
            on:function (name, fn, scope, data) {
                if (name.indexOf('window') !== -1) {
                    //                    fruit.extendEvents(name.substring(7), fn, true);
                    //TODO:change this to window processor
                    engine.addEvent(window, name.substring(7), fn);
                } else {
                    this.superMethod(arguments);
                }
            },
            /**
             * Load a component to a node
             * @param component
             * @param container
             */
            load:function (component, container) {
                if (component instanceof fruit.ui.Component) {
                    var targetEl;
                    if (util.isString(container)) {
                        targetEl = document.getElementById(container);
                    } else {
                        targetEl = container;
                    }
                    targetEl = targetEl || this.getBody();
                    this.appendChild(component);
                    targetEl.appendChild(component.element.getElement());
                    component.trigger('ready', {
                        routing:'tunnel'
                    });
                }
            },
            /**
             * Parse an element or body for register components
             * @param el
             */
            parse:function (el) {
                var element = el || document.body;

                if (dom.isElement(element)) {
                    element=new fruit.Element(element);
                    var fid = element.getAttribute('data-fruit-id');
                    var type = element.getAttribute( 'data-fruit-type');

                    if (fid) {
                        return;
                    }

                    if (type) {
                        var comp = fruit.createComponent(type, null, element);
                        this.appendChild(comp);
                        var name = element.getAttribute( 'data-fruit-name');

                        if (name) {
                            attachProperty(this, name, comp);
                        }

                        comp.trigger('ready', {
                            routing:'tunnel'
                        });
                    } else {
                        var child = element.firstChild;
                        while (child) {
                            if (dom.isElement(child)) {
                                this.parse(child);
                            }
                            child = child.nextSibling;
                        }
                    }
                }
            }
        }
    });



    var appParsed = false;

    fruit.ready(function () {
        if (!appParsed) {
            fruit.Application.parse();
            appParsed = true;
        }
    });
})(fruit, fruit.util, fruit.event.Engine, fruit.dom);
(function (fruit, app, dom, util) {
    /**
     * @class fruit.ui.DraggableBehavior
     * @extends fruit.ui.Behavior
     */
    fruit.define('fruit.ui.DraggableBehavior', {
        extend:'fruit.ui.Behavior',
        entity:{
            onAttached:function () {
                var comp = this.component;
                var handle = this.config.handle || comp;
                var styObj={};
                var nowPos=handle.getStyle('position');
                if(nowPos!=='absolute' || nowPos!=='fixed' || nowPos!=='relative'){
                    styObj={
                        position:'relative'
                    }
                }
                styObj.cursor='move';
                handle.setStyle(styObj);

                comp.activate = false;
                /**
                 * @event dragstart
                 * attach dragstart event
                 */
                this.dragstart = function (sender, e) {
                    if (util.isIE) {
                        comp.element.element.setCapture(true);
                    }

                    //TODO:so bug the code
                    var compInfo=comp.element.getXY();
                    var curStyle=comp.getStyle('position');
                    if(curStyle==="relative" || curStyle==="static"){
                        comp.setStyle({
                            left:compInfo.x,
                            top:compInfo.y,
                            position:'absolute'
                        });
                    }

                    //fruit.Application._body.appendChild();
                    comp.element.appendTo(dom.getBody());


                    if (e.button == 0 || e.button == 1) {
                        comp.activate = true;
                        var compXY = {
                            x:parseFloat(comp.getStyle("left")),
                            y:parseFloat(comp.getStyle("top"))
                        };
                        comp._x = e.pageX - compXY.x;
                        comp._y = e.pageY - compXY.y;

                        comp.trigger("onDragStart");
                        e.preventDefault();
                    }
                };
                /**
                 * @event dragmove
                 * attach dragmove event
                 */
                this.dragmove = function (sender, e) {
                    if(!comp.activate) return;
                    var docInfo = dom.getDocRect();
                    var compInfo = comp.element.getBound();
                    if ((e.button == 0 || e.button == 1)) {
                        comp.setStyle({
                            left:e.pageX - comp._x,
                            top:e.pageY - comp._y
                        });
                        //left:
                        if (e.pageX <= comp._x) {
                            comp.setStyle({ left:0});
                        }
                        //right
                        if ((docInfo.width - e.pageX) <= (compInfo.width - comp._x)) {
                            comp.setStyle({ left:docInfo.width - compInfo.width});
                        }
                        //top
                        if (e.pageY <= comp._y) {
                            comp.setStyle({ top:0});
                        }

                        //if (comp.getOption("fixed")) {
                        if (comp.getStyle("position")==="fixed") {
                            //bottom
                            if ((docInfo.height - e.pageY) <= (compInfo.height - comp._y)) {
                                comp.setStyle({ top:docInfo.height - compInfo.height});
                            }
                        } else {
                            //bottom
                            if ((docInfo.scrollHeight - compInfo.height) <= e.pageY - comp._y) {
                                comp.setStyle({ top:docInfo.scrollHeight - compInfo.height});
                            }
                        }
                    }

                    fruit.dom.clearSelection();
                };
                /**
                 * @event dragend
                 * attach dragend event
                 */
                this.dragend = function (sender, e) {
                    if (util.isIE) {
                        comp.element.element.releaseCapture();
                    }
                    comp.activate = false;
                    comp.trigger("onDragEnd");
                };

                handle.on('dragstart', this.dragstart, this);
                handle.on('dragmove', this.dragmove, this);
                handle.on('dragend', this.dragend, this);
            },
            onDettached:function () {
                var handle = this.config.handle || this.component;
                handle.off('dragstart', this.dragstart);
                handle.off('dragmove', this.dragmove);
                handle.off('dragend', this.dragend);
                delete this.dragstart;
                delete this.dragmove;
                delete this.dragend;
            }
        }
    });
})(fruit, fruit.Application, fruit.dom, fruit.util);
(function (fruit, ui, app, position, dom, util) {
    /**
     * @class fruit.ui.ResizableBehavior
     * @extends fruit.ui.Behavior
     */
    fruit.define('fruit.ui.ResizableBehavior', {
        extend:'fruit.ui.Behavior',
        entity:{
            onAttached:function () {
                var config = this.config,
                    comp = this.component,
                    direction = config.direction,
                    target = config.target.element,
                    handle = this.__createHandle(direction),
                    active=false,
                    initXY,targetSize;
                comp.appendChild(handle);
                handle.on('dragstart', function (sender,event) {
                    active=true;
                    initXY=[event.pageX,event.pageY];
                    targetSize=target.getSize(true);
                    if (util.isIE) {
                        comp.element.element.setCapture(true);
                    }
                    event.routing='none';
                });
                app.on('dragmove', function (sender,event) {
                    if(!active) return;
                    dom.clearSelection();
                    target.setStyle({
                        width:targetSize.width + event.pageX - initXY[0],
                        height:targetSize.height + event.pageY - initXY[1]
                    });
                });
                app.on('dragend', function (sender,event) {
                    //console.log('dragend!');
                    active=false;
                    if (util.isIE) {
                        comp.element.element.releaseCapture();
                    }
                });
            },
            __createHandle:function (direction) {
                return ui.createComponent({
                    attr:{
                        'class':'f-resize-' + direction + '-resize'
                    },
                    tag:'i'
                });
            },
            onDettached:function () {
            }
        }
    });
})(fruit, fruit.ui, fruit.Application, fruit.dom.position, fruit.dom, fruit.util);
(function (fruit, ui, position, app) {
    /**
     * @class fruit.ui.TooltipBehavior
     * @extends fruit.ui.Behavior
     */
    fruit.define('fruit.ui.TooltipBehavior', {
        extend:'fruit.ui.Behavior',
        entity:{
            onAttached:function () {
                var comp = this.component;
                var prop = (this.config && this.config.prop) || "title";
                var globalTooltip = app.getGlobalTooltip();
                var tooltipText = comp.getOption(prop) || this.config[prop];
                if (!tooltipText) return;

                comp.on('mouseover', function () {
                    (prop == "title") && comp.setAttribute(prop, "");
                    globalTooltip.setOption('tooltip',tooltipText);
                    globalTooltip.setStyle({
                        'display':'block'
                    });
                    globalTooltip.show();
                    this.__autoPostion(globalTooltip, comp);
                }, this);
                comp.on('mouseout', function () {
                    (prop == "title") && comp.setAttribute(prop, tooltipText);
                    globalTooltip.setStyle({
                        'display':'none'
                    });
                    globalTooltip.hide();
                }, comp);
                comp.on('dragmove',function(){
                    globalTooltip.setStyle({
                        'display':'none'
                    });
                    globalTooltip.hide();
                });
            },
            __getQuadrant:function(inCompDot,inDocDot){
                if(inCompDot.x<=inDocDot.x && inCompDot.y<=inDocDot.y) return 1;
                if(inCompDot.x>inDocDot.x && inCompDot.y<inDocDot.y) return 2;
                if(inCompDot.x<=inDocDot.x && inCompDot.y>inDocDot.y) return 3;
                if(inCompDot.x>inDocDot.x && inCompDot.y>inDocDot.y) return 4;
                //if(inCompDot.x===inDocDot.x && inCompDot.y===inDocDot.y) return 0;
            },
            __autoPostion:function (globalTooltip, comp) {
                var docInfo=position.getDocRect(),
                    tooltipBound = globalTooltip.getBound(),
                    compBound = comp.getBound(),
                    pos = {},
                    gap=15;
                var docDot={
                    x:docInfo.width*0.5,
                    y:docInfo.height*0.5
                };
                var compDot={
                    x:(compBound.x- docInfo.scrollX)+0.5*compBound.width,
                    y:(compBound.y- docInfo.scrollY)+0.5*compBound.height
                };
                switch (this.__getQuadrant(compDot,docDot)){
                    case 1:
                        //console.log(1111);
                        globalTooltip.setOption('direction',"bl");
                        pos = {
                            left:compBound.x,
                            top:compBound.y+compBound.height + gap
                        };
                        break;
                    case 2:
                        //console.log(2222);
                        globalTooltip.setOption('direction',"br");
                        pos = {
                            left:compBound.x+(compBound.width-tooltipBound.width),
                            top:compBound.y+compBound.height + gap
                        };
                        break;
                    case 3:
                        //console.log(3333);
                        globalTooltip.setOption('direction',"tl");
                        pos = {
                            left:compBound.x,
                            top:compBound.y-(tooltipBound.height + gap)
                        };
                        break;
                    case 4:
                        //console.log(4444);
                        globalTooltip.setOption('direction',"tr");
                        pos = {
                            left:compBound.x+(compBound.width-tooltipBound.width),
                            top:compBound.y-(tooltipBound.height + gap)
                        };
                        break;
                    default:
                        //console.log('default');
                        globalTooltip.setOption('direction',"top");
                        pos = {
                            left:compBound.x,
                            top:compBound.y+compBound.height + gap
                        };
                }
                globalTooltip.setStyle(pos);
            }
        }
    });
})(fruit, fruit.ui, fruit.dom.position, fruit.Application);
(function (fruit, ui) {
    /**
     * @class fruit.ui.PlaceholderBehavior
     * @extends fruit.ui.Behavior
     */
    fruit.define('fruit.ui.PlaceholderBehavior', {
        extend:'fruit.ui.Behavior',
        entity:{
            onAttached:function () {
                var config = this.config,
                    comp = this.component,
                    inputEl = config.inputTarget,
                    placeholderEl = this.__createLabel(config.text);
                comp.appendChild(placeholderEl);
                placeholderEl.on('ready', function () {
                    if (comp.getOption('text')) {
                        placeholderEl.setStyle({'opacity':0, 'zIndex':-1});
                    }
                });
                placeholderEl.on('click', function () {
                    inputEl.focus();
                });
                inputEl.on('focus', function () {
                    if (!inputEl.getAttribute('value')) {
                        placeholderEl.setStyle({'opacity':0.6});
                    }
                });
                inputEl.on('input', function () {
                    placeholderEl.setStyle({'opacity':0, 'zIndex':-1});
                });
                inputEl.on('blur', function () {
                    if (!inputEl.getAttribute('value')) {
                        placeholderEl.setStyle({'opacity':1, 'zIndex':0});
                    }
                });
            },
            __createLabel:function (text) {
                return ui.createComponent({
                    attr:{
                        'class':'f-textbox-placeholder'
                    },
                    name:'placeholder',
                    tag:'span',
                    content:text
                });
            },
            onDettached:function () {
            }
        }
    });
})(fruit, fruit.ui);
(function (fruit, ui, keys) {
    fruit.define('fruit.ui.AbstractListItem', {
        extend:'fruit.ui.Component',
        options:{
            type:{
                defaultValue:'item',
                acceptTypes:['String', 'Null']
            }
        },
        triggers:{
            option:{
                type:{
                    action:'switchClass',
                    params:['#value#', {
                        'item':'f-list-item',
                        'divider':'f-list-divider'
                    }]
                }
            },
            event:{
                mousedown:{
                    action:'__mousedown'
                },
                mouseover:{
                    action:'__mouseover'
                },
                mouseup:{
                    action:'__mouseup'
                }
            }
        },
        methods:{
            activate:function () {
                if (!this.getOption('disabled') && this.getOption('type') === 'item') {
                    this.setAttribute('aria-selected', true);
                    return true;
                }
                else {
                    return false;
                }
            },
            deactivate:function () {
                this.setAttribute('aria-selected', false);
            },
            __mousedown:function (sender, event) {
                event.target = this;
            },
            __mouseup:function (sender, event) {
                event.target = this;
            },
            __mouseover:function (sender, event) {
                event.target = this;
            }
        }
    });


    /**
     * @class fruit.ui.ListItem
     * @extends fruit.ui.Component
     */
    fruit.define('fruit.ui.ListItem', {
        extend:'fruit.ui.AbstractListItem',
        view:{
            tag:'li',
            attr:{
                'class':'f-list-item',
                role:'listitem'
            },
            content:[
                {
                    tag:'i',
                    name:'icon'
                },
                {
                    tag:'a',
                    name:'text'
                }
            ]
        },
        options:{
            /**
             * @cfg {String} text
             * Get or set the text of the List.
             * Default value is null,
             * @example List
             */
            text:{
                defaultValue:null,
                acceptTypes:['String', 'Null']
            },
            icon:{
                defaultValue:'hidden',
                acceptTypes:['String', 'Null']
            }
        },
        triggers:{
            option:{
                text:{
                    target:'text',
                    action:'setHtml'
                },
                icon:{
                    target:'icon',
                    action:'setClass'
                }
            }
        }
    });
    /**
     * @class fruit.ui.List
     * @extends cisco.fig.ui.Component
     */
    fruit.define('fruit.ui.List', {
        extend:'fruit.ui.Component',
        view:{
            attr:{
                tabindex:'-1',
                'class':'f-list',
                role:'list'
            },
            content:[
                {
                    tag:'ul',
                    name:'ulist',
                    attr:{
                        'class':'f-list-wrap'
                    }
                }
            ]
        },
        options:{
            /**
             * @cfg {Array} items
             * Get or set the items of the list.
             * Array type
             * @example [{text: "Item 1"},{text: "Item 2"},{text: "Item 3"}]
             */
            items:{
                defaultValue:null,
                acceptTypes:['Array', 'Null', 'Object']
            },
            itemTemplate:{
                defaultValue:{
                    type:'ListItem',
                    options:{
                        text:'{text}',
                        icon:'{icon}',
                        type:'{type}',
                        disabled:'{disabled}'
                    }
                },
                acceptTypes:['Object']
            }
        },
        triggers:{
            option:{
                items:{
                    target:'ulist',
                    action:'setModel'
                },
                itemTemplate:{
                    target:'ulist',
                    action:'setTemplate'
                }
            },
            event:{
                mouseover:{
                    source:'ulist',
                    action:'__ulist_mouseover'
                },
                mousedown:{
                    source:'ulist',
                    action:'__ulist_mousedown'
                },
                mouseup:{
                    source:'ulist',
                    action:'__ulist_mouseup'
                },
                keyup:{
                    action:'__onKeyUp'
                },
                keydown:{
                    action:'__onKeyDown'
                },
                blur:{
                    action:'__onBlur'
                }
            }
        },
        methods:{
            init:function () {
                this.activeItem = null;
                this.on('focus', this.__focus, this);
                this.on('blur', this.__blur, this);
                this.ulist.template = this.getOption('itemTemplate');
            },
            setOption:function (name, value) {
                this.superMethod(arguments);
                if (name == 'items') {
                    this.activeItem = null;
                }
            },
            getItem:function (index) {
                return this.ulist.childAt(index);
            },
            /**
             * @method activateItem
             */
            activateItem:function (item) {
                var result = false;

                if (this.activeItem) {
                    this.activeItem.deactivate();
                }

                this.activeItem = item;

                if (item) {
                    result = item.activate();
                }

                if (fruit.util.isIE8) {
                    this.setStyle({
                        "zoom":1
                    });
                }

                return result;
            },
            /**
             * @method prevItem
             */
            prevItem:function () {
                if (this.activeItem) {
                    var prevItem = this.activeItem.$previousSibling;
                    while (prevItem) {
                        if (this.activateItem(prevItem)) {
                            break;
                        }

                        prevItem = prevItem.$previousSibling;
                    }
                }
                else {
                    this.activateItem(this.ulist.$lastChild);
                }
            },
            /**
             * @method nextItem
             */
            nextItem:function () {
                if (this.activeItem) {
                    var nextItem = this.activeItem.$nextSibling;
                    while (nextItem) {
                        if (this.activateItem(nextItem)) {
                            break;
                        }

                        nextItem = nextItem.$nextSibling;
                    }
                }
                else {
                    this.activateItem(this.ulist.$firstChild);
                }
            },
            /**
             * @method execute
             */
            execute:function () {
                if (this.activeItem) {
                    this.activeItem.deactivate();
                    this.trigger('execute', {item:this.activeItem});
                    this.activeItem = null;
                }
            },
            /**
             * @method cancel
             */
            cancel:function () {
                this.trigger('cancel');
                if (this.activeItem) {
                    this.activeItem.deactivate();
                    this.activeItem = null;
                }
            },
            __ulist_mouseover:function (sender, event) {
                var target = event.target;
                if (target instanceof ui.AbstractListItem && target.getOption('type') == 'item') {
                    this.activateItem(event.target);
                }
            },
            __ulist_mousedown:function (sender, event) {
                event.preventDefault();
            },
            __ulist_mouseup:function (sender, event) {
                this.execute();
            },
            __onBlur:function () {
                this.cancel();
            },
            __onKeyUp:function (target, evt) {
                var code = evt.keyCode || evt.charCode;

                if (evt.ctrlKey || evt.altKey) {
                    return;
                } else {
                    switch (code) {
                        case keys.ESCAPE:
                            this.cancel();
                            evt.preventDefault();
                            break;
                        case keys.SPACE:
                        case keys.ENTER:
                            this.execute();
                            evt.preventDefault();
                            break;
                    }
                }

                evt.routing = 'none';
                return false;
            },
            __onKeyDown:function (target, evt) {
                var code = evt.keyCode || evt.charCode;
                evt.preventDefault();
                if (evt.ctrlKey || evt.altKey) {
                    return;
                } else {
                    switch (code) {
                        case keys.UP_ARROW:
                            this.prevItem();
                            evt.preventDefault();
                            break;
                        case keys.DOWN_ARROW:
                            this.nextItem();
                            evt.preventDefault();
                            break;
                    }
                }

                evt.routing = 'none';
                return false;
            },
            __focus:function () {
                this.focused = true;
            },
            __blur:function () {
                this.focused = false;
            }
        }
    });

})(fruit, fruit.ui, fruit.util.keys);
(function(fruit, ui) {

	fruit.defineInterface('fruit.ui.IPanel', ['load']);

	/**
	 * @class fruit.ui.AjaxContainer
	 * @extends fruit.ui.Component
	 */
	fruit.define('fruit.ui.AjaxContainer', {
		extend : 'fruit.ui.Component',
		view : {
			tag : 'div'
		},
		implement : 'fruit.ui.IPanel',
		options : {
			/**
			 * @cfg {String} url
			 * ajax load's url.
			 * @example "127.0.0.1/web/test.txt"
			 */
			url : {
				defaultValue : '',
				acceptTypes : ['String']
			},

			/**
			 * @cfg {Boolean} useJscript
			 * Specify whether to execute the loaded javascript. Default is false.
			 * @example false 
			 */
			useJscript : {
				defaultValue : false,
				acceptTypes : ['Boolean']
			},

			/**
			 * @cfg {String} dataType
			 * Specify the ajax's response dataType, default is 'html'.
			 * @example "text"
			 */
			dataType : {
				defaultValue : 'html',
				acceptTypes : ['String']
			}
		},
		methods : {
			load : function() {
				var __src = this.getOption('url'), me = this, bind = fruit.util.bind;
				var __dataType = this.getOption('dataType');
				if (!__dataType) {
					__dataType = 'html';
				}

				fruit.io.ajax({
					url : __src,
					type : 'GET',
					dataType : __dataType,
					error : bind(me.__errorLoad, me),
					success : bind(me.__successLoad, me)
				});

			},

			__errorLoad : function(obj, status) {
                fruit.util.logger.warn("Load data error, reason : " + status);
			},

			__successLoad : function(data, status) {
				var __useJscript = this.getOption('useJscript');
				if (__useJscript) {
					eval(data);
				} else {
					this.setHtml(data);
				}
			}
		}
	});

	/**
	 * @class fruit.ui.IframeContainer
	 * @extends fruit.ui.Component
	 */
	fruit.define('fruit.ui.IframeContainer', {
		extend : 'fruit.ui.Component',
		view : {
			tag : 'iframe'
		},
		options : {
			/**
			 * @cfg {String} url
			 * specify the iframe's url.
			 * @example "127.0.0.1/web/tab_iframe.html"
			 */
			url : {
				defaultValue : '',
				acceptTypes : ['String']
			}
		},
		implement : 'fruit.ui.IPanel',
		methods : {
			load : function() {
				var __src = this.getOption('url');
				this.setAttribute("src", __src);
			}
		}
	});

})(fruit, fruit.ui);
(function (fruit, ui, app, util, dom) {
    app.register({
        popupStack:{}
    });
    var popupStack = app.popupStack;
    /**
     * @class fruit.ui.Popup
     * @extends fruit.ui.Component
     */
    fruit.define('fruit.ui.Popup', {
        extend:'fruit.ui.Component',
        view:{
            dynamic:true,
            container:true,
            attr:{
                'class':'f-popup',
                'style':{
                    'display':'none'
                }
            }
        },
        methods:{
            init:function () {
                this.isPopup = true;
                this.zIndex = 5000;
                this.hide();
            },
            __fixed:function (config) {
                var event = fruit.event.Engine;
                var self = this;
                event.addEvent(window, 'resize', function () {
                    self.setPosition(config);
                });
                event.addEvent(window, 'scroll', function () {
                    self.setPosition(config);
                });
            },
            /**
             *@method open
             */

            open:function (options) {
                if (this.opened) return;
                this._$appendToBody();
                this._$resolveZIndex();
                this._$addToStack();
                var self = this;
                options = options || {};
                var config = {
                    fixed:options.fixed,
                    direction:options.direction || 'below',
                    offsetX:options.offsetX || 0,
                    offsetY:options.offsetY || 0,
                    target:options.target || self.$parent,
                    width:options.width || null,
                    height:options.height || null,
                    align:options.align || null,
                    container:options.container || null
                };
                var isFixed=config.target.getStyle&&config.target.getStyle('position')==='fixed';
                if (config.fixed) {
                    if(isFixed){
                        this.setStyle({position:'fixed'});
                    }else{
                        this.__fixed(config);
                    }
                }
                this.setPosition(config);
                this.opened = true;
                this.trigger('open');
            },
            setPosition:function (config) {


                this.setStyle(this.getStyleObj(this, config));
            },
            getStyleObj:function (comp, config) {
                var mySize = comp.element.getSize();
                var ownerRect;
                if (config.target === fruit.Application) {
                    ownerRect = {top:0, left:0};
                } else {
                    ownerRect = config.target.element.getRect();
                }
                var styleObj = {
                    display:'block',
                    'z-index':comp.zIndex,
                    top:ownerRect.top + config.offsetY,
                    left:ownerRect.left + config.offsetX
                };
                if (null !== config.width) {
                    styleObj['width'] = config.width;
                }
                if (null !== config.height) {
                    styleObj['height'] = config.height;
                }
                if (null === config.container) {
                    switch (config.direction) {
                        case 'above':
                            styleObj.top -= mySize.height - 2;
                            break;
                        case 'left':
                            styleObj.left -= mySize.width + 2;
                            break;
                        case 'right':
                            styleObj.left += ownerRect.width + 2;
                            break;
                        case 'below':
                        default:
                            styleObj.top += ownerRect.height + 2;
                            break;
                    }
                    if ('width' === config.align) {
                        styleObj.width = Math.max(ownerRect.width, config.width);
                    }
                } else {
                    //TODO:getSize or getDocRect
                    if ('center' !== config.direction) {
                        styleObj['left'] = config.offsetX;
                        styleObj['top'] = config.offsetY;
                    } else {
                        styleObj['left'] = '50%';
                        styleObj['top'] = '50%';
                        styleObj['marginLeft'] = mySize.width / 2;
                        styleObj['marginTop'] = mySize.height / 2;
                    }
                }
                return styleObj;
            },
            /**
             *@method close
             */
            close:function () {
                this.hide();
                this.trigger('close');
            },
            hide:function () {
                if (this.opened !== false) {
                    this._$removeFromStack();
                    this.setStyle({
                        display:'none'/*,
                         top : '-9999px'*/
                    });
                    this.opened = false;
                }
            },
            _$appendToBody:function () {
                if (!this._appendedToBody) {
                    dom.getBody().appendChild(this.element);
                    this._appendedToBody = true;
                }
            },
            _$addToStack:function () {
                popupStack[this.$id] = this;
            },
            _$removeFromStack:function () {
                if (popupStack[this.$id]) {
                    delete popupStack[this.$id];
                }
            },
            _$getStack:function () {
                return popupStack;
            },
            _$resolveZIndex:function () {
                var maxIndex = 0, topPopup = null;
                util.each(popupStack, function (popup) {
                    if (popup.zIndex > maxIndex) {
                        topPopup = popup;
                        maxIndex = popup.zIndex;
                    }
                });
                if (topPopup && topPopup != this) {
                    this.zIndex = topPopup.zIndex + 1;
                } else {
                    this.zIndex = 1000;
                }
            },
            _$resolveParentPopup:function () {
                if (!this.parentPopup) {
                    var parent = this.$parent;
                    while (parent) {
                        if (parent instanceof ui.Popup) {
                            this.parentPopup = parent;
                            break;
                        }
                        parent = parent.$parent;
                    }
                }
            }
        }
    });
})(fruit, fruit.ui, fruit.Application, fruit.util, fruit.dom);
(function (fruit, app, position, ui, util, dom, keys) {
    fruit.define('fruit.ui.Tooltip', {
        extend:'fruit.ui.Popup',
        view:{
            tag:'span',
            attr:{
                'class':'f-tooltip',
                role:'tooltip',
                style:{
                    'z-index':5000
                }
            },
            content:[
                {
                    name:'pIcon',
                    tag:'i'
                },
                {
                    name:'content',
                    tag:'span',
                    attr:{
                        'class':'f-tooltip-text'
                    }
                }
            ]
        },
        options:{
            /**
             * @cfg {String} direction
             * Direction of tooltip's arrow.
             * Default value is 'top'
             * Support values are "top"/"right"/"bottom"/"left"
             * @example left
             */
            direction:{
                defaultValue:'top',
                acceptTypes:['String']
            },
            /**
             * @cfg {String} tooltip
             * tooltip text
             * @example tooltip text
             */
            tooltip:{
                defaultValue:null,
                acceptTypes:['String', 'Null']
            },
            /**
             * @cfg {String} icon
             * set icon in the tooltip.
             * String type
             * @example icon-core-alert-x34
             */
            icon:{
                defaultValue:null,
                acceptTypes:['String', 'Null']
            }
        },
        triggers:{
            option:{
                direction:{
                    action:'switchClass',
                    params:[
                        '#value#',
                        {
                            'top':'f-tooltip-top',
                            'tl':'f-tooltip-top-left',
                            'tr':'f-tooltip-top-right',
                            'right':'f-tooltip-right',
                            'rt':'f-tooltip-right-top',
                            'rb':'f-tooltip-right-bottom',
                            'bottom':'f-tooltip-bottom',
                            'bl':'f-tooltip-bottom-left',
                            'br':'f-tooltip-bottom-right',
                            'left':'f-tooltip-left',
                            'lt':'f-tooltip-left-top',
                            'lb':'f-tooltip-left-bottom'
                        }
                    ]
                },
                tooltip:{
                    target:'content',
                    action:'setHtml',
                    params:['#value#']
                },
                icon:{
                    target:'pIcon',
                    action:'addClass',
                    params:['#value#']
                }
            }
        }
    });
    app.register({
        getGlobalTooltip:function () {
            if (!this.globalTooltip) {
                this.globalTooltip = ui.createComponent('Tooltip');
                app.load(this.globalTooltip);
            }
            return this.globalTooltip;
        }
    });
})(fruit, fruit.Application, fruit.dom.position, fruit.ui, fruit.util, fruit.dom, fruit.util.keys);
/**
 * @class fruit.form.Form
 * @namespace fruit.form
 */
(function (fruit, ui, util, dom, ajax, i18n, app) {

    fruit.define('fruit.form.Form', {
        events : ['verifyPass', 'verifyError', 'fieldVerifyError','fieldVerifyPass', 'loadSuccess', 'loadError', 'submitSuccess', 'submitError'],
        requires : ['fruit.form.Field'],
        mixins : 'fruit.Observable',
        config : {
            name : null,
            id : null,
            validate : true,
            reader : null,
            checkAll : true,
            messageType : 'inline',
            writer:null
        },
        reader : null,
        writer : null,
        init : function(config) {
            fruit.util.extend(this,config,this.config);
            this.initFields();
            this.bindEvent();
            if(this.reader){
                 this.setReader(this.reader);
            }
            if(this.writer){
               this.setWriter(this.writer);
            }
            if(this.validate){
                var opt = this.validate===true?{}:this.validate;
                this.setValidate(opt);
            }
        },
        bindEvent : function() {
            var me = this;
            me.el.bind('submit', fruit.func.bind(me.submit, this));
        },
        /**
         * submit the form
         */
        submit : function(actionType) {
            util.logger.debug('submit data')
            if(this.isValid()) {
                this._submit(actionType);
            }
            return false;
        },
        _submit : function(actionType) {
            var me = this;
            if(!me.writer) {
                me.setWriter({
                    url : me.el.attr('action')
                });
            }
            var data = this.toJson();
            //this.writer.submit(data,actionType);
            this.writer.submit(data);
        },
        /**
         * returns form Json data
         */
        toJson : function() {
            var result = {};
            fruit.util.each(this.children, function(field) {
                result[field.name] = field.getValue();
            });
            return result;
        },
        setEl : function(selector) {
            var me = this;
            if(!me.el) {
                me.el = jQuery(selector);
            }
            if(!me.el.size()) {
                me.el = null;
            }
        },
        setWriter : function(options) {
            if(options != null) {
                this.writer = new fruit.data.Writer(options);
            }
        },
        setReader : function(options) {
            if(options != null) {
                this.reader = new fruit.data.Reader(options);
                this.reader.on('readSuccess', this.loadSuccess, this).on('readError', this.loadError, this);
            }
        },
        setValidate : function(options) {
            if(options !== false) {
                this.validate = new fruit.form.Validation({
                    options : options,
                    form : this
                });
            }
        },
        initFields : function() {
            var me = this, selector = me.id ? "#" + me.id : me.name, eles;
            if(!selector) {
                util.logger.error('Need parameter id or name');
            }
            me.el = jQuery(selector);
            if(!me.el.size()) {
                util.logger.error("Can't find the form by {0} ", me.id ? 'ID ' + me.id : ' Name ' + me.name);
            }
            me.children = {};
            eles = me.el.get(0).elements;
            for(var i = 0; i < eles.length; i++) {
                el = eles[i];
                if(el.name && !me.children[el.name]) {
                    me.children[el.name] = new fruit.form.Field({
                        el :el.type=="radio"?null: el,
                        name : el.name,
                        id : el.id
                    });
                }
            }
        },
        /**
         * Iterates an array or an iterable value and invoke the given callback function for each Field.
         * @param {Function} callback
         */
        each : function(fn) {
            return fruit.util.each(this.children, fn);
        },
        /**
         * get a form field by field name
         * @param {String} name
         */
        getField : function(name) {
            return this.children[name];
        },
        loadError : function(xhr, status) {
            this.trigger('loadError');
        },
        loadSuccess : function() {
            var me = this, record = me.reader.getAt(0);
            fruit.util.each(me.children, function(field, key) {
                if(record){
                    var val = record.get(key);
                    if(val) {
                        field.setValue(val);
                    }
                }
            });
            this.trigger('loadSuccess');
        },
        /**
         * load form data if set reader option
         * @param {Object} data  the necessary data for get the ajax request
         */
        load : function(dataObj) {
            if(this.reader) {
                this.reader.read(dataObj);
            }
        },
        /**
         * returns true if all check rule passed.
         * @param {String} name specify the name will only check this Field.
         * @return {Boolean}
         */
        isValid : function(name) {
            var validate = this.validate, errorMsg = [], me = this, flag = true, field;
            if(!validate) {
                return true;
            }
            function verifyField(field, key) {
                var result = validate.verify(field);
                if(result !== true) {
                    //me.trigger('fieldVerifyError', [field, result], field);
                    field.el.addClass('error');
                    //maybe the el has multi-element like radio box
                    var box = field.el.eq(0).parent();
                    box.find('.error-msg').remove()
                    box.append("<span class='error-msg'>" + result + "</span>");

                    flag = false;
                    errorMsg = errorMsg.concat(result);
                    //find a error break the each
                    if(!me.checkAll) {
                        return false;
                    }
                }else{
                    //me.trigger('fieldVerifyPass',[field],field);
                    field.el.removeClass('error');
                    field.el.parent().find('.error-msg').remove();
                }
            }

            if(name && ( field = this.getField(name))) {
                verifyField(field, name);
            } else {
                fruit.util.each(this.children, verifyField);
                if(!flag) {
                    me.trigger('verifyError', [errorMsg], this);
                } else {
                    me.trigger('verifyPass', [], this);
                }
            }
            return flag;
        }
    });

})(fruit, fruit.ui, fruit.util);
/**
 * @class Validation
 * @namespace fruit.form
 */
(function(fruit) {
    var rules = {}, options = {}, sformat = fruit.util.format;
    var api = fruit.define('fruit.form.Validation', {
        statics : {
            /**
             * @param {String} type
             * @param {Mixed} fn   function/regular expression/String (function name)
             * @static
             */
            addRule : function(type, fn, opts) {
                var error = false;
                if(fruit.util.isString(fn)) {
                    fn = fruit.getObject(fn);
                } else if(fruit.util.isObject(fn) && !fn.test) {
                    error = true;
                }
                if(!fn || error) {
                    log.error('Validation.addRule need a function or RegEx');
                }
                rules[type] = fn;
                opts = opts || {};
                if(fruit.util.isString(opts)) {
                    // only set a string as msg
                    opts = {
                        text : opts
                    }
                }
                options[type] = opts;
            }
        },
        config : {
            options : null,
            form : null
        },
        init : function(config) {
            fruit.util.extend(this,config,this.config);
        },
        parseRule : function(field) {
            var custom = this.options && this.options[field.name] || {}, rules = ( custom ? custom.rule : null) || {}, tmp, param, items, msg, alertTextCheckbox, camelize = fruit.util.camelize;
            if(field.validate) {
                items = field.validate.split(',');
                fruit.util.each(items, function(type, i) {
                    tmp = type.split(/\[|,|\]/);
                    name = tmp[0];
                    param = tmp[1];
                    var option = options[name], defkey = 'text', key = defkey + camelize(field.type);
                    msg = rules[key] || (options[name] && options[name][key]) || rules[defkey] || (options[name] && options[name][defkey]);
                    if(field.el.size() > 1) {
                        key = key + 'Multiple';
                        msg = rules[key] || options[key] || msg;
                    }
                    rules[type] = msg;
                });
            }
            return rules;
        },
        /**
         * Returns true if the field pass all rule, otherwise will return the error messages.
         * @param {fruit.form.Field} field
         * @return {Boolean/String}
         */
        verify : function(field, scope) {
            var me = this, items = this.parseRule(field), type = field.type, option, param, tmp, rule, msgs = [], name;
            fruit.util.each(items, function(msg, key) {
                tmp = key.split(/\[|,|\]/);
                name = tmp[0];
                rule = rules[name];
                param = tmp[1];
                if(!rule) {
                    log.error("Can't find the verify rule {0}", name);
                    return false;
                }
                option = options[name];
                if(fruit.util.isFunction(rule)) {
                    var result = rule.call(scope || me, field, param, msg, option)
                    if(result !== true) {

                        if(result === false) {
                            if(msg.indexOf('{0}') > 0) {
                                msg = sformat(msg, param);
                            }
                        } else {
                            msg = result;
                        }
                        msgs.push(msg);
                    }
                } else if(rule.test(field.getValue()) !== true) {
                    msgs.push(msg);
                }
            });
            return msgs.length ? msgs : true;
        },
        getField : function(name) {
            return new fruit.form.Field({
                name : name
            });
        }
    });

    api.addRule('equals', function(field, param) {
        var equalsField = this.getField(param);
        if(field.getValue() != equalsField.getValue()) {
            return false;
        }
        return true;
    }, "Fields do not match with {0}");

    api.addRule('required', function(field) {
        if(!field.getValue()) {
            return false;
        }
        return true;
    }, "This field is required");
    api.addRule('call', function(field,param) {
        var val = field.getValue();
        if(fruit.util.isFunction(param)){
            return param(val);
        }else{
            log.error('[{0}] is not a function.');
        }
    });
    api.addRule('maxSize', function(field, param) {
        var val = field.getValue();
        return (val.length > param) ? false : true;
    }, "Maximal {0} characters allowed");

    api.addRule('minSize', function(field, param) {
        var val = field.getValue();
        return (val.length < param) ? false : true;
    }, "Minimum {0} characters allowed")

    fruit.util.each(['max', 'min'], function(type) {
        var msg = {
            max : 'Maximal {0} number allowed',
            min : 'Minimum {0} number allowed'
        }
        api.addRule(type, function(field, param, msg) {
            var param = parseFloat(param), len = parseFloat(field.getValue());
            if(type == 'min' && len < param || type == 'max' && len > param) {
                return sformat(msg, param);
            }
            return true;
        }, msg[type]);
    });
    
    var util = fruit.util.Date;
    fruit.util.each(['past', 'future'], function(type) {
        var msg = {
            past : 'Date prior to {0}',
            future : 'Date past {0}'
        }
        api.addRule(type, function(field, param, msg) {
            var pdate;
            if(param.substr(0, 1) == ':') {
                pdate = this.getField(param.substr(1)).getValue();
                msg = sformat(msg, pdate);
            } else if(param == 'now') {
                pdate = new Date();
                msg = sformat(msg, util.format(pdate, 'yyyy-mm-dd'))
            }
            if(fruit.util.isString(pdate)) {
                pdate = util.parse(pdate);
            }

            var vdate = util.parse(field.getValue());
            if(type == 'past' && vdate >= pdate || type == 'future' && vdate <= pdate) {
                return msg;
            }
            return true;
        }, msg[type])
    });
})(fruit);
/**
 * @class fruit.form.Field
 * @namespace fruit.form
 */
fruit.define('fruit.form.Field', function() {
    var expr_btn = /reset|button|submit/, expr_checkable = /checkbox|radio/;
    return {
        statics : {
            operator : {
                input : function() {
                    var me = this, type = me.type;
                    if(expr_btn.test(type)) {
                        this.setValue = this.getValue = function() {
                            return null;
                        }
                    } else if(expr_checkable.test(type)) {
                        this.setValue = function(val) {
                            //val = String(val);
                            this.el.each(function(i, el) {
                                if(jQuery(el).val() == val) {
                                    el.checked = true;
                                } else {
                                    el.checked = false;
                                }
                            });
                        }
                        this.getValue = function() {
                            var val;
                            this.el.each(function(i, el) {
                                if(el.checked == true) {
                                    val = jQuery(el).val()
                                }
                            });
                            return val
                        }
                    }
                },
                select : function() {
                    this.setValue = function(val) {
                        var el = this.el.get(0), ops = el.options, item;
                        for(var i = 0; i < ops.length; i++) {
                            item = ops[i];
                            if(item.value == val) {
                                item.selected = true;
                            } else {
                                item.selected = false;
                            }
                        }
                    }
                    this.getValue = function() {
                        var el = this.el.get(0), index = el.selectedIndex;
                        if(index < 0) {
                            return null;
                        }
                        var a = [], ops = el.options;
                        var one = (el.type == 'select-one');
                        var max = ( one ? index + 1 : ops.length);
                        for(var i = ( one ? index : 0); i < max; i++) {
                            var op = ops[i];
                            if(op.selected && op.attributes.value && op.attributes.value['value']) {
                                var v = op.value;
                                if(!v) {// extra pain for IE...
                                    v = (!(op.attributes['value'].specified)) ? op.text : op.value;
                                }
                                if(one) {
                                    return v;
                                }
                                a.push(v);
                            }
                        }
                        if(a.length == 0) {
                            return null;
                        }
                        return one ? a[0] : a;
                    }
                }
            }
        },
        type : null,
        config : {
            name : '',
            el : '',
            id : '',
            validate : null
        },
        /**
         *var field =  new fruit.form.Field({
         * 	name:'name',
         * id:'name',
         * type:'text'
         * });
         * field.setValue(1);
         * field.getValue();
         */
        init : function(config) {
            var me = this, selector;
            fruit.util.extend(this,config,this.config);
            if(!me.el) {
                if(me.id) {
                    selector = "#" + me.id;
                } else if(me.name) {
                    selector = "*[name='" + me.name + "']";
                }
                this.setEl(selector);
            }else{
                this.setEl(me.el);
            }
        },
        setEl : function(selector) {
            var me = this, el;
            if(!selector) {
                return;
            }
            if(fruit.util.isString(selector)) {
                me.el = jQuery(selector);
                el = me.el.get(0);
            } else {
                el = selector;
                me.el = jQuery(el);
            }

            if(!el) {
                return;
            }
            var tag = el.tagName.toLowerCase();

            me.type = el.type.toLowerCase();

            this.applyOperator(tag);
            me.validate = me.el.data('validate');
        },
        setValidate : function(rules) {

        },
        data : function(name, val) {
            return this.el.data(name, val);
        },
        applyOperator : function(type) {
            var statics = this.getStatics();
            if(statics.operator[type]) {
                statics.operator[type].call(this);
            }
        },
        /**
         * set field value
         * @param {String,Number} val
         */
        setValue : function(val) {
            return this.el.val(val);
        },
        /**
         * get field value
         * @return {String,Number} value
         */
        getValue : function() {
            return this.el.val();
        }
    };
});
(function (fruit, ui, util, dom, keys) {
    /**
     * @class fruit.ui.Button
     * This is basic button component
     * @extends fruit.ui.Component
     * @param {Object} inOptions
     * @example
     <pre><code>
     var btn = new fruit.ui.Button({
     text:'Button',
     theme:'primary'
     });
     </code></pre>
     */
    fruit.define('fruit.ui.Button', {
        extend:'fruit.ui.Component',
        view:{
            tag:'button',
            attr:{
                'class':'f-btn',
                type:'button',
                role:'button'
            },
            content:[
                {
                    name:'icon',
                    tag:'i'
                },
                {
                    name:'text',
                    tag:'span',
                    attr:{
                        'class':'f-btn-text'
                    }
                },
                {
                    name:'arrow',
                    tag:'i'
                }
            ]
        },
        options:{
            /**
             * @cfg {String} text
             * Get or set the text of the Button
             * @example Button
             */
            icon:{
                defaultValue:null,
                acceptTypes:['String', 'Null']
            },
            /**
             * @cfg {String} text
             * Get or set the text of the Button
             * @example Button
             */
            text:{
                defaultValue:null,
                acceptTypes:['String', 'Null']
            },
            /**
             * @cfg {Boolean} hasArrow
             * Get or set a value indicates whether the Button has arrow icon
             * @example false
             */
            hasArrow:{
                defaultValue:false,
                acceptTypes:['Boolean']
            },
            /**
             * @cfg {Boolean} hasEllipsis
             * Get or set a value indicates whether the Button displays ellipsis when text is too long
             * @example false
             */
            hasEllipsis:{
                defaultValue:false,
                acceptTypes:['Boolean']
            },
            /**
             * @cfg {String} size
             * Get or set the size of the Button
             * Default value is 'normal'
             * Support values are "small"/"normal"
             * @example small
             */
            size:{
                defaultValue:'normal',
                acceptTypes:['String']
            },
            /**
             * @cfg {String} theme
             * Get or set the them of the Button
             * Default value is 'default'
             * Support values are "default"/"CTA"/"primary"
             * @example happy
             */
            theme:{
                defaultValue:'default',
                acceptTypes:['String']
            },
            /**
             * @cfg {String} maxWidth
             * Get or set the maximum width of the Button
             * @example auto
             */
            maxWidth:{
                defaultValue:null,
                acceptTypes:['String', 'Number', 'Null']
            },
            /**
             * @cfg {String} tooltip
             * set the tooltip status of Button
             * @example button
             */
            tooltip:{
                defaultValue:null,
                acceptTypes:['String', 'Null']
            }
        },
        triggers:{
            option:{
                icon:{
                    target:'icon',
                    action:'setClass'
                },
                text:{
                    target:'text',
                    action:'setText'
                },
                hasArrow:[
                    {
                        target:'arrow',
                        action:'toggleClass',
                        params:['icon-arrow-down-large-dark', '#value#']
                    },
                    {
                        action:'toggleClass',
                        params:['f-btn-arrow', '#value#']
                    },
                    {
                        action:"__toggleArrow",
                        params:['hasArrow', '#value#']
                    }
                ],
                hasEllipsis:{
                    action:'toggleClass',
                    params:['f-btn-ellipsis', '#value#']
                },
                size:{
                    action:'switchClass',
                    params:[
                        '#value#',
                        {
                            'normal':'',
                            'small':'f-btn-small'
                        }
                    ]
                },
                theme:{
                    action:'switchClass',
                    params:[
                        '#value#',
                        {
                            'default':'',
                            'CTA':'f-btn-CTA',
                            'primary':'f-btn-primary'
                        }
                    ]
                },
                maxWidth:[
//                    {
//                        action:'setStyle',
//                        params:['max-width', '#value#']
//                    },
                    {
                        action:"__setMaxWidth",
                        params:['max-width', '#value#']
                    }
                ]
            },
            event:{
                click:{
                    action:'__click'
                },
                keyup:{
                    action:'__keyup'
                },
                keydown:{
                    action:'__keydown'
                },
                ready:{
                    action:'__ready'
                }
            }
        },
        methods:{
            init:function () {
                this.focusable = true;
                if (ui.TooltipBehavior) {
                    this.attachBehavior({
                        behavior:'Tooltip',
                        params:{
                            prop:"tooltip"
                        }
                    });
                }
            },
            setIcon:function (inIconClass) {
                this.setOption("icon", inIconClass);
            },
            __click:function (sender, event) {
                event.target = this;
                if (event.button === 0) {
                    this.focus();
                }
            },
            __keyup:function (sender, event) {
                if (event.hasSystemKey) {
                    return;
                }

                if (event.keyCode === keys.ENTER || event.keyCode === keys.SPACE) {
                    event.preventDefault();
                    /**
                     * @event click Fires when Button clicked.
                     */
                    this.trigger('click', event);
                }
            },
            __keydown:function (sender, event) {
                if (event.hasSystemKey) {
                    return;
                }

                if (event.keyCode === keys.ENTER || event.keyCode === keys.SPACE) {
                    event.preventDefault();
                }
            },
            __toggleArrow:function () {
                var hasArrow = this.getOption("hasArrow");
                if (hasArrow) {
                    var maxWidth = this.text.maxWidth;
                    if (maxWidth) {
                        this.text.setStyle("max-width", maxWidth - 23);
                        if (util.isIE7) {
                            this.text.setStyle("width", maxWidth - 23);
                        }
                    }

                } else {
                    var maxWidth = this.text.maxWidth;
                    if (maxWidth) {
                        this.text.setStyle("max-width", maxWidth + 23);
                        if (util.isIE7) {
                            this.text.setStyle("width", maxWidth + 23);
                        }
                    }
                }
            },
            __setMaxWidth:function () {
                var innerWidth, textInnerWidth;
                var maxWidth = this.getOption("maxWidth");
                var hasArrow = this.getOption("hasArrow");
                if (maxWidth == null) {
                    return;
                }
                if (this.getOption("size") == "small") {
                    maxWidth = Math.max(60, maxWidth);
                    innerWidth = maxWidth - 22;
                } else {
                    maxWidth = Math.max(80, maxWidth);
                    innerWidth = maxWidth - 30;
                }
                if (hasArrow) {
                    textInnerWidth = innerWidth - 23;
                } else {
                    textInnerWidth = innerWidth;
                }

                this.setStyle("max-width", innerWidth);
                this.text.setStyle("max-width", textInnerWidth);
                this.text.maxWidth = textInnerWidth;
                if (util.isIE7) {
                    this.setStyle("max-width", maxWidth);
                    this.text.setStyle("width", textInnerWidth);
                    this.text.setStyle("zoom", 1);
                }
            },
            __ready:function (sender, event) {
                if (util.isIE7) {
                    //var size = this.text.element.getSize();
                    // console.log(size.width);
                    // this.text.setStyle("display", "block");
                    //this.setOption("maxWidth",size.width)
                }
            }
        }
    });
})(fruit, fruit.ui, fruit.util, fruit.dom, fruit.util.keys);
(function (fruit, ui, event, keys) {
    /**
     * @class fruit.ui.CheckBox This is basic checkbox component
     * @extends fruit.ui.Component
     * @param {Object} options
     * @example
     <pre><code>
     var chk = new fruit.ui.CheckBox({
     text:'CheckBox',
     checked:true
     });
     </code></pre>
     */
    fruit.define('fruit.ui.CheckBox', {
        extend:'fruit.ui.Component',
        view:{
            tag:'label',
            attr:{
                'class':'f-checkbox',
                role:'checkbox'
            },
            content:[
                {
                    name:'checkPic',
                    tag:'i',
                    attr:{
                        'class':'f-checkbox-img',
                        tabindex:'0'
                    }
                },
                {
                    name:'check',
                    tag:'input',
                    attr:{
                        type:'checkbox'
                    }
                },
                {
                    name:'text',
                    tag:'span',
                    attr:{
                        'class':'f-label',
                        role:'label'
                    }
                }
            ]
        },
        options:{
            /**
             * @cfg {String} text
             * Get or set the text of the CheckBox
             * @example checkbox
             */
            text:{
                defaultValue:null,
                acceptTypes:['String', 'Null']
            },
            /**
             * @cfg {Boolean} checked
             * Get or set a value indicates whether the CheckBox is checked
             * @example true
             */
            checked:{
                defaultValue:false,
                acceptTypes:['Boolean']
            },
            /**
             * @cfg {String} name
             * Get or set the name of the CheckBox
             * @example checkbox
             */
            name:{
                defaultValue:null,
                acceptTypes:['String', 'Null']
            },
            /**
             * @cfg {String} value
             * Get or set the value of the CheckBox
             * @example checkbox
             */
            value:{
                defaultValue:null,
                acceptTypes:['String', 'Null']
            }
        },
        /**
         * @event onClick Fires when Checkbox clicked.
         */
        triggers:{
            option:{
                text:{
                    target:'text',
                    action:'setText'
                },
                checked:[
                    {
                        target:'check',
                        action:'setAttribute',
                        params:['checked', '#value#']
                    },
                    {
                        action:'setAttribute',
                        params:['aria-checked', '#value#']
                    }
                ],
                name:{
                    target:'check',
                    action:'setAttribute',
                    params:['name', '#value#']
                },
                value:{
                    target:'check',
                    action:'setAttribute',
                    params:['value', '#value#']
                }
            },
            event:{
                focus:{
                    action:'__focus'
                },
                blur:{
                    action:'__blur'
                },
                mouseup:[
                    {
                        action:'__click'
                    },
                    {
                        source:'check',
                        action:'__check_click'
                    }
                ],
                keydown:{
                    action:'__keydown'
                },
                keyup:{
                    action:'__keyup'
                },
                change:{
                    action:'__change'
                }
            }
        },
        methods:{
            init:function(){
                if(fruit.util.isIE){
                    this.text.setAttribute('unselectable','on');
                }
            },
            getValue:function () {
                return this.getOption('checked');
            },
            setValue:function (value) {
                this.setOption('checked', value);
            },
            __check_click:function (sender, event) {
//                event.routing = 'none';
            },
            __click:function (sender, event) {
                event.preventDefault();
                this.setOption('checked', !this.getOption('checked'));
                if (fruit.util.isIE8) {
                    this.setStyle({
                        "zoom":1
                    });
                }
                event.target = this;
            },
            __keydown:function (sender, event) {
                if (event.keyCode === keys.ENTER || event.keyCode === keys.SPACE) {
                    event.preventDefault();
                }
            },
            __keyup:function (sender, event) {
                if (event.hasSystemKey) {
                    return;
                }

                if (event.keyCode === keys.ENTER || event.keyCode === keys.SPACE) {
                    event.preventDefault();
                    this.setOption('checked', !this.getOption('checked'));
                    if (fruit.util.isIE8) {
                        this.setStyle({
                            "zoom":1
                        });
                    }
                }

            },
            __focus:function () {
                this.addClass('f-checkbox-focus');
            },
            __blur:function () {
                this.removeClass('f-checkbox-focus');
            },
            __change:function (sender, event) {
                event.target = this;
            }
        }
    });

})(fruit, fruit.ui, fruit.event, fruit.util.keys);
(function (fruit, ui, util, dom, keys) {
    /**
     * @class fruit.ui.ComboBox
     * This is ComboBox component
     * @extends fruit.ui.Component
     * @param {Object} inOptions
     * @example
     <pre><code>
     var cbox = new fruit.ui.ComboBox({
     placeHolder:'Select a fruit',
     items:['apple','orange','lemon','pear','banana']
     });
     </code></pre>
     */
    fruit.define('fruit.ui.ComboBox', {
        extend:'fruit.ui.Component',
        view:{
            tag:'span',
            attr:{
                'class':'f-combobox',
                'role':'combobox',
                'aria-haspopup':true,
                'aria-expanded':false
            },
            content:[
                {
                    name:'text',
                    tag:'input',
                    attr:{
                        'type':'text'
                    }
                },
                {
                    name:'btn',
                    tag:'span',
                    attr:{
                        'class':'f-combobox-btn'
                    }
                },
                {
                    name:'popup',
                    type:'Popup',
                    attr:{
                        role:"menu",
                        'aria-labelledby':'combobox'
                    },
                    content:{
                        name:'list',
                        type:'List'
                    }
                }
            ]
        },
        options:{
            /**
             * @cfg {String} text
             * Get or set the text of the ComboBox
             * @example California
             */
            text:{
                defaultValue:null,
                acceptTypes:['String', 'Null']
            },
            /**
             * @cfg {String} placeHolder
             * Get or set the placeHolder of the ComboBox
             * @example ComboBox
             */
            placeHolder:{
                defaultValue:null,
                acceptTypes:['String', 'Null']
            },
            /**
             * @cfg {Array} items
             * Get or set the items of the ComboBox.
             * Array type
             * @example [{text:'Alabama'}, {text:'Alaska'},{text: 'California'}, {text:'Connecticut'}, {text:'Delaware'}]
             */
            items:{
                defaultValue:null,
                acceptTypes:['Array', 'Null', 'Object']
            },
            /**
             * @cfg {Boolean} editable
             * Get or set a value indicates whether the ComboBox is editable
             * @example true
             */
            editable:{
                defaultValue:true,
                acceptTypes:['Boolean']
            }
        },
        triggers:{
            option:{
                text:{
                    target:'text',
                    action:'setAttribute',
                    params:['value', '#value#']
                },
                placeHolder:{
                    target:'text',
                    action:'setAttribute',
                    params:['placeholder', '#value#']
                },
                items:{
                    target:'list',
                    action:'setOption',
                    params:['items', '#value#']
                },
                editable:[
                    {
                        target:'text',
                        action:'setAttribute',
                        params:['readonly', '#!value#']
                    },
                    {
                        target:'text',
                        action:'setAttribute',
                        params:['aria-readonly', '#!value#']
                    }
                ]
            },
            event:{
                keydown:{
                    source:'text',
                    action:'__text_keydown'
                },
                focus:{
                    source:'text',
                    action:'__text_focus'
                },
                blur:{
                    source:'text',
                    action:'__text_blur'
                },
                input:{
                    source:'text',
                    action:'__text_input'
                },
                mousedown:[
                    {
                        source:'text',
                        action:'__text_mousedown'
                    },
                    {
                        source:'btn',
                        action:'__btn_mousedown'
                    },
                    {
                        source:'list',
                        action:'__list_mousedown'
                    }
                ],
                click:{
                    source:'btn',
                    action:'__btn_click'
                },
                execute:{
                    source:'list',
                    action:'__list_execute'
                },
                cancel:{
                    source:'list',
                    action:'__list_cancel'
                }
            }
        },
        entity:{
            init:function () {
                this.focusable = true;
                var popup = this.popup;
                var popupId = 'fruit-' + popup.$id;
                popup.setAttribute('id', popupId);
                this.setAttribute('aria-owns', popupId);
            },
            /**
             * Open the menu of ComboBox.
             * @method open
             */
            open:function () {
                if (!this.popup.opened) {
                    //this.popup.open(this.getOption('direction'), {y:-1, eqWidth:true});
                    var self = this;
                    this.popup.open({
                        direction:self.getOption('direction'),
                        offsetY:-1,
                        align:'width'
                    });
                    this.setAttribute('aria-expanded', true);
                }
            },
            /**
             * close the menu of ComboBox.
             * @method close
             */
            close:function () {
                if (this.popup.opened) {
                    this.popup.close();
                    this.setAttribute('aria-expanded', false);
                }
            },
            /**
             * Get value
             * @return {*}
             */
            getValue:function () {
                return this.getOption('text');
            },
            /**
             * Set value
             * @param value
             */
            setValue:function (value) {
                this.setOption('text', value);
            },
            __text_mousedown:function () {
                this.text.focus();
            },
            __text_focus:function () {
                this.addClass('f-combobox-focus');
            },
            __text_blur:function (sender, event) {
                this.removeClass('f-combobox-focus');
                this.close();
            },
            __text_input:function () {
                var str = this.text.getAttribute('value');
                this.setOption('text', str);
                this.__refreshItems(str, true);
            },
            __btn_mousedown:function (sender, event) {
                event.preventDefault();
            },
            __btn_click:function () {
                this.text.focus();
                this.addClass('f-combobox-focus');
                if (this.popup.opened) {
                    this.close();
                }
                else {
                    this.__refreshItems();
                    this.open();
                }
            },
            __list_mousedown:function (sender, event) {
                this.list.execute();
            },
            __text_keydown:function (sender, event) {
                var code = event.keyCode;

                if (event.hasSystemKey) {
                    return;
                } else {
                    switch (code) {
                        case keys.UP_ARROW:
                            if (this.popup.opened) {
                                this.list.prevItem();
                            }
                            event.preventDefault();
                            break;
                        case keys.DOWN_ARROW:
                            if (this.popup.opened) {
                                this.list.nextItem();
                            }
                            else {
                                this.__refreshItems();
                                this.open();
                            }
                            event.preventDefault();
                            break;
                        case keys.ENTER:
                            this.list.execute();
                            event.preventDefault();
                            break;
                        case keys.ESCAPE:
                            this.close();
                            this.text.focus();
                            event.preventDefault();
                            break;
                    }
                }

                event.routing = 'none';
            },
            __refreshItems:function (str, autoOpen) {
                var items = this.getOption('items');
                var item, text;
                var model = [];
                var i = 0;

                if (items && items.length > 0) {
                    if (str) {
                        var strLength = str.length;
                        str = str.toLowerCase();
                        for (; i < items.length; i++) {
                            item = items[i];
                            text = item.text;
                            if (text.toLowerCase().indexOf(str) == 0) {
                                model.push({text:'<b>' + text.substr(0, strLength) + '</b>' + text.substr(strLength)});
                            }
                        }
                    } else {
                        for (; i < items.length; i++) {
                            item = items[i];
                            text = item.text;
                            model.push({text:text});
                        }
                    }
                }

                this.list.setOption('items', model);

                if (model.length > 0 && autoOpen) {
                    this.popup.open({
                        direction:this.getOption('direction'),
                        offsetY:-1,
                        align:'width'
                    });
                    this.setAttribute('aria-expanded', true);
                }
                else {
                    this.close();
                }
            },
            __list_execute:function (sender, event) {
                this.setOption('text', event.item.getText());
                this.close();
            },
            __list_cancel:function () {
                this.close();
            }
        }
    });
})(fruit, fruit.ui, fruit.util, fruit.dom, fruit.util.keys);
(function (fruit, ui, util, keys) {
    /**
     * @class fruit.ui.ComboButton
     * @extends fruit.ui.Component
     * @example
     <pre><code>
     var cbtn = new fruit.ui.ComboButton({
     items:[{text: 'Open File'},{text: 'Open Folder'},{text: 'Open URL'}],
     text:'Open'
     });
     </code></pre>
     */
    fruit.define('fruit.ui.ComboButton', {
        extend:'fruit.ui.Component',
        view:{
            tag:'span',
            attr:{
                'class':'f-combobutton',
                'role':'combobutton',
                'tabindex':0,
                'aria-expanded':false,
                'aria-haspopup':true
            },
            content:[
                {
                    tag:'span',
                    name:'btnPrimary',
                    attr:{
                        'class':'f-combobutton-text'
                    }
                },
                {
                    tag:'span',
                    name:'btnDropdown',
                    attr:{
                        'class':'f-combobutton-arrow'
                    }
                },
                {
                    name:'popup',
                    type:'Popup',
                    dynamic:true,
                    content:{
                        name:'list',
                        type:'List'
                    },
                    attr:{
                        'aria-labelledby':'combobutton',
                        'role':'menu'
                    }
                }
            ]
        },
        options:{
            /**
             * @cfg {String} direction
             * Get or set the direction of the popup.
             * Default value is 'below',
             * Support values are "below"/"above"/"auto"
             * @example below
             */
            direction:{
                defaultValue:'below',
                acceptTypes:['String']
            },
            /**
             * @cfg {String} text
             * Get or set the text of the DropdownButton.
             * Default value is null,
             * @example Combo Button
             */
            text:{
                defaultValue:null,
                acceptTypes:['String', 'Null']
            },
            /**
             * @cfg {Array} items
             * Get or set the items of the list.
             * Array type
             * @example [{text: "Item 1"},{text: "Item 2"},{text: "Item 3"}]
             */
            items:{
                defaultValue:null,
                acceptTypes:['Array', 'Null', 'Object']
            },
            /**
             * @cfg {String} theme
             * Get or set the them of the Combo Button
             * Default value is 'default'
             * Support values are "default"/"CTA"/"primary"
             * @example CTA
             */
            theme:{
                defaultValue:'default',
                acceptTypes:['String']
            }
        },
        triggers:{
            option:{
                text:{
                    target:'btnPrimary',
                    action:'setText'
                },
                items:{
                    target:'list',
                    action:'setOption',
                    params:['items', '#value#']
                },
                theme:{
                    action:'switchClass',
                    params:[
                        '#value#',
                        {
                            'default':'',
                            'CTA':'f-combobutton-CTA',
                            'primary':'f-combobutton-primary'
                        }
                    ]
                }
            },
            event:{
                click:[
                    {
                        source:'list',
                        action:'__list_click'
                    },
                    {
                        source:'btnPrimary',
                        action:'__btnPrimary_click'
                    },
                    {
                        source:'btnDropdown',
                        action:'__btnDropdown_click'
                    }
                ],
                execute:{
                    source:'list',
                    action:'__list_execute'
                },
                cancel:{
                    source:'list',
                    action:'__list_cancel'
                },
                keyup:{
                    action:'__keyup'
                },
                keydown:{
                    action:'__keydown'
                },
                blur:{
                    action:'__blur'
                }
            }
        },
        methods:{
            init:function () {
                this.isOpen = false;

            },
            /**
             * Open dropdown menu
             */
            open:function () {
                var self=this;
                var direction = self.getOption('direction');
                this.popup.open({
                    direction:direction,
                    offsetY:direction == "above"?-4:0,
                    align:'width'
                });
                this.setAttribute('aria-expanded', true);
                var list = this.list;
                list.focus();
                this.addClass("f-combobutton-focus");
            },
            setModel:function () {
                this.superMethod(arguments);
            },
            /**
             * close the dropdown list.
             * @method close
             */
            close:function () {
                this.popup.close();
                this.setAttribute('aria-expanded', false);
                this.focus();
            },
            __blur:function () {
                this.removeClass("f-combobutton-focus");
            },
            __btnPrimary_click:function (sender, event) {
                this.addClass("f-combobutton-focus");
                /**
                 * @event command Fires when primary button clicked.
                 */
            },
            __list_click:function (sender, event) {
                event.routing = 'none';
            },
            __keyup:function (sender, event) {
                if (event.hasSystemKey) {
                    return;
                }
                switch (event.keyCode) {
                    case keys.ENTER:
                        event.preventDefault();
                        /**
                         * @event execute Fires when item clicked.
                         */
                        this.trigger('execute', event);
                        break;
                    case keys.SPACE:
                    case keys.DOWN_ARROW:
                        event.preventDefault();
                        if (!this.isOpen) {
                            this.open();
                            this.isOpen = true;
                        }
                        break;
                    case keys.ESCAPE:
                        event.preventDefault();
                        if (this.isOpen) {
                            this.close();
                            this.isOpen = false;
                        }
                        break;
                }
                event.routing = 'none';
            },
            __keydown:function (sender, event) {
                if (event.hasSystemKey) {
                    return;
                }

                switch (event.keyCode) {
                    case keys.UP_ARROW:
                        if (this.popup.opened) {
                            this.list.prevItem();
                        }
                        event.preventDefault();
                        break;
                    case keys.DOWN_ARROW:
                        if (this.popup.opened) {
                            this.list.nextItem();
                        }
                        event.preventDefault();
                        break;
                    case keys.ENTER:
                        this.__btnPrimary_click(sender, event);
                        //this.list.execute();
                        event.preventDefault();
                        break;
                    case keys.ESCAPE:
                        if (this.isOpen) {
                            this.close();
                            this.isOpen = false;
                        }
                        event.preventDefault();
                        break;
                }

                event.routing = 'none';
            },
            __btnDropdown_click:function (sender, event) {
                if (!this.isOpen) {
                    this.open();
                    this.isOpen = true;
                }
                event.routing = 'none';
            },
            __list_execute:function (sender, event) {
                if (this.isOpen) {
                    this.close();
                    this.isOpen = false;
                }
                this.focus();
            },
            __list_cancel:function () {
                if (this.isOpen) {
                    this.close();
                    this.isOpen = false;
                }
            }
        }
    });
})(fruit, fruit.ui, fruit.util, fruit.util.keys);
(function (fruit, ui, keys) {

    /**
     * @extends fruit.ui.Component
     * @class fruit.ui.DropdownButton
     <pre><code>
     var dbtn = new fruit.ui.DropdownButton({
     items:[{text: 'Open File'},{text: 'Open Folder'},{text: 'Open URL'}],
     text:'Open'
     });
     </code></pre>
     */
    fruit.define('fruit.ui.DropdownButton', {
        extend:'fruit.ui.Component',
        view:{
            attr:{
                'class':'f-dropdown-btn',
                'aria-expanded':false,
                'aria-haspopup':true
            },
            content:[
                {
                    name:'button',
                    type:'Button',
                    options:{
                        hasArrow:true
                    }
                },
                {
                    name:'popup',
                    type:'Popup',
                    attr:{
                        role:"menu",
                        'aria-labelledby':'dropdownbutton'
                    },
                    dynamic:true,
                    content:{
                        name:'list',
                        type:'List'
                    }
                }
            ]
        },
        options:{
            /**
             * @cfg {String} text
             * Get or set the text of the DropdownButton.
             * Default value is null,
             * @example DropdownButton
             */
            text:{
                defaultValue:null,
                acceptTypes:['String', 'Null']
            },
            /**
             * @cfg {Array} items
             * Get or set the items of the list.
             * Array type
             * @example [{text: "Item 1"},{text: "Item 2"},{text: "Item 3"}]
             */
            items:{
                defaultValue:null,
                acceptTypes:['Array', 'Null', 'Object']
            },
            /**
             * @cfg {String} direction
             * Get or set the direction of the popup.
             * Default value is below,
             * Support values are "below"/"above"/"auto"
             * @example below
             */
            direction:{
                defaultValue:'below',
                acceptTypes:['String', 'Null']
            },
            /**
             * @cfg {String} appearance
             * Get the appearance of the DropdownButton.
             * Default value is normal
             * Support values are "normal"/"mini"/"text"
             * Array type
             * @example normal
             */
            appearance:{
                defaultValue:'normal',
                acceptTypes:['String'],
                readonly:true
            }
        },
        triggers:{
            option:{
                text:{
                    target:'button',
                    action:'setOption',
                    params:['text', '#value#']
                },
                items:{
                    target:'list',
                    action:'setOption',
                    params:['items', '#value#']
                },
                appearance:[
                    {
                        action:'switchClass',
                        params:[
                            '#value#',
                            {
                                'normal':'',
                                'mini':'f-dropdown-btn-mini',
                                'text':'f-dropdown-btn-text',
                                'arrow':'f-dropdown-btn-arrow'
                            }
                        ]
                    },
                    {
                        target:'popup',
                        action:'switchAttribute',
                        params:['aria-labelledby', '#value#', {
                            'normal':'dropdownbutton',
                            'mini':'menu',
                            'text':'menu',
                            'arrow':'menu'
                        }]
                    }
                ]
            },
            event:{
                click:{
                    source:'button',
                    action:'__button_click'
                },
                keyup:{
                    source:'button',
                    action:'__button_keyup'
                },
                keydown:{
                    source:'button',
                    action:'__button_keydown'
                },
                focus:{
                    source:'button',
                    action:'__button_focus'
                },
                blur:{
                    source:'button',
                    action:'__button_blur'
                },
                execute:{
                    source:'list',
                    action:'__list_execute'
                },
                cancel:{
                    source:'list',
                    action:'__list_cancel'
                }
            }
        },
        methods:{
            init:function () {
                this.focusable = true;
            },
            /**
             * Open the dropdown list.
             * @method open
             */
            open:function () {
                var appearance = this.getOption('appearance');
                var offsetX, offsetY, aboveOffsetY,direction;

                switch (appearance) {
                    case 'mini':
                        offsetX = 0;
                        offsetY = -1;
                        aboveOffsetY = -4;
                        break;
                    case 'text':
                        offsetX = 0;
                        offsetY = 0;
                        aboveOffsetY = 0;
                        break;
                    case 'arrow':
                        offsetX = 0;
                        offsetY = 0;
                        aboveOffsetY = -1;
                        break;
                    default:
                        offsetX = 0;
                        offsetY = 1;
                        aboveOffsetY = -5;
                        break;
                }

                //this.popup.open(this.getOption('direction'), {x:offsetX, y:offsetY,eqWidth:true});
                direction = this.getOption('direction');
                this.popup.open({
                    direction:direction,
                    offsetX:offsetX,
                    offsetY:direction == "above" ? aboveOffsetY : offsetY,
                    width:90,
                    align:'width'
                });
                this.setAttribute('aria-expanded', true);
                this.list.focus();
                this.button.addClass('f-dropdown-btn-focus');
                this.button.addClass('f-btn-focus');
            },
            /**
             * close the dropdown list.
             * @method close
             */
            close:function () {
                this.popup.close();
                this.setAttribute('aria-expanded', false);
                this.button.removeClass('f-dropdown-btn-focus');
                this.button.removeClass('f-btn-focus');
            },
            __button_click:function () {
                this.open();
            },
            __button_focus:function () {
                this.button.addClass('f-dropdown-btn-focus');
                this.button.addClass('f-btn-focus');
            },
            __button_blur:function () {
                this.button.removeClass('f-dropdown-btn-focus');
                this.button.removeClass('f-btn-focus');
            },
            __button_keydown:function (sender, event) {
                if (event.keyCode !== keys.TAB) {
                    event.preventDefault();
                }
            },
            __button_keyup:function (sender, event) {
                if (event.hasSystemKey) {
                    return;
                }
                switch (event.keyCode) {
                    case keys.UP_ARROW:
                        if (this.popup.opened) {
                            this.list.prevItem();
                        }
                        event.preventDefault();
                        break;
                    case keys.DOWN_ARROW:
                        if (this.popup.opened) {
                            this.list.nextItem();
                        }
                        else {
                            this.open();
                        }
                        event.preventDefault();
                        break;
                    case keys.SPACE:
                    case keys.ENTER:
                        if (this.popup.opened) {
                            this.list.execute();
                        }
                        event.preventDefault();
                        break;
                    case keys.ESCAPE:
                        this.close();
                        event.preventDefault();
                        break;
                }

                event.routing = 'none';
            },
            __list_cancel:function () {
                this.close();
            },
            __list_execute:function () {
                this.close();
                this.button.focus();
            }
        }
    });

})(fruit, fruit.ui, fruit.util.keys);
(function (fruit, ui, util, keys) {
    /**
     * @class fruit.ui.NumberSpinner
     * @extends fruit.ui.Component
     * @example
     <pre><code>
     var num = new fruit.ui.NumberSpinner({
     minValue:0,
     maxValue:100,
     step:5,
     value:20
     });
     </code></pre>
     */
    fruit.define('fruit.ui.NumberSpinner', {
        extend:'fruit.ui.Component',
        view:{
            tag:'span',
            name:'wrapper',
            attr:{
                'class':'f-numberspinner',
                role:'spinbutton'
            },
            content:[
                {
                    tag:'input',
                    name:'text',
                    attr:{
                        'type':'text',
                        'class':'placeHolder'
                    }
                },
                {
                    tag:'a',
                    name:'upArrowBtn',
                    attr:{
                        'class':'f-numberspinner-upBtn'
                    }
                },
                {
                    tag:'a',
                    name:'downArrowBtn',
                    attr:{
                        'class':'f-numberspinner-downBtn'
                    }
                }
            ]
        },
        options:{
            /**
             * @cfg {Number} value
             * set the value of the NumberSpinner
             * Support values are false/true
             * @example 0
             */
            value:{
                defaultValue:null,
                acceptTypes:['Number', 'Null']
            },
            /**
             * @cfg {Number} minValue
             * Set the NumberSpinner's min value.
             * Default value is 0
             * @example 0
             */
            minValue:{
                defaultValue:0,
                acceptTypes:['Number']
            },
            /**
             * @cfg {Number} maxValue
             * Set the NumberSpinner's max value.
             * Default value is 99
             * @example 99
             */
            maxValue:{
                defaultValue:99,
                acceptTypes:['Number']
            },
            /**
             * @cfg {Number} step
             * Set the NumberSpinner's step number.
             * Default value is 1
             * @example 1
             */
            step:{
                defaultValue:1,
                acceptTypes:['Number', 'Null']
            },
            /**
             * @cfg {Boolean} readonly
             * Get or set a value indicates whether the NumberSpinner is readonly
             * Default value is null
             * @example false
             */
            readonly:{
                defaultValue:false,
                acceptTypes:['Boolean']
            }
        },
        triggers:{
            option:{
                value:{
                    target:'text',
                    action:'setAttribute',
                    params:['value', '#value#']
                },
                readonly:[
                    {
                        target:'text',
                        action:'setAttribute',
                        params:['readOnly', '#value#']
                    },
                    {
                        action:'setAttribute',
                        params:['aria-readonly', '#value#']
                    }
                ]
            },
            event:{
                'focus':{
                    action:'__focus'
                },
                'blur':{
                    action:'__blur'
                },
                'input':{
                    source:'text',
                    action:'__text_input'
                },
                'change':{
                    source:'text',
                    action:'__text_change'
                },
                'keydown':{
                    source:'text',
                    action:'__text_keydown'
                },
                'mousewheel':{
                    source:'text',
                    action:'__text_mousewheel'
                },
                'mouseup':[
                    {
                        source:'upArrowBtn',
                        action:'__upClick'
                    },
                    {
                        source:'downArrowBtn',
                        action:'__downClick'
                    }
                ]
            }
        },
        methods:{
            init:function () {
                var value = this.getOption('value');
                this.setAttribute('aria-valuemax',this.getOption('maxValue'));
                this.setAttribute('aria-valuemin',this.getOption('minValue'));
                this.__trySetValue(value);
            },
            increase:function () {
                var oldValue = this.getOption('value');
                var step = this.getOption('step');
                var minValue = this.getOption('minValue');
                var maxValue = this.getOption('maxValue');
                var newValue;

                if (oldValue == null) {
                    newValue = minValue;
                }
                else {
                    newValue = Math.min(oldValue + step - (oldValue - minValue) % step, maxValue);
                }

                this.setOption('value', newValue);
                this.setAttribute('aria-valuenow',newValue);
                this.trigger('Change');
            },
            decrease:function () {
                var oldValue = this.getOption('value');
                var step = this.getOption('step');
                var minValue = this.getOption('minValue');
                var maxValue = this.getOption('maxValue');
                var newValue;

                if (oldValue == null) {
                    newValue = maxValue;
                }
                else {
                    newValue = Math.max(oldValue - ((oldValue - minValue) % step || step), minValue);
                }

                this.setOption('value', newValue);
                this.setAttribute('aria-valuenow',newValue);
                this.trigger('Change');
            },
            getValue:function () {
                return this.getOption('value');
            },
            setValue:function (value) {
                this.__trySetValue(value);
            },
            __focus:function () {
                this.focused = true;
                this.addClass('f-numberspinner-focus');
            },
            __blur:function () {
                this.focused = false;
                this.removeClass('f-numberspinner-focus');
                this.trigger('Blur');
            },
            __text_input:function (sender, event) {
                //this.__trySetValue(this.text.getAttribute('value'));
            },
            __text_change:function () {
                this.__trySetValue(this.text.getAttribute('value'));
            },
            __text_mousewheel:function (sender, event) {
                if (this.focused) {
                    var delta = event.originalEvent.wheelDelta;
                    if (delta > 0) {
                        this.increase();
                    } else {
                        this.decrease();
                    }
                    event.preventDefault();
                }
            },
            __text_keydown:function (sender, event) {
                var keyChar = event.keyChar;
                var keyCode = event.keyCode;
                if (keyCode == keys.BACKSPACE || keyCode == keys.TAB || keyCode == 189/* - */) {

                } else if (keyCode == keys.UP_ARROW) {
                    this.increase();
                }
                else if (keyCode == keys.DOWN_ARROW) {
                    this.decrease();
                }
                else if (event.hasSystemKey || keyChar < '0' || keyChar > '9') {
                    event.preventDefault();
                }
            },
            __upClick:function () {
                this.increase();
            },
            __downClick:function () {
                this.decrease();
            },
            __trySetValue:function (value) {
                var oldValue = this.getOption('value');
                var minValue = this.getOption('minValue');
                var maxValue = this.getOption('maxValue');
                var newValue = parseInt(value);

                if (value === null || value === '') {
                    newValue = null;
                }
                else if (newValue > maxValue) {
                    newValue = maxValue;
                }
                else if (newValue < minValue) {
                    newValue = minValue;
                }
                else if (newValue <= maxValue && newValue >= minValue) {
                    newValue = newValue;
                } else {
                    newValue = oldValue;
                }

                this.setOption('value', newValue);
                this.text.setAttribute('value', newValue);
                this.setAttribute('aria-valuenow',newValue);
            }
        }
    });
})(fruit, fruit.ui, fruit.util, fruit.util.keys);
(function (fruit, ui, util, dom, keys) {
    /**
     * @ignore
     * @class fruit.ui.Radio
     * @extends fruit.ui.Component
     * @example
     <pre><code>
     var num = new fruit.ui.Radio({
     text:'Male'
     });
     </code></pre>
     */
    fruit.define('fruit.ui.Radio', {
        extend:'fruit.ui.Component',
        view:{
            tag:'label',
            attr:{
                'role':'radio',
                'class':'f-radio'
            },
            content:[
                {
                    tag:'i',
                    attr:{
                        'class':'f-radio-img'
                    }
                },
                {
                    name:'input',
                    tag:'input',
                    attr:{
                        type:'radio'
                    }
                },
                {
                    name:'label',
                    tag:'span',
                    attr:{
                        'class':'f-label'
                    }
                }
            ]
        },
        options:{
            text:{
                defaultValue:null,
                acceptTypes:['String', 'Null']
            },
            value:{
                defaultValue:null,
                acceptTypes:['String', 'Null']
            },
            name:{
                defaultValue:null,
                acceptTypes:['String', 'Null']
            },
            checked:{
                defaultValue:false,
                acceptTypes:['Boolean']
            }
        },
        triggers:{
            option:{
                text:{
                    target:'label',
                    action:'setText',
                    params:['#value#']
                },
                value:{
                    target:'input',
                    action:'setAttribute',
                    params:['value', '#value#']
                },
                name:{
                    target:'input',
                    action:'setAttribute',
                    params:['name', '#value#']
                },
                checked:[
                    {
                        target:'input',
                        action:'setAttribute',
                        params:['checked', '#value#']
                    },
                    {
                        action:'setAttribute',
                        params:['aria-checked', '#value#']
                    }
                ]
            },
            event:{
                'click':[
                    {
                        action:'__click'
                    },
                    {
                        source:'input',
                        action:'__inputClick'
                    }
                ],
                'mousedown':{
                    action:'__mousedown'
                }
            }
        },
        methods:{
            getValue:function () {
                return this.getOption('checked');
            },
            setValue:function (value) {
                this.setOption('checked', value);
            },
            activate:function () {
                this.addClass('f-radio-focus');
            },
            deactivate:function () {
                this.removeClass('f-radio-focus');
            },
            __inputClick:function (sender, event) {
                event.preventDefault();
                event.routing = 'none';
            },
            __click:function (sender, event) {
                event.target = this;
            },
            __mousedown:function (sender, event) {
                event.target = this;
            }
        }
    });
})(fruit, fruit.ui, fruit.util, fruit.dom, fruit.util.keys);
(function (fruit, ui, util, dom, keys) {
    /**
     * @class fruit.ui.RadioGroup
     * @extends fruit.ui.Component
     * @example
     <pre><code>
     var num = new fruit.ui.RadioGroup({
     items:[{text:'Male',checked:true},{text:'Female',checked:false}]
     });
     </code></pre>
     */
    fruit.define('fruit.ui.RadioGroup', {
        extend:'fruit.ui.Component',
        view:{
            attr:{
                'role':'radiogroup',
                'tabindex':'0',
                'class':'f-radio-group'
            },
            template:{
                type:'Radio',
                options:{
                    text:'{text}',
                    value:'{value}',
                    checked:'{checked}',
                    name:'{name}',
                    disabled:'{disabled}'
                }
            }
        },
        options:{
            /**
             * @cfg {Array} items Get or set the items of the RadioGroup Default
             *      value is null
             * @example [{text:'aaa',value:'a',checked:true},{text:'bbb',value:'b',checked:false}]
             */
            items:{
                defaultValue:null,
                acceptTypes:['Array', 'Null']
            }
        },
        triggers:{
            option:{
                items:{
                    action:'setModel',
                    params:['#value#']
                }
            },
            event:{
                'keyup':{
                    action:'__onKeyUp'
                },
                'keydown':{
                    action:'__onKeyDown'
                },
                'focus':{
                    action:'__focus'
                },
                'blur':{
                    action:'__blur'
                },
                'click':{
                    action:'__click'
                },
                'mousedown':{
                    action:'__mousedown'
                }
            }
        },
        methods:{
            init:function () {
                this.__resetItems();
            },
            setModel:function () {
                this.superMethod(arguments);
                this.__resetItems();
            },
            /**
             * @method activateItem
             */
            activateItem:function (item) {
                if (util.isNumber(item)) {
                    item = this.childAt(item);
                }
                if (item == this._activeItem) {
                    return;
                }
                if (item) {
                    item.activate();
                }
                else {
                    return;
                }
                if (this._activeItem) {
                    this._activeItem.deactivate();
                }
                this._activeItem = item;
                if (fruit.util.isIE8) {
                    this.setStyle({
                        "zoom":1
                    });
                }
            },
            selectItem:function (item) {
                if (util.isNumber(item)) {
                    item = this.childAt(item);
                } else if (util.isString(item)) {
                    item = this.childAt(Number(item));
                }
                if (item == this._selectedItem) {
                    return;
                }
                if (this._selectedItem) {
                    this._selectedItem.setOption('checked', false);
                }
                this._selectedItem = item;
                if (item) {
                    item.setOption('checked', true);
                }
                if (fruit.util.isIE8) {
                    this.setStyle({
                        "zoom":1
                    });
                }
                this.trigger('change', {item:item});
            },
            /**
             * @method prevItem
             */
            prevItem:function () {
                var item = this._activeItem ? this._activeItem.$previousSibling : this.$lastChild;
                if (item) {
                    while (item) {
                        if (!item.getOption('disabled')) {
                            this.activateItem(item);
                            break;
                        }
                        item = item.$previousSibling;
                    }
                }
            },
            /**
             * @method nextItem
             */
            nextItem:function () {
                var item = this._activeItem ? this._activeItem.$nextSibling : this.$firstChild;
                if (item) {
                    while (item) {
                        if (!item.getOption('disabled')) {
                            this.activateItem(item);
                            break;
                        }
                        item = item.$nextSibling;
                    }
                }
            },
            __resetItems:function () {
                var self = this;
                this._activeItem = null;
                this.children(function (child) {
                    var m = child.getModel();
                    if (m && m.checked) {
                        self._selectedItem = child;
                        return false;
                    }
                });
            },
            __click:function (sender, event) {
                var item = event.target;
                if (item instanceof fruit.ui.Radio) {
                    this.selectItem(item);
                }
            },
            __mousedown:function (sender, event) {
                var item = event.target;
                if (item instanceof fruit.ui.Radio) {
                    this.activateItem(item);
                }
            },
            __onKeyUp:function (target, event) {
                if (this.getOption('disabled')) {
                    return;
                }
                var code = event.keyCode;
                if (event.hasSystemKey) {
                    return;
                } else {
                    switch (code) {
                        case keys.SPACE:
                        case keys.ENTER:
                            if (this._activeItem) {
                                this.selectItem(this._activeItem);
                            }
                            event.preventDefault();
                            break;
                    }
                }
            },
            __onKeyDown:function (target, event) {
                if (this.getOption('disabled')) {
                    return;
                }
                var code = event.keyCode;
                if (event.hasSystemKey) {
                    return;
                } else {
                    switch (code) {
                        case keys.UP_ARROW:
                        case keys.LEFT_ARROW:
                            this.prevItem();
                            event.preventDefault();
                            break;
                        case keys.DOWN_ARROW:
                        case keys.RIGHT_ARROW:
                            this.nextItem();
                            event.preventDefault();
                            break;
                        case keys.SPACE:
                        case keys.ENTER:
                            if (this._activeItem) {
                                this.selectItem(this._activeItem);
                            }
                            event.preventDefault();
                            break;
                    }
                }
            },
            __focus:function (sender, event) {
                if (event.target == sender && !this._activeItem) {
                    if (this._selectedItem) {
                        this.activateItem(this._selectedItem);
                    }
                    else {
                        this.nextItem();
                    }
                }
            },
            __blur:function (sender, event) {
                if (event.target == sender && this._activeItem) {
                    this._activeItem.deactivate();
                    this._activeItem = null;
                }
            }
        }
    });
})(fruit, fruit.ui, fruit.util, fruit.dom, fruit.util.keys);
(function (fruit, ui, util, dom, keys) {
    /**
     * @class fruit.ui.TextBox
     * This is basic TextBox component
     * @extends fruit.ui.Component
     * @param {Object} inOptions
     * @example
     <pre><code>

     </code></pre>
     */
    fruit.define('fruit.ui.TextBox', {
        extend:'fruit.ui.Component',
        view:{
            tag:'span',
            attr:{
                'class':'f-textbox',
                role:'textbox'
            },
            content:[
                {
                    name:'text',
                    tag:'input',
                    attr:{
                        type:'text'
                    }
                },
                {
                    name:'icon',
                    tag:'a'
                }
            ]
        },
        options:{
            /**
             * @cfg {String} placeHolder
             * Get or set the placeHolder of the TextBox
             * Default value is null
             * @example init
             */
            placeHolder:{
                defaultValue:null,
                acceptTypes:['String', 'Null']
            },
            /**
             * @cfg {String} text
             * Get or set the text of the TextBox
             * Default value is null
             * @example textbox
             */
            text:{
                defaultValue:null,
                acceptTypes:['String','Number', 'Null']
            },
            /**
             * @cfg {Boolean} readonly
             * Get or set a value indicates whether the TextBox is readonly
             * Default value is null
             * @example false
             */
            readonly:{
                defaultValue:false,
                acceptTypes:['Boolean']
            },
            icon:{
                defaultValue:null,
                acceptTypes:['String', 'Null']
            },
            /**
             * @cfg {Number} maxLength
             * Get or set the max length of the TextBox
             * Default value is null
             * @example 20
             */
            maxLength:{
                defaultValue:null,
                acceptTypes:['Number', 'Null']
            },
            'type':{
                defaultValue:'text',
                acceptTypes:['String']
            }
        },
        triggers:{
            option:{

                text:{
                    target:'text',
                    action:'setAttribute',
                    params:['value', '#value#']
                },
                readonly:[
                    {
                        target:'text',
                        action:'setAttribute',
                        params:['readonly', '#value#']
                    },
                    {
                        action:'setAttribute',
                        params:['aria-readonly', '#value#']
                    }
                ],
                icon:{
                    target:'icon',
                    action:'switchClass',
                    params:[
                        '#value#',
                        {
                            'null':'',
                            DEFAULT:'f-textbox-icon'
                        }
                    ]
                },
                maxLength:{
                    target:'text',
                    action:'setAttribute',
                    params:[ 'maxlength', '#value#' ]
                },
                type:{
                    target:'text',
                    action:'setAttribute',
                    params:[ 'type', '#value#' ]
                }
            },
            event:{
                'focus':{
                    action:'__focus'
                },
                'blur':{
                    action:'__blur'
                },
                'input':{
                    action:'__input'
                },
                'change':{
                    action:'__change'
                }
            }
        },
        methods:{
            init:function () {
                this.focusable = true;
                this.attachBehavior({
                    behavior:'Placeholder',
                    params:{
                        text:this.getOption('placeHolder'),
                        inputTarget:this.text
                    }
                })
            },
            /**
             * icon of textbox is shown or not
             * @method showIcon
             * @param {Boolean} inBoolean
             * @example true
             */
            showIcon:function (inBoolean) {
                //TODO:fig.core.js  hide/show
                //icon.enabled???
                if (inBoolean) {
                    this.icon.setStyle({
                        display:"inline-block"
                    });
                } else {
                    this.icon.setStyle({
                        display:"none"
                    });
                }
            },
            /**
             * disable the icon events
             * @method disableIcon
             * @param {Boolean} inBoolean
             * @example true
             */
            disableIcon:function (inBoolean) {
                this.icon.setOption('disabled', inBoolean);
            },
            /**
             * make textBox focus
             * @method focus
             * @example
             */
            focus:function () {
                this.text.focus();
            },
            getValue:function () {
                return this.getOption('text');
            },
            setValue:function (value) {
                this.setOption('text', value);
            },
            __supportPlaceHolder:function () {
                return 'placeholder' in document.createElement('input');
            },
            __showPlaceHolder:function () {
                if (!this.__supportPlaceHolder()) {
                    var text = this.text;
                    var value = this.getText();
                    var ph = text.getAttribute('placeHolder') || "";
                    var dv = text.element.defaultValue;
                    text.addClass("placeHolder");
                    if (value === dv || value === ph) {
                        this.setText(ph);
                    }
                }
            },
            __getPlaceHolder:function () {
                return this.text.getAttribute('placeHolder');
            },
            __focus:function () {
                var text = this.text;
                var isReadOnly = text.getAttribute("readOnly");
                if (!isReadOnly) {
                    this.addClass('f-textbox-focus');
                    /*if (!this.__supportPlaceHolder()) {
                     var value = this.getText(), ph = text.getAttribute('placeHolder'), dv = text.element.defaultValue;
                     text.removeClass("placeHolder");
                     if (value === ph) {
                     this.setText('');
                     }
                     }*/
                }
                /**
                 * @event focus
                 */
                this.trigger('Focus');
            },
            __blur:function () {
                this.removeClass('f-textbox-focus');
//                this.__showPlaceHolder();
                /**
                 * @event blur
                 */
                this.trigger('Blur');
            },
            __input:function () {
                this.setOption('text', this.text.getAttribute('value'));
                /**
                 * @event input
                 */
                this.trigger('Input');
            },
            __change:function () {
                this.setOption('text', this.text.getAttribute('value'));
                /**
                 * @event change
                 */
                this.trigger('Change');
            },
            __iconClick:function () {
                if (!this.getOption("disabled")) {
                    /**
                     * @event iconClick
                     */
                    this.trigger('iconClick');
                }
            }
        }
    });
})(fruit, fruit.ui, fruit.util, fruit.dom, fruit.util.keys);
(function (fruit, ui) {
    /**
     * @class fruit.ui.Textarea
     * This is Textarea component
     * @extends fruit.ui.Component
     * @param {Object} inOptions
     */
    fruit.define('fruit.ui.Textarea', {
        extend:'fruit.ui.Component',
        view:{
            tag:'span',
            attr:{
                'class':'f-textarea',
                role:'textarea'
            },
            content:{
                name:'textarea',
                tag:'textarea',
                attr:{
                    'class':'f-textarea-body',
                    role:'textarea'
                }
            }
        },
        options:{
            /**
             * @cfg {String} placeHolder
             *
             * @example Textarea
             */
            placeHolder:{
                defaultValue:null,
                acceptTypes:['String']
            },
            /**
             * @cfg {Number} minHeight
             *
             * @example 50
             */
            minHeight:{
                defaultValue:50,
                acceptTypes:['Number', 'Null']
            },
            /**
             * @cfg {Number} maxHeight
             *
             * @example 300
             */
            maxHeight:{
                defaultValue:null,
                acceptTypes:['Number', 'Null']
            },
            /**
             * @cfg {String} text
             *
             * @example
             */
            text:{
                defaultValue:null,
                acceptTypes:['String']
            },
            /**
             * @cfg {Boolean} readonly
             *
             * @example false
             */
            readonly:{
                defaultValue:null,
                acceptTypes:['Boolean','Null']
            }
        },
        triggers:{
            option:{
                minHeight:{
                    action:'setStyle'
                },
                maxHeight:{
                    action:'setStyle'
                },
                text:{
                    action:'setText',
                    target:'textarea'
                },
                readonly:{
                    action:'setAttribute',
                    params:['readonly', '#value#']
                }
            },
            event:{
                'input':{
                    action:'adjust'
                },
                'ready':{
                    action:'adjust'
                }
            }
        },
        methods:{
            init:function(){
                this.attachBehavior({
                    behavior:'Placeholder',
                    params:{
                        text:this.getOption('placeHolder'),
                        inputTarget:this.textarea
                    }
                })
            },
            adjust:function () {
                //TODO:has some bug in ie,so bug the code.[afei]
                var minHeight = this.getOption('minHeight'),
                    maxHeight = this.getOption('maxHeight'),
                    height = 0,
                    isIE = fruit.util.browserName == 'IE',
                    textarea=this.textarea;
                if (!isIE) {
                    textarea.element.setStyle({'height':minHeight});
                }
                //TODO:check the paddingTop in ie of the currentStyle.
                var scrollHeight = textarea.element.element.scrollHeight,
                    padding =this.__getPaddings(textarea);
                if (scrollHeight > minHeight) {
                    if (maxHeight && scrollHeight > maxHeight) {
                        height = maxHeight - padding;
                        textarea.element.setStyle({'overflowY':'auto'});
                    } else {
                        height = scrollHeight - padding;
                        textarea.element.setStyle({'overflowY':'hidden'});
                    }
                    textarea.element.setStyle({'height':height});
                } else {
                    if (isIE) {
                        textarea.element.setStyle({'height':minHeight});
                    }
                }
            },
            __getPaddings:function(textarea){
                return parseFloat(textarea.element.getStyle('paddingTop')) + parseFloat(textarea.element.getStyle('paddingBottom'));
            }
        }
    });
})(fruit, fruit.ui);
(function (fruit, ui, util, dom, keys) {
    /**
     * @class fruit.ui.SearchBox
     * This is basic SearchBox
     * @extends fruit.ui.Component
     * @param {Object} inOptions
     * @example
     <pre><code>
     var btn = new fruit.ui.SearchBox({
     });
     </code></pre>
     */
    fruit.define('fruit.ui.SearchBox', {
        extend:'fruit.ui.Component',
        view:{
            attr:{
                'class':'f-searchbox'
            },
            content:{
                name:"text",
                tag:"input",
                attr:{
                    type:"text"
                }
            }
        },
        options:{
            placeholder:{
                defaultValue:null,
                acceptTypes:["String", "Null"]
            },
            text:{
                defaultValue:"",
                acceptTypes:["String", "Null"]
            }
        },
        triggers:{
            option:{
                placeholder:{
                    target:'text',
                    action:'setAttribute',
                    params:["placeholder", '#value#']
                },
                text:{
                    target:'text',
                    action:'setAttribute',
                    params:['value', '#value#']
                }
            },
            event:{
                focus:{
                    action:'__click'
                },
                blur:{
                    action:'__blur'
                },
                click:{
                    action:'__click'
                },
                keyup:{
                    action:'__keyup'
                },
                keydown:{
                    action:'__keydown'
                }
            }
        },
        methods:{
            init:function () {
                this.focusable = true;
                this.__manuallyOpen = false;
            },
            __click:function (sender, event) {
                this.addClass("f-searchbox-focus");
                this.text.focus();
            },
            __blur:function (sender, event) {
                if (!this.__manuallyOpen) {
                    this.removeClass("f-searchbox-focus");
                    this.text.blur();
                    this.text.setAttribute("value", this.getOption("text"));
                }
            },
            __keyup:function (sender, event) {
                if (event.hasSystemKey) {
                    return;
                }
                switch (event.keyCode) {
                    case keys.ENTER:
                        event.preventDefault();
                        this.trigger('command', this.text.getAttribute("value"));
                        break;
                }

                event.routing = 'none';
            },
            __keydown:function (sender, event) {

            },
            open:function () {
                this.__click();
                this.__manuallyOpen = true;
            },
            close:function () {
                this.__manuallyOpen = false;
                this.__blur();

            }
        }
    });
})(fruit, fruit.ui, fruit.util, fruit.dom, fruit.util.keys);

(function(fruit, ui, util, dom) {

	/**
	 * @class fruit.ui.AccordionHead
	 * @extends fruit.ui.Component
	 * @ignore
	 */
	fruit.define('fruit.ui.AccordionHead', {
		extend : 'fruit.ui.Component',
		view : {
			tag : 'a',
			attr : {
				'class' : 'f-accordion-header'
			},
			content : [{
				tag : 'i',
				attr : {
					'class' : 'icon-accordion'
				}
			}, {
				tag : 'span',
				content : '{title}'
			}]
		},
		triggers : {
			event : {
				click : {
					action : '__click'
				},
				keydown : {
					action : '__KeyDown'
				}
			}
		},
		methods : {
			__click : function(inSender, inEvent) {
				this.trigger('accordionHeadClick', {
					source : this.$parent
				});
			},
			active : function() {
				this.addClass('f-accordion-header-selected');
				this.setAttribute('tabIndex', 0);
			},
			deactive : function() {
				this.removeClass('f-accordion-header-selected');
				this.removeAttribute('tabIndex');
			},
			focusMe : function() {
				this.focus();
			},
			__KeyDown : function(inSender, inEvent, inType) {
				this.trigger('keydownInHead', {
					source : this,
					sender : inSender,
					event : inEvent,
					type : inType
				});
			}
		}
	});

	/**
	 * @class fruit.ui.AccordionPanel
	 * @extends fruit.ui.Component
	 * @ignore
	 */
	fruit.define('fruit.ui.AccordionPanel', {
		extend : 'fruit.ui.Component',
		view : {
			tag : 'div',
			content : '{content}'
		},
		methods : {
			active : function() {
				this.removeClass('hidden');
				this.addClass('f-accordion-content');

				var __panel = this.$firstChild;
				if (__panel && __panel.interfaceOf('fruit.ui.IPanel')) {
					__panel.load();
				}
			},
			deactive : function() {
				this.removeClass('f-accordion-content');
				this.addClass('hidden');
			}
		}
	});

	/**
	 * @class fruit.ui.Accordion
	 * @extends fruit.ui.Component
	 * @example
	 <pre><code>
	 var myAccordion1 = new fruit.ui.Accordion({
	 items : [{
	 id : 1,
	 title : 'Accordion1',
	 content : '<p>This is Accordion-1</p>'
	 }, {
	 id : 2,
	 title : 'Accordion2',
	 content : '<p>This is Accordion-2</p>'
	 }],
	 defaultActive : 0
	 });
	 </code></pre>
	 */
	fruit.define('fruit.ui.Accordion', {
		extend : 'fruit.ui.Component',
		view : {
			tag : 'div',
			attr : {
				'class' : 'f-accordion',
				role : 'presentation'
			},
			content : [{
				tag : 'ul',
				name : 'AccordionCollection',
				attr : {
					'class' : 'f-accordion-wrap'
				},
				template : {
					tag : 'li',
					attr : {
						'class' : 'f-accordion-item'
					},
					content : [{
						type : 'AccordionHead'
					}, {
						type : 'AccordionPanel',
						options : {
							hidden : true
						}
					}]
				}

			}]
		},
		triggers : {
			option : {
				items : {
					action : 'setModel'
				}
			},
			event : {
				ready : {
					action : '__ready'
				},
				accordionHeadClick : {
					action : '__AccordionHeadClick'
				},
				keydownInHead : {
					action : '__naviKeyDown'
				}
			}
		},
		options : {
			/**
			 * @cfg {Array} items
			 * Accordion's model
			 * @example [{id : 1, title : 'Accordion1', content : '<p>This is Accordion-1</p>' },{id : 2, title : 'Accordion1', content : '<p>This is Accordion-1</p>' }]
			 */
			items : {
				defaultValue : null,
				acceptTypes : ['Array', 'Null']
			},

			/**
			 * @cfg {Number} defaultActive
			 * Accordion's default active index, default value is 0.
			 * @example 0
			 */
			defaultActive : {
				defaultValue : 0,
				acceptTypes : ['Number']
			}
		},
		methods : {
			/**
			 * set model for the Accordion
			 * @param {Array} model
			 * @param {String} path
			 * @ignore
			 */
			setModel : function(model, path) {
				var vmc = new fruit.ui.data.ViewModelCollection(model);
				this.superMethod([vmc], path);
			},

			/**
			 * add a panel.
			 * @param {Object} AccordionPanel
			 * @param {Number} index
			 * @example [{"AccordionPanel": {id : 3, title : 'Accordion3', content : '<p>This is my added Accordion</p>'},"index":2}]
			 */
			addPanel : function(AccordionPanel, index) {
				if (AccordionPanel) {
					var len = this.getModel().length;
					if (!index || index > len) {
						index = len;
					}
					this.model.insertItem(AccordionPanel, index);

					if (index <= this.activePanelIndex) {
						this.activePanelIndex++;
					}
				}
			},

			/**
			 * remove a panel.
			 * @param {Number} index
			 * @example 1
			 */
			removePanel : function(index) {
				var len = this.getModel().length;
				if (index < len && index >= 0) {
					this.model.removeItemAt(index);
					var activeIndex = this.activePanelIndex;
					if (index <= this.activePanelIndex) {
						if (index == 0 && this.activePanelIndex == 0) {
							activeIndex = 0;
							this.activePanelIndex = 1;
						} else {
							activeIndex = this.activePanelIndex - 1;
						}
					}
					this.active(activeIndex);
				}
			},

			__ready : function() {
				this.activePanelIndex = this.getOption('defaultActive');
				var len = this.getModel().length;
				if (this.activePanelIndex >= len || this.activePanelIndex < 0) {
					util.logger.error("Option defaultActive set error.");
					this.activePanelIndex = 0;
				}
				this.__activeAccordion(this.activePanelIndex, true);
			},

			__AccordionHeadClick : function(sender, event) {
				var activePanelIndex = event.source.getIndex();

				if (activePanelIndex != this.activePanelIndex) {
					this.active(activePanelIndex);
				}
			},

			/**
			 * active a panel by index.
			 * @param {Number} index
			 * @example 1
			 */
			active : function(index) {
				if (index != this.activePanelIndex) {
					this.__deactiveAccordion(this.activePanelIndex);
					this.activePanelIndex = index;
					this.__activeAccordion(index);
				}

			},

			/**
			 * active the previous accordion panel
			 */
			prev : function() {
				if (this.activePanelIndex > 0) {
					this.active(this.activePanelIndex - 1);
				}
			},

			/**
			 * active the nex accordion panel
			 */
			next : function() {
				var maxIndex = this.getModel().length - 1;
				if (this.activePanelIndex < maxIndex) {
					this.active(this.activePanelIndex + 1)
				}
			},

			__activeAccordion : function(index, initialize) {
				var activeAccordionItem = this.AccordionCollection.childAt(index);
				if (activeAccordionItem) {
					var activePanelHead = activeAccordionItem.$firstChild;
					if (activePanelHead) {
						activePanelHead.active();
						if (!initialize) {
							activePanelHead.focusMe();
						}
					}

					var activePanle = activeAccordionItem.$lastChild;
					if (activePanle) {
						activePanle.active();
					}
				}
			},

			__deactiveAccordion : function(index) {
				var activeAccordionItem = this.AccordionCollection.childAt(index);
				if (activeAccordionItem) {
					var deactivePanelHead = activeAccordionItem.$firstChild;
					if (deactivePanelHead) {
						deactivePanelHead.deactive();
					}

					var deactivePanel = activeAccordionItem.$lastChild;
					if (deactivePanel) {
						deactivePanel.deactive();
					}
				}
			},

			__naviKeyDown : function(sender, params) {
				var ev = params.event;
				if (ev.ctrlKey || ev.altKey) {
					return;
				}
				switch(ev.keyCode) {
					case util.keys.LEFT_ARROW :
					case util.keys.UP_ARROW :
						this.prev();
						break;
					case util.keys.RIGHT_ARROW :
					case util.keys.DOWN_ARROW :
						this.next();
						break;
					default :
						break;
				}
			}
		}
	});

})(fruit, fruit.ui, fruit.util, fruit.dom);
(function (fruit, ui, util, dom, keys) {
    fruit.define('fruit.ui.data.CalendarItemViewModel', {
        extend:'fruit.ui.data.ViewModel',
        properties:{
            'itemClass':{
                get:function () {
                    var itemClassName = [];
                    var model = this.model;
                    var dateObj = model.dataObj;
                    //this.setContent(1);
                    if (dateObj.getMonth() < model.currentMonth || dateObj.getFullYear() < model.currentYear) {
                        itemClassName.push("f-calendar-item-prev");
                    } else if (dateObj.getMonth() > model.currentMonth || dateObj.getFullYear() > model.currentYear) {
                        itemClassName.push("f-calendar-item-next");
                    } else {
                        itemClassName.push("f-calendar-item-current");
                    }
                    if (util.formatDate(dateObj, "yyyy-mm-dd") == model.today) {
                        itemClassName.push("f-calendar-item-today");
                    }

                    return itemClassName.join(" ");
                    //this.dateTime = dateObj.getTime();
                }
            },
            'day':{
                get:function () {
                    var dateObj = this.getValue("dataObj");
                    return dateObj.getDate();
                }
            }
        }
    });
    fruit.define('fruit.ui.CalendarItem', {
        extend:'fruit.ui.Component',
        view:{
            tag:"li",
            content:"{day}",
            attr:{
                'class':'{itemClass}'
            }

        },
        options:{
            'selected':{
                defaultValue:false,
                acceptTypes:["Boolean"]
            }
        },
        triggers:{
            event:{
                click:{
                    action:'__itemClick'
                }
            },
            option:{
                'selected':{
                    action:"toggleClass",
                    params:["f-calendar-item-selected","#value#"]
                }
            }
        },
        methods:{
            __itemClick:function () {
                var formatDate = this.getModel().formatDate;
                this.trigger("itemClick", {date:util.formatDate(this.dateObj, formatDate), dateObj:this.dateObj, item:this});
            }
        }
    })
    /**
     * @class fruit.ui.Calendar
     * This is basic Calendar component
     * @extends fruit.ui.Component
     * @param {Object} options
     * <pre><code>
     *     var calendar = new fruit.ui.Calendar({
     selectedDay:"2012-9-20",
     formatDate:"ddd mmm dd yyyy"
     });
     calendar.on("itemClick",function(sender,args){
     var date = args.date;
     var dateObj = args.dateObj;
     alert(date);
     })
     calendar.renderTo();
     * </code></pre>
     */
    fruit.define('fruit.ui.Calendar', {
        extend:'fruit.ui.Component',
        view:{
            attr:{
                'class':'f-calendar',
                'tabIndex':'-1'
            },
            content:[
                {
                    attr:{
                        'class':"f-calendar-header"
                    },
                    content:[
                        {
                            name:'rightBtn',
                            tag:'span',
                            attr:{
                                'class':'f-calendar-header-rightBtn'
                            }
                        },
                        {
                            name:'leftBtn',
                            tag:'span',
                            attr:{
                                'class':'f-calendar-header-leftBtn'
                            }
                        },
                        {
                            name:'todayBtn',
                            tag:'button',
                            attr:{
                                'class':'f-btn f-btn-small'
                            },
                            content:"Today"
                        },
                        {

                            tag:'span',
                            attr:{
                                'class':'f-calendar-header-text'
                            },
                            content:"{currentDateLabelText}"
                        }
                    ]

                },
                {
                    attr:{
                        'class':'f-calendar-content'
                    },
                    content:[
                        {
                            model:"{dayNames}",
                            tag:"ul",
                            attr:{
                                'class':'f-calendar-content-header'
                            },
                            template:{
                                tag:"li",
                                content:"{@self}"
                            }
                        },
                        {
                            //model:"{dateGrid}",
                            name:'contentBody',
                            tag:"ul",
                            attr:{
                                'class':'f-calendar-content-body'
                            },
                            template:{
                                type:"CalendarItem",
                                options:""
                            }
                        }
                    ]
                }
            ]
        },
        options:{
            /**
             * @cfg {String} selectedDay
             * Set the selected date
             * @example 2012-9-20
             */
            "selectedDay":{
                defaultValue:null,
                acceptTypes : ['String', 'Null']
            },
            /**
             * @cfg {String} formatDate
             * Set the formatDate of date
             * @example yyyy-mm-dd
             */
            "formatDate":{
                defaultValue:"yyyy-mm-dd",
                acceptTypes : ['String', 'Null']
            }

        },
        triggers:{
            event:{
                ready:{
                    action:'__updateDate'
                },
                keydown:{
                    action:'__keyup'
                },
                click:[
                    {
                        source:'rightBtn',
                        action:'__increaseMonth'
                    },
                    {
                        source:'leftBtn',
                        action:'__decreaseMonth'
                    },
                    {
                        source:'todayBtn',
                        action:'__returnToToday'
                    }
                ],
                itemClick:{
                    source:'contentBody',
                    action:'__itemClick'
                }
            }
        },
        methods:{
            init:function () {
                this.__dateObj = util.newDate(this.getOption("selectedDay"));
                this.__selectedDayTime = this.getOption("selectedDay") ? this.__dateObj.getTime() : 0;
            },
            _$generateDateModel:function () {
                var date = this.__dateObj;
                this.__currentMonth = date.getMonth();
                this.__currentYear = date.getFullYear();
                this.__today = util.formatDate(new Date(), "yyyy-mm-dd");
                this.__viewModelCollection = new fruit.ui.data.ViewModelCollection(this._$generateDateGrid(), "fruit.ui.data.CalendarItemViewModel");
                this.__currentModel = {
                    //dateGrid:this.__viewModelCollection,
                    dayNames:util.getDayNames("ddd"),
                    currentDateLabelText:this.__getCurrentDateLabelText()
                };
                //console.log(this.__currentModel);
            },
            _$generateDateGrid:function () {
                var dateGrid = [];
                var step = 24 * 60 * 60 * 1000;
                var dateGridItemNumbers = 7 * 6;
                var firstDateGridItemTime = util.newDate(this.__currentYear + "-" + (this.__currentMonth + 1) + "-1");
                var firstDayDay = firstDateGridItemTime.getDay();
                var firstDayTime = firstDateGridItemTime.getTime();

                firstDateGridItemTime = firstDayTime - firstDayDay * step;
                for (var i = 0; i < dateGridItemNumbers; i++) {
                    var itemDataTime =  firstDateGridItemTime + step * i;
                    if(itemDataTime == this.__selectedDayTime){
                        this.__selectedItemIndex =  i;
                    }
                    dateGrid.push({
                        dataObj:new Date(itemDataTime),
                        dateTime:itemDataTime,
                        currentMonth:this.__currentMonth,
                        currentYear:this.__currentYear,
                        today:this.__today,
                        formatDate:this.getOption("formatDate")
                    });
                }
                return dateGrid;
            },
            __getCurrentDateLabelText:function () {
                return util.formatDate(this.__dateObj, "mmmm yyyy");
            },
            __increaseMonth:function () {
                this.__dateObj.setMonth(++this.__currentMonth);
                this.__updateDate();
            },
            __decreaseMonth:function () {
                this.__dateObj.setMonth(--this.__currentMonth);
                this.__updateDate();
            },
            __returnToToday:function () {
                this.__dateObj = new Date();
                this.__updateDate();
            },
            __keyup:function (sender, evt) {
                var code = evt.keyCode || evt.charCode;
                var step = 24 * 60 * 60 * 1000;
                var self = this;
                if(!this.__selectedItemIndex){
                    return;
                }
                if (evt.ctrlKey || evt.altKey) {
                    return;
                } else {
                    switch (code) {
                        case keys.UP_ARROW:
                            this.__selectedItemIndex -=7;
                            break;
                        case keys.DOWN_ARROW:
                            this.__selectedItemIndex +=7;
                            break;
                        case keys.LEFT_ARROW:
                            this.__selectedItemIndex --;
                            break;
                        case keys.RIGHT_ARROW:
                            this.__selectedItemIndex ++;
                            break;
                    }

                    if (this.__selectedItemIndex >= 42) {
                        this.__increaseMonth();
                        return false;
                    }
                    if (this.__selectedItemIndex <= 0) {
                        this.__decreaseMonth();
                        return false;
                    }
                    this.__setSelectedItem(this.__selectedItemIndex);
                }
                evt.routing = 'none';
                return false;
            },
            __itemClick:function (sender, args) {

                this.__setSelectedItem(args.item.getIndex())
                //this.__selectedItemIndex = args.item.getIndex();

            },
            __setSelectedItem:function (itemIndex) {
                //console.log(args);
                if(this.__selectedItem){
                    this.__selectedItem.setOption("selected",false);
                }
                this.__selectedItem = this.contentBody.childAt(itemIndex);
                this.__selectedDayTime = this.__selectedItem.getModel().dateTime;
                this.__selectedItem.setOption("selected",true);
            },
            __updateDate:function () {
                delete this.__selectedItemIndex;
                this._$generateDateModel();
                this.setModel(this.__currentModel);
                this.contentBody.setModel(this.__viewModelCollection);
                if(this.__selectedItemIndex){
                    this.__setSelectedItem (this.__selectedItemIndex);
                }

            },
            getSelctedDay:function () {
                var selectedItem = this.__selectedItem;
                return  util.formatDate(selectedItem.dateObj, this.getOption("formatDate"));
            }
        }
    })

})(fruit, fruit.ui, fruit.util, fruit.dom, fruit.util.keys);
(function (fruit, ui) {
    fruit.define('fruit.ui.data.DataGridViewModel', {
        extend:'fruit.ui.data.ViewModel',
        entity:{
            init:function (model, columns) {
                this.columns = columns;
            },
            getModel:function (path) {
                var modelInfo = this.superMethod(arguments);
                var path = modelInfo.path;
                var tokens = path.split('.');
                var key;
                if (tokens && tokens.length > 0) {
                    key = tokens[0];
                    if (key == 'columns') {
                        tokens.shift();
                        return {
                            model:this.columns,
                            path:tokens.join('.')
                        }
                    }
                    else if (key == 'rows') {
                        tokens.shift();
                        return {
                            model:this.model,
                            path:tokens.join('.')
                        }
                    }
                    else if (key == 'pages') {
                        tokens.shift();
                        return {
                            model:this.pages,
                            path:tokens.join('.')
                        }
                    }
                }

                return modelInfo;
            }
        }
    });

    fruit.define('fruit.ui.DataGridPageLink', {
        extend:'fruit.ui.Component',
        view:{
            tag:'li'
        },
        options:{
            selected:{
                defaultValue:false
            },
            text:{
                defaultValue:null
            }
        },
        triggers:{
            option:{
                selected:{
                    action:'toggleClass',
                    params:['f-pagination-item-selected', '#value#']
                },
                text:{
                    action:'setText'
                }
            },
            event:{
                click:{
                    action:'__click'
                }
            }
        },
        events:{
            subscribe:{
                'this':{
                    'click':'__click'
                }
            }
        },
        methods:{
            __click:function (sender, event) {
                this.trigger('pageLinkClick', {item:this});
            }
        }
    });

    fruit.define('fruit.ui.DataGridRow', {
        extend:'fruit.ui.Component',
        view:{
            tag:'tr',
            attr:{
                'class':'f-datagrid-row'
            },
            content:[
                {
                    tag:'td',
                    content:'{name}'
                },
                {
                    tag:'td',
                    content:'{type}'
                }
            ]
        }
    });

    fruit.define('fruit.ui.DataGrid', {
        extend:'fruit.ui.Component',
        view:{
            attr:{
                'class':'f-datagrid'
            },
            content:[
                {
                    attr:{
                        'class':'f-datagrid-toolbar'
                    }
                },
                {
                    model:'{columns}',
                    attr:{
                        'class':'f-datagrid-header'
                    },
                    content:{
                        tag:'table',
                        content:[
                            {
                                tag:'colgroup',
                                template:{
                                    tag:'col',
                                    attr:{
                                        width:'{width}'
                                    }
                                }
                            },
                            {
                                tag:'thead',
                                content:{
                                    tag:'tr',
                                    template:{
                                        tag:'th',
                                        content:'{text}'
                                    }
                                }
                            }
                        ]
                    }
                },
                {
                    name:'body',
                    attr:{
                        'class':'f-datagrid-body'
                    },
                    content:{
                        attr:{
                            'class':'f-datagrid-body-wrap'
                        },
                        content:{
                            tag:'table',
                            content:[
                                {
                                    model:'{columns}',
                                    tag:'colgroup',
                                    template:{
                                        tag:'col',
                                        attr:{
                                            width:'{width}'
                                        }
                                    }
                                },
                                {
                                    name:'tbody',
                                    tag:'tbody',
                                    model:'{rows}'
                                }
                            ]
                        }
                    }
                },
                {
                    attr:{
                        'class':'f-datagrid-footer'
                    },
                    content:{
                        content:{
                            attr:{
                                'class':'f-pagination'
                            },
                            content:{
                                tag:'ul',
                                name:'pageLink',
                                model:'{pages}',
                                template:{
                                    type:'DataGridPageLink',
                                    options:{
                                        text:'{number}',
                                        selected:'{selected}'
                                    }
                                }
                            }
                        }
                    }
                }
            ]
        },
        options:{
            height:{
                defaultValue:360
            },
            editable:{
                defaultValue:false
            },
            columns:{
                defaultValue:null
            },
            pageCapacity:{
                defaultValue:10
            },
            currentPage:{
                defaultValue:0
            }
        },
        triggers:{
            option:{
                height:{
                    target:'body',
                    action:'setStyle',
                    params:['height', '#value#']
                }
            },
            event:{
                pageLinkClick:{
                    source:'pageLink',
                    action:'__pageLinkClick'
                },
                click:{
                    source:'tbody',
                    action:'__tbody_click'
                }
            }
        },
        methods:{
            init:function () {
                var columns = this.getOption('columns'), column;
                var i = 0, length, template, content;
                var editable = this.getOption('editable');

                if (columns) {
                    template = {
                        tag:'tr'
                    };

                    content = template.content = [];
                    length = columns.length;

                    for (; i < length; i++) {
                        column = columns[i];
                        if (column.field) {
                            content.push({
                                tag:'td',
                                content:'{' + column.field + '}'
                            });
                        }
                        else if (column.template) {
                            content.push({
                                tag:'td',
                                content:column.template
                            });
                        }
                    }

                    if (editable) {
                        content.push({
                            tag:'td',
                            content:[
                                {
                                    type:'Button',
                                    options:{
                                        text:'Edit'
                                    }
                                },
                                {
                                    type:'Button',
                                    options:{
                                        text:'Remove'
                                    }
                                }
                            ]
                        });
                    }

                    this.tbody.template = template;
                }
            },
            setModel:function (model) {
                if (!(model instanceof  fruit.ui.DataGridViewModel)) {
                    model = new fruit.ui.DataGridViewModel(model, this.getOption('columns'));
                }

                model.paginate(this.getOption('pageCapacity'));
                model.selectPage(this.getOption('currentPage'));

                this.superMethod(arguments);
            },
            paginate:function (capacity) {
                this.setOption('pageCapacity', capacity);
                this.updateModel();
            },
            selectPage:function (index) {
                this.setOption('currentPage', index);
                this.updateModel();
            },
            updateModel:function () {
                if (this.model) {
                    this.setModel(this.model);
                }
            },
            __pageLinkClick:function (sender, event) {
                this.selectPage(event.item.getModel().index);
            },
            __tbody_click:function (sender, event) {
                var target = event.target;
                var command;
                if (target instanceof fruit.ui.Button) {
                    command = target.getText();

                    if (command == 'Edit') {
                        var row = target.$parent.$parent;

                        row.children(function (child) {
                            var model = child.getModel('content');
                            var type = fruit.util.getType(model);
                            var comp;
                            switch (type) {
                                case 'String':
                                    comp = fruit.ui.createComponent({
                                        type:'TextBox',
                                        options:{
                                            text:'{' + child.__propMap['content'] + '}'
                                        }
                                    });
                                    break;
                                case 'Boolean':
                                    comp = fruit.ui.createComponent({
                                        type:'CheckBox',
                                        options:{
                                            checked:'{' + child.__propMap['content'] + '}'
                                        }
                                    });
                                    break;
                                case 'Number':
                                    comp = fruit.ui.createComponent({
                                        type:'NumberSpinner',
                                        options:{
                                            value:'{' + child.__propMap['content'] + '}'
                                        }
                                    });
                                    break;
                            }

                            if (comp) {
                                child.empty();
                                child.appendChild(comp);
                                comp.model = child.model;
                                comp.__modelPath = child.__modelPath;
                                comp._$onModelChanged(comp, {
                                    action:'init'
                                });
                            }
                        });

                        target.setText('Save');
                    }
                    else if (command == 'Save') {
                        var row = target.$parent.$parent;

                        row.children(function (child) {
                            child._$onModelChanged(child, {
                                action:'init'
                            });
                        });
                        target.setText('Edit');
                    }
                    else if (command == 'Remove') {
                        this.model.removeItem('', target.getModel());
                        this.updateModel();
                    }
                }
            }
        }
    });
})(fruit, fruit.ui);
(function (fruit, ui, util, dom, keys, ajax, i18n, engine, app) {
    /**
     * @class fruit.ui.Dialog
     * This is basic Dialog component
     * @extends fruit.ui.Component
     * @param {Object} inOptions
     * @example
     <pre><code>
     var dlg = new fruit.ui.Dialog({
     modal:true,
     fixed:true,
     header:'Login',
     body:'<h3>This is a Header</h3><p>This is a paragraph</p>'
     });
     dlg.open();
     </code></pre>
     */
    fruit.define('fruit.ui.Dialog', {
        extend:'fruit.ui.Popup',
        view:{
            dynamic:true,
            attr:{
                'class':'f-dialog',
                style:{
                    display:'none'
                },
                role:'dialog'
            },
            content:[
                {
                    name:'header',
                    attr:{
                        'class':'f-dialog-header'
                    },
                    content:[
                        {
                            tag:'i',
                            name:'headerIcon'
                        },
                        {
                            tag:'span',
                            name:'headerText',
                            attr:{
                                'class':'f-dialog-header-title'
                            }
                        },
                        {

                            attr:{
                                'class':'f-toolbar'
                            },
                            content:[
                                {
                                    name:'btnClose',
                                    tag:'button',
                                    attr:{
                                        type:'button',
                                        'class':'f-toolbar-item f-icon-btn'
                                    },
                                    content:{
                                        tag:'i',
                                        attr:{
                                            'class':'icon-close-x18'
                                        }
                                    },
                                    options:{
                                        title:'Close'//i18n.getText('close')
                                    }
                                }
                            ]
                        }
                    ]
                },
                {
                    name:'body',
                    attr:{
                        'class':'f-dialog-content'
                    }
                },
                {
                    name:'footer',
                    attr:{
                        'class':'f-dialog-footer'
                    },
                    content:{
                        attr:{
                            'class':'f-toolbar f-toolbar-right'
                        },
                        content:[
                            {
                                type:'Button',
                                name:'btnCancel',
                                options:{
                                    text:'Cancel'
                                }
                            },
                            {
                                type:'Button',
                                name:'btnOk',
                                options:{
                                    text:'Ok',
                                    theme:'primary'
                                }
                            }
                        ]
                    }
                }
            ]
        },
        regions:{
            'default':{
                target:'body'
            },
            'header':{
                target:'header'
            },
            'footer':{
                target:'footer'
            },
            'headerText':{
                target:'headerText'
            }

        },
        options:{
            /**
             * @cfg {Mixed} header
             * Get or set the header of the Dialog
             * Default value is null
             * @example "Login"
             */
            header:{
                defaultValue:null,
                acceptTypes:['String', 'Object', 'Array', 'Null']
            },
            /**
             * @cfg {Mixed} body
             * Get or set the body of the dialog
             * Default value is null
             * @example "<h3>This is a Header</h3><p>This is a paragraph</p>"
             */
            body:{
                defaultValue:null,
                acceptTypes:['String', 'Object', 'Array', 'Null']
            },
            /**
             * @cfg {Mixed} footer
             * Get or set the footer of the dialog
             * Default value is null
             * @example "<p>This is the footer</p>"
             */
            footer:{
                defaultValue:null,
                acceptTypes:['String', 'Object', 'Array', 'Null']
            },
            /**
             * @cfg {Boolean} fixed
             * Get a value indicates whether the dialog is fixed
             * Default value is true
             * @example true
             */
            fixed:{
                defaultValue:true,
                acceptTypes:['Boolean'],
                readonly:true
            },
            /**
             * @cfg {Boolean} modal
             * Get a value indicates whether the dialog is modal
             * Default value is true
             * @example true
             */
            modal:{
                defaultValue:true,
                acceptTypes:['Boolean'],
                readonly:false
            },
            /**
             * @cfg {Number} width
             * Get or set the width of the dialog
             * Default value is 400
             * @example 350
             */
            width:{
                defaultValue:null,
                acceptTypes:['Number', 'Null']
            },
            /**
             * @cfg {String} position
             * Get the position of the dialog
             * Default value is 'center'
             * @example center
             */
            position:{
                defaultValue:'center',
                acceptTypes:['String', 'Object']
            },
            /**
             * @cfg {Boolean} draggable
             * Get a value indicates whether the dialog is draggable
             * @example true
             */
            draggable:{
                defaultValue:true,
                acceptTypes:['Boolean'],
                readonly:true
            },
            /**
             * @cfg {Boolean} resizable
             * Get a value indicates whether the dialog is resizable
             * @example true
             */
            resizable:{
                defaultValue:true,
                acceptTypes:['Boolean'],
                readonly:true
            },
            /**
             * @cfg {Boolean} closable
             * Get a value indicates whether the dialog is closable
             * @example true
             */
            closeable:{
                defaultValue:true,
                acceptTypes:['Boolean'],
                readonly:true
            },
            /**
             * @cfg {Number} focusIndex
             * Get or set the index of the element to be focused when dialog is opened
             * @example 0
             */
            focusIndex:{
                defaultValue:1,
                acceptTypes:['Number', 'Null']
            }
        },
        /**
         * @event onOpen
         * Fires when dialog opened.
         */
        /**
         * @event onClose
         * Fires when dialog closed.
         */
        /**
         * @event onExecute
         * Fires when dialog ok button clicked.
         */
        /**
         * @event onCancel
         * Fires when dialog cancel button clicked.
         */
        /**
         * @event onContentReady
         * Fires when dialog content load ready.
         */
        triggers:{
            option:{
                header:{
                    target:'headerText',
                    action:'setContent'
                },
                body:{
                    target:'body',
                    action:'setContent'
                },
                footer:{
                    target:'footer',
                    action:'setContent'
                },
                width:{
                    action:'setStyle',
                    params:['width', '#value#']
                }
            },
            event:{
                click:[
                    {
                        source:'btnOk',
                        action:'execute'
                    },
                    {
                        source:'btnCancel',
                        action:'cancel'
                    },
                    {
                        source:'header',
                        action:'__onDragStart'
                    }
                ],
                mousedown:{
                    source:'btnClose',
                    action:'close'
                },
                keydown:[
                    {
                        source:'btnClose',
                        action:'closeKeyDown'
                    },
                    {
                        action:'myKeydown'
                    }
                ],
                keyup:{
                    source:'btnClose',
                    action:'closeKeyup'
                },
                onDragStart:{
                    action:'__onDragStart'
                }
            }
        },
        methods:{
            init:function () {
                this._focusables = [];
                this.btnClose.focusable = true;
                this.__resolveFocusables(this);
                this._focusables.push(this._focusables.shift());
                if (ui.TooltipBehavior) {
                    //this.btnClose.attachBehavior(new ui.TooltipBehavior(this.btnClose));
                    this.btnClose.attachBehavior({
                        behavior:'Tooltip'
                    });
                }/*
                if (this.getOption('closeable')) {
                    this.btnClose.hide();
                }*/
                if (this.getOption('draggable') && ui.DraggableBehavior) {
                    /*this.attachBehavior(new ui.DraggableBehavior(this, {
                     handle:this.header
                     }));*/
                    this.attachBehavior({
                        behavior:'Draggable',
                        params:{
                            handle:this.header
                        }
                    });
                }
                if (this.getOption('resizable') && ui.ResizableBehavior) {
                    /*var behavior = new ui.ResizableBehavior(this, {
                     'direction':'se',
                     target:this.body,
                     min:{
                     width:100,
                     height:50
                     },
                     max:{
                     width:600,
                     height:400
                     }
                     });
                     this.attachBehavior(behavior);*/
                    this.attachBehavior({
                        behavior:'Resizable',
                        params:{
                            'direction':'se',
                            target:this.body,
                            min:{
                                width:100,
                                height:50
                            },
                            max:{
                                width:600,
                                height:400
                            }
                        }
                    });
                }
                //Todo:
                if (this.getOption("position") == "center") {
                    var self = this;
                    engine.addEvent(window, "resize", function () {
                        self.setPosition("center");
                    });
                }
                this.__clearTitleAlt();
                this.__closeable();
            },
            __closeable:function () {
                if (this.getOption("closeable") == false) {
                    this.btnClose.setStyle('display', 'none');
                }
            },
            myKeydown:function (insender, e) {
                var code = e.keyCode || e.charCode;
                if (e.ctrlKey || e.altKey) {
                    return;
                }
                if (code === keys.ESCAPE) {
                    this.getOption('closeable') && this.close();
                }
            },
            __clearTitleAlt:function () {
                if (this.getOption("title") || this.getOption("alt")) {
                    this.removeAttribute("title");
                    this.removeAttribute("alt");
                }
            },
            __onDragStart:function () {
                //todo:maybe a temp solution
                var lastIndex = this.getOption('focusIndex');
                this._focusables[lastIndex] && this._focusables[lastIndex].focus();
            },
            closeKeyDown:function (inSender, inEvent, inType) {
                var ev = inEvent;
                if (ev.ctrlKey || ev.altKey) {
                    return;
                }
                if (ev.keyCode === util.keys.ENTER || ev.keyCode === util.keys.SPACE) {
                    //TODO:event bug
                    if (ev.preventDefault) {
                        ev.preventDefault()
                    }
                    ev.returnValue = false;
                }
            },
            closeKeyup:function (inSender, inEvent, inType) {
                var ev = inEvent;
                if (ev.ctrlKey || ev.altKey) {
                    return;
                }
                if (ev.keyCode === util.keys.ENTER || ev.keyCode === util.keys.SPACE) {
                    this.close();
                }
            },
            /**
             * Load content from url either through ajax or jframe
             * @method loadContent
             * @param {String} url
             * @param {Boolean} useIframe
             * @example [{"url":"content.html","useIframe":true}]
             */
            loadContent:function (url, useIframe) {
                this.body.empty();
                var self = this;
                if (url) {
                    if (useIframe) {
                        this.body.setContent({
                            tag:'iframe',
                            attr:{
                                src:url,
                                frameBorder:0
                            }
                        });
                        self.trigger('onContentReady');
                    } else {
                        ajax.get(url, null, function (data) {
                            self.body.setContent(data);
                            self.trigger('onContentReady');
                        }, 'html');
                    }
                }
            },
            /**
             * Set the position of the dialog
             * @method setPosition
             * @param {Mixed} value
             * @example [{x:200,y:100},'center']
             */
            setPosition:function (value) {
                var mySize = this.element.getSize(this.element);
                var docInfo = dom.getDocRect();
                var pos = {
                    x:0.5 * (docInfo.width - mySize.width),
                    y:0.5 * (docInfo.height - mySize.height)
                };
                if (typeof value === 'object') {
                    pos = {
                        x:x = value.x >= 0 ? value.x : 0,
                        y:value.y >= 0 ? value.y : 0
                    };
                } else if (!this.getOption('fixed')) {
                    pos = {
                        x:pos.x + docInfo.scrollX,
                        y:pos.y + docInfo.scrollY
                    };
                }
                this.setStyle({
                    'left':pos.x,
                    'top':pos.y
                });
                this.setOption('position', value);
            },
            /**
             * Open the dialog
             * @method open
             */
            open:function () {
                if (!this.opened) {
                    this._$appendToBody();
                    this._$resolveZIndex();
                    this.zIndex++;
                    this._$addToStack();
                    this.setStyle({
                        display:'block',
                        position:this.getOption('fixed') ? 'fixed' : 'absolute',
                        'z-index':this.zIndex
                    });
                    this.setPosition(this.getOption('position'));
                    if (this.getOption('modal')) {
                        app.showOverlay(this);
                    }
                    this.__restoreFocus();
                    this.opened = true;
                    this.trigger('open');
                }
            },
            /**
             * Close the dialog
             * @method close
             */
            close:function () {
                if (this.opened !== false) {
                    this.setStyle({
                        display:'none'
                    });
                    this._$removeFromStack();
                    if (this.getOption('modal')) {
                        app.off('keyup', this.__onKeyUp, this);
                    }
                    var topModal = this.__findTopModal();
                    if (topModal && topModal.getOption('modal')) {
                        app.showOverlay(topModal);
                        topModal.__restoreFocus();
                    } else {
                        app.hideOverlay();
                    }
                    var tooltip = app.getGlobalTooltip();
                    tooltip.hide();
                    //console.dir(this._focusables)
                    //this._focusables && this._focusables[0].focus();
                    this.opened = false;
                    this.trigger('close');
                }
            },
            /**
             * Execute the operation and close the dialog
             * @method execute
             */
            execute:function () {
                this.trigger('execute');
                this.close();
            },
            /**
             * Cancel the operation and close the dialog
             * @method cancel
             */
            cancel:function (inSender, inArgs) {
                this.trigger('cancel');
                this.close();
            },
            destroy:function () {
                this.close();
                this.superMethod(arguments);
            },
            __restoreFocus:function () {
                this.__setFocus(this.getOption('focusIndex'));
            },
            __setFocus:function (index) {
                if (this._focusables && this._focusables.length > index) {
                    this._focusables[index].focus();
                }
                this.setOption('focusIndex', index);
            },
            __prevFocus:function () {
                var index = this.getOption('focusIndex');
                index = index == 0 ? this._focusables.length - 1 : index - 1;
                this.__setFocus(index);
            },
            __nextFocus:function () {
                var index = this.getOption('focusIndex');
                index = index == this._focusables.length - 1 ? 0 : index + 1;
                this.__setFocus(index);
            },
            __getBody:function () {
                return this.body.getAttribute('html');
            },
            __resolveFocusables:function (comp) {
                util.each(comp.children(), function (subComp) {
                    if (!subComp.isPopup) {
                        if (subComp.focusable) {
                            this._focusables.push(subComp);
                        } else {
                            this.__resolveFocusables(subComp);
                        }
                    }
                }, this);
                //var first=;
            },
            __findTopModal:function () {
                var topModal = null;
                var stack = this._$getStack();
                var zIndex = 0;
                util.each(stack, function (popup) {
                    if (popup instanceof ui.Dialog && popup.getOption("modal")) {
                        if (popup.zIndex > zIndex) {
                            zIndex = popup.zIndex;
                            topModal = popup;
                        }
                    }
                });
                return topModal;
            }
        }
    });
    var globalOverlay = ui.createComponent({
        attr:{
            'class':'f-scrim'
        }
    });
    app.register({
        showOverlay:function (target) {
            var overlay = this._overlay;
            this._target = target;
            if (!overlay) {
                overlay = this._overlay = globalOverlay;
                overlay.element.appendTo(dom.getBody());
                app.on('keydown', function (sender, e) {
//                    console.log('keydown!');
                    if (this._target) {
//                        console.log(e);
                        var keys = util.keys;
                        var code = e.keyCode;
                        if (e.hasSystemKey) {
                            return;
                        }
                        switch (code) {
                            case keys.ESCAPE:
                                this._target.getOption('closeable') && this._target.cancel();
                                break;
                            case keys.TAB:
                                //TODO:normalize event bug
                                e.preventDefault();
                                if (e.shiftKey) {
                                    this._target.__prevFocus();
                                } else {
                                    this._target.__nextFocus();
                                }
                                break;
                            default:
                        }
                    }
                }, this);
            }
            overlay.setStyle({
                'display':'block',
                'z-index':(target.zIndex - 1) || 1000
            });
        },
        hideOverlay:function () {
            var overlay = this._overlay;
            this._target = null;
            if (overlay) {
                overlay.setStyle({
                    'display':'none'
                });
            }
        }
    });
})(fruit, fruit.ui, fruit.util, fruit.dom, fruit.util.keys, fruit.io.ajax, fruit.util.i18n, fruit.event.Engine, fruit.Application);
/**
 * Alert dialog
 * @namespace fruit
 * @author ricowang@cisco.com
 * @extends fruit.ui.Dialog
 * @class fruit.ui.Alert
 *
 * Example:
 * fruit.ui.Alert(text, button{text,class,style});
 */
(function(fruit){
    fruit.ui.Alert = function(text, button){
        var alert;
        alert = new fruit.ui.Dialog({
            body:text,
            modal:true,
            resizable:false,
            fixed:true,
            header:"Alert"
        });
        alert.setAttribute('role', 'alert');
        alert.btnCancel.hide();
        if (button){
            if (button.text){
                alert.btnOk.setOption('text', button.text);
            }
            if (button['class']){
                alert.btnOk.setAttribute('class', button['class']);
            }
            if (button['style']){
                alert.btnOk.setAttribute('style', button['style']);
            }
        }
        alert.renderTo();
        alert.open();
        return alert;
    };
})(fruit);
/**
 * confirm dialog
 * @namespace fruit
 * @author ricowang@cisco.com
 * @extends fruit.ui.Dialog
 * @class fruit.ui.Confirm
 *
 * Example:
 * fruit.ui.Confirm(text, executeFunction, cancelFunction, buttons)
 */

(function(fruit){
    fruit.ui.Confirm = function(text, executeFunction, cancelFunction, buttons){
      var confirm;
        confirm = new fruit.ui.Dialog({
            header:"Confirm",
            body: text,
            resizable: false,
            model: true,
            fixed:true,
            listeners:{
                execute: executeFunction,
                cancel: cancelFunction
            }
        });
        confirm.setAttribute('role', 'alertdialog');
        if (buttons){
            if (buttons.execute){
                if (buttons.execute.text){
                    confirm.btnOk.setOption('text', buttons.execute.text);
                }
                if (buttons.execute['class']){
                    confirm.btnOk.setAttribute('class', buttons.execute['class']);
                }
                if (buttons.execute.style){
                    confirm.btnOk.setAttribute('style', buttons.execute.style);
                }
            }
            if (buttons.cancel){
                if (buttons.cancel.text){
                    confirm.btnCancel.setOption('text', buttons.cancel.text);
                }
                if (buttons.cancel['class']){
                    confirm.btnCancel.setAttribute('class',buttons.cancel['class']);
                }
                if (buttons.cancel['style']){
                    confirm.btnCancel.setAttribute('style', buttons.cancel['style']);
                }
            }
        }
        confirm.renderTo();
        confirm.open();
        return confirm;
    };
})(fruit);
(function (fruit, ui, util, dom, keys) {
    /**
     * @class fruit.ui.Loading
     * @namespace fruit
     * @extends fruit.ui.Component
     * @example new fruit.ui.Loading({text:"Loading"});
     */
    fruit.define('fruit.ui.Loading', {
        extend:'fruit.ui.Component',
        view:{
            tag:"span",
            name:'size',
            attr:{
                "class":"f-loading hidden",
                type:"loading",
                role:"loading"
            },
            content:[
                {
                    name:'icon',
                    tag:'i',
                    attr:{
                        'class':'f-loading-img'
                    }
                },
                {
                    name:"text",
                    tag:"span",
                    attr:{
                        "class":"f-loading-text"
                    }
                }
            ]
        },
        options:{
            /*
             * @cfg {String} text
             * Loading text
             * @example Loading image
             */
            text:{
                defaultValue:null,
                acceptTypes:['String', 'Null']
            },
            /*
             * @cfg {Boolean} hashIcon
             * Show loading icon
             */
            hasIcon:{
                defaultValue:true,
                acceptTypes:['Boolean'],
                readOnly:true
            },
            /*
             * @cfg {Number} interval
             * Show set loading interval
             *  @example 10
             */
            interval:{
                defaultValue:40,
                acceptTypes:['Number'],
                readOnly:true
            },
            /*
             * @cfg {String} size
             * Support values are "normal"/"small"
             * set loading size.normal/small
             * @example example
             */
            size:{
                defaultValue:'normal',
                acceptTypes:['String'],
                readOnly:true
            }
        },
        triggers:{
            option:{
                text:{
                    target:'text',
                    action:'setText'
                },
                hasIcon:[
                    {
                        target:'icon',
                        action:'toggleClass',
                        params:['f-loading-img', '#value#']
                    },
                    {
                        action:'toggleClass',
                        params:['', '#value#']
                    }
                ],
                size:{
                    action:'switchClass',
                    params:[
                        '#value#',
                        {
                            'normal':'f-loading-big',
                            'small':''
                        }
                    ]
                },
                event:{}
            }
        },
        methods:{
            init:function () {
                this.setTime = null;
                this.iconNumber = 12;
                this.iconStart = this.iconNumber;
                this.iconStep = 32;
                this.i = 0;
                if (this.getOption('size') === 'small') {
                    this.i = this.iconNumber;
                    this.iconStart = this.iconNumber * 2;
                }
                ;
                this.setStyle({
                    display:'none'
                });
            },
            /**
             * destroy loading object
             */
            destroy:function () {
                this.hide();
                this.superMethod(arguments);
            },
            /**
             * Show loading
             */
            show:function () {
                var callback = fruit.util.bind(this.__rotation, this);
                this.setTime = new fruit.effect.Animator({
                    duration:0,
                    interval:this.getOption('interval')
                });
                this.setTime.start(callback);
                this.setStyle({
                    display:'block'
                });
            },
            /**
             * Hide loading
             */
            hide:function () {
                this.setTime.stop();
                this.setStyle({
                    display:'none'
                });
            },
            __rotation:function () {
                this.i++;

                if (this.i === this.iconStart) {
                    if (this.getOption('size') === 'small') {
                        this.i = this.iconNumber;
                    }
                    else {
                        this.i = 0;
                    }
                }

                this.icon.setStyle("background-position", "0 -" + this.i * this.iconStep + "px");
            }
        }
    })
})(fruit, fruit.ui, fruit.util, fruit.dom, fruit.util.keys);
(function(fruit, ui, util, dom) {

	/**
	 * @class fruit.ui.TabHead
	 * @extends fruit.ui.Component
	 * @ignore
	 */
	fruit.define('fruit.ui.TabHead', {
		extend : 'fruit.ui.Component',
		view : {
			tag : 'li',
			attr : {
				'class' : 'f-tab-item',
				role : 'tab'
			},
			content : [{
				tag : 'a',
				name : 'tabTitle',
				content : '{title}'
			}]
		},
		triggers : {
			event : {
				click : {
					action : '__click'
				},
				keydown : {
					action : '__keyDown'
				}
			}
		},
		methods : {
			__click : function(inSender, inEvent) {
				this.trigger('tabHeadClick', {
					source : this
				});
			},
			active : function() {
				this.addClass('f-tab-item-selected');
				this.tabTitle.setAttribute('tabIndex', 0);
			},
			deactive : function() {
				this.removeClass('f-tab-item-selected');
				this.tabTitle.removeAttribute('tabIndex');
			},
			focusMe : function() {
				this.tabTitle.focus();
			},
			__keyDown : function(inSender, inEvent, inType) {
				this.trigger('keydownInHead', {
					source : this,
					sender : inSender,
					event : inEvent,
					type : inType
				});
			}
		}
	});

	/**
	 * @class fruit.ui.TabPanel
	 * @extends fruit.ui.Component
	 * @ignore
	 */
	fruit.define('fruit.ui.TabPanel', {
		extend : 'fruit.ui.Component',
		view : {
			tag : 'div',
			attr : {
				role : 'tabpanel'
			},
			content : '{content}'
		},
		methods : {
			active : function() {
				this.removeClass('hidden');
				this.addClass('f-tab-content-body');

				var __panel = this.$firstChild;
				if (__panel && __panel.interfaceOf('fruit.ui.IPanel')) {
					__panel.load();
				}
			},
			deactive : function() {
				this.removeClass('f-tab-content-body');
				this.addClass('hidden');
			}
		}
	});

	/**
	 * @class fruit.ui.Tab
	 * @extends fruit.ui.Component
	 * @example
	 <pre><code>
	 var myTab1 = new fruit.ui.Tab({
	 items : [{
	 id : 1,
	 title : 'Tab1',
	 content : '<p>This is Tab-1</p>'
	 }, {
	 id : 2,
	 title : 'Tab2',
	 content : '<p>This is Tab-2</p>'
	 }],
	 defaultActive : 0
	 });
	 </code></pre>
	 */
	fruit.define('fruit.ui.Tab', {
		extend : 'fruit.ui.Component',
		view : {
			tag : 'div',
			attr : {
				'class' : 'f-tab'
			},
			content : [{
				tag : 'ul',
				name : 'tabHeads',
				attr : {
					'class' : 'f-tab-wrap',
					role : 'tablist'
				},
				template : {
					type : 'TabHead'
				}
			}, {
				tag : 'div',
				name : 'tabPanels',
				attr : {
					'class' : 'f-tab-content'
				},
				template : {
					type : 'TabPanel',
					options : {
						hidden : true
					}
				}
			}]
		},
		triggers : {
			option : {
				items : {
					action : 'setModel'
				}
			},
			event : {
				ready : {
					action : '__ready'
				},
				tabHeadClick : {
					source : 'tabHeads',
					action : '__tabHeadClick'
				},
				keydownInHead : {
					action : '__naviKeyDown'
				}
			}
		},
		options : {
			/**
			 * @cfg {Array} items
			 * Tab's model
			 * @example [{id : 1, title : 'Tab1', content : '<p>This is Tab-1</p>'},{id : 2,title : 'Tab2',content : '<p>This is Tab-2</p>'}]
			 */
			items : {
				defaultValue : null,
				acceptTypes : ['Array', 'Null']
			},

			/**
			 * @cfg {Number} defaultActive
			 * Tab's default active index, default value is 0.
			 * @example 0
			 */
			defaultActive : {
				defaultValue : 0,
				acceptTypes : ['Number']
			}
		},
		methods : {
			/**
			 * set model for the tab
			 * @param {Array} model
			 * @param {String} path
			 * @ignore
			 */
			setModel : function(model, path) {
				var vmc = new fruit.ui.data.ViewModelCollection(model);
				this.superMethod([vmc], path);
			},

			/**
			 * add a panel.
			 * @param {Object} tabPanel
			 * @param {Number} index
			 * @example [{"tabPanel": {id : 3, title : 'Tab3', content : '<p>This is my added Tab</p>'}, "index":2}]
			 */
			addPanel : function(tabPanel, index) {
				if (tabPanel) {
					var len = this.getModel().length;
					if (!index || index > len) {
						index = len;
					}
					this.model.insertItem(tabPanel, index);

					if (index <= this.activePanelIndex) {
						this.activePanelIndex++;
					}
				}
			},

			/**
			 * remove a panel.
			 * @param {Number} index
			 * @example 1
			 */
			removePanel : function(index) {
				var len = this.getModel().length;
				if (index < len && index >= 0) {
					this.model.removeItemAt(index);
					var activeIndex = this.activePanelIndex;
					if (index <= this.activePanelIndex) {
						if (index == 0 && this.activePanelIndex == 0) {
							activeIndex = 0;
							this.activePanelIndex = 1;
						} else {
							activeIndex = this.activePanelIndex - 1;
						}
					}
					this.active(activeIndex);
				}
			},

			__ready : function() {
				this.activePanelIndex = this.getOption('defaultActive');
				var len = this.getModel().length;
				if (this.activePanelIndex >= len || this.activePanelIndex < 0) {
					util.logger.error("Option defaultActive set error.");
					this.activePanelIndex = 0;
				}
				this.__activeTabHead(this.activePanelIndex, true);
				this.__activeTabPanel(this.activePanelIndex);
			},

			__tabHeadClick : function(sender, event) {
				if (event.source.$parent == this.tabHeads) {
					var activePanelIndex = event.source.getIndex();
					if (activePanelIndex != this.activePanelIndex) {
						this.active(activePanelIndex);
					}
				}
			},

			/**
			 * active a panel by index.
			 * @param {Number} index
			 * @example 1
			 */
			active : function(index) {
				if (index != this.activePanelIndex) {
					this.__deactiveTabHead(this.activePanelIndex);
					this.__deactiveTabPanel(this.activePanelIndex);

					this.activePanelIndex = index;

					this.__activeTabHead(index);
					this.__activeTabPanel(index);
				}
			},

			/**
			 * active the previous tab panel
			 */
			prev : function() {
				if (this.activePanelIndex > 0) {
					this.active(this.activePanelIndex - 1);
				}
			},

			/**
			 * active the nex tab panel
			 */
			next : function() {
				var maxIndex = this.getModel().length - 1;
				if (this.activePanelIndex < maxIndex) {
					this.active(this.activePanelIndex + 1)
				}
			},

			/**
			 * active the first tab panel
			 */
			first : function() {
				if (this.activePanelIndex != 0) {
					this.active(0);
				}
			},

			/**
			 * active the last tab panel
			 */
			last : function() {
				var maxIndex = this.getModel().length - 1;
				if (this.activePanelIndex != maxIndex) {
					this.active(maxIndex);
				}
			},

			__activeTabHead : function(index, initialize) {
				var activePanelHead = this.tabHeads.childAt(index);
				if (activePanelHead) {
					activePanelHead.active();
					if (!initialize) {
						activePanelHead.focusMe();
					}
				}
			},

			__activeTabPanel : function(index) {
				var activePanle = this.tabPanels.childAt(index);
				if (activePanle) {
					activePanle.active();
				}
			},

			__deactiveTabHead : function(index) {
				var deactivePanelHead = this.tabHeads.childAt(index);
				if (deactivePanelHead) {
					deactivePanelHead.deactive();
				}
			},

			__deactiveTabPanel : function(index) {
				var deactivePanel = this.tabPanels.childAt(index);
				if (deactivePanel) {
					deactivePanel.deactive();
				}
			},

			__naviKeyDown : function(sender, params) {
				if (params.source.$parent == this.tabHeads) {
					var ev = params.event;
					if (ev.ctrlKey || ev.altKey) {
						return;
					}
					switch(ev.keyCode) {
						case util.keys.LEFT_ARROW :
							this.prev();
							break;
						case util.keys.RIGHT_ARROW :
							this.next();
							break;
						case util.keys.HOME :
							this.first();
							break;
						case util.keys.END :
							this.last();
							break;
						default :
							break;
					}
				}
			}
		}
	});

})(fruit, fruit.ui, fruit.util, fruit.dom);
(function (fruit, app, position, ui, util, dom, keys) {
    fruit.define('fruit.ui.TooltipDialog', {
        extend:'fruit.ui.Popup',
        view:{
            attr:{
                'class':'f-tooltip f-tooltip-dialog',
                'style':{
                    'left':20,
                    'top':30
                }
            },
            content:[
                {
                    name:'content',
                    tag:'span',
                    attr:{
                        'class':'f-tooltip-text'
                    },
                    content:{
                        name:'list',
                        type:'List'
                    }
                }
            ]
        },
        options:{
            items:{
                defaultValue:null,
                acceptTypes:['Object', 'Array', 'Null']
            },
            direction:{
                defaultValue:'top',
                acceptTypes:['String']
            },
            'position':{
                defaultValue:null,
                acceptTypes:['Object','Null']
            },
            content:{
                defaultValue:null,
                acceptTypes:['String','Object','Null']
            }
        },
        triggers:{
            option:{
                items:{
                    target:'list',
                    action:'setOption',
                    params:['items', '#value#']
                },
                direction:{
                    action:'switchClass',
                    params:[
                        '#value#',
                        {
                            'top':'f-tooltip-top',
                            'tl':'f-tooltip-top-left',
                            'tr':'f-tooltip-top-right',
                            'right':'f-tooltip-right',
                            'rt':'f-tooltip-right-top',
                            'rb':'f-tooltip-right-bottom',
                            'bottom':'f-tooltip-bottom',
                            'bl':'f-tooltip-bottom-left',
                            'br':'f-tooltip-bottom-right',
                            'left':'f-tooltip-left',
                            'lt':'f-tooltip-left-top',
                            'lb':'f-tooltip-left-bottom'
                        }
                    ]
                },
                'position':{
                    action:'setPosition',
                    params:'#value#'
                },
                content:{
                    target:'content',
                    action:'setContent',
                    params:'#value#'
                }
            }
        },
        methods:{
            show:function () {
                this.setStyle({
                    'display':'block'
                });
            },
            hide:function () {
                this.setStyle({
                    'display':'none'
                });
            },
            setPosition:function(inPosition){
                var pos=inPosition || { x:0, y:0};
                this.setStyle({
                    left:pos.x,
                    top:pos.y
                })
            }
        }
    });
})(fruit, fruit.Application, fruit.dom.position, fruit.ui, fruit.util, fruit.dom, fruit.util.keys);
(function (fruit, ui, util, dom, keys) {
    fruit.define('fruit.ui.TreeNode', {
        extend:'fruit.ui.Component',
        view:{
            tag:'li',
            attr:{
                'class':'f-tree-item f-tree-item-open'

            },
            content:[
                {
                    name:"container",
                    attr:{
                        'class':'f-tree-item-container'

                    },
                    tag:"a",
                    content:[
                        {
                            name:'arrow',
                            tag:'span',
                            attr:{
                                'class':'f-tree-item-arrow'
                            }
                        },
                        {
                            name:'icon',
                            tag:'span',
                            attr:{
                                'class':'f-tree-item-file'
                            }
                        },
                        {
                            name:'text',
                            tag:'span',
                            attr:{
                                'class':'f-tree-item-text'
                            },
                            content:'{title}'
                        }
                    ]
                },
                {
                    tag:"ul",
                    attr:{
                        'class':'f-tree-wrap'
                    },
                    model:'{node}',
                    template:{
                        type:"fruit.ui.TreeNode"
                    }

                }
            ]
        },
        triggers:{
            event:{
                'click':[
                    {
                        source:"container",
                        action:'__selfClick'
                    },
                    {
                        source:'arrow',
                        action:'__arrowClick'
                    }
                ]
            }
        },
        methods:{
            itemClick:function () {
                if (this.container.hasClass('f-tree-item-container-folder')) {
                    this.arrowClick();
                }
                this.trigger('itemClick', {
                    value:this.getModel().value,
                    item:this
                });
            },
            arrowClick:function () {
                if (!this.hasClass('f-tree-item-open')) {
                    this.addClass('f-tree-item-open');
                } else {
                    this.removeClass('f-tree-item-open');
                }
            },
            __selfClick:function (inSender, args) {
                //conole.log(2);
                this.itemClick();
                args.routing = 'none';
            },
            __arrowClick:function (inSender, args) {
                this.arrowClick();
                //conole.log(args);
                args.routing = 'none';
            },
            syncModel:function () {
                this.superMethod(arguments);
                var model = this.getModel();
                if (model.node && model.node.length != 0) {
                    this.container.addClass("f-tree-item-container-folder");
                    this.setAttribute("role","group")
                }else{
                    this.setAttribute("role","treeitem");
                }
                if (model.iconClass) {
                    this.icon.setClass(model.iconClass);
                }
            }
        }
    });
    /**
     * @class fruit.ui.Tree
     * This is basic tree component
     * @extends fruit.ui.Component
     * @example
     <pre><code>
     var tree = new fruit.ui.Tree({
        items:[
            {"title":"Blue", "value":"blue", "node":[
                {"title":"Dark Blue", "value":"100"},
                {"title":"Light Blue", "value":"50", "node":[
                    {"title":"Lighter", "value":"40"},
                    {"title":"Lightest", "value":"30", "iconClass":"icon-monitoring-x18"}
                ]}
            ]},
            {"title":"MyIcon", "value":"icon", "iconClass":"icon-global-x18"}
        ]
    });
     tree.on('itemClick', function (inSender, args) {
        alert(args.value);
    });
     tree.renderTo("tree1");
     </code></pre>
     */
    fruit.define('fruit.ui.Tree', {
        extend:'fruit.ui.Component',
        view:{
            attr:{
                'class':'f-tree',
                'tabIndex':"0",
                'role':'tree'
            },
            content:[
                {
                    tag:"ul",
                    attr:{
                        'class':'f-tree-wrap'
                    },
                    name:"treeRoot",
                    model:'{@self}',
                    template:{
                        type:"fruit.ui.TreeNode"
                    }
                }
            ]
        },
        triggers:{
            option:{
                items:{
                    action:'setModel'
                }
            },
            event:{
                "itemClick":{
                    action:'__itemClick'
                },
                "focus":{
                    action:'__focus'
                },
                'keydown':{
                    action:'__onKeyDown'
                },
                'click':{
                    action:'__click'
                }
            }
        },
        options:{
            /**
             * @cfg {Array} items
             * Tree's model
             * @example [{"title":"Blue","value":"blue","node":[{"title":"Dark Blue","value":"100"},{"title":"Light Blue","value":"50","node":[{"title":"Lighter","value":"40"},{"title":"Lightest","value":"30","iconClass":"icon-monitoring-x18"}]}]},{"title":"MyIcon","value":"icon","iconClass":"icon-global-x18"}]
             */
            items:{
                defaultValue:null,
                acceptTypes:['Array', 'Null']
            }
        },
        methods:{
            __getCurrentItemIndex:function (item) {
                for (var i = 0; i < this.itemlist.length; i++) {
                    if (this.itemlist[i].$id == item.$id) {
                        return i;
                    }
                }
            },
            __click:function (sender, args) {
                //conole.log(args);
                args.routing = 'none';
            },
            __itemClick:function (sender, args) {
                this.__selectItem(args.item);
            },
            setModel:function () {
                this.superMethod(arguments);
                var tempAry = [];
                this.traverse(function (node) {
                    if (node instanceof  fruit.ui.TreeNode) {
                        tempAry.push(node);
                    }
                });
                this.itemlist = tempAry;
            },
            __onKeyDown:function (target, event) {
                if (this.getOption('disabled')) {
                    return;
                }
                var code = event.keyCode;
                if (event.hasSystemKey) {
                    return;
                } else {
                    switch (code) {
                        case keys.UP_ARROW:
                            this.prevItem();
                            event.preventDefault();
                            break;
                        case keys.LEFT_ARROW:
                            this.__leftItemAction();
                            event.preventDefault();
                            break;
                        case keys.DOWN_ARROW:
                            this.nextItem();
                            event.preventDefault();
                            break;
                        case keys.RIGHT_ARROW:
                            this.__rightItemAction();
                            event.preventDefault();
                            break;
                        case keys.SPACE:
                            this.executeSelectedItem();
                            event.preventDefault();
                            break;
                        case keys.ENTER:
                            this.executeSelectedItem();
                            event.preventDefault();
                            break;
                    }
                }
            },
            __leftItemAction:function () {
                var item = this.__getCurrentItem();
                var type = this.__getItemType(item);
                var parentItem = item.$parent.$parent;
                if (type == "folder") {
                    if (item.hasClass('f-tree-item-open')) {
                        item.removeClass('f-tree-item-open');
                    } else if (!parentItem.hasClass("f-tree")) {
                        this.__selectItem(parentItem);
                    }
                } else if (type == "file") {
                    if (!parentItem.hasClass("f-tree")) {
                        this.__selectItem(parentItem);
                    }
                }
            },
            __rightItemAction:function () {
                var item = this.__getCurrentItem();
                var type = this.__getItemType(item);
                var parentItem = item.$parent.$parent;
                if (type == "folder") {
                    if (item.hasClass('f-tree-item-open')) {
                        this.nextItem();
                    } else {
                        item.addClass('f-tree-item-open');
                    }
                }
            },
            /**
             *
             */
            nextItem:function () {
                var item, itemIndex;
                for (var i = this.currentItemIndex + 1 || 0; i < this.itemlist.length; i++) {
                    var _item = this.itemlist[i];
                    //conole.log(_item.$parent.getStyle("display"));
                    //conole.log(_item.getStyle("display"));
                    if (_item.$parent.getStyle("display") != "none") {
                        item = _item;
                        itemIndex = i;
                        break;
                    }
                }
                this.__selectItem(item, itemIndex);
            },
            /**
             *
             */
            prevItem:function () {
                var item, itemIndex;
                for (var i = this.currentItemIndex - 1 || 0; i >= 0; i--) {
                    var _item = this.itemlist[i];
                    if (_item.$parent.getStyle("display") != "none") {
                        item = _item;
                        itemIndex = i;
                        break;
                    }
                }
                this.__selectItem(item, itemIndex);
            },
            /**
             *
             */
            executeSelectedItem:function () {
                var item = this.__getCurrentItem();
                item.itemClick();

            },
            __focus:function (sender, args) {
                util.delay(0.2, function () {
                    this.__getCurrentItem();
                }, this);
            },
            __getItemType:function (item) {
                if (item.container.hasClass('f-tree-item-container-folder')) {
                    return "folder"
                } else {
                    return "file"
                }
            },
            __getCurrentItem:function () {
                if (util.isUndef(this.currentItem)) {
                    this.__selectItem();
                }
                return this.currentItem;
            },
            __selectItem:function (item, index) {
                if (this.currentItem) {
                    this.currentItem.removeClass("f-tree-item-selected");
                }
                if (util.isUndef(item)) {
                    item = this.itemlist[0];
                    index = 0;
                }
                this.currentItem = item;
                this.currentItemIndex = index || this.__getCurrentItemIndex(item);
                this.currentItem.container.focus();
                this.currentItem.addClass("f-tree-item-selected");
            }
        }
    });
})(fruit, fruit.ui, fruit.util, fruit.dom, fruit.util.keys);
/**
 * Notification
 * @namespace fruit
 * @author kanyu@cisco.com
 * @extends fruit.ui.Component
 * @class fruit.ui.Notification
 *
 * Example:
 * fruit.ui.Notification({
 * 	message : 'Demo Notification Text!'
 * });
 */
(function(fruit, util, app) {
	fruit.define('fruit.ui.Notification', {
		extend : 'fruit.ui.Component',
		view : {
			tag : 'div',
			attr : {
				'class' : 'f-notice'
			},
			content : {
				tag : 'span',
				name : 'noticeSpan',
				content : [{
					tag : 'span',
					name : 'message',
					content : '{message}',
					attr : {
						'class' : 'f-notice-text'
					}
				}, {
					tag : 'a',
					name : 'closeIcon',
					attr : {
						'href' : 'javascript:;',
						'class' : 'icon-close-x16'
					}
				}]
			}
		},
		triggers : {
			event : {
				ready : {
					action : '__ready'
				},
				click : [{
					source : 'closeIcon',
					action : '__closeNotice'
				}]
			}
		},
		options : {
			/**
			 * @cfg {String} type
			 * type of notification. Support 'confirm'/'alert'/'error'. Default value is 'confirm'.
			 */
			type : {
				defaultValue : 'confirm',
				acceptTypes : ['String', 'Null']
			},

			/**
			 * @cfg {String} message
			 * notification message. Default value is ''.
			 */
			message : {
				defaultValue : '',
				acceptTypes : ['String', 'Null']
			},

			/**
			 * @cfg {Boolean} hasIcon
			 * whether notification has type icon. Default value is false.
			 */
			hasIcon : {
				defaultValue : false,
				acceptTypes : ['Boolean', 'Null']
			},

			/**
			 * @cfg {Boolean} hasClose
			 * whether notification has close icon. Default value is true.
			 */
			hasClose : {
				defaultValue : true,
				acceptTypes : ['Boolean', 'Null']
			},

			isGlobal : {
				defaultValue : false,
				acceptTypes : ['Boolean', 'Null']
			},

			/**
			 * @cfg {Number} autoClose
			 * Auto close timer(ms). 0 : no autoClose. Default value is 0.
			 */
			autoClose : {
				defaultValue : 0,
				acceptTypes : ['Number', 'Null']
			}
		},
		methods : {
			init : function() {
				this.autoCloseTimer = null;

				//In global notification, click in blank document after this period time may hide the component.
				this.minStayTime = 3000;
			},
			__ready : function() {
				var me = this;
				var type = this.getOption('type').toLowerCase();
				var noticeSpan = this.noticeSpan;
				switch(type) {
					case 'confirm' :
						noticeSpan.addClass('f-confirmation');
						break;
					case 'alert':
						noticeSpan.addClass('f-alert');
						break;
					case 'error':
						noticeSpan.addClass('f-error');
						break;
					default :
						break;
				}

				this.message.setText(this.getOption('message'));

				if (this.getOption('hasIcon')) {
					this.addClass('f-notice-icon');
				}
				if (this.getOption('hasClose')) {
					this.addClass('f-notice-close');
				}
				if (this.getOption('isGlobal')) {
					this.__initGlobalNotice();
				}

				var autoCloseMs = this.getOption('autoClose');
				if (autoCloseMs > 0) {
					me.autoCloseTimer = setTimeout(function() {
						me.__closeNotice();
					}, autoCloseMs);
				}
			},

			__initGlobalNotice : function() {
				var me = this;
				this._showTimer = new Date();
				this.addClass('f-notice-top');
				var outerWidth = this.getBound().width;
				//var outerWidth = parseInt(this.getStyle('width'));
				this.setStyle('marginLeft', outerWidth * (-0.5));
				this.__onGlobalEvent();
			},

			__blankClick : function(sender, e) {
				if (e && e.target) {
					var containerEle = this.getElement();
					var target = e.target;
					//if e.target is a component
					if (target.getElement) {
						if (target !== containerEle && (!containerEle.contains(target.getElement())) && (new Date() - this._showTimer > this.minStayTime)) {
							this.__hideGlobalNotice();
						}
					} else {
						if (target !== containerEle && (!containerEle.contains(target)) && (new Date() - this._showTimer > this.minStayTime)) {
							this.__hideGlobalNotice();
						}
					}
				}
			},

			__closeNotice : function() {
				if (this.getOption('isGlobal')) {
					this.__hideGlobalNotice();
					return;
				}

				if (this.autoCloseTimer) {
					clearTimeout(this.autoCloseTimer);
				}
				this.destroy();
			},

			__hideGlobalNotice : function() {
				if (this.hasRender) {
					//remove event
					this.__unGlobalEvent();

					this.hide();
					this.hasRender = false;
				}
			},

			__showGlobalNotice : function() {
				this.hasRender = true;
				this.show();

				//add event
				this.__onGlobalEvent();
			},

			__onGlobalEvent : function() {
				app.on('click', this.__blankClick, this);
			},

			__unGlobalEvent : function() {
				app.off('click', this.__blankClick, this);
			}
		}
	});

	/**
	 * @class fruit.ui
	 * @namespace fruit.ui
	 * @singleton
	 */
	util.extend(fruit.ui, {
		globalNotice : null,

		/**
		 * global notify
		 * @param {Object} options
		 */

		/**
		 * @cfg {String} message
		 * message shown in global notification
		 */
		notify : function(options) {
			options = util.extend({}, options);
			options.isGlobal = true;
			if (!fruit.ui.globalNotice) {
				fruit.ui.globalNotice = new fruit.ui.Notification(options);
				fruit.ui.globalNotice.renderTo();
				fruit.ui.globalNotice.hasRender = true;
			} else {
				fruit.ui.globalNotice.message.setText(options.message);
				if (!fruit.ui.globalNotice.hasRender) {
					fruit.ui.globalNotice.__showGlobalNotice();
				}
			}
		}
	});
})(fruit, fruit.util, fruit.Application);
(function (fruit, util, engine, window) {
    /**
     * @singleton
     * @mixins fruit.Observable
     * @class fruit.Router
     * This is router component, you could register you router mao and it monitor url change , when it is changed it execute the registered function.
     * Example
     * <pre><code>
     *     var router = fruit.Router;
     router.registerRouteMap({
                                "login":{
                                    "leave":this._loginLeave,
                                    "enter":this._loginEnter
                                },
                                "detail":{
                                    "leave":this._detailLeave,
                                    "enter":this._detailEnter
                                },
                                "main":this._main,
                                "/^reg/":this.__reg
                            }, this);
     router.setDefault("login");
     router.on("HashChange", this.__log);
     router.start();
     * </code></pre>
     *
     */
    /**
     * @event HashChange
     * When url changed , it will execute the registered function.
     */
    fruit.define('fruit.Router', {
        singleton:true,
        mixins:'fruit.Observable',
        methods:{
            routerMap:{},
            routerRegMap:[],
            init:function () {
                var self = this;
                this.__isStart = false;
                if (util.isIE) {
                    setInterval(function () {
                       //console.log(util.getURL());
                        //console.log(self.__prevURL);
                        if (self.__isStart && (util.getURL() !== self.__prevURL)) {
                            self.__checkURL();
                        }
                    }, 300);
                } else {
                    engine.addEvent(window, "hashchange", function () {
                        self.__checkURL();
                    })

                }
//
//                fruit.addEvent(window, "load", function () {
//                    self.__checkURL();
//                }, false);
            },
            /**
             * Register router map
             * @param {Object|String} map  it could be a string or a object with two key "enter" and "leave"
             * @param {Object} scope  context
             */
            registerRouteMap:function (map, context) {
                if (map) {
                    for (var i in map) {
                        if (i.substr(0, 1) == "/") {
                            this.routerRegMap.push([i.substr(1, i.length - 2), map[i]]); //Reg router map
                        } else {
                            this.routerMap[i] = map[i];
                        }
                    }
                }
                this.routerContext = context;
            },
            /**
             * Set default router , the router must be registered.
             * @param {String} defaultRouter
             */
            setDefault:function (defaultRouter) {
                this.__defaultRouter = defaultRouter;
                if (!this.routerMap[defaultRouter]) {
                    throw "Please define default router";
                }
            },
            /**
             * Start router manual
             */
            start:function () {
                this.__isStart = true;
                this.__checkURL();
            },
            /**
             * Get the current hash map
             * @return {Object|String}
             */
            getHash:function () {
                return  this.__prevRouterHash || "";
            },
            __checkURL:function () {

                //console.log("__checkURL");
                var hash = this.__parserHash();
                var __currentRegObj = this.__getCurrentRouterObj(hash.router);
                this.__callRouterMethod(__currentRegObj, hash);
                this.trigger("HashChange", {
                    hash:hash
                }, this.routerContext);
            },
            __getCurrentRouterObj:function (router) {
                if (this.routerMap[router]) {
                    return this.routerMap[router];
                }
                for (var i = 0; i < this.routerRegMap.length; i++) {
                    if (new RegExp(this.routerRegMap[i][0]).test(router)) {
                        return this.routerRegMap[i][1];
                    }
                }
                if (router === '' && this.__defaultRouter) {
                    return this.routerMap[this.__defaultRouter];
                }
                return "";
            },
            __callRouterMethod:function (inRouterObj, hash) {
                //console.log("__callRouterMethod");
                this.__callPrevRouterMethod(hash);
                this.__callCurrentRouterMethod(inRouterObj, hash);
            },
            __callPrevRouterMethod:function (hash) {
                var prevRoute = this.__prevRouterObj;
                if (util.isObject(prevRoute) && prevRoute.leave) {
                    return prevRoute.leave.call(this.routerContext, this.__prevRouterHash, hash) !== false;
                }
                return true;
            },
            __callCurrentRouterMethod:function (inRouterObj, hash) {
                //console.log("__callCurrentRouterMethod");
                if (fruit.util.isObject(inRouterObj) && inRouterObj.enter) {
                    this.__prevRouterHash = hash;
                    this.__prevRouterObj = inRouterObj;
                    inRouterObj.enter.call(this.routerContext, hash);
                } else {
                    this.__prevRouterHash = hash;
                    this.__prevRouterObj = inRouterObj;
                    if (inRouterObj != "") {
                        inRouterObj.call(this.routerContext, hash);
                    }

                }

            },
            __parserHash:function () {
                var url = this.__prevURL = util.getURL();
                var rootURL = this.rootURL = util.baseURL();
                var hash = util.getURLHash();
                if (hash != "") {
                    // if hash has "/"
                    if (/\//.test(hash)) {
                        var hashAry = hash.split("/");
                        return {
                            'router':hash.substring(0, hash.indexOf("/")),
                            'params':hash.substr(hash.indexOf("/") + 1)
                        }
                    } else {
                        return {
                            'router':hash,
                            'params':[]
                        }
                    }

                } else {
                    this.rootURL = url;
                    return {
                        'router':'',
                        'params':[]
                    }
                }
            },
            redirect:function (router, params) {
                if (this.__callPrevRouterMethod({'router':router, 'params':params})) {
                    this.__prevRouterHash = "";
                    window.location.href = this.rootURL + '#' + router + (params ? "/" + params : "");
                }
            }
        }

    })
})(fruit, fruit.util, fruit.event.Engine, window);
/**
 * @class fruit.Frame
 * @namespace fruit
 * @mixins fruit.Observable
 * @singleton
 * @extends fruit
 * need refresh page remove trigger window hash change.
 * after refresh unlock
 */
(function (fruit, util) {
    var
        HASH_CHANGE = 'hashChange',
        BEFORE_REFRESH = 'beforerefresh',
        AFTER_REFRESH = 'afterrefresh',
        LOCK_MSG = 'lockmsg',
        _bind = fruit.util.bind,
        _moduleEvent = {},
        _lockcount = 0,
        _this,
        _holdLink,
        _anchor = '_anchor',
        _bodyRefreshCount = 0,
        _dom = fruit.dom,
        _addScript = function (urls) {
            var num = urls.length, i = 0, scriptfunction = '';

            if (num === 0) {
                return;
            }
            (function loadScript() {
                function loadNextScript() {
                    i++;
                    if (i < num) {
                        loadScript();
                    }
                }

                if (!urls[i].inline) {
                    fruit.io.load.script(urls[i].url, loadNextScript, loadNextScript);
                } else {
                    scriptfunction = urls[i].url;
                    // $("<script/>").html(scriptfunction).appendTo(_this.option.bodyID);
                    if (scriptfunction) {
                        fruit.io.load.script(scriptfunction, null, null, true);
                    }
                    loadNextScript();
                }
            })();
        },
        _getBody = function (data) {
            var content = [], contentIndex = 0, scripts = [],
            //data = data.replace(/[\r\n\t]/g, ''),
                reg = /<script(.*?)>/ig, match, matchValue, endScript, innerMatch;
            lastEndScriptIndex = -1;
            while (match = reg.exec(data)) {
                // http://stackoverflow.com/questions/1659749/script-tag-in-javascript-string
                // It's not right to contains "</script>" in the script tag, because the browser HTML parser will see the </script> within the string and it will interpret it as the end of the script element.
                if (match.index < lastEndScriptIndex) {
                    continue;
                }
                content.push(data.substring(contentIndex, match.index));
                contentIndex = reg.lastIndex;
                matchValue = match[1];
                if (innerMatch = /src="(.*?)"/i.exec(matchValue)) {
                    scripts.push({
                        url:innerMatch[1],
                        inline:false
                    });
                    if (matchValue.charAt(matchValue.length - 1) !== '/') {
                        endScript = _findEndScriptTag(contentIndex, data);
                        contentIndex = endScript[1];
                    }
                } else {
                    endScript = _findEndScriptTag(contentIndex, data);
                    scripts.push({
                        url:endScript[0],
                        inline:true
                    });
                    contentIndex = endScript[1];
                }
            }
            content.push(data.substr(contentIndex));

            return {
                content:content.join(''),
                scripts:scripts
            };
        },
        _findEndScriptTag = function (startIndex, data) {
            var endScriptIndex = data.indexOf('</script>', startIndex);
            lastEndScriptIndex = endScriptIndex + '</script>'.length;
            return [data.substring(startIndex, endScriptIndex), lastEndScriptIndex];
        },

        _afterRefresh = function (data) {
            _html(data);

            //Goto anchor
            _gotoAnchor();

            _this.trigger(AFTER_REFRESH);
        },
		
		_afterRefreshError = function(){
			_resetEvents();
			if (typeof _this.option.ajaxError === "function"){
				return _this.option.ajaxError;
			}
		},
		
        _beforeRefresh = function () {
            if (_this.trigger(BEFORE_REFRESH) === false) {

            }
            _resetEvents();
        },
        _resetEvents = function() {
            util.each(_moduleEvent, function (fn, name) {
                _this.off(name, fn);
            });
        },
        _gotoAnchor = function () {
            var params = fruit.util.getURLParams(),
                value = params[_anchor];
            if (value) {
                //var offset = _dom.offset('a[name=' + value + ']');
                var offset = $('a[name=' + value + ']').offset();
                if (offset) {
                    window.scrollTo(0, offset.top);
                }
            }
        },
        _html = function (data, ele) {
            var html = _getBody(data);
            ele = ele || _this.option.bodyID;
            $(ele).empty();
            $(html.content).appendTo(ele);
            _addScript(html.scripts);
        },
        _ajax = function (url) {
            fruit.io.ajax({
                url:url,
                type:_this.option.ajaxType||'POST',
                success:_afterRefresh,
                error:_afterRefreshError
            });
        };

    /**
     * @event hashchange
     * Fire hash change method.
     */
    /**
     * @event beforerefresh
     * Fire when page before fresh method.
     */
    /**
     * @event afterrefresh
     * Fire when page after fresh method.
     */
    /**
     * @event lockmsg
     * Fire when page lock fire lockmsg.
     */
    fruit.define('fruit.Frame', {
        mixins:'fruit.Observable',
        singleton:true,
        entity:{
            lockMessage:{},
            lockFn:{},
            option:{
                /*
                 * @cfg {string} user custom ajax url with html or api.
                 * Toggle mockup
                 */
                mockup:'',
                /*
                 * @cfg {String} bodyID
                 * Refresh page body content id
                 */
                bodyID:null,
                /*
                 * @cfg {string} defaultUrl
                 * Defined home default url
                 */
                defaultUrl:null,
                /*
                 * @cfg {Integer} pageFreshFrequency
                 * Defined page hash change number auto refresh body.
                 */
                pageFreshFrequency:20
            },
            /*
             * Bind and trigger hash change method.
             * @param {Object} config
             */
            run:function (option) {
                this.option = util.extend(this.option, option);
                _this = this;
                this.on(option.listeners);
                var router = fruit.Router;
                this.beforeUrl = fruit.util.getURL();
                router.on(HASH_CHANGE, _bind(this.onHashChange, this));
                router.start();
            },
            /*
             * hash change get url for mockup or devsite.
             */
            onHashChange:function () {
                var url = fruit.util.getURLHash() || this.option.defaultUrl;
                if (typeof this.option.ajaxUrl === "function") {
                    url = this.option.ajaxUrl();
                }
                else {
                    url = fruit.util.baseURL() + url;
                }

                var self = this;
                //hold hash change when user return false;
                 //_this.trigger(HASH_CHANGE, [_this.module()], null, true);
                if (this.trigger(HASH_CHANGE, [{
                    module :this.module(),
                    feature:this.feature(),
                    params:fruit.util.getURLParams(),
                    afterUrl:fruit.util.getURL(),
                    isFeatureChange:(function(){
                        if (self.moduleFeature(self.beforeUrl) === self.moduleFeature()){
                            return false;
                        }else{
                            return true;
                        }
                    })(),
                    beforeUrl:this.beforeUrl
                    }], null, true) === false)
                {
                    return false;
                }
                this.refreshBody(url);
            },           
            /*
             * set html content
             * @param content {string}
             * @param ele {string}
             */
            html:_html,
            /*
             * Refresh body render content and check lock and anchor.
             * @param {Object} url
             */
            refreshBody:function (url) {
                //check trigger lock method.
                if (fruit.util.getURLHash() === _holdLink) {
                    return;
                }

                //check lock count
                if (_lockcount > 0) {
                    this.trigger(LOCK_MSG);
                    return;
                }

                if (_bodyRefreshCount >= this.option.pageFreshFrequency) {
                    window.location.reload(true);
                    return;
                }

                _beforeRefresh();
                _ajax(url);

                _bodyRefreshCount++;

            },
            /**
             * set anchor get by hash.
             * @param {Object} value
             */
            anchor:function (value) {
                if (value) {
                    var params = fruit.util.getURLParams();
                    params[_anchor] = value;
                    var hash = fruit.util.generateURLString(params);
                    window.location.hash = hash;
                    _gotoAnchor();
                }
            },
            /**
             * Get module and feature value.
             */
            moduleFeature:function (url) {
                var hash = fruit.util.getURLHash(url) || this.option.defaultUrl;
                if (/\?/.test(hash)) {
                    hash = hash.substr(0, hash.indexOf('?'));
                }
                return hash;
            },
            /*
             * Get module value.
             */
            module:function (url) {
                var params = this.moduleFeature(url);
                return params.split('/').slice(1, 2).join('');
            },
            /*
             * Get feature value for url.
             */
            feature:function (url) {
                /*
                if (feature) {
                    window.location.hash = '#/' + this.module() + '/' + feature;
                    return;
                }*/
                if (this.moduleFeature(url)) {
                    var params = this.moduleFeature(url).split('/');
                    if (params.length > 2) {
                        return params.slice(2, 3)[0];
                    } else {
                        return '';
                    }
                }
            },
            /*
             * Set lock method and message.
             * @param {Object} key
             * Add lock key value.
             * @param {Object} msg
             * Add lock message value.
             * @param {Object} fn
             * Add lock function.
             */
            lock:function (key, msg, fn) {
                if (this.lockMessage[key] === undefined) {
                    _lockcount++;
                }
                this.lockMessage[key] = msg;
                if (fn) {
                    this.lockFn[key] = fn;
                }
                _holdLink = fruit.util.getURLHash();
            },
            /*
             * remove lock by key.
             * @param {Object} key
             */
            unlock:function (key) {
                if (!key) {
                    _lockcount = 0;
                    this.lockMessage = {};
                    this.lockFn = {};
                    
                    //this.onHashChange();
                }
                if (typeof this.lockMessage[key] != 'undefined') {
                    _lockcount--;
                    delete this.lockMessage[key];
                    delete this.lockFn[key];
                }
                _holdLink = null;
            },
            /*
             * Check hold method.
             */
            hold:function () {
                if (_holdLink) {
                    window.location.hash = _holdLink;
                }
            },
            /*
             * Bind between module change method.
             * @param {Object} eventName
             * @param {Object} fn
             * @param {boolean} removeBetweenModuleChange
             */
            on:function (eventName, fn, removeBetweenModuleChange) {
                if (util.isObject(eventName)) {
                    return this.superMethod(arguments);
                }
                if (removeBetweenModuleChange === true) {
                    _moduleEvent[eventName] = fn;
                }
                this.superMethod([eventName, fn]);
            }
        }
    });
})(fruit, fruit.util);

(function (fruit, util, engine, window) {
    /**
     * @singleton
     * @mixins fruit.Observable
     * @class fruit.Cookie
     * Set or get cookie by js
     *
     * <pre><code>
     console.log(">>>Set")
     fruit.Cookie.setCookie("Name","Abu",15);
     fruit.Cookie.setCookie("Sex","Male",15);
     console.log(">>>Get")
     console.log(fruit.Cookie.getCookie("Name"));
     console.log(fruit.Cookie.getCookie("Sex"));
     console.log(">>>Delete")
     fruit.Cookie.delCookie("Name")
     console.log(fruit.Cookie.getCookie("Name"));
     console.log(fruit.Cookie.getCookie("Sex"));

     console.log(">>>Destory")
     fruit.Cookie.destory();
     console.log(fruit.Cookie.getCookie("Name"));
     console.log(fruit.Cookie.getCookie("Sex"));
     * </code></pre>
     *
     */
    /**
     * @event CookieChange
     * When cookie change , trigger this event
     */
    fruit.define('fruit.Cookie', {
        singleton:true,
        mixins:'fruit.Observable',
        methods:{
            /**
             * Set Cookie
             * @param inName
             * @param inValue
             * @param inExdays
             */
            setCookie:function (inName, inValue, inExdays) {
                var expires;
                if (inName) {
                    if (inExdays) {
                        var date = new Date();
                        date.setTime(date.getTime() + (inExdays * 24 * 60 * 60 * 1000));
                        expires = "; expires=" + date.toGMTString();
                    }
                    else {
                        expires = "";
                    }
                    document.cookie = inName + "=" + escape(inValue) + expires + "; path=/";
                    this.trigger('CookieChange',this);
                }
            },
            /**
             * Get cookie by name
             * @param inName
             * @return {*}
             */
            getCookie:function (inName) {
                if (inName) {
                    var match = document.cookie.match(new RegExp(inName + "=(.*?)(?:;|$)"));
                    if (match) {
                        return unescape(match[1].replace(/\+/g, "%20"));
                    }
                }
            },
            /**
             * Delete cookie by name
             * @param inName
             */
            delCookie:function (inName) {
                this.setCookie(inName, "", -1);
            },
            /**
             * Delete all cookie
             */
            destory:function () {
                var cookies = document.cookie.split(";");
                for (var i = 0; i < cookies.length; i++) {
                    this.delCookie(cookies[i].split("=")[0]);
                }

            }
        }
    });
})(fruit, fruit.util, fruit.event.Engine, window);
/**
 * @ignore
 * @class fruit.io
 * @namespace fruit.io
 * @singleton
 * @ignore
 */
(function(fruit) {
	fruit.ns("fruit.io");

	/**
	 * Ajax request
	 * @param {Object} options
	 * @return {Object} request
	 */

	/**
	 * @cfg {String} spi
	 * fruit framework spi
	 */

	/**
	 * @cfg {Function} beforeSend
	 * A pre-request callback function
	 */

	/**
	 * @cfg {Function} complete
	 * A function to be called when the request finishes (after success and error callbacks are executed).
	 */

	/**
	 * @cfg {Object} data
	 * Data to be sent to the server.
	 */

	/**
	 * @cfg {String} responseType
	 * The type of data that you're expecting back from the server. Including xml, json, script, html, jsonp or text.
	 */

	/**
	 * @cfg {Function} error
	 * A function to be called if the request fails.
	 */

	/**
	 * @cfg {Function} success
	 * A function to be called if the request succeeds.
	 */

	/**
	 * @cfg {String} method
	 * The request method ("POST" or "GET").
	 */

	/**
	 * @cfg {String} url
	 * A string containing the URL to which the request is sent.
	 */

	/**
	 * @cfg {Boolean} async
	 * Default is true. By default, all requests are sent asynchronously
	 */

	/**
	 * @cfg {Boolean} useMerge
	 * Default is true. By default, spi requests are useMerged by certain rules.
	 */

	fruit.io.ajax = function(options) {
		var opts = fruit.util.extend({}, options), req;
		var beforeSend = opts.beforeSend, success = opts.success, error = opts.error, complete = opts.complete;
		if (!opts.method && opts.type) {
			opts.method = opts.type;
			delete opts.type;
		}
		if (!opts.responseType && opts.dataType) {
			opts.responseType = opts.dataType;
			delete opts.dataType;
		}
		opts.listeners = {
			beforeSend : beforeSend,
			success : success,
			error : error,
			complete : complete
		};

		//delete event handler options
		delete opts.beforeSend;
		delete opts.success;
		delete opts.error;
		delete opts.complete;

		if (fruit.util.isDefine(opts.spi) || fruit.util.isDefine(opts.listeners.error)) {
			if (opts.spi) {
				if (opts.useMerge !== false) {
					req = fruit.io.MergeSPIRequest.add(opts);
				} else {
					req = new fruit.io.SPIRequest(opts);
					req.send();
				}
			} else {
				req = new fruit.io.PageRequest(opts);
				req.send();
			}
		} else {
			req = new fruit.io.Request(opts);
			req.send();
		}
		return req;
	}
})(fruit);
/**
 * @class fruit.io.PageRequest
 * @extends fruit.io.Request
 * @namespace fruit.io
 * @ignore
 */
(function(fruit) {
	var bind = fruit.util.bind;
	var errorGlobalFlag = '<!--PAGE_IDENTITY:GLOBAL_ERROR_PAGE-->', errorSessionTimeout = '<!--PAGE_IDENTITY:SESSOIN_TIME_OUT-->', errorType = '<!--PAGE_IDENTITY_TYPE:GLOBAL-->'
	var getHtmlError = function(text, type) {
		pageFlag = ['<!--PAGE_IDENTITY:' + type + '_START-->', '<!--PAGE_IDENTITY:' + type + '_END-->'];
		var start = text.indexOf(pageFlag[0]) + pageFlag[0].length, end = text.indexOf(pageFlag[1]) - start;
		if (start > 0 && end > 0) {
			return text.substr(start, end);
		}
		return false;
	}

	fruit.define('fruit.io.PageRequest', {
		extend : 'fruit.io.Request',
		statics : {
			mock : null
		},
		options : {
			/**
			 * @cfg {String} type
			 * specify the request type : 'GET' or 'POST', the default is 'GET' in a common request, and in a spi request it must be 'POST'.
			 */
			method : 'GET'
		},

		/**
		 * @event EVENT_SESSION_TIMEOUT
		 * Fires if request time out.
		 * @param {Object} info
		 */

		/**
		 * @event REQUEST_COMPLETE
		 * Fires if every request complete.
		 * @param {Object} xhr
		 * @param {String} status
		 */

		/**
		 * @event GLOBAL_PAGE_ERROR
		 * Fires if html page request error.
		 * @param {Object} xhr
		 * @param {String} status
		 */

		methods : {
			/**
			 * send request to server
			 * @hide
			 */
			send : function() {
				var options = this.updateOptions();
				var status;
				var mock = fruit.io.PageRequest.mock;
				if (mock) {
					if (mock.status == 404 || mock.status == 500) {
						status = 'error';
					} else if (mock.status == 200) {
						status = 'success';
					}
					if (status == 'success') {
						options.success(mock.responseText, status, {});
					} else {
						options.error(mock, 'error');
					}

					options.complete(mock.responseText, status);
				} else {
					this.superMethod([options]);
				}
				return this;
			},
			onSuccess : function() {
				var method = 'process' + fruit.util.upperFirstChar(this.getOption('responseType'));
				if (this[method]) {
					this[method].apply(this, arguments);
				} else {
					this.trigger('success', arguments, this, true);
				}

				fruit.util.logger.info("request success trigger!");
			},
			processHtml : function(data, status, xhr) {
				var isSessionTimeout = (data.lastIndexOf(errorSessionTimeout) >= 0), isGlobalError = (data.lastIndexOf(errorGlobalFlag) >= 0);
				if (isSessionTimeout) {
					fruit.io.Request.trigger(fruit.io.EVENT_SESSION_TIMEOUT, [data], null, true);
					return;
				}

				if (isGlobalError) {
					fruit.io.Request.trigger(fruit.io.GLOBAL_PAGE_ERROR, [data], null, true);
					return;
				}
				this.trigger('success', arguments, this, true);
			},
			onError : function(xhr, status) {
				this.trigger('error', arguments, this, true);
			},
			onComplete : function(xhr, status) {
				this.trigger('complete', arguments, this, true);
				fruit.io.Request.trigger(fruit.io.Request_COMPLETE, arguments, this, true);
			},
			updateOptions : function() {
				var me = this, bind = fruit.util.bind, listeners = me.listeners;
				var beforeSendFn = me.getOption('listeners').beforeSend;
				me.setOption('listeners', {
					success : me.onSuccess ? bind(me.onSuccess, me) : null,
					error : me.onError ? bind(me.onError, me) : null,
					complete : me.onComplete ? bind(me.onComplete, me) : null,
					beforeSend : beforeSendFn ? bind(beforeSendFn, me) : null
				});
				return this.getAllOptions();
			}
		}
	});
})(fruit);
/**
 * @class fruit.io.SPIRequest
 * @namespace fruit.io
 * @extends fruit.io.Request
 */
(function(fruit) {
	var bind = fruit.util.bind;

	fruit.define('fruit.io.SPIRequest', {
		extend : 'fruit.io.Request',
		statics : {
			/**
			 *constant for ajax result status of success
			 * @ignore
			 */
			SUCCESS : 'SUCCESS',
			/**
			 *constant for ajax result status of failure
			 * @ignore
			 */
			FAILURE : 'FAILURE',
			/**
			 *constant for ajax result status of pending
			 * @ignore
			 */
			PENDING : 'PENDING',

			defaultUrl : '',

			/**Get the request token
			 *It will be overwrite by user if necessary.
			 * @static
			 */
			getToken : function() {
				return null;
			},

			/**Set the request default server's url. If the ajax url config item is not specified, the request will send to this default server.
			 * The request's default server url can be replaced by ajax url config item.
			 * @param {String} url
			 * @static
			 */
			setDefaultUrl : function(url) {
				this.defaultUrl = url;
			},

			getDefaultUrl : function() {
				return this.defaultUrl;
			}
		},
		options : {
			method : 'POST',
			responseType : 'json',
			/**
			 * @cfg {String} spi specify the remote service name
			 */
			spi : '',
			id : '',
			/**
			 * @cfg {Boolean} useMerge set true system will merge multi-request
			 */
			useMerge : true
		},
		methods : {
			init : function(option) {
				this.setOption('url', option.url || fruit.io.SPIRequest.defaultUrl);
				this.useMerge = (this.getOption('spi') && this.getOption('useMerge')) ? true : false;
				this.id = Math.uuid();
				this.aborted = false;
			},
			/**
			 * send spi request to server
			 * @hide
			 */
			send : function() {
				var options = this.updateOptions();
				return this.superMethod([options]);
			},
			abort : function() {
				if (this.useMerge) {
					this.aborted = true;
				} else {
					this.superMethod();
				}
			},
			onSuccess : function(data, status, xhr) {
				var me = this;
				if (fruit.util.isArray(data)) {
					data = data[0];
				}
				switch (data.status) {
					case fruit.io.SPIRequest.SUCCESS:
						this.trigger('success', [data, data.status, this], null, true);
						break;
					case fruit.io.SPIRequest.FAILURE:
						//show error info (1155- not login 102- session timeout)
						if (data.exceptionID == 1155 || data.exceptionID == 102) {
							var info = {};
							if (data.reason) {
								info = {
									timeoutType : data.reason
								};
							}
							fruit.io.Request.trigger(fruit.io.EVENT_SESSION_TIMEOUT, [info], null, true);
							fruit.util.logger.info("Session_Timeout Trigger!");
						} else {
							this.statusText = 'failure';
							this.trigger('error', [this, 'failure', data], null, true);
						}
						break;
					case fruit.io.SPIRequest.PENDING:
						fruit.io.MergeSPIRequest.add(this, true);
						break;
					default:
						fruit.util.logger.warn("unknow result status [" + data.status + "]!");
						break;
				}
			},

			onError : function(xhr, status) {
				this.trigger('error', arguments, this, true);
			},
			onComplete : function(xhr, status) {		
				this.trigger('complete', arguments, this, true);
				fruit.io.Request.trigger(fruit.io.Request_COMPLETE, arguments, this, true);
			},
			updateOptions : function() {
				var me = this, bind = fruit.util.bind, listeners = me.listeners;
				var beforeSendFn = me.getOption('listeners').beforeSend;
				me.setOption('data', me.getData());
				me.setOption('listeners',{
					success : me.onSuccess ? bind(me.onSuccess, me) : null,
					error : me.onError ? bind(me.onError, me) : null,
					complete : me.onComplete ? bind(me.onComplete, me) : null, 
					beforeSend : beforeSendFn ? bind(beforeSendFn, me) : null
				});
				return this.getAllOptions();
			},
			getData : function() {
				var data = this.getDataObject();
				if (!fruit.util.isArray(data)) {
					data = [data];
				}

				var _token = fruit.io.SPIRequest.getToken();
				if (_token) {
					return {
						"__spiCall__" : JSON.stringify(data),
						"token" : _token
					}
				} else {
					return {
						"__spiCall__" : JSON.stringify(data)
					}
				}
			},
			getDataObject : function() {
				var spi = this.getOption('spi').split('.');
				var _service = this.getOption('isSecondCall') ? "" : spi[0];
				var _data = this.getOption('data');
				if (_data) {
					return {
						id : this.id,
						service : _service,
						spi : spi[1],
						parameters : _data
					}
				} else {
					return {
						id : this.id,
						service : _service,
						spi : spi[1]
					}
				}
			}
		}
	});
})(fruit);
/**
 * @class fruit.io.MergeSPIRequest
 * @namespace fruit.io
 * @extends fruit.io.SPIRequest
 * @ignore
 */
(function (fruit) {
    var bind = fruit.util.bind;

    fruit.define('fruit.io.MergeSPIRequest', {
        extend:'fruit.io.SPIRequest',
        statics:{
            /**
             * merge wait time (unit millisecond)
             */
            waitTime:100,
            /**
             * merge max request count
             */
            maxRequest:20,
            /**
             * check merge time (unit millisecond)
             */
            checkWaitTime:20,
            /**
             * current merged call number
             */
            count:0,
            add:function (opts, isSecondCall) {
                if (!this.instance) {
                    //copy options
                    var options = fruit.util.extend({}, opts, {
                        spi:''
                    });
                    this.instance = new fruit.io.MergeSPIRequest(options);
                }
                var req;
                if (opts.$name) {
                    req = opts;
                } else {
                    req = new fruit.io.SPIRequest(opts);
                }

                if (isSecondCall) {
                    req.setOption('isSecondCall', true);
                }

                this.instance.push(req);
                this.count++;
                return req;
            }
        },

        methods:{
            init:function (option) {
                this.list = {};
                var statics = this.getStatics();
                this.timeid = setTimeout(bind(this.send, this), statics.waitTime);
            },
            send:function () {
                var statics = this.getStatics();
                statics.instance = null;
                statics.count = 0;
                this.timeid = 0;
                this.superMethod();
            },
            push:function (req) {
                var statics = this.getStatics();
                this.list[req.id] = req;
                if (statics.maxRequest < statics.count) {
                    this.timeid && clearTimeout(this.timeid);
                    this.send();
                }
            },
            onSuccess:function (data, status, xhr) {
                this.distribute(arguments, data);
            },
            onError:function (xhr, status) {
                this.distribute(arguments);
            },
            onComplete:function () {
                this.distribute(arguments);
            },
            getDataObject:function () {
                var data = [];
                fruit.util.each(this.list, function (req, key) {
                    data.push(req.getDataObject());
                })
                return data;
            },
            distribute:function (args, data) {
                var me = this, req, list = this.list, method = this.distribute.caller.$name;
                var result = {};
                if (data) {//success
                    fruit.util.each(data, function (dataItem) {
                        result[dataItem.id] = dataItem;
                    });
                }

                fruit.util.each(list, function (obj) {
                    if (!obj.aborted) {
                        var arg = [];
                        if (data && obj.id && result[obj.id]) {
                            var objId = obj.id;
                            req = me.list[objId];
                            arg[0] = result[objId];
                        } else {
                            req = obj;
                            arg = args;
                        }
                        req[method].apply(req, arg);
                    }else{
                    	if(method == 'onComplete'){
                    		me.trigger('complete', [me, 'abort'], me, true);
                    	}else{
                    		me.trigger('error', [me, 'abort'], me, true);
                    	}
                    }
                });
            }
        }
    });
})(fruit);
/**
 * @ignore
 * @class fruit.io
 * @namespace fruit.io
 * @singleton
 * @ignore
 */
(function(fruit) {
	fruit.ns("fruit.io");

	/**
	 * Ajax request
	 * @param {Object} options
	 * @return {Object} request
	 */

	/**
	 * @cfg {String} spi
	 * fruit framework spi
	 */

	/**
	 * @cfg {Function} beforeSend
	 * A pre-request callback function
	 */

	/**
	 * @cfg {Function} complete
	 * A function to be called when the request finishes (after success and error callbacks are executed).
	 */

	/**
	 * @cfg {Object} data
	 * Data to be sent to the server.
	 */

	/**
	 * @cfg {String} responseType
	 * The type of data that you're expecting back from the server. Including xml, json, script, html, jsonp or text.
	 */

	/**
	 * @cfg {Function} error
	 * A function to be called if the request fails.
	 */

	/**
	 * @cfg {Function} success
	 * A function to be called if the request succeeds.
	 */

	/**
	 * @cfg {String} method
	 * The request method ("POST" or "GET").
	 */

	/**
	 * @cfg {String} url
	 * A string containing the URL to which the request is sent.
	 */

	/**
	 * @cfg {Boolean} async
	 * Default is true. By default, all requests are sent asynchronously
	 */

	/**
	 * @cfg {Boolean} useMerge
	 * Default is true. By default, spi requests are useMerged by certain rules.
	 */

	fruit.io.ajax = function(options) {
		var opts = fruit.util.extend({}, options), req;
		var beforeSend = opts.beforeSend, success = opts.success, error = opts.error, complete = opts.complete;
		if (!opts.method && opts.type) {
			opts.method = opts.type;
			delete opts.type;
		}
		if (!opts.responseType && opts.dataType) {
			opts.responseType = opts.dataType;
			delete opts.dataType;
		}
		opts.listeners = {
			beforeSend : beforeSend,
			success : success,
			error : error,
			complete : complete
		};

		//delete event handler options
		delete opts.beforeSend;
		delete opts.success;
		delete opts.error;
		delete opts.complete;

		if (fruit.util.isDefine(opts.spi) || fruit.util.isDefine(opts.listeners.error)) {
			if (opts.spi) {
				if (opts.useMerge !== false) {
					req = fruit.io.MergeSPIRequest.add(opts);
				} else {
					req = new fruit.io.SPIRequest(opts);
					req.send();
				}
			} else {
				req = new fruit.io.PageRequest(opts);
				req.send();
			}
		} else {
			req = new fruit.io.Request(opts);
			req.send();
		}
		return req;
	}
})(fruit);
/**
 * @class fruit.io.load
 * @namespace fruit.io
 * @singleton
 */
(function (fruit) {
    var _loadScript = function (content, fn, errFn, isInner, doc) {
            var container = doc || document.getElementsByTagName('head')[0], script, done = false;
            doc = doc || document;
            script = doc.createElement('script');
            script.language = "javascript";
            script.charset = "UTF-8";
            script.type = 'text/javascript';
            script.onload = script.onreadystatechange = function () {
                if (!done && (!script.readyState || 'loaded' === script.readyState || 'complete' === script.readyState)) {
                    done = true;
                    fn && fn();
                    script.onload = script.onreadystatechange = null;
                    script.parentNode.removeChild(script);
                    script = null;
                    return;
                }
            };
            script.onerror = function () {
                if (!done) {
                    done = true;
                    errFn && errFn();
                }
            };
            if (isInner) {
                script.text = content;
            } else {
                script.src = content;
            }
            container.appendChild(script);
            if (!done && isInner) {
                done = true;
                fn && fn();
            }
            container = null;
        },

        _loadStyle = function (content, fn, isInner, doc) {
            doc = doc || document;
            if (isInner) {
                var style = styleCache[doc];
                if (!style) {
                    style = styleCache[doc] = doc.createElement('style');
                    style.setAttribute('type', 'text/css');
                    document.getElementsByTagName('head')[0].appendChild(style);
                }
                style.styleSheet && (style.styleSheet.cssText += content) || style.appendChild(doc.createTextNode(content));
            }
            else {
                var link = document.createElement('link');
                link.charset = 'UTF-8';
                link.rel = 'stylesheet';
                link.type = 'text/css';
                link.href = content;
                doc.getElementsByTagName('head')[0].appendChild(link);

                var styles = doc.styleSheets, load = function () {
                    for (var i = 0; i < styles.length; i++) {
                        if (link === (styles[i].ownerNode || styles[i].owningElement)) {
                            return fn();
                        }
                    }
                    setTimeout(arguments.callee, 5);
                };
            }
            if (fn) {
                fn();
            }
        }

    fruit.ns('fruit.io.load').extend({
        /**
         * Add script to the page asynchronously
         * @param {String} content  script code or url of script file
         * @param {Function} fn    callback function
         * @param {Boolean} isInner specify the content is code or url , set true the content is code. (default is false)
         * @param {DomElement} doc doc (Optional) the location of you need append to.
         */
        script:_loadScript,

        /**
         * Add Style to the page asynchronously
         * @param {String} content  Style code or url of Style file
         * @param {Function} fn    callback function
         * @param {Boolean} isInner specify the content is code or url , set true the content is code. (default is false)
         * @param {DomElement} doc doc (Optional) the location of you need append to.
         */
        style:_loadStyle
    });
})(fruit);
/**
 * @class fruit.interfaces.IStore
 * @namespace fruit.interfaces
 */
fruit.defineInterface('fruit.interfaces.IStore', [
/**
 * @method getModel
 */
    'getModel',
    
    'getModelCollection',
    
    'read',
    
    'create',
    
    'update',
    
    'destroy'
]
);


/**
 * @class fruit.data.AjaxStore
 * @namespace fruit.data
 */
(function(fruit, util, logger) {
	fruit.define('fruit.data.AjaxStore', {
		mixins : 'fruit.Observable',
		implement : 'fruit.interfaces.IStore',
		options : {
			/**
			 * @cfg {String} responseType
			 * specify the response data type.
			 */
			responseType : {
				defaultValue : 'json',
				acceptTypes : ['String', 'Null']
			},

			modelType : {
				defaultValue : 'fruit.ui.data.ViewModel',
				acceptTypes : ['String', 'Null']
			},

			idAttribute : {
				defaultValue : 'id',
				acceptTypes : ['String', 'Null']
			},

			/**
			 * @cfg {Object} url
			 * specify the request url
			 */
			url : {
				defaultValue : '',
				acceptTypes : ['Object', 'String']
			}
		},

		methods : {
			init : function(option) {
				this.id = Math.uuid();
				this.loading = false;
				this.data = null;
				this.modelCollection = null;
			},

			save : function(params) {
				//TODO
				if (params.action.toLowerCase() == 'create') {
					this.create(params.data);
				}

				if (params.action.toLowerCase() == 'update') {
					this.update(params.data);
				}

				if (params.action.toLowerCase() == 'destroy') {
					this.destroy(params.data);
				}
			},

			read : function(params) {
				var _url = this.getOption('url');
				var readUrl = '';
				if (util.isString(_url)) {
					readUrl = _url;
				} else {
					readUrl = _url.read || '';
				}
				this.__ajax('Read', readUrl, 'GET', params || {});
			},

			create : function(sender, params) {
				var _url = this.getOption('url'), createUrl = '';
				if (util.isObject(_url)) {
					createUrl = _url.create || '';

					var data = {}, _item = params.item;
					if ( _item instanceof fruit.ui.data.ViewModel) {
						data = _item.getJSON();
					}

					this.__ajax('Create', createUrl, 'POST', data);
				}else{
					logger.error('The url config should be defined as an object.');
				}
			},

			update : function(sender, params) {
				var _url = this.getOption('url'), updateUrl = '';
				if (util.isObject(_url)) {
					updateUrl = _url.update || '';

					var data = {}, _item = params.item;
					if ( _item instanceof fruit.ui.data.ViewModel) {
						data = _item.getJSON();
					}

					this.__ajax('Update', updateUrl, 'POST', data);
				}else{
					logger.error('The url config should be defined as an object.');
				}
			},

			destroy : function(sender, params) {
				var _url = this.getOption('url'), destroyUrl = '';
				if (util.isObject(_url)) {
					destroyUrl = _url.destroy || '';

					var data = {}, _item = params.item;
					if ( _item instanceof fruit.ui.data.ViewModel) {
						var idAttr = this.getOption('idAttribute');
						data[idAttr] = _item.getValue(idAttr);
					}
					this.__ajax('Destroy', destroyUrl, 'POST', data);
				}else{
					logger.error('The url config should be defined as an object.');
				}
			},

			__checkSpi : function(url) {
				var index = url.indexOf("spi:");
				if (index == 0) {
					var spiUrl = url.substr("spi:".length);
					return spiUrl;
				} else {
					return false;
				}
			},

			__ajax : function(action, url, mehod, params) {
				var me = this, bind = util.bind;
				var opts = this.getAllOptions();
				action = util.capitalize(action);

				var reqOpts = {
					method : mehod,
					responseType : opts.responseType,
					data : params,
					success : bind(me['__on' + action + 'Success'], me),
					error : bind(me['__on' + action + 'Error'], me),
					complete : bind(me['__on' + action + 'Complete'], me)
				};

				url = util.trim(url);
				var spiUrl = this.__checkSpi(url);
				if (spiUrl) {
					reqOpts.spi = spiUrl;

				} else {
					reqOpts.url = url;
				}
				fruit.io.ajax(reqOpts);
			},

			getModel : function(id) {
				var idAttr = this.getOption('idAttribute') || 'id', model;
				if (!this.modelCollection) {
					this.modelCollection = this.getModelCollection();
				}

				if (id) {
					model = this.modelCollection.first(function(item) {
						return item.getValue(idAttr) == id;
					});
				} else {
					model = this.modelCollection.getItem(0);
				}
				return model;
			},

			getModelCollection : function() {
				if (!this.modelCollection) {
					var modelType = this.getOption('modelType');
					var _collectionData = util.clone(this.data);
					if (!util.isArray(_collectionData)) {
						_collectionData = [this.data];
					}
					this.modelCollection = new fruit.ui.data.ViewModelCollection(_collectionData, modelType);
					if (this.modelCollection) {
						this.modelCollection.on('add', this.create, this);
						this.modelCollection.on('edit', this.update, this);
						this.modelCollection.on('remove', this.destroy, this);
					}
				}
				return this.modelCollection;
			},

			__onReadSuccess : function(data, status, xhr) {
				this.data = this.__parseToJson(data);
				this.trigger('readSuccess', [this.data, status, xhr], null, true);
			},

			__onReadError : function(xhr, status) {
				this.trigger('readError', [xhr, status], null, true);
				logger.warn("read error, status=" + status);
			},

			__onReadComplete : function(xhr, status) {
				this.trigger('readComplete', [xhr, status], null, true);
			},

			__parseToJson : function(inputData) {
				//assume inputData is json data
				return inputData || {};
			}
		}
	}, function() {
		var prop = this.prototype;
		util.each(['Create', 'Update', 'Destroy'], function(name) {
			var eventName = name.toLowerCase();
			prop['__on' + name + 'Success'] = function(data, status, xhr) {
				this.trigger(eventName + 'Success', [data, status, xhr, eventName], null, true);
			}
			prop['__on' + name + 'Error'] = function(xhr, status) {
				this.trigger(eventName + 'Error', [xhr, status, eventName], null, true);
				logger.warn(eventName + " error, status = " + status);
			}
			prop['__on' + name + 'Complete'] = function(xhr, status) {
				this.trigger(eventName + 'Complete', [xhr, status, eventName], null, true);
			}
		});
	});
})(fruit, fruit.util, fruit.util.logger);
(function (fruit, util) {
    //http://www.w3schools.com/svg/svg_reference.asp
    //http://www.w3schools.com/svg/svg_examples.asp
    var NS = "http://www.w3.org/2000/svg";
    var xlink = 'http://www.w3.org/1999/xlink';
    fruit.define('fruit.Graphic.SVGGraphic', {
        entity:{
            generateRoot:function (inConfig) {
                var svg = document.createElementNS(NS, "svg");
                svg.setAttribute("width", inConfig.width || "100%");
                svg.setAttribute("height", inConfig.height || "100%");
                return svg;

            },
            rect:function (inConfig) {
                var SVGObj = this.defaultSymbol(inConfig);
                SVGObj.style.stroke = inConfig.stroke || "rgb(0, 0, 0, 0)";
                SVGObj.style.strokeWidth = parseInt(inConfig.strokeWidth) || 1;
                SVGObj.setAttribute("rx", parseInt(inConfig.rx) || 0);
                SVGObj.setAttribute("ry", parseInt(inConfig.ry) || 0);

                return SVGObj;
            },
            circle:function (inConfig) {
                var SVGObj = this.defaultSymbol(inConfig);
                SVGObj.setAttribute("r", parseInt(inConfig.r) || 0);
                SVGObj.setAttribute("cx", parseInt(inConfig.x) || 0);
                SVGObj.setAttribute("cy", parseInt(inConfig.y) || 0);

                return SVGObj;
            },
            ellipse:function (inConfig) {
                var SVGObj = this.defaultSymbol(inConfig);
                SVGObj.setAttribute("r", parseInt(inConfig.r) || 0);
                SVGObj.setAttribute("cx", parseInt(inConfig.x) || 0);
                SVGObj.setAttribute("cy", parseInt(inConfig.y) || 0);
                SVGObj.setAttribute("rx", parseInt(inConfig.rx) || 0);
                SVGObj.setAttribute("ry", parseInt(inConfig.ry) || 0);


                return SVGObj;
            },
            line:function (inConfig) {
                var SVGObj = document.createElementNS(NS, "line");
                SVGObj.setAttribute("x1", parseInt(inConfig.x1) || 0);
                SVGObj.setAttribute("y1", parseInt(inConfig.y1) || 0);
                SVGObj.setAttribute("x2", parseInt(inConfig.x2) || 0);
                SVGObj.setAttribute("y2", parseInt(inConfig.y2) || 0);
                SVGObj.style.stroke = inConfig.stroke || "rgb(0, 0, 0, 0)";
                SVGObj.style.strokeWidth = parseInt(inConfig.strokeWidth) || 1;

//                var arrow = this.path({
//                    path:"M 0,0 L 40,30 L 0,60 z",
//                    fill:"#333"
//                });
//                SVGObj.appendChild(arrow);


                return SVGObj;
            },
            path:function (inConfig) {
                /*
                 http://www.w3schools.com/svg/svg_path.asp
                 M = moveto
                 L = lineto
                 H = horizontal lineto
                 V = vertical lineto
                 C = curveto
                 S = smooth curveto
                 Q = quadratic Bézier curve
                 T = smooth quadratic Bézier curveto
                 A = elliptical Arc
                 Z = closepath

                 */
                var SVGObj = document.createElementNS(NS, "path");
                SVGObj.setAttribute("d", inConfig.path || "");
                SVGObj.style.fill = inConfig.fill;
                //SVGObj.style.fill = inConfig.fill;
                return SVGObj;
            },
            image:function (inConfig) {
                var SVGObj = document.createElementNS(NS, "image");
                inConfig.src && SVGObj.setAttributeNS(xlink, 'href', inConfig.src);
                inConfig.width && SVGObj.setAttribute("width", parseInt(inConfig.width));
                inConfig.height && SVGObj.setAttribute("height", parseInt(inConfig.height));
                inConfig.x && SVGObj.setAttribute("x", parseInt(inConfig.x) || 0);
                inConfig.y && SVGObj.setAttribute("y", parseInt(inConfig.y) || 0);
                return SVGObj;
            },
            text:function (inConfig) {
                var SVGObj = this.defaultSymbol(inConfig);
                var textNode = document.createTextNode(inConfig.text || "");
                SVGObj.appendChild(textNode);
                return SVGObj;
            },
            defaultSymbol:function (inConfig) {
                var SVGObj = document.createElementNS(NS, inConfig.type);
                inConfig.width && SVGObj.setAttribute("width", parseInt(inConfig.width));
                inConfig.height && SVGObj.setAttribute("height", parseInt(inConfig.height));
                inConfig.x && SVGObj.setAttribute("x", parseInt(inConfig.x) || 0);
                inConfig.y && SVGObj.setAttribute("y", parseInt(inConfig.y) || 0);
                inConfig.fill && (SVGObj.style.fill = inConfig.fill);
                return SVGObj;
            },

            animate:function (inConfig) {
                //<animate attributeName="d" attributeType="XML" begin="0s" dur="6s" fill="freeze" from="M 300,300 L300,0 A300,300 0  0,1 504,80 z" to="M 300,300 L300,0 A300,300 0  0,1 504,380 z" />


                var ani = document.createElementNS("http://www.w3.org/2000/svg", inConfig.type || "animateTransform");
                ani.setAttributeNS(null, "attributeName", inConfig.attr);
                ani.setAttributeNS(null, "attributeType", "xml");
                ani.setAttributeNS(null, "from", inConfig.from);
                ani.setAttributeNS(null, "to", inConfig.to);
                ani.setAttributeNS(null, "begin", "0s");
                ani.setAttributeNS(null, "dur", inConfig.dur + "s");
//                ani.setAttribute("from", inConfig.from);
//                ani.setAttribute("to", inConfig.to);
//                ani.setAttribute("fill", "freeze");
                return ani;
            }
        }
    })
})(fruit, fruit.util);
(function (fruit, util) {
    fruit.define('fruit.Graphic.VMLGraphic', {
        entity:{
            init:function () {
                document.namespaces.add("v", "urn:schemas-microsoft-com:vml");
                document.createStyleSheet().addRule("v\\: *", "behavior:url(#default#VML); position:absolute");
                document.createStyleSheet().addRule("v\\:roundrect", "behavior:url(#default#VML); position:absolute");
                document.createStyleSheet().addRule("v\\:oval", "behavior:url(#default#VML); position:absolute");
                document.createStyleSheet().addRule("v\\:roundrect", "behavior:url(#default#VML); position:absolute");
                document.createStyleSheet().addRule("v\\:fill", "behavior:url(#default#VML); position:absolute");
                document.createStyleSheet().addRule("v\\:line", "behavior:url(#default#VML); position:absolute");
                document.createStyleSheet().addRule("v\\:shape", "behavior:url(#default#VML); position:absolute");
                document.createStyleSheet().addRule("v\\:polyline", "behavior:url(#default#VML); position:absolute");
                document.createStyleSheet().addRule("v\\:stroke", "behavior:url(#default#VML); position:absolute")
            },
            generateRoot:function (inConfig) {


            },
            rect:function (inConfig) {
            },
            circle:function (inConfig) {
            },
            ellipse:function (inConfig) {
            },
            line:function (inConfig) {
            },
            path:function (inConfig) {
            },
            defaultSymbol:function (inConfig) {
            }
        }
    })
})(fruit, fruit.util);
(function (fruit, util) {
    var isSVG = document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1");
    var isVML = (document.all && !(navigator.userAgent.indexOf("Opera") >= 0)) ? true : false;


    fruit.define('fruit.Graphic.GraphicManager', {
        singleton:true,
        entity:{
            init:function () {
                if (isVML) {
                    this.engine = new fruit.Graphic.VMLGraphic();
                } else {
                    this.engine = new fruit.Graphic.SVGGraphic();
                }
            },
            getGraphic:function (inConfig) {
                var root = this.generateRoot(inConfig);

                return this.__generateChild(inConfig.content, root);
            },
            generateRoot:function (inConfig) {
                return this.engine.generateRoot(inConfig);
            },
            __generateChild:function (content, inParentEl) {
                if (content) {
                    content = util.isArray(content) ? content : [content];
                    for (i = 0; i < content.length; i++) {
                        var sub = content[i];
                        var subGraphic = this.generateSymbol(sub);
                        inParentEl.appendChild(subGraphic);
                    }
                    return inParentEl;
                }
            },
            generateSymbol:function (inConfig) {
                var type = inConfig.type, sub;
                switch (type) {
                    case 'rect':
                        sub = this.engine.rect(inConfig);
                        break;
                    case 'circle':
                        sub = this.engine.circle(inConfig);
                        break;
                    case 'ellipse':
                        sub = this.engine.ellipse(inConfig);
                        break;
                    case 'line':
                        sub = this.engine.line(inConfig);
                        break;
                    case 'linearGradient':
                        sub = this.engine.linearGradient(inConfig);
                        break;
                    case 'defs':
                        sub = this.engine.defs(inConfig);
                        break;
                    case 'polyline':
                        sub = this.engine.polyline(inConfig);
                        break;
                    case 'polygon':
                        sub = this.engine.polygon(inConfig);
                        break;
                    case 'path':
                        sub = this.engine.path(inConfig);
                        break;
                    case 'image':
                        sub = this.engine.image(inConfig);
                        break;
                    case 'text':
                        sub = this.engine.text(inConfig);
                        break;
                    default:
                        sub = this.engine.defaultSymbol(inConfig);
                        break;
                }
                return sub;
            },
            generateAnimateSymbol:function(inConfig){
                return this.engine.animate(inConfig);
            }
        }


    });
})(fruit, fruit.util);
(function (fruit, util, GraphicManager) {


    fruit.define("fruit.Graphic.core", {
        //extend:"fruit.ui.Component",
        mixins:['fruit.Observable'],
        options:{
            height:{
                defaultValue:"100%"
            },
            width:{
                defaultValue:"100%"
            }

        },
        entity:{
            colorTable:["#0086C0","#91DC0D","#13ACDC","#FFAF09","#119E1B","#F85B37","#652D89","#F58025","#B64926"],
            init:function () {
                var self = this;
                if (!this.graphic) {
                    this.graphic = GraphicManager.generateRoot({
                        width:self.getOption("width"),
                        height:self.getOption("height")
                    })
                }

            },
            renderTo:function (container) {
                var targetEl;
                if (this.graphic) {
                    if (util.isString(container)) {
                        targetEl = document.getElementById(container);
                    } else {
                        targetEl = container;
                    }
                    targetEl = targetEl || document.body;
                    targetEl.appendChild(this.graphic);
                }
            },
            setModel:function (model, path) {
                if (this.model) {
                    if (this.model instanceof fruit.ui.data.ViewModel) {
                        this.model.off('refresh', this.syncModel, this);
                        this.model.off('edit', this.editModel, this);
                    } else if (this.model instanceof fruit.ui.data.ViewModelCollection) {
                        this.model.off('reset', this.syncModel, this);
                        this.model.off('add', this.syncModel, this);
                        this.model.off('remove', this.syncModel, this);
                    }
                }
                this.model = model;

                if (model) {
                    if (this.model instanceof fruit.ui.data.ViewModel) {
                        this.model.on('refresh', this.syncModel, this);
                        this.model.on('edit', this.editModel, this);
                        this.modelType = 'VM';
                    } else if (this.model instanceof fruit.ui.data.ViewModelCollection) {
                        this.model.on('reset', this.syncModel, this);
                        this.model.on('add', this.syncModel, this);
                        this.model.on('remove', this.syncModel, this);
                        this.modelType = 'VMC';
                    } else {
                        throw "model must be ViewModel or ViewModelCollection";
                    }
                }
                this.syncModel();
            },
            syncModel:function () {
            },
            editModel:function () {
            },
            empty:function(){
                while (this.graphic.lastChild) {
                    this.graphic.removeChild(this.graphic.lastChild);
                }
            }

        }
    });


    fruit.Graphic.core.regProcessor('graphic', function (cls, data) {
        if (data.graphic) {
            var graphic = GraphicManager.getGraphic(data.graphic);
            cls.prototype.graphic = graphic;
        }
    });


})(fruit, fruit.util, fruit.Graphic.GraphicManager);
//http://jbkflex.wordpress.com/2011/07/28/creating-a-svg-pie-chart-html5/
(function (fruit, util, GraphicManager) {
    fruit.define("fruit.Graphic.Sector", {
        extend:"fruit.Graphic.core",
        graphic:{
        }
    })


    fruit.define("fruit.Graphic.Pie", {
        extend:"fruit.Graphic.core",
        options:{
            title:{
                defaultValue:""
            }
        },
        entity:{
            init:function () {
                this.sector = [];
            },
            syncModel:function () {
                var model = this.model.model;
                this.__serializeModel(model);
                this.__drawPie(model);
            },

            editModel:function (model) {
                var model = this.model.model;
                this.__serializeModel(model);
                this.__animatePie(model);
            },
            __serializeModel:function (model) {
                var pieLength = model.length;
                var angle = 0;
                var width = this.getOption("width");
                var height = this.getOption("height")
                var radius = (Math.min(height, width)) / 2;
                var lastPoint_y = 0;
                var lastPoint_x = width / 2;
                var sum = 0;
                for (var i = 0; i < pieLength; i++) {
                    sum += parseInt(model[i].value);
                }
                for (var i = 0; i < pieLength; i++) {
                    var item = model[i];
                    item.angle = Math.ceil((item.value / sum) * 360);
                    angle += item.angle;
                    var path = [];
                    path.push("M " + height / 2 + "," + width / 2); //goto center
                    path.push("L" + lastPoint_x + "," + lastPoint_y);
                    path.push("A" + radius + "," + radius + " 0 ");
                    path.push(item.angle >= 180 ? "1,1" : "0,1");
                    lastPoint_x = parseInt(width / 2 + radius * Math.sin(Math.PI * angle / 180));
                    lastPoint_y = parseInt(height / 2 - radius * Math.cos(Math.PI * angle / 180));
                    path.push(lastPoint_x + "," + lastPoint_y);
                    path.push("z");
                    item.path = path.join(" ");
                }
            },
            __drawPie:function (model) {
                var colorTable = this.colorTable;
                var pieLength = model.length;
                //
                for (var i = 0; i < pieLength; i++) {
                    var item = model[i];
                    var sub = GraphicManager.generateSymbol({
                        type:'path',
                        path:item.path,
                        fill:colorTable[i % colorTable.length]
                    })
                    this.sector[i] = sub;
                    this.graphic.appendChild(sub);
                    sub.addEventListener("click",this.__showSector);
                }
            },
            __animatePie:function (model) {
                var colorTable = this.colorTable;
                var pieLength = model.length;
                var dur = 0.5;
                //
                for (var i = 0; i < pieLength; i++) {
                    var item = model[i];
                    var sub = this.sector[i];
                    var from = sub.getAttribute("d");


                    var ani = GraphicManager.generateAnimateSymbol({
                        type:"animate",
                        attr:'d',
                        from:from,
                        to:item.path,
                        dur:dur
                    });
                    sub.appendChild(ani);

                    (function (subEL, aniEL, path) {
                        setTimeout(function () {
                            subEL.setAttribute("d", path);
                            aniEL.parentNode.removeChild(aniEL);
                        }, dur*1000)
                        setTimeout(function () {
                            aniEL.beginElement();
                        }, 0)
                    })(sub, ani, item.path);


                }
            },
            __showSector:function(inSender){


            }

        }





    });
})(fruit, fruit.util, fruit.Graphic.GraphicManager);
(function (fruit, util, GraphicManager) {
    //http://upload.wikimedia.org/wikipedia/commons/5/5c/Router.svg
    fruit.define("fruit.Graphic.Device", {
        mixins:['fruit.Observable'],
        options:{
            config:{
                defaultValue:null,
                acceptType:["Object", "null"]
            },
            icon:{
                defaultValue:"images/router.png",
                acceptType:["String", "null"]
            }
        },
        entity:{
            init:function () {
                var self = this;
                var config = this.getOption("config");
                var icon = this.getOption("icon");

                var group = this.graphic = GraphicManager.generateSymbol({
                    type:"g"
                });


                var img = this.img = GraphicManager.generateSymbol({
                    type:'image',
                    src:icon,
                    x:config.x,
                    y:config.y,
                    width:32,
                    height:32
                })

                var text = this.text = GraphicManager.generateSymbol({
                    type:'text',
                    x:config.x + 32,
                    y:config.y + 32,
                    text:config.name,
                    fill:"#999"
                })


                this.graphic.appendChild(img);
                this.graphic.appendChild(text);

                img.addEventListener("click", function () {
                    self.trigger('nodeClick', config);
                });
                img.addEventListener("mousedown", function () {
                    self.trigger('mousedown', config);
                });

                //this.graphic = img;
                // console.log(img);
            }
        }
    });

    fruit.define("fruit.Graphic.Router", {
        extend:"fruit.Graphic.Device",
        options:{
            icon:{
                defaultValue:"images/router.png",
                acceptType:["String", "null"]
            }
        },
        entity:{

        }
    });
    fruit.define("fruit.Graphic.Server", {
        extend:"fruit.Graphic.Device",
        options:{
            icon:{
                defaultValue:"images/server.png",
                acceptType:["String", "null"]
            }
        },
        entity:{

        }
    });
    fruit.define("fruit.Graphic.Switch", {
        extend:"fruit.Graphic.Device",
        options:{
            icon:{
                defaultValue:"images/switch.png",
                acceptType:["String", "null"]
            }
        },
        entity:{

        }
    });

    fruit.define("fruit.Graphic.Topology", {
        extend:"fruit.Graphic.core",
        options:{
            title:{
                defaultValue:""
            }
        },
        graphic:{
        },
        entity:{
            init:function () {
                this.r = 32;

                this.dateObj = {};
            },
            __attachEvent:function () {
                this.dragging = false;
                document.addEventListener("click", function (e) {
                    var target = e.target;
                    if (target.nodeName == "image") {
                        console.log(1);
                    }

                });
            },

            syncModel:function () {
                var model = this.model.model;
                this.__serializeModel(model.node);
                this.__draw(model.node);
            },

            editModel:function (model) {
                var model = this.model.model;
                this.__serializeModel(model.node);
                this.__draw(model.node);
            },
            __serializeModel:function (node) {
                var width = this.getOption("width") - this.r * 2;// reduce radius
                var height = this.getOption("height") - this.r * 2;
                var nodeLength = node.length;
                var _connections;


                //build mapping
                for (var i = 0; i < nodeLength; i++) {
                    var item = node[i];


                    if (item.ip == item.connection) {
                        alert(1);
                    }


                    if (this.dateObj[item.ip]) {
                        _connections = this.dateObj[item.ip].connections;

                    } else {
                        _connections = []
                    }
                    this.dateObj[item.ip] = item;
                    this.dateObj[item.ip].connections = _connections;


                    if (this.dateObj[item.connection]) {
                        this.dateObj[item.connection].connections.push(item.ip);
                    } else {
                        this.dateObj[item.connection] = {
                            connections:[item.ip]
                        }
                    }
                    this.dateObj[item.ip].connections.push(item.connection);
                    //this.dateObj[item.ip] = sourceItem;
                    //this.dateObj[item.connection] = targetItem;

                }

                // remove duplicate items
                for (var i = 0; i < nodeLength; i++) {
                    var item = node[i];
                    util.arrayUniq(item.connections)
                }


                node.sort(function (a, b) {
                    return (b.connections.length - a.connections.length);
                })


                var maxLevel = node[0].connections.length;
                var R = Math.floor(width / (maxLevel * 2));
                var centerX = width / 2;
                var centerY = height / 2;
                var levelArray = [];

                for (var i = 0; i < nodeLength; i++) {
                    var item = node[i];
                    var level = item.connections.length;

                    if (levelArray[level]) {
                        levelArray[level].push(item)
                    } else {
                        levelArray[level] = [item];
                    }

                }


                for (var i = 1; i <= maxLevel; i++) {
                    var itemCollection = levelArray[maxLevel-i+1];
                    console.log(itemCollection)
                    if (util.isUndef(itemCollection)) {
                        continue;
                    }
                    var num = itemCollection.length;
                    var angle = Math.floor(360 / num);
                    for (var j = 0; j < num; j++) {
                        var item = itemCollection[j];
                        var offsetX = Math.floor(R * i * Math.sin(Math.PI * angle * j / 180));
                        var offsetY = Math.floor(R * i * Math.cos(Math.PI * angle * j / 180));

                        console.log(offsetX+","+offsetY)

                        item.x = Math.floor(centerX + offsetX);
                        item.y = Math.floor(centerY + offsetY);
                        this.dateObj[item.ip].x = item.x;
                        this.dateObj[item.ip].y = item.y;

                    }


                }


                //genrate position
//                for (var i = 0; i < nodeLength; i++) {
//                    var item = node[i];
//
//
//                    item.x = Math.floor(Math.random() * width) + this.r;
//                    item.y = Math.floor(Math.random() * height) + this.r;
//                    this.dateObj[item.ip].x = item.x;
//                    this.dateObj[item.ip].y = item.y;
//
//
//                }

                //console.log()
            },
            redraw:function () {
                var model = this.model.model;
                this.__draw(model.node);
            },
            __draw:function (node) {
                var width = this.getOption("width");
                var height = this.getOption("height");
                var nodeLength = node.length;
                var dot, self = this;

                //
                this.empty();


                var line = this.line = GraphicManager.generateSymbol({
                    type:"g"
                });
                this.graphic.appendChild(line);

                var icon = this.icon = GraphicManager.generateSymbol({
                    type:"g"
                });
                this.graphic.appendChild(icon);


                for (var i = 0; i < nodeLength; i++) {
                    var item = node[i];
                    var connectionPoint = this.dateObj[item.connection];

                    switch (item.type) {
                        case 'server':
                            dot = new fruit.Graphic.Server({
                                config:item
                            });
                            break;
                        default:
                            dot = new fruit.Graphic.Router({
                                config:item
                            });
                            break;
                    }
                    dot.on('nodeClick', function (inSender, args) {
                        self.trigger('nodeClick', args);
                    })

                    dot.on('mousedown', function (inSender, args) {
                        self.__startDraggingItem(inSender, args);
                    })


                    var line = GraphicManager.generateSymbol({
                        type:'line',
                        x1:item.x + 16,
                        y1:item.y + 16,
                        x2:connectionPoint.x + 16,
                        y2:connectionPoint.y + 16,
                        stroke:"#ccc"
                    })

                    line.style.strokeDasharray = "9, 5";
                    this.line.appendChild(line);
                    this.icon.appendChild(dot.graphic);
                }

            },
            __calcStagePosition:function () {
                this.width = this.getOption("width");
                this.height = this.getOption("height");
                this.offsetTop = this.graphic.offsetTop;
                this.offsetLeft = this.graphic.offsetLeft;
            },
            __startDraggingItem:function (inSender, args) {
                var self = this;

                this.__calcStagePosition();

                var drag = function (e) {
                    var mouseX = e.pageX;
                    var mouseY = e.pageY;
                    itemX = mouseX - self.offsetLeft;
                    itemY = mouseY - self.offsetTop;
                    inSender.img.setAttribute("x", itemX);
                    inSender.img.setAttribute("y", itemY);
                    args.x = itemX;
                    args.y = itemY;
                    self.redraw();
                }

                document.addEventListener("mousemove", drag);
                document.addEventListener("mouseup", function (e) {
                    document.removeEventListener("mousemove", drag, false);
                })
            }

        }
    })
})(fruit, fruit.util, fruit.Graphic.GraphicManager);
