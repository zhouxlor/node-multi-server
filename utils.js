'use strict';

var config = require('./config');
var util = {};

//debug ĞÅÏ¢Êä³ö 
util.log = function(msg, level){
	if(level <= config.debug_level) {
		console.log(msg);
	}
}


module.exports = util;
