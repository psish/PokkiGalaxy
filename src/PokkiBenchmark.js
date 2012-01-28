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
