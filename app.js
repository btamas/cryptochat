"use strict";

var express = require("express"),
	http = require("http"),
	moonboots = require("moonboots"),
	path = require("path"),
	app = module.exports = express(),
	Bookshelf  = require('bookshelf');

app.configure(function(){
	app.set("port", process.env.PORT || 3000);
	app.set("views", __dirname + "/views");
	app.set("view engine", "jade");
	app.use(express.favicon());
	app.use(express.logger("dev"));
	app.use(express.static(path.join(__dirname, "public")));
	app.use(express.bodyParser());
	app.use(express.cookieParser());
	app.use(app.router);
});

var clientApp = new moonboots({
    main: __dirname + '/public/js/main.js',
    developmentMode: true,
    libraries: [
		__dirname + '/public/js/crypto-js/rollups/aes.js',
		__dirname + '/public/js/crypto-js/components/mode-cfb-min.js',
		__dirname + '/public/js/crypto-js/components/pad-zeropadding-min.js',
		__dirname + '/public/js/crypto-js/rollups/hmac-sha1.js',
		__dirname + '/bower_components/jquery/jquery.js',
		__dirname + '/bower_components/peerjs/peer.js'
    ],
    server: app
});

app.get("/", function(req,res) {
	res.render("server",{
		js: clientApp.jsFileName()
	});
});

app.get("/client", function(req,res) {
	res.render("client",{
		js: clientApp.jsFileName()
	});
});

app.get("/moonboots/*", clientApp.js());

var PeerServer = require('peer').PeerServer;
var server = new PeerServer({ port: 4000 });

http.createServer(app).listen(app.get("port"), function(){
	console.log("Express server listening on port " + app.get("port"));
});
