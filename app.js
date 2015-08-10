var express = require( 'express' );
var app = express(); // creates an instance of an express application
var swig = require('swig');
var bodyParser = require('body-parser');
var socketio = require('socket.io');

// hey app, here's where you find any views for `res.render`
app.set('views', __dirname + '/views');
// hey app, render views using the html engine
app.set('view engine', 'html');
// hey app, when you render html use this function to do so
app.engine('html', swig.renderFile);
swig.setDefaults({cache: false});

var port = 3000;
var server = app.listen(port, function () {
	console.log('Server on port', port, 'reporting for duty');
});

var io = socketio.listen(server);

app.use(function (req, res, next) {
	var startTime = Date.now();
	res.on('finish', function () {
		var totalTime = (Date.now() - startTime) + 'ms';
		console.log(req.method, req.path, res.statusCode, totalTime);
	});
	next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// app.get('/stylesheets/style.css', function (req, res, next) {
// 	res.sendFile(__dirname + '/public/stylesheets/style.css');
// });

app.use(function (req, res, next) {
	// if there's a valid file at req.path
	// serve it up
	// otherwise defer to next middleware
	res.sendFile(__dirname + '/public' + req.path, function (err) {
		if (err) next();
	});
});

// app.use(express.static('public'));

var routerMaker = require('./routes');

app.use(routerMaker(io));