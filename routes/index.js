var tweetBank = require('../tweetBank');

module.exports = function (io) {
	var router = require('express').Router();

	router.get('/', function (req, res) {
		// will trigger res.send of the index.html file
		// after rendering with swig.renderFile
		res.render('index', {
			showForm: true,
			title: 'Home',
			tweets: tweetBank.list()
		});
	});

	router.get('/users/:name', function (req, res) {
		var userTweets = tweetBank.find({
			name: req.params.name
		});
		res.render('index', {
			showForm: true,
			title: req.params.name,
			tweets: userTweets,
			theName: req.params.name
		});
	});

	router.get('/users/:name/tweets/:id', function (req, res) {
		var id = parseInt(req.params.id);
		var theTweet = tweetBank.find({
			id: id
		});
		res.render('index', {title: req.params.name, tweets: theTweet})
	});

	router.post('/submit', function (req, res) {
		tweetBank.add(req.body.shenanigans, req.body.text);
		var theNewTweet = tweetBank.list().pop();
		io.sockets.emit('new_tweet', theNewTweet);
		res.redirect('/');
	});
	return router;
};