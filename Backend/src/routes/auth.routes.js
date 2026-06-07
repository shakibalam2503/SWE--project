/**
 * @file src/routes/auth.routes.js
 * @description Auth routes — wires endpoints, middlewares and controllers together.
 * @author Shakib
 */

const express = require("express")
const router = express.Router()
const { uploadNID } = require("../middlewares/upload.middleware")
const { verifyToken } = require("../middlewares/auth.middleware")
const { authLimiter } = require("../middlewares/rateLimiter.middleware")

const {
    registerController,
    loginController,
    logoutController,
    refreshTokenController,
    getMeController,
} = require("../controllers/auth.controller")

router.post("/register",authLimiter,uploadNID, registerController)
router.post("/login", authLimiter,loginController)
router.post("/logout",verifyToken, logoutController)
router.post("/refresh",authLimiter, refreshTokenController)
router.get("/me", verifyToken, getMeController)

module.exports = router