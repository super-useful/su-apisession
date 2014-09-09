var getenv = require('getenv');
var redis = require('redis');

var REDIS_PORT = getenv('REDIS_PORT_6379_TCP_PORT', '6379');
var REDIS_HOST = getenv('REDIS_PORT_6379_TCP_ADDR', 'localhost');

var redisClient = redis.createClient(REDIS_PORT, REDIS_HOST);
var redisCo = require('co-redis')(redisClient);

module.exports = redisCo;
