var RTCCryptoChat = function _RTCCryptoChat(options) {
	if (!options) {
		options = {};
	}
	
	this.host = options.host || window.location.hostname;
	this.port = options.port || 4000;
	this.connection = undefined;
	this.messageListener = undefined;
	
	this._initialize();
};

RTCCryptoChat.prototype._generateKey = function _generateKey(length) {
	if (length < 1 || length % 4 !== 0) {
		return undefined;
	}
	
	var key = "";
	for (var i=0; i<length/4; i++) {
		key += Math.round(Math.random()*16).toString(16);
	}
	
	return CryptoJS.enc.Hex.parse( key );
};

RTCCryptoChat.prototype._decodeMessage = function _decodeMessage(data) {
	if (!this.messageListener) {
		return;
	}
	
	try {
		var dataobj = JSON.parse(data),
			message = dataobj.message,
			hmac = dataobj.hmac;
	}
	catch(e) {
		return this.messageListener();
	}
	
	var generatedHmac = CryptoJS.HmacSHA1( message, CryptoJS.enc.Hex.parse(this.key.toString()) ).toString();
	
	if (hmac !== generatedHmac) {
		return this.messageListener();
	}

	var decrypted = CryptoJS.AES.decrypt(
		message,
		this.key,
		{
			iv: this.iv,
			mode: CryptoJS.mode.CFB,
			padding: CryptoJS.pad.ZeroPadding
		}).toString(CryptoJS.enc.Utf8);
	
	return this.messageListener( decrypted );
};

RTCCryptoChat.prototype._initialize = function _initialize() {
	var _this = this;
	
	//generate keys
	this.key = this._generateKey(256);
	this.iv = this._generateKey(256);
	
	this.peer = new Peer(undefined, {host: this.host, port: this.port});
	this.peer.on("connection", function(connection) {
		_this.connection = connection;
		console.log("New connection!");
	});
  //@todo close lekezelése hasonloan
	this.peer.on("open",function(id) {
		_this.id = id;
	});
};

RTCCryptoChat.prototype.join = function _join(hash) {
	var _this = this,
		hashText = atob(hash),
		hashParams = hashText.split("|"),
		id;
	
	
	if (hashParams.length === 3)
	{
		id = hashParams[0];
		this.key = CryptoJS.enc.Hex.parse( hashParams[1] );
		this.iv = CryptoJS.enc.Hex.parse( hashParams[2] );
	}
	
	if (id) {
		this.conn = this.peer.connect(id);
		this.conn.on("open",function(){
			console.log("Connected to " + id);
			_this.conn.on("data", _this._decodeMessage.bind(_this));
		});
	}
};

RTCCryptoChat.prototype.send = function _send(message) {
	if (this.connection) {
    //workaround: encrypt sometimes encrypt wrong, but reparsing key is solve this problem
		var encrypted = CryptoJS.AES.encrypt(
			message,
			CryptoJS.enc.Hex.parse(this.key.toString()),
			{
        iv: CryptoJS.enc.Hex.parse(this.iv.toString()),
				mode: CryptoJS.mode.CFB,
				padding: CryptoJS.pad.ZeroPadding
			}).toString();
    
    //workaround: HmacSHA1 sometimes change the key, I don't know why :/
		var hmac = CryptoJS.HmacSHA1( encrypted, CryptoJS.enc.Hex.parse(this.key.toString()) ).toString();
		
		this.connection.send(
			JSON.stringify({
				message: encrypted,
				hmac: hmac
			})
		);
	}
};

RTCCryptoChat.prototype.getShareHash = function _getShareHash() {
	return btoa( [ this.id, this.key.toString(), this.iv.toString() ].join("|") );
};

RTCCryptoChat.prototype.onMessage = function _onMessage(listener) {
	if (listener && typeof listener === "function") {
		this.messageListener = listener;
	}
};

RTCCryptoChat.prototype.onConnected = function _onConnected(listener) {
	if (listener && typeof listener === "function") {
		this.peer.on("open", listener);
	}
};

//@todo ondisconnected
//@todo more connection in the same time (it's possible)