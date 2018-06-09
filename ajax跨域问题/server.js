let http = require('http');
let fs = require('fs');
let readFile = require('util').promisify(fs.readFile);

http.createServer((req, res) => {
	readFile('./index.html').then((content) => {
		res.writeHead(200, {
			'Content-Type': 'text/html'
		});
		res.write(content);
		res.end();
	});
}).listen(8887);

console.log('server started, port=8887');