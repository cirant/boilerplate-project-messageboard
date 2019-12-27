/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var { assert, expect } = chai;
var server = require('../server');
var MongoClient = require("mongodb");
var mongoose = require('mongoose');
const Thread = require('../models/thread');

chai.use(chaiHttp);

suite('Functional Tests', function () {

  let threadIds;
  let replayId;

  this.beforeAll(function (done) {
    mongoose.connect(process.env.MONGO_DB_TEST || process.env.MONGO_DB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false
    }).then(() => {
      Thread.create([
        { delete_password: '123123', text: 'test', board: 'test-board' },
        { delete_password: '123123', text: 'test', board: 'test-board' }
      ]).then(threads => {
        threadIds = threads.map(t => t._id.toString());
      }).catch(err => {
        console.log('err', err)
      });
      done();
    });
  });

  this.afterAll((done) => {
    mongoose.connection.db.collections().then(async collections => {
      for (let collection of collections) {
        await collection.drop();
      }
    }).then(() => {
      mongoose.disconnect();
      done()
    })
  });

  suite('API ROUTING FOR /api/threads/:board', function () {

    suite('POST', function () {

      test('should redirect after create a thread', function (done) {
        chai
          .request(server)
          .post("/api/threads/test-board")
          .send({
            "delete_password": "123123",
            "text": "hola 26 para borrar"
          })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.req.path, '/b/test-board');
            done();
          });
      });

    });

    suite('GET', function () {

      test('should return an array', function (done) {
        chai
          .request(server)
          .get("/api/threads/test-board")
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            assert.property(res.body[0], 'replies');
            assert.notProperty(res.body[0], 'delete_passwords');
            assert.notProperty(res.body[0], 'reported');
            done();
          });
      });

    });

    suite('DELETE', function () {
      test('should return success after delete', function (done) {
        chai
          .request(server)
          .delete("/api/threads/test-board")
          .send({
            "thread_id": threadIds[0],
            "delete_password": "123123"
          })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'success');
            done();
          });
      });

      test('should return incorrect password', function (done) {
        chai
          .request(server)
          .delete("/api/threads/test-board")
          .send({
            "thread_id": threadIds[1],
            "delete_password": "1231234"
          })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'incorrect password');
            done();
          });
      });

    });

    suite('PUT', function () {
      test('should return success after updated', function (done) {
        chai
          .request(server)
          .put("/api/threads/test-board")
          .send({
            "thread_id": threadIds[1],
          })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'success');
            done();
          });
      });
    });

  });

  suite('API ROUTING FOR /api/replies/:board', function () {

    suite('POST', function () {
      test('should redirect after create a thread', function (done) {
        chai
          .request(server)
          .post("/api/replies/test-board")
          .send({
            "thread_id": threadIds[1],
            "delete_password": "123123",
            "text": "rest reply"
          })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.req.path, `/b/test-board/${threadIds[1]}`);
            done();
          });
      });
    });

    suite('GET', function () {
      test('should return thread', function (done) {
        chai
          .request(server)
          .get("/api/replies/test-board")
          .query({ thread_id: threadIds[1] })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.property(res.body, 'text');
            assert.property(res.body, 'board');
            assert.property(res.body, 'replies');
            assert.notProperty(res.body, 'delete_passwords');
            assert.notProperty(res.body, 'reported');
            assert.isArray(res.body.replies);
            replayId = res.body.replies[0]._id;
            done();
          });
      });
    });

    suite('PUT', function () {
      test('should return success after updated', function (done) {
        chai
          .request(server)
          .put("/api/replies/test-board")
          .send({
            "thread_id": threadIds[1],
            "reply_id": replayId
          })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'success');
            done();
          });
      });
    });

    suite('DELETE', function () {
      test('should return success after delete', function (done) {
        chai
          .request(server)
          .delete("/api/replies/test-board")
          .send({
            "thread_id": threadIds[1],
            "reply_id": replayId,
            "delete_password": "123123"
          })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'success');
            done();
          });
      });

      test('should return incorrect password', function (done) {
        chai
          .request(server)
          .delete("/api/threads/test-board")
          .send({
            "thread_id": threadIds[1],
            "reply_id": replayId,
            "delete_password": "1231234"
          })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'incorrect password');
            done();
          });
      });

    });

  });

});
