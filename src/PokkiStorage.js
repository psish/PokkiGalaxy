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
