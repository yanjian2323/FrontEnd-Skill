CORS全称是跨域资源共享(Cross-Origin Resource Sharing),用来解决AJAX跨域请求资源的问题

#### ajax跨域分析

```javascript
// 这个js文件运行在localhost:8887中，ajax请求的url是localhost:9999/json，所以跨域了
let xhr = new XMLHttpRequest();
xhr.open('get', 'http://localhost:9999/json', true);
xhr.send();
```
我们在浏览器发出一个ajax跨域请求的时候，通常会在控制台报下面的错误。

![](https://ws2.sinaimg.cn/large/006tKfTcly1fs4mm9k1irj31kw01jdh2.jpg)

这个错意味着什么？是我们的请求没发出去吗?服务端有没有正常响应？其实真实情况是，这个请求发出去了，服务端也处理了这个请求，只是浏览器接收到了响应结果后发现这是个跨域请求，找不到对应的响应头(Access-Control-Allow-Origin)，所以在控制台抛出了错误，代码中我们拿不到返回的结果

![](https://ws1.sinaimg.cn/large/006tKfTcgy1fs4mrpnsnjj31kw05ujtc.jpg)

#### Access-Control-Allow-Origin

在服务端响应头设置Access-Control-Allow-Origin字段可以解决上面报错的问题
```Java
res.writeHead(200, {
  'Access-Control-Allow-Origin': '*'
});
```
如果要设置一个特定的域名才可以进行跨域请求，那么
```javascript
res.writeHead(200, {
  // 设置只有从http://localhost:9999下发出的ajax请求才可以跨域
  'Access-Control-Allow-Origin': 'http://localhost:8887'
});
```

#### ajax跨域发请求的时候，分为简单请求和非简单请求

- 简单请求

同时满足以下3个条件，会直接发送请求，就称为简单请求

1. http的请求方法为get、post、head之一
2. 请求头字段Content-Type为text/plain、multipart/form-data、application/x-www-form-urlencoded之一
3. 没有自定义的头字段

- 非简单请求

发正式请求前会发送一个预检options请求，当预检请求通过以后才会发真正的请求

下面是常见发送非简单请求的情况，还有其他情况，不一一列觉了

1. 发请求时加入了自定义的头字段
2. 发请求时的Content-Type头是application/json
3. http请求的方法是put、delete等

#### Access-Control-Allow-Methods

举一个非简单请求的例子：
```javascript
let xhr = new XMLHttpRequest();
// 注意这里是put方法，所以这个请求是非简单请求
xhr.open('put', 'http://localhost:9999/json', true);
xhr.send();
```

这个时候我们会发现浏览器报错了
![avatar](https://ws1.sinaimg.cn/large/006tNc79ly1fs41s3zmjfj3106018aab.jpg)

看看chrome发送请求的情况

![](https://ws1.sinaimg.cn/large/006tNc79ly1fs42om3ex4j31ek0iyq7w.jpg)

请求的方法是OPTIONS，请求头里浏览器自动添加了Access-Control-Request-Method:PUT，用来跟服务端验证PUT方法有没有被允许，由于我们服务端还没允许PUT方法，所以浏览器报错了

我们在响应里加个Access-Control-Allow-Methods就可以

```javascript
res.writeHead(200, {
	'Content-Type': 'application/json',
	'Access-Control-Allow-Origin': 'http://localhost:8887',
	'Access-Control-Allow-Methods': 'PUT'//可以写多个,用逗号分开 
});
```

再来看看chrome发送的请求，第一个请求还是预检请求，预检请求通过发了第二个请求

![](https://ws1.sinaimg.cn/large/006tNc79gy1fs42j06pwxj31g60imaey.jpg)



由于这次服务端响应头返回了Access-Control-Allow-Methods: PUT，预检成功，然后发送了真正的PUT请求

但是对于非简单请求，如果每次都发预检请求太浪费了，可以通过设置Access-Control-Max-Age响应头控制缓存时间，单位是秒，在这个时间内不会在发预检请求了，nodejs中可以如下设置：

```javascript
res.writeHead(200, {
	'Access-Control-Allow-Origin': '*'
	'Access-Control-Max-Age': 100 //100秒之内不发预检请求
});
```


#### Access-Control-Allow-Headers

有时候我们在发ajax的时候自定义了头信息

	let xhr = new XMLHttpRequest();
	xhr.open('get', 'http://localhost:9999/json', true);
	xhr.setRequestHeader('X-Cross-Test', 'test');//设置一个自定义头
	xhr.send();
需要服务端需要返回允许这个头Access-Control-Allow-Headers才可以

	res.writeHead(200, {
		'Content-Type': 'application/json',
		'Access-Control-Allow-Origin': 'http://localhost:8887',
		'Access-Control-Allow-Headers': 'X-Cross-Test'//可以是多个,用逗号分隔
	});
#### Access-Control-Allow-Credentials

在浏览器发起一个http请求的时候，会默认带上该域名下的cookie，在跨域请求的时候，由于请求的是别的域名，不会带上别的域名的cookie，如果需要带上另一个域名的cookie信息，需要加个withCredentials=true

```javascript
let xhr = new XMLHttpRequest();
xhr.open('get', 'http://localhost:9999/json', true);
xhr.withCredentials = true;
xhr.send();
```
同样的，服务端要返回Access-Control-Allow-Credentials

```javascript
res.writeHead(200, {
	'Content-Type': 'application/json',
  	'Access-Control-Allow-Origin': 'http://localhost:8887',
  	'Access-Control-Allow-Credentials': true
});
```