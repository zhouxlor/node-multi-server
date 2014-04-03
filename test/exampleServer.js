'use strict';

var MultiServer = require("./../nmserver.js");

var multiServer = new MultiServer();

multiServer.on("ready", function(){
	console.log("local server ready.");
})

multiServer.on("serverError", function(err){
	console.log("local server err.");
})

multiServer.on("serverClose", function(){
	console.log("local server close.");
})

mulitServer.on("connFromOtherServer", function(conn){
	console.log("other server connected to this server");
})

mulitServer.on("routeMsg", function(msg){
	console.log("received msg from other server");
})

mulitServer.on("msg", function(opts){
	console.log("this server received msg and send to clients connect to this server");
})