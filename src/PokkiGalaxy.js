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
