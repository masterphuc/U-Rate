var mysql = require('mysql');

var jsdom = require('jsdom').jsdom;
var document = jsdom('<html></html>', {});
var window = document.defaultView;
var $ = require('jquery')(window);

var movieList = 'mango,fantasticbeasts';

var AlchemyAPI = require('./alchemyapi');
var alchemyapi = new AlchemyAPI();

//setting up sql
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'p#66wuRD',
    database: 'movieschema'
});
connection.connect(function (error) {
    if (!!error) {
        console.log('Error');
    } else {
        console.log('Connected');
    }
    //console.log(error);
});

var Twit = require('twit');
var T = new Twit({
    consumer_key: 'hWZGwXnBJYjFzeeDnHgq7BhFB',
    consumer_secret: 'WxhHEI4VIDKWYunjDq7BP5n5QBTIPJkom1OwVuTmgqH6Unln7U',
    access_token: '601026791-CAoiOxsmLF1NFYy6tXMTHqZxBDLimELeOYBe3jvl',
    access_token_secret: 'dqLUNeDtQgrkZIQ8CyzSa3YDjo6bEedc99RSdwsROvZV6'
})

var stream = T.stream('statuses/filter', {
    track: movieList,
    language: 'en'
});

var totalScore;
var score;
var tweetCount;

stream.on('tweet', function (tweet) {

    var tweetTxt = tweet.text;
    var combineTxt = movieList + "`" + tweetTxt;
    var captures = /\b(\w+)\b.*`.*\b\1\b/i.exec(combineTxt);

    alchemyapi.sentiment("text", tweetTxt, {}, function (response) {
        //console.log(captures + " " + captures[0] + " " + captures[1] + " captures stuff");
        try {
            if (captures[1]) {
                console.log(captures[1] + " occurs in both strings");
                console.log(tweetTxt)
                console.log("Sentiment: " + response["docSentiment"]["type"]);
                console.log("Sentiment: " + response["docSentiment"]["score"]);
                console.log("");
                var scoreQuery = connection.query('SELECT * FROM movies WHERE tweetTitle = ?', captures[1], function (err, rows, fields) {
                    if (err) throw err;

                    for (var i in rows) {
                        totalScore = row[i].totalScore + response["docSentiment"]["score"];
                        tweetCount = row[i].tweetCount + 1;
                        score = totalScore / tweetCount;
                    }
                });


                var query = connection.query('UPDATE  movies SET score = ' + score + ' , totalScore = ' + totalScore + ' , tweetCount = ' + tweetCount + ' WHERE tweetTitle = ?', captures[1], function (err, result) {
                    if (err) {
                        console.error(err);
                        return;
                    }
                    //console.log(query.sql);
                    console.error(result);
                }); 
            }
        } catch (err) {
            console.log("no match in both strings");
        }


    });


})