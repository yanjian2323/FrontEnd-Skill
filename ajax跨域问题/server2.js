let http = require('http');

http.createServer((req, res) => {
	console.log('url:' + req.url);
	if (req.url === '/json') {
		let user = {
			name: 'user',
			age: 25
		};
		res.writeHead(200, {
			'Content-Type': 'application/json',
			'Access-Control-Allow-Origin': 'http://localhost:8887',
			'Access-Control-Allow-Methods': 'PUT',
			'Access-Control-Allow-Headers': 'X-Cross-Test',
			'Access-Control-Allow-Credentials': true
			'Access-Control-Max-Age': 10000
		});
		
		res.end(JSON.stringify(user));
	} else {
		res.writeHead(404);
		res.end();
	}
}).listen(9999);

console.log('server started, port=9999');