/**
 * @swagger
 * components:
 *   schemas:
 *     Todo:
 *       type: object
 *       properties:
 *         task:
 *           type: string
 *           description: The task to be created or updated
 *         user:
 *           type: string
 *           description: The user ID who created the task
 */

/**
 * @swagger
 * tags:
 *   name: Todo
 *   description: The Todo API
 * /api/v1/todos:
 *   get:
 *     summary: Get all todos
 *     tags: [Todo]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Returns the list of todos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Todo'
 *       500:
 *         description: Some server error
 *   post:
 *     summary: Create a new todo
 *     tags: [Todo]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Todo'
 *     responses:
 *       200:
 *         description: The created todo.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Todo'
 *       400:
 *         description: Bad request. Invalid input data.
 *       500:
 *         description: Some server error
 * /api/v1/todos/{id}:
 *   delete:
 *     summary: Delete todo by ID
 *     tags: [Todo]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the todo to delete
 *     responses:
 *       200:
 *         description: Todo removed successfully
 *       400:
 *         description: Bad request. Todo not found.
 *       401:
 *         description: Unauthorized. Invalid authorization.
 *       500:
 *         description: Some server error
 */


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
        const todo = new Todo({
          task,
          user: req.user.id,
        });
  
        await todo.save();
  
        res.json(task);
      } catch (err) {
        console.error(err.message);
        res.status(500).json({
          msg: 'Server vverror',
        });
      }
    }
  );

/**
 * @route PUT/api/v1/todos
 * @desc update todos by id
 * @access private
 */

router.delete("/:id", auth, async (req, res) => {
  const id = req.params.id;

  try {
    const task_todo = await Todo.findById(id);

    if (!task_todo) {
      return res.status(400).json({
        msg: 'Task not found',
      });
    }

    if (req.user.id.toString() !== task_todo.user.toString()) {
      return res.status(401).json({
        msg: 'Invalid authorization',
      });
    }

    await Todo.findOneAndDelete({ _id: id });

    res.json({
      msg: 'Task removed successfully',
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      msg: 'Server error',
    });
  }
});



module.exports = router;
