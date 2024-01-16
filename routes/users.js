/**
 * @swagger
 * tags:
 *   name: User
 *   description: API for managing users
 * 
 * /api/v1/users:
 *   post:
 *     summary: Create a new user
 *     tags: [User]
 *     requestBody:
 *       description: User information for creating a new user.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the user.
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The email address of the user.
 *               password:
 *                 type: string
 *                 description: The password for the user.
 *             required:
 *               - name
 *               - email
 *               - password
 *     responses:
 *       '200':
 *         description: The created User.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: The auto-generated id of the user.
 *                 name:
 *                   type: string
 *                   description: The name of the user.
 *                 email:
 *                   type: string
 *                   description: The email address of the user.
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *                   description: The date and time the user was added.
 *       '400':
 *         description: Bad Request. Indicates invalid or missing data in the request.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       msg:
 *                         type: string
 *                         description: The error message.
 *       '500':
 *         description: Internal Server Error. Indicates a server-side issue.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   description: The error message.
 */

const express = require("express");
const { check, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const router = express.Router();

const User = require("../models/user");

/**
 * @route POST /api/v1/users
 * @desc Create a new user
 * @access public
 */

router.post(
  "/",
  [
    check("name", "Please enter your full name.").not().isEmpty(),
    check("email", "Please enter your email address.").isEmail(),
    check("password", "Please insert atleast 6 characters.").isLength({
      min: 6,
      max: 15,
    }),
  ],
  async (req, res) => {
    const result = validationResult(req);

    if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() });
    }

    const { name, email, password } = req.body;

    try {
      let user = await User.findOne({ email });

      if (user) {
        return res.status(400).json({
          msg: "User already exists",
        });
      }

      user = new User({
        name,
        email,
        password,
      });

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      await user.save();

      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(
        payload,
        process.env.JWTSECRET,
        { expiresIn: 3600000 },
        (err, token) => {
          if (err) throw err;
          return res.json({
            token,
          });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ msg: "Server error" });
    }
  }
);

module.exports = router;
