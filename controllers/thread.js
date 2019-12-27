const Thread = require('../models/thread');
const reply = require('../models/reply');

exports.create = async (req, res) => {
  const { board } = req.params || req.body;
  const { delete_password, text } = req.body;

  try {
    const thread = await Thread.create({ delete_password, text, board });
    res.redirect(`/b/${board}`);
  } catch (e) {
    console.log('==== ERROR ===== ', e)
    res.status(400).send(e);
  }
}

exports.find = async (req, res) => {
  const { board } = req.params || req.body;
  console.log('board', board)
  try {
    const thread = await Thread.find()
      .select('-delete_password -reported -__v')
      .populate('replies', '-delete_password -reported -__v -thread_id', null, { sort: { 'created_on': -1 }, limit: 3 })
      .sort({ bumped_on: -1 })
      .limit(10);

    res.status(200).json(thread)
  } catch (e) {
    console.log('==== ERROR ===== ', e)
    res.status(400).send(e);
  }
}

exports.delete = async (req, res) => {
  const { board } = req.params || req.body;
  const { delete_password, thread_id } = req.body;

  try {
    const thread = await Thread.deleteAfterCompare({ _id: thread_id }, { delete_password });
    res.status(200).send(thread)
  } catch (e) {
    console.log('==== ERROR ===== ', e)
    res.status(400).send(e);
  }
}

exports.report = async (req, res) => {
  const { board } = req.params || req.body;
  const { thread_id } = req.body;
  try {
    const thread = await Thread.findOneAndUpdate(
      { _id: thread_id, board: board },
      { $set: { reported: true } },
      { new: true },
    );

    res.status(200).send('success');
  } catch (e) {
    console.log('==== ERROR ===== ', e)
    res.status(400).send(e);
  }
}