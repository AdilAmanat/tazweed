'use strict';

/*
 * Module dependencies.
 */

const users = require('../app/controllers/users');
const invitations = require('../app/controllers/invitations');
const auth = require('./middlewares/authorization');

/**
 * Route middlewares
 */
const invitationAuth = [auth.requiresLogin, auth.invitation.hasAuthorization]

const fail = {
  failureRedirect: '/login'
};


/**
 * Expose routes
 */

module.exports = function (app, passport) {
  const pauth = passport.authenticate.bind(passport);

  app.get('/', auth.requiresLogin,(req,res) => {
    res.render('home',{});
  });

  // user routes
  app.get('/login', users.login);
  app.get('/signup', users.signup);
  app.get('/logout', users.logout);
  app.post('/users', users.create);
  app.post(
    '/users/session',
    pauth('local', {
      failureRedirect: '/login',
      failureFlash: 'Invalid email or password.'
    }),
    users.session
  );
  app.get('/users/:userId', users.show);

  app.get('/user/:userId/slot', auth.requiresLogin, users.slot);
  app.post('/user/:userId/slot', auth.requiresLogin,users.createSlot);
  //invitation routes
  app.post('/user/:userId/invitation', auth.requiresLogin,users.createInvitation);
  app.get('/user/:userId/invitation', auth.requiresLogin,users.getInvitation);
  app.get('/user/:userId/invitations', auth.requiresLogin,users.showInvitation);

  app.get('/sellers',auth.requiresLogin,users.getSellers);

  app.patch('/invitation/:invitationId/state', invitationAuth,users.updateStatus);
  //app.post('/invitation/status', users.updateStatus);

  app.param('userId', users.load);
  app.param('invitationId', invitations.load);

  /**
   * Error handling
   */

  app.use(function (err, req, res, next) {
    // treat as 404
    if (
      err.message &&
      (~err.message.indexOf('not found') ||
        ~err.message.indexOf('Cast to ObjectId failed'))
    ) {
      return next();
    }

    console.error(err.stack);

    if (err.stack.includes('ValidationError')) {
      res.status(422).render('422', { error: err.stack });
      return;
    }

    // error page
    res.status(500).render('500', { error: err.stack });
  });

  // assume 404 since no middleware responded
  app.use(function (req, res) {
    const payload = {
      url: req.originalUrl,
      error: 'Not found'
    };
    if (req.accepts('json')) return res.status(404).json(payload);
    res.status(404).render('404', payload);
  });
};
