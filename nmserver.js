'use strict';
var net = require('net');
var EventEmitter = require('events').EventEmitter
  , util = require('util')

var config = require('./config');
var utils = require('./utils');

function MultiServer() {
	//local server as client connect to other server and save each connection 
	this.routerClient = {};
	this.routerServer = null;
	//local server as other server host server and save the connection
	this.routerServerConn = null;
	this.connNum = 0;
	this.setupLocalServer();
}

util.inherits(MultiServer, EventEmitter);

MultiServer.prototype.registConn = function() {
	var self = this;
	//connect to other server
	this.connNum = 0;
	config.hostList.forEach(function(host){
		if(host.host != config.localHost.host || host.port != config.localHost.port) {
			self.linkServer("start", host);
		}
	});
}

MultiServer.prototype.linkServer = function(flag, host){
	var self = this;
	//connect to other server
	var client = net.connect(host.port, host.host, function(){
		utils.log("connect to server host:" + host.host + ", port:" + host.port + " success!", 0);
		if(flag == "start") {
			self.connNum++;
			if(self.connNum >= (config.hostList.length - 1)) {
				self.emit("ready");
			}
		}
		self.routerClient[host.name] = client;
	});

	client.on("error", function(err){
		self.emit("serverError", err);
	})
	client.on("close", function(){
		self.emit("serverClose");
		utils.log("closed----host:" + host.host + ", port:" + host.port, 0);
		if(flag == "start") {
			self.connNum++;
			if(self.connNum >= (config.hostList.length - 1)) {
				self.emit("ready");
			}
		}
	})
}

MultiServer.prototype.setupLocalServer = function() {
	var self = this;
	//setup self server host
	utils.log("setup local server...", 0);
	this.routerServer = net.createServer(function(c){
		self.routerServerConn = c;
		c.on('data', function(msg){
			var buf = new Buffer(msg);
			var temp = buf.toString();
			utils.log("Received message from other server: " + temp, 2);
			self.onReceiveMsgFromServer(temp);
		});
		c.on('error', function(err){
			self.emit("serverError", err);
		});
		c.on('end', function() {
			self.emit("end");
		});
		c.pipe(c);
	});
	this.routerServer.on("connection", function(conn){
		utils.log("other server client connect to this server", 1);
		self.emit("connFromOtherServer", conn);
	});
	this.routerServer.on("error", function(err){
		utils.log("local server error:" + err, 0);
		self.emit("serverError", err);
	});
	this.routerServer.listen(config.localHost.port, function(){
		utils.log("local server Listen on port:" + config.localHost.port + "...", 0);
		utils.log("setup local server...done", 0);
		self.registConn();
	});
}

MultiServer.prototype.sendMsgToServer = function(opts) {
	/*
		send message to all server or target server
		opts.msg: message
		opts.server:target server name,if null message will broadcast all server
	*/
	var self = this;
	if(!opts.server) {
		//broadcast message to all connected server
		for(var clientName in self.routerClient) {
			var client = self.routerClient[clientName];
			if(client) {
				client.write(opts);
			}
		}
		//send message to all client connected to me
		this.sendMsgToOwnClient(opts);
	}else{
		//send message to opts.server
		if(server == config.localHost.name) {
			//send message to me
			this.sendMsgToOwnClient(opts);
		}else{
			//send message to other server
			for(var clientName in self.routerClient) {
				if(clientName == server) {
					var client = self.routerClient[clientName];
					client.write(opts);
				}
			}
		}
	}
}

MultiServer.prototype.sendMsgToOwnClient = function(opts) {
	//将消息发送给自己的客户端的指定客户
	this.emit('msg', opts);
}

MultiServer.prototype.onReceiveMsgFromServer = function(msg) {
	this.emit('routeMsg', msg);
}

module.exports = MultiServer;