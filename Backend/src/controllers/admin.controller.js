/**
 * @file src/controllers/admin.controller.js
 * @description Handles admin verification requests
 */

const {
    getPendingUsersService,
    approveUserService,
    rejectUserService,
    getAllUsersService,
} = require("../services/admin.service")

async function getPendingUsersController(req, res) {
    try {
        const users = await getPendingUsersService()
        return res.status(200).json({ users })
    } catch (err) {
        return res.status(err.statusCode || 500).json({ message: err.message || "Internal server error." })
    }
}

async function getAllUsersController(req, res) {
    try {
        const users = await getAllUsersService()
        return res.status(200).json({ users })
    } catch (err) {
        return res.status(err.statusCode || 500).json({ message: err.message || "Internal server error." })
    }
}

async function approveUserController(req, res) {
    try {
        const userId = req.params.id
        await approveUserService(userId)
        return res.status(200).json({ message: "User approved successfully." })
    } catch (err) {
        return res.status(err.statusCode || 500).json({ message: err.message || "Internal server error." })
    }
}

async function rejectUserController(req, res) {
    try {
        const userId = req.params.id
        await rejectUserService(userId)
        return res.status(200).json({ message: "User rejected successfully." })
    } catch (err) {
        return res.status(err.statusCode || 500).json({ message: err.message || "Internal server error." })
    }
}

module.exports = {
    getPendingUsersController,
    getAllUsersController,
    approveUserController,
    rejectUserController,
}