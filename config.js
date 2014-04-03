'use strict';

var config = {};

config.debug_level = 2;//0-none, 1-info, 2-all

//host config
config.localHost = {"host":"192.168.84.53", "port":"6100", "name":"server1"};
config.hostList = [
				{"host":"192.168.84.53", "port":"6100", "name":"server1"},
				{"host":"192.168.84.53", "port":"6101", "name":"server2"},
				{"host":"192.168.84.53", "port":"6102", "name":"server3"}
]

module.exports = config;
