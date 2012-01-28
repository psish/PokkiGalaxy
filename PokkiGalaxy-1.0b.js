/*  
    PokkiGalaxy
     - Part of PokkiGalaxy Framework

    @authors
        John Chavarria <john@sweetlabs.com>, SweetLabs Inc.
    @version 1.0b
    @license MIT License

    @copyright (c) 2011, Authors.

*/


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


/*  
    PokkiStorage
     - Part of PokkiGalaxy Framework

    @authors
        John Chavarria <john@sweetlabs.com>, SweetLabs Inc.
    @version 1.3
    @license MIT License

    @copyright (c) 2011, Authors.

*/


pokki.storage = {


    /**
    * get: Gets one or several items from LocalStorage.
    *
    * @param array/string key The key of the element.
       An array can be passed to get several keys.
       The keys can be stringified object structures (i.e. "foo.bar.key").
    * @param bool scramble Is the value needs to be descrambled?
    * @return * The returned value.
    */
    get: function(key, scramble)
    {

        scramble = scramble || false;

        // If several keys are passed.
        if (typeof key == 'object') {
            var obj = {};
            for (var k = 0; k < key.length; k++) {
                obj[key[k]] = this.get(key[k], scramble);
            }
            return obj;
        // If a single key is passed.
        } else {
            var key = this.decompose(key);

            // If the key is a stringified object structure.
            if (key.object) {
                return this.parse(key.item, scramble)[key.key];
            // If the key is a normal string.
            } else {
                return this.parse(key, scramble);        
            }        
        }
        
    },


    /**
    * set: Sets one or several items to LocalStorage.
    *
    * @param object/string key The key of the element.
       An object can be passed to set several keys.
       The keys can be stringified object structures (i.e. "foo.bar.key").
       Object must be formated as following: {foo: {value:'bar', scramble:true}}
    * @param * value The value to set.
    * @param bool scramble Is the value needs to be descrambled?
    */
    set: function(key, value, scramble)
    {

        scramble = scramble || false;

        // If several keys are passed.
        if (typeof key == 'object') {
            for (var k in key) {
                this.set(k, key[k].value, key[k].scrambled);
            }
        // If a single key is passed.
        } else {
            var key = this.decompose(key);

            // If the key is a stringified object structure.
            if (key.object) {
                var obj = {};
                var previous = "";
                for (var i = 1; i < key.keys.length; i++) {
                    previous += key.keys[i];
                    if (i < key.keys.length - 1) {
                        obj[previous] = {};
                    } else {
                        obj[previous] = this.stringify(value, scramble);
                    }
                }

                var item = this.get(key.item);
                for (var k in obj) {
                    item[k] = obj[k];
                }
                localStorage.setItem(key.item, this.stringify(item, scramble));
            // If the key is a normal string.
            } else {
                localStorage.setItem(key, this.stringify(value, scramble));
            }                      
        }
    
    },


    /**
    * remove: Removes one or several items from LocalStorage.
    *
    * @param array/string key The key of the element.
       An array can be passed to remove several keys.
       The keys can be stringified object structures (i.e. "foo.bar.key").
    */
    remove: function(key)
    {

        // If several keys are passed.
        if (typeof key == 'object') {
            for (var k = 0; k < key.length; k++) {
                this.remove(key[k]);
            }        
        // If a single key is passed.
        } else {
            var key = this.decompose(key);

            // If the key is a stringified object structure.
            if (key.object) {
                var item = this.get(key.item);
                delete item[key.key];
                this.set(key.item, item);
            // If the key is a normal string.
            } else {
                localStorage.removeItem(key);
            }                      
        }    
    
    },


    /**
    * isset: Checks if a LocalStorage variable is set.
    *
    * @param array/string key The key of the element.
       The key can be a stringified object structure (i.e. "foo.bar.key").
    * @return Boolean If the variable is set.

    */
    isset: function(key)
    {

        return (this.get(key) ? true : false);
    
    },


    /**
    * decompose: Decomposes a key string to check if it is a stringified object
       structure.
    *
    * @param String key The string key.
    * @param Object/String Returns the original key or an object containing the
       decomposed key.
    */
    decompose: function(key)
    {

        var keys   = key.split('.');
        var object = (keys.length > 1 ? true : false);

        if (object) {
            return {
                object : true,
                item   : keys[0],
                key    : key.substr(keys[0].length + 1, key.length),
                keys   : keys
            }
        } else {
            return key;
        }
    
    },


    /**
    * parse: Returns a variable from LocalStorage, JSON parses it and descramble
       if needed.
    *
    * @param array/string key The key of the element.
    * @param bool scramble Is the value needs to be descrambled?
    */
    parse: function(key, scramble)
    {

        scramble = scramble || false;

        var value = (scramble
            ? pokki.descramble(localStorage.getItem(key))
            : localStorage.getItem(key));

        return (pokki.isJSON(value) ? JSON.parse(value) : value);

    },


    /**
    * stringify: Returns the value stringified and scrambled if needed.
    *
    * @param * value The value.
    * @param bool scramble Is the value needs to be scrambled?
    */
    stringify: function(value, scramble)
    {

        scramble = scramble || false;

        value = (scramble ? pokki.scramble(value) : value);

        return (typeof value != 'string' ? JSON.stringify(value) : value);

    },

    /**
    * c: localStorage.clear() wrapper.
    *
    */
    c: function()
    {
    
        localStorage.clear();

    }


};

/*  
    PokkiTemplate
     - Part of PokkiGalaxy Framework

    @authors
        John Chavarria <john@sweetlabs.com>, SweetLabs Inc.
    @version 1.1
    @license MIT License

    @copyright (c) 2011, Authors.

*/


/**
* Constructor: Pokki Template Constructor.
*
* @param String template Template name.
* @param Object args Template arguments values.
* @param Element/String container Where to display.
*/
pokki.tpl = function tpl(template, args, container)
{

    this.get(template);
    container = pokki.isElement(container);
    container.innerHTML = this.parse(args, container);

};


/**
* get: Get the template file via local XHR.
*
* @param String template Template name.
*/
pokki.tpl.prototype.get = function get(template)
{

    var tpl = new XMLHttpRequest();
    tpl.open("GET", pokki.config.tplFolder + '/'+template+'.' +
     pokki.config.tplFormat, false);
    tpl.send();
    this.tpl = tpl.responseText;

};


/**
* parse: Parses the template content to apply the args.
*
* @param Object args Template arguments values.
* @param Element container Where to display.
*/
pokki.tpl.prototype.parse = function parse(args, container)
{

    this.tpl = this.tpl
     .replace(/\{{(.*?)\}}/g,
        function(markup, content) {
            content = content.split('.');
            count   = content.length;
            if (count > 1) {
                var initial = args[content[0]];
                var explode = content.splice(1, count);
                for (var i = 0; i < explode.length; i++) {
	                initial = initial[explode[i]];
                }
                return initial;
            } else {
                return args[content];
            }
            
        });

    return this.tpl;

};

/*  
    PokkiBenchmark
     - Part of PokkiGalaxy Framework

    @authors
        John Chavarria <john@sweetlabs.com>, SweetLabs Inc.
    @version 1.1
    @license MIT License

    @copyright (c) 2011, Authors.

*/


/**
* Constructor: Pokki Benchmark Constructor.
*
*/
pokki.benchmark = function benchmark()
{

    this.start = +new Date();

};


/**
* stop: Stops the timer.
*
* @param Bool display Console.log the result?
*/
pokki.benchmark.prototype.stop = function stop(display)
{

    display = display || false;

    this.stop = +new Date();

    this.time = this.stop - this.start;

    if (display) {
        this.display();
    }

    return this.time;

};


/**
* display: Console.log the bench time.
*
* @param String description A title for the current benchmark.
* @param String unit Display in miliseconds or seconds.
*/
pokki.benchmark.prototype.display = function display(description, unit)
{

    description = description   || false;
    unit        = unit          || false;

    var time = (unit ? this.timing(this.time, unit) : this.time);
    
    pokki.debug('[Benchmark' + (description ? ' ' + description+'] ' : '] ') +
     time + (unit ? unit : 'ms'));

};


/**
* display: Console.log the bench time.
*
* @param String description A title for the current benchmark.
* @param String unit Display in miliseconds or seconds ('s' || 'ms').
*/
pokki.benchmark.prototype.timing = function timing(time, unit)
{

    return (unit == 'ms' ? time : time / 1000);

};



/*  
    PokkiTemplate
     - Part of PokkiGalaxy Framework

    @authors
        John Chavarria <john@sweetlabs.com>, SweetLabs Inc.
    @version 1.0
    @license MIT License

    @copyright (c) 2011, Authors.

*/


/**
* pokkiUploader constructor
*
* @param Object options pokkiUploader Options.
*/
pokki.uploader = function(options)
{

    // Setting options
    this.options = this.setOptions(options);

    // Injecting the iframe.
    this.createIframe();

    // Handling Drag & Drop
    this.handleDrop();

    // Handling input file
    this.handleInput();
    
};


/**
* send: Sends the XHR Request
*
* @param String uri The URL for the XHR request
* @param Object headers Request headers
* @param String/Object POST parameters
* @param String paramName File POST param name="" 
* @param Function progress Progress callback function
* @param Function success Success callback function
*/
pokki.uploader.prototype.send = function send(uri, headers, params, paramName,
 progress, success)
{

    if (this.file) {
        // Config vars
        var xhr         = new XMLHttpRequest();
        var boundary    = '----------POKKIUPLOADERBOUNDARY2011';
        var body        = '';
        var rn          = "\r\n";
        var fileName    = this.file.name;
        var fileType    = 'application/octet-stream';
        var fileData    = this.file.data;

        // File body
        body += '--' + boundary + rn;
        body += 'Content-Disposition: form-data; name="'+ paramName +
         '"; filename="' + fileName + '"' + rn;
        body += "Content-Type: " + fileType + rn + rn;
        body += fileData + rn;
        body += '--' + boundary;

        // POST parameters
        if (typeof params == 'string') {
            params = params.split('&');
            for (var i = 0; i < params.length; i++) {
                var p = params[i].split('=');
                body += rn + 'Content-Disposition: form=data; name="'+p[0]+'"' +
                 rn + rn + p[1] + rn + '--' + boundary;
            }
            body += '--';
        } else if (typeof params == 'object') {
            for (var i in params) {
                body += rn + 'Content-Disposition: form-data; name="' + i + '"'+
                 rn + rn + params[i] + rn + '--' + boundary;
            }
            body += '--';
        }

        // Success & Failure callback
        xhr.onreadystatechange = function(e) {
            if (xhr.readyState == 4) {
                if (xhr.status == 200) {
                    success(xhr.responseText);
                } else {
                    this.options.failure(this.errorCodes(003, xhr));
                }
            }
        }.bind(this); 

        // Progress callback
        xhr.upload.addEventListener('progress', function(e) {
            if (e.lengthComputable) {
                var percentage = Math.round((e.loaded * 100) / e.total);
                progress(percentage);
            }
        }, false);
        xhr.upload.addEventListener('error', function(e) {
            this.options.failure(e);
        }.bind(this), false);

        // Open XHR
        xhr.open("POST", uri, true);
        xhr.setRequestHeader("Content-Type", "multipart/form-data; boundary="
         + boundary);

        // Headers
        for (var key in headers) {
            var header = '';
            if (headers[key].prefix) {
                header += headers[key].prefix + ' ';
            }
            if (typeof headers[key].headers == 'string') {
                head = headers[key].headers.split('&');
                for (var i = 0; i < head.length; i++) {
                    var h = head[i].split('=');
                    header += h[0] + '="' + h[1] + '", ';
                }  
            } else if (typeof headers[key].headers == 'object') {
                for (var k in headers[key].headers) {
                    header += k + '="' + headers[key].headers[k] + '", ';
                }
            }
            if (header.charAt(header.length - 2) == ',') {
                header = header.slice(0, header.length - 2);
            }

            xhr.setRequestHeader(key, header);                                        

        }

        // Content Length
        xhr.setRequestHeader("Content-Length", body.length);

        // Send XHR
        xhr.sendAsBinary(body);
    } else {
        // No file selected failure
        this.options.failure(this.errorCodes(002));
    }

};


/**
* PokkiUploader options setting
*
* @param Object options PokkiUploader Options.
* @return Object Formatted options.
*/
pokki.uploader.prototype.setOptions = function setOptions(options)
{

    var opt = {};

    for (var key in options) {
        if (options.hasOwnProperty(key)) {
            opt[key] = (key == 'input' || key == 'dropzone' || key == 'overdrop'
             ? pokki.isElement(options[key]) : options[key]);
        }
    }

    return opt;

};


/**
* handleFiles: Handle files dropped or selected from an input
*
* @param Files files HTML Files object.
* @param Boolean input File from an input or a drop?
*/
pokki.uploader.prototype.handleFiles = function handleFiles(files)
{

    this.file = files[0];

    var isImage = (this.file.type.match('image.*') ? true : false);
    var typeOk  = false;
    if (this.options.types) {
        var cont = true;
        for (var key = 0; key < this.options.types.length; key++) {
            if (this.file.type.match(this.options.types[key]) && cont) {
                typeOk = true;
                cont = false;
            }
        }
    } else {
        var typeOk = true;
    }

    if (!typeOk) {
        this.options.failure(this.errorCodes(001));
        this.file = false;
    }

    var i = 0;
    var reach = (isImage ? 2 : 1);

    if (typeOk) {
        this.frame.contentWindow.window.getData(this.file, false,
         function(data) {

            this.file.data = data;

            i++;
            if (i == reach) {
                this.options.handle(this.file);
            }

        
        }.bind(this));
    }

    if (isImage && typeOk) {
        this.frame.contentWindow.window.getData(this.file, true,
         function(data) {

            this.file.dataURL = data;

            i++;
            if (i == reach) {
                this.options.handle(this.file);
            }
        
        }.bind(this));
    }
};


/**
* handleInput: Handles the dropzone
*
*/
pokki.uploader.prototype.handleInput = function handleInput()
{

    // If an input exists
    if (this.options.input) {
        this.options.input.addEventListener('change', function(ev) {

            this.handleFiles(ev.target.files);

        }.bind(this));
    }

};


/**
* handleDrop: Handles the dropzone
*
*/
pokki.uploader.prototype.handleDrop = function handleDrop()
{

    // If a dropzone exists
    if (this.options.dropzone) {
        // Creates an HTML5 drop zone.
        this.dropbox = this.createDropbox(this.options.dropzone);

        // If there is a drop over, creates another HTML5 drop zone.
        if (this.options.overdrop) {
            this.overdropbox = this.createDropbox(this.options.overdrop, true);
        }
    }

};


/**
* createDropbox: creates an HTML5 dropbox
*
* @params Element el Element to apply the dropbox.
* @param Boolean force Forces the handling of files on drop.
* @return Object pokki.dropbox instance.
*/
pokki.uploader.prototype.createDropbox = function createDropbox(el, force)
{

    force = force || false;

    return new pokki.dropbox(el, {
        onDragEnter: function() {
            if (typeof this.options.onDragEnter == 'function') {
                this.options.onDragEnter();
            }
            this.overDrop();
        }.bind(this),
        onDragExit: function() {
            if (typeof this.options.onDragExit == 'function') {
                this.options.onDragExit();
            }
            this.overDrop(true);
        }.bind(this),
        onDragOver: function() {
            if (typeof this.options.onDragOver == 'function') {
                this.options.onDragOver();
            }
            this.overDrop();
        }.bind(this),
        onDrop: function(files) {
            if (!this.options.overdrop || force) {
                this.handleFiles(files);
            }
            this.overDrop(true);
        }.bind(this)
    });

};


/**
* overDrop: Display the over drop Element
*
* @param Boolean destroy Display or destroy the Element?
*/
pokki.uploader.prototype.overDrop = function overDrop(destroy)
{

    destroy = destroy || false;

    if (this.options.overdrop) {
        if (destroy) {
            this.options.overdrop.setAttribute('style', 'display: none;');        
        } else {
            this.options.overdrop.setAttribute('style', 'display: block;');        
        }
    }

};


/**
* createIframe: Creates the iframe for upload.
*
*/
pokki.uploader.prototype.createIframe = function createIframe()
{

    var current = document.getElementById('PokkiUploaderFrame-'
     + this.options.frame);
    if (!current) {
        this.frame = document.createElement('iframe');
        this.frame.setAttribute('id', 'PokkiUploaderFrame-'
         + this.options.frame);
        this.frame.setAttribute('src', this.options.frame);
        this.frame.setAttribute('style', 'position:absolute; left:-9999px;');
        document.body.appendChild(this.frame);
    } else {
        this.frame = current;
    }

};


/**
* errorCodes: Error handling.
*
* @param Number code Error code number.
* @param Object xhr XHR Object  
*/
pokki.uploader.prototype.errorCodes = function errorCodes(code, xhr)
{

    xhr = xhr || false;

    switch (code) {
        case 001:
            return {
                code    : 001,
                error   : 'This file type is not supported!'
            };
            break;
        case 002:
            return {
                code    : 002,
                error   : 'No file selected!'
            };
            break;
        case 003:
            return {
                code    : 003,
                error   : xhr,
            }
    }

};


/*  
    PokkiDropBox
     - Part of PokkiGalaxy Framework

    @authors
        John Chavarria <john@sweetlabs.com>, SweetLabs Inc.
    @version 1.1
    @license MIT License

    @copyright (c) 2011, Authors.

*/


/**
* Constructor: Pokki DropBox Constructor.
*
* @param Element/String el The Element to apply the dropbox.
* @param Object options PokkiDropBox options.
*/
pokki.dropbox = function(el, options)
{

    el = pokki.isElement(el);

    if (options.onDragEnter) {
	    el.addEventListener("dragenter", function(ev) {
	    
	        callback('enter', ev);
	        
	    }, false);    
    }
    if (options.onDragExit) {
	    el.addEventListener("dragexit", function(ev) {
	    
	        callback('exit', ev);
	        
	    }, false);    
    }
	el.addEventListener("dragover", function(ev) {
	
	    callback('over', ev);
	    
	}, false);
	el.addEventListener("drop", function(ev) {
	
	    callback('drop', ev);
	    
	}, false);

    var callback = function callback(type, ev)
    {

	    ev.stopPropagation();
	    ev.preventDefault();    
        switch (type) {
            case 'enter':
                options.onDragEnter();
                break;
            case 'exit':
                options.onDragExit();
                break;
            case 'over':
                options.onDragOver();
                break;
            case 'drop':
	            var files = ev.dataTransfer.files;            
                if (files.length > 0) {
                    options.onDrop(files);
                } else {
                    options.onDrop(false);
                }
                break;
        }
    
    };

};


/*  
    PokkiFx
     - Part of PokkiGalaxy Framework

    @authors
        John Chavarria <john@sweetlabs.com>, SweetLabs Inc.
    @version 1.0
    @license MIT License

    @copyright (c) 2011, Authors.

*/


pokki.Fx = {

    // Global timer
    timer: null,

    /**
    * fade: Fades in or out an Element
    *
    * @param Element el The DOM Element.
    * @param [String/Object options Set of options.]
    */
    fade: function(el, options)
    {

        var opt = {
            properties: 'opacity',
            duration : '0.5s',
            values    : '0'
        };

        this.setTransition(el, opt, options, 'in', 1);

    },


    /**
    * slide: Slides in or out an Element
    *
    * @param Element el The DOM Element.
    * @param [String/Object options Set of options.]
    */
    slide: function(el, options)
    {

        if (typeof options == 'string') {
            var inout = options;
            var type  = 'vertical';
            var fade  = false;
        } else if (typeof options == 'object') {
            if (options.type) {
                var type = options.type;
                delete options.type;
            } else {
                var type = 'vertical';
            }
            if (options.way) {
                var inout = options.way;
                delete options.way;
            } else {
                var inout = 'in';
            }
            if (options.fade) {
                var inout = options.fade;
                delete options.fade;
            } else {
                var fade = false;
            }
        } else {
            var inout = 'in';
            var type  = 'vertical';
            var fade  = false; 
        }

        this.slider(el, type, fade, inout, options)

    },


    /**
    * reveal: Reveals an Element (Slide In + Opacity)
    *
    * @param Element el The DOM Element.
    * @param [String/Object options Set of options.]
    */
    reveal: function(el, options)
    {

        var type =
         (typeof options == 'object' && options.type
          ? options.type
          : 'vertical'
         );

        this.slider(el, type, true, 'in', options);

    },


    /**
    * dissolve: Dissolves an Element (Slide Out + Opacity)
    *
    * @param Element el The DOM Element.
    * @param [String/Object options Set of options.]
    */
    dissolve: function(el, options)
    {

        var type =
         (typeof options == 'object' && options.type
          ? options.type
          : 'vertical'
         );

        this.slider(el, type, true, 'out', options);

    },


    /**
    * toggle: Toggles an Element (Slide in or out)
    *
    * @param Element el The DOM Element.
    * @param [Object options User options.] 
    */
    toggle: function(el, options)
    {

        if (!el.clientHeight) {
            this.reveal(el, options);
        } else {
            this.dissolve(el, options);
        }
        
    },


    /**
    * morph: Tweens two CSS classes on a DOM Element
    *
    * @param Element el The DOM Element.
    * @param String css The CSS class to tween to.
    * @param [Object options User options.] 
    */
    morph: function(el, css, options)
    {

        var styles = this.getStyles(el);
        var node   = el.nodeName;

        var dummy = document.createElement(node);
        dummy.setAttribute('class', css);
        document.body.appendChild(dummy);
        var newStyles = this.getStyles(dummy);
        document.body.removeChild(dummy);

        var compare = this.styleCompare(styles, newStyles);
        compare.duration = '0.5s';
        this.setTransition(el, compare, options);

    },


    /**
    * set: Sets a CSS3 Transition to an Element.
    *
    * @param Element el The DOM Element.
    * @param Object options User options.
    */
    set: function(el, options)
    {

        var opt = Object();

        if (!options.duration) {
            opt.duration = '0.5s';
        }

        this.setTransition(el, opt, options);
    
    },


    /**
    * setTransition: Sets a CSS3 Transition to an Element.
    *
    * @param Element el The DOM Element.
    * @param Object opt Transition options
    * @param [Object options User options.]
    * @param [String str String option.]
    * @param [String/Number value Value to force if string option is passed.]
    * @param [Function start Function to execute onStart.]
    * @param [Function complete Function to execture onComplete.]
    */
    setTransition: function(el, opt, options, str, value, start, complete)
    {

        options  = options  || false;
        str      = str      || false;
        value    = (value   || value == 0 ? value.toString() : false);
        start    = start    || false;
        complete = complete || false;

        if (typeof options == 'string' && str && value) {
            if (options == str) {
                opt.values = [value];
            }    
        } else if (typeof options == 'object') {
            for (var key in options) {
                opt[key] = options[key];
                if (key == 'duration' && typeof options[key] == 'string') {
                    opt.duration = [this.duration(options[key])];
                }
            }
        }

        if (typeof opt.properties == 'string') {
            var prop = opt.properties.split(' ').join('').split(',');
            opt.properties = prop;
        }

        if (typeof opt.values == 'string') {
            opt.values = [opt.values];
        }

        var delay = 0;
        if (opt.delay) {
            delay = opt.delay * 1000;
        }

        setTimeout(function() {
            this.onStart(opt.onStart, start);
        }.bind(this), delay);
        
        setTimeout(function() {
            // Setting timing function transition
            if (opt.transition) {
                el.style['-webkit-transition-timing-function']
                 = opt.transition;
            }

            // Setting transition delay
            if (opt.delay) {
                el.style['-webkit-transition-delay'] = opt.delay + 's';
            }

            // Setting list of properties to animate
            el.style['-webkit-transition-property'] =
             opt.properties.toString();
            // Setting properties duration
            el.style['-webkit-transition-duration'] =
             opt.duration.toString();

            for (var i = 0; i < opt.properties.length; i++) {
                // If the background is a CSS3 gradient
                if ((opt.properties[i] == 'background'
                     || opt.properties[i] == 'background-image') 
                && this.isGradient(opt.values[i])) {
                    var orig = window.getComputedStyle(el)['background-image'];
                    var from = this.prepareGradient(orig); 
                    var to   = this.prepareGradient(opt.values[i]);
                    this.gradientBG(el, {
                        from: from,
                        to: to,
                        duration: opt.duration
                    });
                } else {
                    // Setting properties values
                    el.style[opt.properties[i]] = opt.values[i];
                }
            }
        }.bind(this), 0);

        this.onComplete(el, opt.onComplete, complete);

    },


    /**
    * slider: Slides a DOM Element
    *
    * @param Element el The DOM Element.
    * @param String type Horizontal or Vertical.
    * @param Boolean fade Apply fade or not.
    * @param String inout In or Out?
    * @param Object options User options.
    */
    slider: function(el, type, fade, inout, options)
    {

        if (inout == 'in') {
            el.style.cssText  = '';
            if (fade) {
                el.style.opacity = 0;
            }
        }
        el.style.overflow = 'hidden';

        var metrics = this.getMetrics(el);
        var outComplete;

        if (inout == 'in') {
            el.style.display = 'block';
            metrics = this.getMetrics(el);
            if (type == 'vertical') {
               el.style.height = 0;        
            } else if (type == 'horizontal') {
               el.style.width = 0;        
            }
        } else {
            outComplete = function() {
                el.style.display = 'none';
            };
        }

        var opt = {


            duration: '0.5s'
        };

        if (type == 'vertical') {
            opt.properties = ['height', 'margin-top', 'margin-bottom'];
            if (inout == 'in') {
                opt.values =
                 [metrics.height, metrics['margin-top'],
                  metrics['margin-bottom']];
            } else if (inout == 'out') {
                opt.values = [0, 0, 0];
            }
        } else if (type == 'horizontal') {
            opt.properties = ['width', 'margin-left', 'margin-right'];
            if (inout == 'in') {
                opt.values =
                 [metrics.width, metrics['margin-left'],
                  metrics['margin-right']];
            } else if (inout == 'out') {
                opt.values = [0, 0, 0];
            }
        }     
         

        if (fade) {
            opt.properties.push('opacity');
            if (inout == 'in') {
                opt.values.push(1);
            } else if (inout == 'out') {
                opt.values.push(0);
            }
        }
        
        this.setTransition(el, opt, options, false, false, false, outComplete);

    },


    /**
    * onStart: Fires onStart Event.
    *
    * @param Function start The onStart callback Function.
    */
    onStart: function(start, s)
    {

        if (typeof s == 'function') {
            s();
        }
        if (typeof start == 'function') {
            start();
        }

    },


    /**
    * onComplete: Fires onCoGetMetricsmplete Event.
    *
    * @param Element el The DOM Element to attach the Event Listener.
    * @param Function start The onStart callback Function.
    */
    onComplete: function(el, complete, c)
    {

        var fnc = function() {
            if (typeof c == 'function') {
                c();
            }
            if (typeof complete == 'function') {
                complete();
            }
            el.removeEventListener('webkitTransitionEnd', fnc, true);
        };

        el.addEventListener('webkitTransitionEnd', fnc, true);

    },


    /**
    * gradientBG: Animates a gradient background.
    *
    * @param Element el The DOM Element.
    * @param Object options Colors and duration.
    */
    gradientBG: function(el, options)
    {

        var duration = options.duration.toString();

        var timer = 25;

        duration   = Number(duration.split('s')[0]) * 1000;
        var iterations = duration / timer;

        var from0 = this.hexToRGB(options.from.color1);
        var from1 = this.hexToRGB(options.from.color2);
        var to0   = this.hexToRGB(options.to.color1);
        var to1   = this.hexToRGB(options.to.color2);

        var color1 = this.colorSteps(from0, to0, iterations);
        var color2 = this.colorSteps(from1, to1, iterations);

        if (el.getAttribute('lock') == 'false' ||
         el.getAttribute('lock') == null) {
            for (var i = 0; i < iterations; i++) {
                    this.timer = setTimeout(function(val) {

                        var c1 = 'rgb('+
                         color1.R[val]+','+color1.G[val]+','+color1.B[val] + ')';
                        var c2 = 'rgb('+
                         color2.R[val]+','+color2.G[val]+','+color2.B[val] + ')';

                        el.style.background =
                         '-webkit-gradient(linear, 0% 0%, 0% 100%, from('+
                         c1+'), to('+c2+'))';    

                        if (val == 0) {
                            el.setAttribute('lock', 'true');
                        } else if (val == iterations - 1) {
                            el.setAttribute('lock', 'false');
                        }

                    }.bind(this), timer * i, i);
            }
        }

    },


    /**
    * isRGB: Checks if a color is in RGB or Hex.
    *
    * @param String color The color string.
    * @return Boolean.
    */
    isRGB: function(color)
    {
    
        return color.substring(0,3).toLowerCase() == 'rgb';

    },
    

    /**
    * colorSteps: Create steps for a color, joining unit steps.
    *
    * @param Number color1 The first color.
    * @param Number color2 The second color.
    * @param Number iterations Number of iterations.
    * @return Object.
    */
    colorSteps: function(color1, color2, iterations)
    {

        return {
            R: this.unitSteps(color1.R, color2.R, iterations),
            G: this.unitSteps(color1.G, color2.G, iterations),
            B: this.unitSteps(color1.B, color2.B, iterations)
        };
    
    },


    /**
    * unitSteps: Create steps between two color units (R, G or B).
    *
    * @param Number u1 The first color unit.
    * @param Number u2 The second color unit.
    * @param Number iterations Number of iterations.
    * @return Object.
    */
    unitSteps: function(u1, u2, iterations)
    {

        var less = false;
        var R = u1 - u2;
        if (R < 0) {
            R = R * -1;
            less = true;
        }
        var RAdd  = Math.ceil(R / iterations); 
        var RStep = Array();

        for (var i = 0; i < iterations; i++) {
            if (less) {
                if (u1 < u2 && (u1 + RAdd < u2)) {
                    u1 = u1 + RAdd;
                    RStep.push(u1);
                } else {
                    RStep.push(u2);
                }
            } else {
                if (u1 > u2 && (u1 - RAdd > u2)) {
                    u1 = u1 - RAdd;
                    RStep.push(u1);
                } else {
                    RStep.push(u2);
                }
            }
        }

        return RStep;
    
    },


    /**
    * hexToRGB: Transforms a color String from Hex to RGB.
    *
    * @param String hex The color string.
    * @return Object.
    */
    hexToRGB: function(hex)
    {

        if (!this.isRGB(hex)) {
            hex = (hex.charAt(0) == '#' ? hex.substring(1) : hex);
            hex = (hex.length == 3 ? hex + hex : hex);

            return {
                R: parseInt(hex.substring(0,2), 16),
                G: parseInt(hex.substring(2,4), 16),
                B: parseInt(hex.substring(4,6), 16)
            }
        } else {
            hex = hex.split(' ').join('').substring(4,hex.length-1).split(',');
            return {
                R: parseInt(hex[0]),
                G: parseInt(hex[1]),
                B: parseInt(hex[2])
            }
        }


    },


    /**
    * isGradient: Checks if a background property is a gradient.
    *
    * @param String property The CSS property.
    * @return Boolean.
    */
    isGradient: function(property)
    {
    
        return property.split(' ').join('').substring(0,16)
         == '-webkit-gradient';    

    },
    

    /**
    * prepareGradient: Prepares a gradient CSS property, transforming into Obj.
    *
    * @param String prop The CSS property.
    * @return Object.
    */
    prepareGradient: function(prop)
    {

        prop = prop.split(' ').join('').substring(17, prop.length-7).split(',');

        if (prop[3].substring(5,8) == 'rgb') {
            prop[3] = prop[3] +  ',' + prop[4] + ',' + prop[5];
            prop[4] = prop[6] +  ',' + prop[7] + ',' +
             prop[8].substring(0, prop[8].length - 1);
        }

        return {
            type: prop[0],
            left: [prop[1].split('%')[0], prop[1].split('%')[1]],
            right: [prop[2].split('%')[0], prop[2].split('%')[1]],
            color1: prop[3].substring(5, prop[3].length - 1),
            color2: prop[4].substring(3, prop[4].length - 1)
        }
        
    },


    /**
    * styleCompare: Compares two sets of CSS Styles.
    *
    * @param Object style1 The first set of styles.
    * @param Object style2 The second set of styles.
    * @return Object Styles differences.
    */
    styleCompare: function(style1, style2)
    {

        var compare = {
            properties:[],
            values:[]
        };
        
        for (var key in style1) {
            if (this.isCSS3Style(key) && style1[key] != style2[key]) {
                compare.properties.push(key);
                compare.values.push(style2[key]);        
            }
        }

        return compare;

    },


    /**
    * isCSS3Style: Tests if a CSS Property can be animated with CSS3.
    *
    * @param String key The CSS property.
    * @return Bool.
    */
    isCSS3Style: function(key)
    {

        var css3Styles = [
            'background-color',
            'background-image',
            'background-position',
            'background-size',
            'border-color',
            'border-radius',
            'border-width',
            'border-spacing',
            'border',
            'border-left',
            'border-top-left-radius',
            'border-top-right-radius',
            'border-bottom-left-radius',
            'border-bottom-right-radius',
            'color',
            'clip',
            'fill',
            'fill-opacity',
            'flood-color',
            'font-size',
            'font-size-adjust',
            'font-stretch',
            'font-weight',
            'height',
            'left',
            'letter-spacing',
            'lighting-color',
            'line-height',
            'margin',
            'margin-top',
            'margin-left',
            'margin-right',
            'margin-bottom',
            'marker-offset',
            'max-height',
            'max-width',
            'min-height',
            'min-width',
            'opacity',
            'outline-color',
            'outline-offset',
            'outline-width',
            'padding',
            'padding-top',
            'padding-right',
            'padding-bottom',
            'padding-left',
            'right',
            'stop-color',
            'stop-opacity',
            'stroke',
            'stroke-dasharray',
            'stroke-dashoffset',
            'stroke-miterlimit',
            'stroke-opacity',
            'stroke-width',
            'text-indent',
            'text-shadow',
            'top',
            'vertical-align',
            'visibility',
            'width',
            'word-spacing',
            'z-index'
        ];

        return css3Styles[key] == undefined;

    },


    /**
    * getStyles: Gets the styles of a specified DOM Element.
    *
    * @param Element el The DOM Element.
    * @return Object Computed styles of the Element.
    */
    getStyles: function(el)
    {

        var computedStyles  = window.getComputedStyle(el).cssText;
        return this.stylesToObject(computedStyles);

    },


    /**
    * stylesToObject: Transforms styles from string to Object.
    *
    * @param String styles CSSText.
    * @return Object CSS Styles Object formated.
    */
    stylesToObject: function(styles)
    {

        styles = styles.split(';');

        var obj = {};
        for (var i = 0; i < styles.length; i++) {
            var tmp = styles[i].split(':');
            if (tmp[0][0] == ' ') {

                tmp[0] = tmp[0].substr(1);
            }
            if (tmp[0] && tmp[1]) {
                obj[tmp[0]] = tmp[1];
            }
        }
        
        return obj;

    },


    /**
    * getMetrics: Get the metrics of an Element (witdh / height / margins)
    *
    * @param Element el The DOM Element.
    */
    getMetrics: function(el)
    {

        var size = window.getComputedStyle(el);

        return {
            'height'        : el.clientHeight + 'px',
            'width'         : el.clientWidth + 'px',
            'margin-top'    : size['margin-top'],
            'margin-bottom' : size['margin-bottom'],
            'margin-left'   : size['margin-left'],
            'margin-right'  : size['margin-right']
        };

    },


    /**
    * duration: Transforms a duration passed as a String in Number
    *
    * @param String The duration in String.
    * @return Number The duration in Number.
    */
    duration: function(str)
    {

        switch (str) {
            case 'short':
                return '0.25s';
                break;
            case 'normal':
                return '0.5s';
                break;
            case 'long':
                return '1s';
                break;
            default:
                return str;
                break;
        }

    }


};


/*  
    Pokki Google Analytics
     - Part of PokkiGalaxy Framework

    @authors
        Blake Machado <blake@sweetlabs.com>, SweetLabs Inc.
        Fontaine Shu <fontaine@sweetlabs.com>, SweetLabs, Inc.
    @version 1.2
    @license MIT License

    @copyright (c) 2011, Authors.

    Example usage:
        - Set your Account-Id and Domain in PokkiConfig.js
        - Call these whenever you want to track a page view or a custom event:
            pokki.ga._trackPageview('/index', 'optional title');
            pokki.ga._trackEvent('category', 'action', 'label', 'value');
*/


(function() {
    var VERSION = '1.2';
    var IS_DEBUG = false;
    
    var LocalStorage = function(key, initial_value) {
        if (window.localStorage.getItem(key) == null && initial_value != null) {
            window.localStorage.setItem(key, initial_value);
        }
        
        this._get = function() {
            return window.localStorage.getItem(key);
        };
        
        this._set = function(value) {
            return window.localStorage.setItem(key, value);
        };
        
        this._remove = function() {
            return window.localStorage.removeItem(key);
        };
        
        this.toString = function() {
            return this._get();
        };
    };
    
    ga_pokki = new function() {
        var that = this;
        var initialized = false;
        
        var tracking_code_url = 'http://www.google-analytics.com/ga.js';
        var beacon_url = 'http://www.google-analytics.com/__utm.gif';
        
        var utmac = false; // set by calling _setAccount
        var utmhn = false; // set by calling _setDomain
        var utmwv = '4.3'; // tracking api version
        var utmcs = 'UTF-8'; // charset
        var utmul = 'en-us'; // language
        var utmdt = '-'; // page title
        var utmn = 0; // random number
        var utmt = 'event'; // analytics type
        var utmhid = 0; // unique id per session
        
        var uid = new LocalStorage('ga_pokki_uid');
        var uid_rand = new LocalStorage('ga_pokki_uid_rand');
        var session_cnt = new LocalStorage('ga_pokki_session_cnt');
        var f_session = new LocalStorage('ga_pokki_f_session');
        var l_session = new LocalStorage('ga_pokki_l_session');
        var first_run = new LocalStorage('ga_pokki_first_run');
        var visitor_custom_vars = new LocalStorage('ga_pokki_visitor_custom_vars');
        
        var c_session = 0;
        var custom_vars = visitor_custom_vars._get() ? JSON.parse(visitor_custom_vars._get()) : ['dummy'];
        
        function rand(min, max) {
            return min + Math.floor(Math.random() * (max - min));
        }
        
        function get_random() {
            return rand(100000000,999999999);
        }
        
        function return_cookies() {
            // utma represents user, should exist for lifetime: [user_id].[random #].[first session timestamp].[last session timestamp].[start of this session timestamp].[total # of sessions]
            // utmb is a session, [user_id].[requests_per_session?].[??].[start of session timestamp]
            // utmc is a session, [user_id]
            // utmz is a referrer cookie
            var cookie = uid._get();
            var ret = '__utma=' + cookie + '.' + uid_rand._get() + '.' + f_session._get() + '.' + l_session._get() + '.' + c_session + '.' + session_cnt._get() + ';';
            ret += '+__utmz=' + cookie + '.' + c_session + '.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none);';
            ret += '+__utmc=' + cookie + ';';
            ret += '+__utmb=' + cookie + '.' + request_cnt + '.10.' + c_session + ';';
            return ret;
        }
        
        function generate_query_string(params) {
            var qa = [];
            for (var key in params) {
                qa.push(key + '=' + encodeURIComponent(params[key]));
            }
            return '?' + qa.join('&');
        }
      
        function gainit() {
            c_session = (new Date()).getTime();
            if(IS_DEBUG) console.log('gainit', c_session);
            
            request_cnt = 0;
            utmhid = get_random();
            
            if (uid._get() == null) {
                uid._set(rand(10000000,99999999));
                uid_rand._set(rand(1000000000,2147483647));
            }
            
            if (session_cnt._get() == null) {
                session_cnt._set(1);
            }
            else {
                session_cnt._set(parseInt(session_cnt._get()) + 1);
            }
            
            if (f_session._get() == null) {
                f_session._set(c_session);
            }
            if (l_session._get() == null) {
                l_session._set(c_session);
            }
            
            // event to reset session when popup closes
            pokki.addEventListener('popup_hidden', function() {
                // user has specified both required parameters...
                if(utmac && utmhn) {
                    that._trackEvent('User', 'PopupHidden');
                }
                
                if(IS_DEBUG) console.log('resetting session');
                
                l_session._set(c_session);
                request_cnt = 0;
                utmhid = get_random();
            });
            
            // event to start session when popup opens
            pokki.addEventListener('popup_showing', function() {
                // don't run the first time
                if(initialized) {
                    c_session = (new Date()).getTime();
                    session_cnt._set(parseInt(session_cnt._get()) + 1);
                    
                    if(IS_DEBUG) console.log('new current session time', c_session);
                }
                else {
                    initialized = true;
                }
            });
            
            // event to log an icon click and first run
            pokki.addEventListener('popup_shown', function() {
                // user has specified both required parameters...
                if(utmac && utmhn) {
                    // track first run
                    if(first_run._get() == null) {
                        that._trackEvent('User', 'FirstRun');
                        first_run._set(1);
                    }
                    // track icon click
                    that._trackEvent('User', 'IconClick');
                }
            });
        }
        
        // public
        this._setAccount = function(account_id) {
            if(IS_DEBUG) console.log(account_id);
            utmac = account_id;
            gainit();
        };
        // public
        this._setDomain = function(domain) {
            if(IS_DEBUG) console.log(domain);
            utmhn = domain;
        };
        // public
        this._setCustomVar = function(index, name, value, opt_scope) {
            if(index < 1 || index > 5) return false;
            
            var params = {
                name: name,
                value: value,
                scope: opt_scope
            };
            
            custom_vars[index] = params;
            
            // store if custom var is visitor-level (1)
            if(opt_scope === 1) {
                var vcv = visitor_custom_vars._get() ? JSON.parse(visitor_custom_vars._get()) : ['dummy'];
                vcv[index] = params;
                visitor_custom_vars._set(JSON.stringify(vcv));
            }
            
            if(IS_DEBUG) {
                console.log(custom_vars);
                //console.trace();
            }
            
            return true;
        };
        // public
        this._trackPageview = function(path, title) {
            if(IS_DEBUG) {
                console.log('Track Page View', arguments);
                //console.trace();
            }
            
            request_cnt++;
            if (!path) {
                path = '/';
            }
            if(!title) {
                title = utmdt;
            }
            
            // custom vars
            var event = '';
            
            if(custom_vars.length > 1) {
                var names = '';
                var values = '';
                var scopes = '';
                
                for(var i = 1; i < custom_vars.length; i++) {
                    names += custom_vars[i].name;
                    values += custom_vars[i].value;
                    scopes += (custom_vars[i].scope == null ? 3 : custom_vars[i].scope);
                    
                    if(i+1 < custom_vars.length) {
                        names += '*';
                        values += '*';
                        scopes += '*';
                    }
                }
                
                event += '8(' + names + ')';
                event += '9(' + values + ')';
                event += '11(' + scopes + ')';
            }
            
            var params = {
                utmwv: utmwv,
                utmn: get_random(),
                utmhn: utmhn,
                utmcs: utmcs,
                utmul: utmul,
                utmdt: title,
                utmhid: utmhid,
                utmp: path,
                utmac: utmac,
                utmcc: return_cookies()
            };
            if(event != '') {
                params.utme = event;
            }
            
            var url = beacon_url + generate_query_string(params);
            var img = new Image();
            img.src = url;
        };
        // public
        this._trackEvent = function(category, action, label, value) {
            if(IS_DEBUG) {
                console.log('Track Event', arguments);
                //console.trace();
            }
            
            request_cnt++;
            var event = '5(' + category + '*' + action;
            if (label) {
                event += '*' + label + ')';
            }
            else {
                event += ')';
            }
            if (value) {
                event += '(' + value + ')'
            }
            
            // custom vars
            if(custom_vars.length > 1) {
                var names = '';
                var values = '';
                var scopes = '';
                
                for(var i = 1; i < custom_vars.length; i++) {
                    names += custom_vars[i].name;
                    values += custom_vars[i].value;
                    scopes += (custom_vars[i].scope == null ? 3 : custom_vars[i].scope);
                    
                    if(i+1 < custom_vars.length) {
                        names += '*';
                        values += '*';
                        scopes += '*';
                    }
                }
                
                event += '8(' + names + ')';
                event += '9(' + values + ')';
                event += '11(' + scopes + ')';
            }
            
            var params = {
                utmwv: utmwv,
                utmn: get_random(),
                utmhn: utmhn,
                utmcs: utmcs,
                utmul: utmul,
                utmt: utmt,
                utme: event,
                utmhid: utmhid,
                utmac: utmac,
                utmcc: return_cookies()
            };
            var url = beacon_url + generate_query_string(params);
            var img = new Image();
            img.src = url;
        };
    };
})();


// Copyright 2007 Google, Inc.
// This sample code is under the Apache2 license, see
// http://www.apache.org/licenses/LICENSE-2.0 for license details.
/**
* @fileoverview Wrapper for Time Tracking
*/

/**
* @class Time Tracking component.
* This class encapsulates all logic for time tracking on a particular
* page. Time tracking could be for any object within a page or the page
* itself.
*
* @param {Array.<Number>} arg1 Optional array that represents the bucket
* @constructor
*/
var TimeTracker = function(opt_bucket) {
  if (opt_bucket) {
    this.bucket_ = opt_bucket.sort(this.sortNumber);
  } else {
    this.bucket_ = TimeTracker.DEFAULT_BUCKET;
  }
};

TimeTracker.prototype.startTime_;
TimeTracker.prototype.stopTime_;
TimeTracker.prototype.bucket_;
TimeTracker.DEFAULT_BUCKET = [100, 500, 1500, 2500, 5000];

/**
* Calculates time difference between start and stop
* @return {Number} The time difference between start and stop
*/
TimeTracker.prototype._getTimeDiff = function() {
  return (this.stopTime_ - this.startTime_);
};

/**
* Helper function to sort an Array of numbers
* @param {Number} arg1 The first number
* @param {Number} arg2 The second number
* @return {Number} The difference used to sort
*/
TimeTracker.prototype.sortNumber = function(a, b) {
  return (a - b);
};

/**
* Records the start time
* @param {Number} arg1 Optional start time specified by user
*/
TimeTracker.prototype._recordStartTime = function(opt_time) {
  if (opt_time != undefined) {
    this.startTime_ = opt_time;
  } else {
    this.startTime_ = (new Date()).getTime();
  }
};

/**
* Records the stop time
* @param {Number} arg1 Optional stop time specified by user
*/
TimeTracker.prototype._recordEndTime = function(opt_time) {
  if (opt_time != undefined) {
    this.stopTime_ = opt_time;
  } else {
    this.stopTime_ = (new Date()).getTime();
  }
};

/**
* Tracks the event. Calculates time and sends information to
* the event tracker passed
* @param {Object} arg1 GA tracker created by user
* @param {String} arg2 Optional event object name
* @param {String} arg3 Optional event label
*/
TimeTracker.prototype._track = function(tracker,
                                        opt_event_obj_name,
                                        opt_event_label) {
  var eventTracker;
  if (opt_event_obj_name != undefined && opt_event_obj_name.length != 0) {
    eventTracker = tracker._createEventTracker(opt_event_obj_name);
  } else {
    eventTracker = tracker._createEventTracker('TimeTracker');
  }

  var i;
  var bucketString;
  for(i = 0; i < this.bucket_.length; i++) {
    if ((this._getTimeDiff()) < this.bucket_[i]) {
      if (i == 0) {
        bucketString = "0-" + (this.bucket_[0]);
        break;
      } else {
        bucketString = this.bucket_[i - 1] + "-" + (this.bucket_[i] - 1);
        break;
      }
    }
  }
  if (!bucketString) {
    bucketString = this.bucket_[i - 1] + "+";
  }
  eventTracker._trackEvent(bucketString, opt_event_label, this._getTimeDiff());
};

/**
* Sets the bucket for histogram generation in GA
* @param {Array.<Number>} The bucket array
*/
TimeTracker.prototype._setHistogramBuckets = function(buckets_array) {
  this.bucket_ = buckets_array.sort(this.sortNumber);
};




/*  
    Pokki Google Analytics Time Tracker
     - Part of PokkiGalaxy Framework

    Extended and adapted for Pokki from TimeTracker, originally by Google, Inc.

    @authors
        Fontaine Shu <fontaine@sweetlabs.com>, SweetLabs, Inc.
    @version 1.0
    @license MIT License

    @copyright (c) 2011, Authors.

    Example usage:
        - pokki_timer = new PokkiTimeTracker();
        - pokki_timer._recordStartTime();
        - pokki_timer._recordEndTime();
        // Specify your own histogram "action" values
        - pokki_timer._setHistogramBuckets([10, 20, 50, 100, 500, 1000]);
        // Track via historgram buckets
        - pokki_timer._track();
*/


PokkiTimeTracker.prototype = new TimeTracker();
function PokkiTimeTracker(opt_bucket) {
    TimeTracker.apply(this, arguments);
}
/**
* TimeTracker._track logic
* @param opt_event_obj_name String Optional event object name
* @param opt_event_label String Optional event label
* @param opt_time_func Function Optional Can be used to convert time value from milliseconds to something more readable, like minutes
*/
PokkiTimeTracker.prototype._track = function(opt_event_obj_name, opt_event_label, opt_time_func) {
    var category = (opt_event_obj_name != undefined && opt_event_obj_name.length != 0) ? opt_event_obj_name : 'TimeTracker';
    
    var i;
    var bucketString;
    var time_diff = opt_time_func ? opt_time_func(this._getTimeDiff()) : this._getTimeDiff();
    
    for(i = 0; i < this.bucket_.length; i++) {
        if (time_diff < this.bucket_[i]) {
            if (i == 0) {
                bucketString = "0-" + (this.bucket_[0]);
                break;
            } else {
                bucketString = this.bucket_[i - 1] + "-" + (this.bucket_[i] - 1);
                break;
            }
        }
    }
    
    if (!bucketString) {
        bucketString = this.bucket_[i - 1] + "+";
    }
    
    ga_pokki._trackEvent(category, bucketString, opt_event_label, opt_time_func ? opt_time_func(this._getTimeDiff()) : this._getTimeDiff());
};


/*  
    PokkiGalaxy Setup
     - Part of PokkiGalaxy Framework

    @authors
        John Chavarria <john@sweetlabs.com>, SweetLabs Inc.
    @version 1.0
    @license MIT License

    @copyright (c) 2011, Authors.

*/


// If Pokki Google Analytics is enabled
if (pokki.config.GA) {
    pokki.ga = ga_pokki;
    pokki.ga._setAccount(pokki.config.GAAccount);
    pokki.ga._setDomain(pokki.config.GADomain);

    pokki.ga.timeTracker = function timeTracker()
    {

        return new PokkiTimeTracker();
    
    };
}

// If magic var _ is enabled
if (pokki.config.magic) {
    var _ = pokki;
}
