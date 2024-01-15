const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const auth = require("../middleware/auth");

const Todo = require("../models/todos");

/**
 * @route GET/api/v1/todos
 * @desc Get all todos
 * @access private
 */

router.get("/", auth, async (req, res) => {
  try {
    const todos = await Todo.find({ user: req.user.id }).sort({
      created_at: -1,
    });
    res.json(todos);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
    });
  }
});

/**
 * @route POST/api/v1/todos
 * @desc Create a new todos
 * @access private
 */

router.post(  '/',
  [
      auth,
      [
        check('task', 'Please enter your task.').exists(),
      ],
    ],
    async (req, res) => {
      const result = validationResult(req);
  
      if (!result.isEmpty()) {
        return res.status(400).json({
          errors: result,
        });
      }
  
      const { task } = req.body;
  
      try {
        const task = new Todo({
          task,
          user: req.user.id,
        });
  
        await task.save();
  
        res.json(task);
      } catch (err) {
        console.error(err.message);
        res.status(500).json({
          msg: 'Server error',
        });
      }
    }
  );

/**
 * @route PUT/api/v1/todos
 * @desc update todos by id
 * @access private
 */

router.put('/:id', auth, async (req, res) => {
    res.send('Update Task by id');	  const id = req.params.id;
  
    const { task } = req.body;
  
    try {
      const taskFields = {};
  
      if (task) taskFields.task = task;
  
      let task = await Todo.findById(id);
  
      if (!task) {
        return res.status(400).json({
          msg: 'Task not found',
        });
      }
  
      if (req.user.id.toString() !== task.user.toString()) {
        res.status(401).json({
          msg: 'Invalid authorization',
        });
      }
  
      task = await Todo.findByIdAndUpdate(
        id,
        { $set: taskFields },
        { new: true }
      );
  
      return res.json(task);
    } catch (err) {
      console.error(err.message);
      res.status(500).json({
        msg: 'Server error',
      });
    }


});

/**
 * @route Delete/api/v1/todos
 * @desc Delete todos by id
 * @access private
 */

router.delete("/:id", (req, res) => {
  res.send("Delete todos by id");
});

module.exports = router;
