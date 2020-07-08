'use strict';

/**
 * Module dependencies.
 */

const mongoose = require('mongoose');
const { wrap: async } = require('co');
const User = mongoose.model('User');
const Invitation = mongoose.model('Invitation');

/**
 * Load
 */

exports.load = async(function* (req, res, next, _id) {
  const criteria = { _id };
  try {
    req.profile = yield User.load({ criteria });
    if (!req.profile) return next(new Error('User not found'));
  } catch (err) {
    return next(err);
  }
  next();
});

/**
 * Create user
 */

exports.create = async(function* (req, res) {
  const user = new User(req.body);
  user.provider = 'local';
  try {
    yield user.save();
    req.logIn(user, err => {
      if (err) req.flash('info', 'Sorry! We are not able to log you in!');
      res.redirect('/');
    });
  } catch (err) {
    const errors = Object.keys(err.errors).map(
      field => err.errors[field].message
    );

    res.render('users/signup', {
      title: 'Sign up',
      errors,
      user
    });
  }
});

/**
 *  Show profile
 */

exports.show = function (req, res) {
  const user = req.profile;
  res.render('users/show', {
    title: user.name,
    user: user
  });
};

exports.signin = function () { };

/**
 * Auth callback
 */

exports.authCallback = login;

/**
 * Show login form
 */

exports.login = function (req, res) {
  res.render('users/login', {
    title: 'Login'
  });
};

/**
 * Show sign up form
 */

exports.signup = function (req, res) {
  res.render('users/signup', {
    title: 'Sign up',
    user: new User()
  });
};

/**
 * Logout
 */

exports.logout = function (req, res) {
  req.logout();
  res.redirect('/login');
};

/**
 * Session
 */

exports.session = login;

/**
 * Login
 */

function login(req, res) {
  const redirectTo = req.session.returnTo ? req.session.returnTo : '/';
  delete req.session.returnTo;
  res.redirect(redirectTo);
}

exports.slot = function (req, res) {
  res.render('users/slot', {
    title: 'New Article',
    user: req.profile
  });
};

exports.createSlot = async(function* (req, res) {
  const user = req.profile;
  try {
    User.update({
      _id: user._id,
    },
      {
        $set: { 'start': req.body.start, 'end': req.body.end }
      }, function (err, count) {
        if (err) console.log(err, "this err")
      });
  } catch (err) {
    const errors = Object.keys(err.errors).map(
      field => err.errors[field].message
    );

    res.render('users/slot', {
      title: 'New Article',
      user: req.profile
    });
  }
});
exports.createInvitation = async(function* (req, res) {

  try {

    const criteria = { __id: req.body.assignee };
    const user = yield User.findById(req.body.assignee);

    const invitation = new Invitation({
      creator: req.profile,
      user: user,
      start: req.body.start,
      end: req.body.end,
    });

    invitation.save();
    res.status(200).send();
  } catch (err) {
    const errors = Object.keys(err.errors).map(
      field => err.errors[field].message
    );

  }
});

exports.getInvitation = async(function* (req, res) {

  try {
    const criteria = { user: req.profile._id };

    const invitations = yield Invitation.find(criteria);

    res.status(200).send(invitations);
  } catch (err) {
    const errors = Object.keys(err.errors).map(
      field => err.errors[field].message
    );

  }
});

exports.showInvitation = async(function* (req, res) {
  var invitations = '';
  try {
    const criteria = { user: req.profile._id };

  invitations = yield Invitation.find(criteria).populate('user').populate('creator');
  //   .exec(function(err,post){
  //     invitations = post;
  //     console.log(post);
  //     // console.log(post.User);
  // });

  } catch (err) {
    const errors = Object.keys(err.errors).map(
      field => err.errors[field].message
    );
    
  }
  res.render('users/invitations', {
    invitations: invitations
  })
});

exports.updateStatus = async(function* (req, res) {
  const state = req.body.state;
  
  try {
    Invitation.update({
      _id: req.invitation._id,
    },
      {
        $set: { 'state': state}
      }, function (err, count) {
        if (err) console.log(err, "this err")
      });
  } catch (err) {
    const errors = Object.keys(err.errors).map(
      field => err.errors[field].message
    );

  }

  res.status('200').send();
});

exports.getSellers = async(function* (req, res) {

  try {
    const userType = { type: 'seller' };
    const criteria = {...userType,...req.query};
    
    const sellers = yield User.find(criteria);

    res.status(200).send(sellers);
  } catch (err) {
    const errors = Object.keys(err.errors).map(
      field => err.errors[field].message
    );

    res.status(400).send();

  }
});