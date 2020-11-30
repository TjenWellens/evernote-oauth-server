require('dotenv').config()
const express = require('express')
const app = express()
const session = require('express-session')
const evernote = require('evernote');

app.use(session({
	secret: 'keyboard cat',
	resave: false,
	saveUninitialized: true,
	cookie: {
		//todo
		// secure: true,
	}
}))

const callbackUrl = `${process.env.BASE_URL}/oauth_callback`;

function createClient() {
	return new evernote.Client({
		consumerKey: process.env.CONSUMER_KEY,
		consumerSecret: process.env.CONSUMER_SECRET,
		sandbox: true, // change to false when you are ready to switch to production
		china: false, // change to true if you wish to connect to YXBJ - most of you won't
	});
}

app.get('/', function (req, res) {
	const client = createClient();

	client.getRequestToken(callbackUrl, function (error, oauthToken, oauthTokenSecret) {
		if (error) {
			res.json(error)
			return
		}
		// store your token here somewhere - for this example we use req.session
		req.session.oauthToken = oauthToken;
		req.session.oauthTokenSecret = oauthTokenSecret;
		res.redirect(client.getAuthorizeUrl(oauthToken)); // send the user to Evernote
	});
})

app.get('/oauth_callback', function (req, res) {
	const client = createClient();
	client.getAccessToken(req.session.oauthToken,
		req.session.oauthTokenSecret,
		req.query.oauth_verifier,
		function (error, oauthToken, oauthTokenSecret, results) {
			if (error) {
				res.json(error)
				return
			}

			res.json({
				oauthToken,
			})
		});
})

app.listen(3000)
