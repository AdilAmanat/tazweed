/**
 * Module dependencies.
 */

const mongoose = require('mongoose');
const crypto = require('crypto');

const Schema = mongoose.Schema;
const oAuthTypes = ['github', 'twitter', 'google', 'linkedin'];

/**
 * User Schema
 */

const InvitationSchema = new Schema({
    creator: { type: Schema.ObjectId, ref: 'User' },
    user: { type: Schema.ObjectId, ref: 'User' },
    start: { type: Number, default: '' },
    end: { type: Number, default: '' },
    state: { type: String, default: 'pending' },

});

/**
 * Statics
 */

InvitationSchema.statics = {
    /**
     * Load
     *
     * @param {Object} options
     * @param {Function} cb
     * @api private
     */
  
    load: function (options, cb) {
      options.select = options.select || 'creator user start end';
      return this.findOne(options.criteria)
        .select(options.select)
        .exec(cb);
    }
  };

mongoose.model('Invitation', InvitationSchema);