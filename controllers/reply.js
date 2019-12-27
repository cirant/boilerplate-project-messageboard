const Thread = require('../models/thread');
const Reply = require('../models/reply');

exports.create = async (req, res) => {
  const { board } = req.params || req.body;
  const { delete_password, text, thread_id } = req.body;

  try {
    const reply = new Reply({ delete_password, text, thread_id });
    const thread = await Thread.findOneAndUpdate(
      { _id: thread_id },
      { $push: { replies: reply._id } },
      { new: true },
    );

    await reply.save();

    res.redirect(`/b/${board}/${thread_id}`)
  } catch (e) {
    console.log('==== ERROR ===== ', e)
    res.status(400).send(e);
  }
}

exports.find = async (req, res) => {
  const { board } = req.params || req.body;
  const { thread_id } = req.query || req.body;

  try {
    const thread = await Thread.findOne({ _id: thread_id })
      .select('-delete_password -reported -__v')
      .populate('replies', '-delete_password -reported -__v -thread_id', null, { sort: { 'created_on': -1 } })

    res.status(200).json(thread)
  } catch (e) {
    console.log('==== ERROR ===== ', e)
    res.status(400).send(e);
  }
}

exports.delete = async (req, res) => {
  const { board } = req.params || req.body;
  const { delete_password, thread_id, reply_id } = req.body;

  try {
    const thread = await Reply.deleteAfterCompare({ _id: reply_id, thread_id: thread_id }, { delete_password });
    res.status(200).send(thread)
  } catch (e) {
    console.log('==== ERROR ===== ', e)
    res.status(400).send(e);
  }
}

exports.report = async (req, res) => {
  const { board } = req.params || req.body;
  const { delete_password, thread_id, reply_id } = req.body;

  try {
    await Reply.findOneAndUpdate(
      { _id: reply_id, thread_id: thread_id },
      { $set: { reported: true } },
      { new: true },
    );
    res.status(200).send('success');
  } catch (e) {
    console.log('==== ERROR ===== ', e)
    res.status(400).send(e);
  }
}