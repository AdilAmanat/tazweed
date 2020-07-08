'use strict';

/**
 * Module dependencies.
 */

const mongoose = require('mongoose');
const { wrap: async } = require('co');
const User = mongoose.model('User');
const Invitation = mongoose.model('Invitation');

exports.load = async(function* (req, res, next, _id) {
    const criteria = { _id };
    try {
      req.invitation = yield Invitation.load({ criteria });
      if (!req.invitation) return next(new Error('User not found'));
    } catch (err) {
      return next(err);
    }
    next();
});