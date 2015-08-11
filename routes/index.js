var tweetBank = require('../tweetBank');
var orm = require('../models');

module.exports = function (io) {
	var router = require('express').Router();

	function getUserList() {
		return orm.User.findAll().then(function(results) {
			return results.map(function(result) {
				return {name: result.name,
					id: result.dataValues.id,
					pictureUrl: result.dataValues.pictureUrl
				}
			});
		});
	};
	function getTweetList() {
		return orm.Tweet.findAll({include: [orm.User]}).then(function(results) {
			return results.map(function(result) {
				return {name: result.dataValues.User.name, 
					text: result.dataValues.tweet, 
					pictureUrl: result.dataValues.User.dataValues.pictureUrl,
					id: result.dataValues.id,
					userId: result.dataValues.userId,
				}
			});
		});
	};

	router.get('/', function (req, res) {
		// will trigger res.send of the index.html file
		// after rendering with swig.renderFile
		getTweetList().then(function(tweets){
			res.render('index', {
				showForm: true,
				title: 'Home',
				tweets: tweets
			});
		});
	});

	router.get('/users/:name', function (req, res) {
		getTweetList().then(function(tweets) {
			var userTweets = tweets.filter(function(tweet){
				return tweet.name == req.params.name;
			});
			res.render('index', {
				showForm: true,
				title: req.params.name,
				tweets: userTweets,
				theName: req.params.name
			});
		});
	});

	router.get('/users/:name/tweets/:id', function (req, res) {
		var id = parseInt(req.params.id);
		getTweetList().then(function(tweets) {
			var theTweet = tweets.filter(function(tweet) {
				return tweet.id == id;
			});
			res.render('index', {title: req.params.name, tweets: theTweet})
		});
	});

	router.post('/submit', function (req, res) {
		getUserList().then(function(users) {
			if (!(users.some(function(user) {return user.name == req.body.shenanigans}))) {
				orm.User.upsert({id: null, name: req.body.shenanigans, pictureUrl: '/img/tweet.jpeg'});
			}
			return getUserList();
		}).then(function(users) {
			var userId = users.filter(function(user) {
				return user.name == req.body.shenanigans;
			})[0].id;
			orm.Tweet.upsert({id: null, UserId: userId, tweet: req.body.text});
			return orm.Tweet.max('id');
		}).then(function(id) {
			return getTweetList().filter(function(tweet) {
				return tweet.id == id;
			});
		}).then(function(tweet) {
			io.sockets.emit('new_tweet', tweet);
			res.redirect('/');
		});

		// tweetBank.add(req.body.shenanigans, req.body.text);
		// var theNewTweet = tweetBank.list().pop();
		// io.sockets.emit('new_tweet', theNewTweet);
	});
	return router;
};