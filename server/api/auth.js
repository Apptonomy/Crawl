const { Router } = require('express');
const passport = require('passport');
const cookieSession = require('cookie-session');

require('../passport-setup.js');

const authRouter = Router();

// trying to utilize this cookie session middleware
// https://www.npmjs.com/package/cookie-session
authRouter.use(cookieSession({
  name: 'crawl-session',
  keys: ['key1', 'key2'],
}));

// use the two helper funcitons initialize and session
// http://www.passportjs.org/docs/configure
authRouter.use(passport.initialize());
authRouter.use(passport.session());

// this may be the main log in route from the main.js
authRouter.get('/google/login', (req, res) => {
  if (req.user) {
    const data = {
      redirect: '/',
      user: req.user.displayName,
      email: req.user.emails[0].value,
      image: req.user.photos[0].value,
    };
    return res.send(data);
  }
  const data = { redirect: '/login' };
  return res.send(data);
});

// this route will grab the profile and the email from google
authRouter.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// this is the route called after a user clicks their sign in information
authRouter.get('/google/callback', passport.authenticate('google', { scope: ['profile', 'email'], failureRedirect: 'failed' }),
  (req, res) => {
    // Successful authentication, redirect home.
    res.redirect('/');
  });


// this is a possible you are not logged in route
authRouter.get('/google/notLoggedIn', (req, res) => res.send('You are not logged in'));

// this is a possible failed to log in route
authRouter.get('/google/failed', (req, res) => res.send('You failed to log in'));

// this is a possible logout route
authRouter.get('/google/logout', (req, res) => {
  console.log('test');
  req.session = null;
  req.logout();
  // when redirecting to notLoggedIn, it said 'net::ERR_CONNECTION_CLOSED', so just send the reponse here
  // res.redirect('/');
  res.send('logged out');
});


module.exports = {
  authRouter,
};
