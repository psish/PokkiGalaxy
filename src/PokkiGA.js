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


