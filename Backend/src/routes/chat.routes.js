const express =
    require("express")

const router =
    express.Router()

const {
    verifyToken
} = require(
    "../middlewares/auth.middleware"
)

const {
    createConversationController,
    sendMessageController,
    getMessagesController,
    getConversationsController,
    markMessagesReadController
} = require(
    "../controllers/chat.controller"
)

// =====================================================
// Create Conversation
// =====================================================

router.post(
    "/conversation",
    verifyToken,
    createConversationController
)

// =====================================================
// Send Message
// =====================================================

router.post(
    "/message",
    verifyToken,
    sendMessageController
)

// =====================================================
// Get Conversations
// =====================================================

router.get(
    "/conversations",
    verifyToken,
    getConversationsController
)

// =====================================================
// Get Messages
// =====================================================

router.get(
    "/:conversationId",
    verifyToken,
    getMessagesController
)
router.patch(
    "/read/:conversationId",
    verifyToken,
    markMessagesReadController
)
module.exports = router