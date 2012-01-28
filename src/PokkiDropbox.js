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

