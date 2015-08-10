var tweetBank = require('../tweetBank');
var orm = require('../models');

module.exports = function (io) {
	var router = require('express').Router();

	var tweetList = orm.Tweet.findAll({include: [orm.User]}).then(function(results) {
			return results.map(function(result) {
				console.log(result.dataValues);
				return {name: result.dataValues.User.name, 
					text: result.dataValues.tweet, 
					pictureUrl: result.dataValues.User.dataValues.pictureUrl,
					id: result.dataValues.id,
					userId: result.dataValues.userId,
				}
			});
		});

	router.get('/', function (req, res) {
		// will trigger res.send of the index.html file
		// after rendering with swig.renderFile
		console.log(tweetList);

		tweetList.then(function(tweets){
			res.render('index', {
				showForm: true,
				title: 'Home',
				tweets: tweets
			});
		});

	});

	router.get('/users/:name', function (req, res) {
		tweetList.then(function(tweets) {
			// var userTweets = tweets.find({
			// 	name: req.params.name
			// });
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