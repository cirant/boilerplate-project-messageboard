/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
const threadController = require('../controllers/thread');
const replyController = require('../controllers/reply');

module.exports = function (app) {
  app.route('/api/threads/:board')
    .get(threadController.find)
    .put(threadController.report)
    .delete(threadController.delete)
    .post(threadController.create);

  app.route('/api/replies/:board')
    .get(replyController.find)
    .put(replyController.report)
    .delete(replyController.delete)
    .post(replyController.create);

};
