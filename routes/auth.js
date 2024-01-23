/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: API for user authentication
 * 
* /api/v1/auth:
 *   get:
 *     summary: Get logged in user
 *     tags: [Auth]
 *     description: Get information about the currently logged-in user.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       '200':
 *         description: Successful operation. Returns information about the logged-in user.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: The user's unique identifier.
 *                 name:
 *                   type: string
 *                   description: The user's name.
 *                 email:
 *                   type: string
 *                   format: email
 *                   description: The user's email address.
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
 * 
 *   post:
 *     summary: Log in user
 *     tags: [Auth]
 *     description: Log in a user with valid credentials.
 *     requestBody:
 *       description: User credentials for logging in.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The user's email address.
 *               password:
 *                 type: string
 *                 description: The user's password.
 *             required:
 *               - email
 *               - password
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       '200':
 *         description: Successful operation. Returns a JWT token for authentication.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: The JWT token for authentication.
 *       '400':
 *         description: Bad Request. Indicates invalid or missing data in the request.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   description: The error message.
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
const auth = require("../middleware/auth");

const router = express.Router();

const User = require("../models/user");

/**
 * @route GET /api/v1/auth
 * @desc Get logged in data
 * @access private
 */
router.get("/", auth, async (req, res) => {
  res.send("get logged in user");
  try {
    const user = await User.findById(req.user.id).select("-password");
    return res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      msg: "Server error",
    });
  }
});

/**
 * @route POST /api/v1/auth
 * @desc log in user
 * @access public
 */
router.post(
  "/",
  [
    check("email", "Please enter your valid email").isEmail(),
    check("password", "Please enter your valid password").exists(),
  ],
  async (req, res) => {
    const result = validationResult(req);

    if (!result.isEmpty()) {
      return res.status(400).json({ result: errors.array() });
    }

    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(400).json({
          msg: "User not exists.",
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({
          msg: "Invalid password",
        });
      }

      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(
        payload,
        process.env.JWTSECRET,
        {
          expiresIn: 3600000,
        },
        (err, token) => {
          if (err) throw err;
          return res.json({
            token,
          });
        }
      );
    } catch (error) {
      console.error(error.message);
      return res.status(500).json({
        msg: "Server Error",
      });
    }
  }
);

module.exports = router;
