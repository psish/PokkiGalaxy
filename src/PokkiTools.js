/*  
    PokkiTools
     - Part of PokkiGalaxy Framework

    @authors
        John Chavarria <john@sweetlabs.com>, SweetLabs Inc.
    @version 1.1
    @license MIT License

    @copyright (c) 2011, Authors.

*/


/**
* isJSON: Tests if a string is a valid stringified JSON (to avoid try/catch).
*
* @param String str A string to be tested.
* @return Boolean.
*/
pokki.isJSON = function isJSON(str)
{

    return (/^[\],:{}\s]*$/.test(str.replace(/\\["\\\/bfnrtu]/g, '@').replace
     (/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
     replace(/(?:^|:|,)(?:\s*\[)+/g, '')));

};


/**
* isURL: Tests if a string is a valid URL.
*
* @param String str A string to be tested.
* @return Boolean.
*/
pokki.isURL = function isURL(value)
{

	return (/[A-Za-z]+:\/\/[A-Za-z0-9-_\#\!]+\.[A-Za-z0-9-_:%&\?\/.=]+/gm).
	 test(value);

};


/**
* isElement: Checks if the el param is an Element.
*
* @param Element/String el Element parameter.
* @return Element  
*/
pokki.isElement = function isElement(el)
{

    return (typeof (el) == 'Element' || typeof (el) == 'object'
     ? el : document.getElementById(el));

};


/**
* debug: Extending console.log function to work only in debug mode.
*
*/
pokki.debug = function debug()
{

    if (pokki.config.debug) {
        for (var i = 0; i < arguments.length; i++) {
            console.log(arguments[i]);
        }
    }

};


// Extending pokki.rpc function to handle objects and arrays.
pokki.r = function(pattern, stringify)
{

    stringify = stringify || false;

    var func = pattern.split('(')[0];

    if (pokki.rpc('typeof ' + func + ' == "function"')) {
        if (stringify) {
            return JSON.parse(pokki.rpc('JSON.stringify('+pattern+')'));            
        } else {
            return pokki.rpc(pattern);        
        }
    } else {
        if (pokki.rpc('typeof ' + pattern + ' == "object" ||' +
                      'typeof ' + pattern + ' == "array"')) {
            return JSON.parse(pokki.rpc('JSON.stringify('+pattern+')'));
        } else {
            return pokki.rpc(pattern);
        }
    }

};


// Extends XHR prototype to add sendAsBinary method
XMLHttpRequest.prototype.sendAsBinary = function(datastr)
{

    function byteValue(x)
    {

        return x.charCodeAt(0) & 0xff;

    }

    var ords = Array.prototype.map.call(datastr, byteValue);
    var ui8a = new Uint8Array(ords);
    this.send(ui8a.buffer);

};
