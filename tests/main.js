var app  = require('../app.js'),
	http = require("http"),
	request = require("superagent"),
	expect = require("expect.js");

describe('app', function () {
	before(function (done) {
		http.createServer(app).listen(3000,done);
	});

	it('should be listening at localhost:3000', function (done) {
		request.get("http://localhost:3000/").end(function (res) {
			expect(res).to.exists;
			expect(res.status).to.equal(200);
			done();
		});
	});
	
	it('/', function (done) {
		request.get("http://localhost:3000/").end(function (res) {
			expect(res).to.exists;
			expect(res.status).to.equal(200);
			done();
		});
	});
});