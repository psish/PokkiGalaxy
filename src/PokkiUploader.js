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
