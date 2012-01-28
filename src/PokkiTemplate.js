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
