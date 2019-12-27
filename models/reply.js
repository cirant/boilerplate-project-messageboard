const mongoose = require('mongoose');
const { Schema } = mongoose;
const util = require('../utils');

const { Types: { ObjectId } } = Schema;

const ReplySchema = new Schema({
  text: {
    type: String,
    required: true
  },
  delete_password: {
    type: String,
    required: true
  },
  thread_id: {
    type: ObjectId,
    required: true
  },
  reported: {
    type: Boolean,
    default: false
  }
},
  {
    timestamps: { createdAt: 'created_on', updatedAt: false }
  });

ReplySchema.statics.deleteAfterCompare = async function (query, { delete_password }) {
  try {
    const response = await util.schemaPasswordCompare(this, {
      _id: query._id,
      thread_id: query.thread_id
    }, delete_password);

    if (typeof response === 'object') {
      response.text = '[deleted]';
      await response.save();
      return 'success';
    } else { return response }
  } catch (err) {
    console.log('deleteAfterCompare error ', err)
    return err;
  }
}


ReplySchema.pre('save', util.schemaPasswordCrypt);

module.exports = mongoose.model('Reply', ReplySchema);