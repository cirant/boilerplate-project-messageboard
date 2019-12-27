const mongoose = require('mongoose');
const { Schema } = mongoose;
const util = require('../utils');
const Reply = require('./reply');

const { Types: { ObjectId } } = Schema;

const ThreadSchema = new Schema({
  board: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  delete_password: {
    type: String,
    required: true
  },
  reported: {
    type: Boolean,
    default: false
  },
  replies: [
    {
      type: ObjectId,
      ref: 'Reply'
    }
  ]
},
  {
    timestamps: { createdAt: 'created_on', updatedAt: 'bumped_on' }
  });


ThreadSchema.statics.deleteAfterCompare = async function (query, { delete_password }) {
  try {
    const response = await util.schemaPasswordCompare(this, query, delete_password);
    if (typeof response === 'object') {
      await Reply.deleteMany({ thread_id: response._id, _id: { $in: response.replies } })
      await response.delete();
      return 'success'
    } else { return response }
  } catch (err) {
    console.log('deleteAfterCompare error ', err)
    return err;
  }
}

ThreadSchema.methods.toJSON = function () {
  var obj = this.toObject()
  obj.replycount = this.replies.length;
  return obj
}

ThreadSchema.pre('save', util.schemaPasswordCrypt);

module.exports = mongoose.model('Thread', ThreadSchema);

