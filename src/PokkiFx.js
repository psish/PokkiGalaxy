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
