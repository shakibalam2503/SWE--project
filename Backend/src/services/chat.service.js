const { getPool } =require("../config/db")
const pool = getPool()

// =====================================================
// Create Conversation
// =====================================================

async function createConversationService(
    propertyId,
    tenantId,
    ownerId
) {

    // Check existing conversation

    const [existing] =
        await pool.query(
            `
            SELECT 
                c.*,
                p.title,
                p.address,
                p.monthly_rent,
                p.area,
                tenant.name AS tenant_name,
                owner.name AS owner_name
            FROM conversations c
            JOIN properties p ON c.property_id = p.id
            JOIN users tenant ON c.tenant_id = tenant.id
            JOIN users owner ON c.owner_id = owner.id
            WHERE c.property_id = ?
            AND c.tenant_id = ?
            AND c.owner_id = ?
            `,
            [
                propertyId,
                tenantId,
                ownerId,
            ]
        )

    // Return existing conversation

    if (existing.length > 0) {

        return existing[0]
    }

    // Create new conversation

    const [result] =
        await pool.query(
            `
            INSERT INTO conversations (
                property_id,
                tenant_id,
                owner_id
            )
            VALUES (?, ?, ?)
            `,
            [
                propertyId,
                tenantId,
                ownerId,
            ]
        )

    // Fetch newly created conversation

    const [conversation] =
        await pool.query(
            `
            SELECT 
                c.*,
                p.title,
                p.address,
                p.monthly_rent,
                p.area,
                tenant.name AS tenant_name,
                owner.name AS owner_name
            FROM conversations c
            JOIN properties p ON c.property_id = p.id
            JOIN users tenant ON c.tenant_id = tenant.id
            JOIN users owner ON c.owner_id = owner.id
            WHERE c.id = ?
            `,
            [result.insertId]
        )

    return conversation[0]
}

// =====================================================
// Send Message
// =====================================================

async function sendMessageService(
    conversationId,
    senderId,
    message
) {

    await pool.query(
        `
        INSERT INTO messages (
            conversation_id,
            sender_id,
            message
        )
        VALUES (?, ?, ?)
        `,
        [
            conversationId,
            senderId,
            message,
        ]
    )

    return {
        success: true,
    }
}

// =====================================================
// Get Messages
// =====================================================

async function getMessagesService(
    conversationId
) {

    const [messages] =
        await pool.query(
            `
            SELECT
                m.*,
                u.name

            FROM messages m

            JOIN users u
            ON m.sender_id = u.id

            WHERE m.conversation_id = ?

            ORDER BY m.created_at ASC
            `,
            [conversationId]
        )

    return messages
}

// =====================================================
// Get User Conversations
// =====================================================

async function getConversationsService(
    userId
) {

    const [conversations] =
        await pool.query(
            `
            SELECT
                c.*,

                p.title,
                p.address,
                p.monthly_rent,
                p.area,

                tenant.name
                AS tenant_name,

                owner.name
                AS owner_name,

                (
                    SELECT message
                    FROM messages
                    WHERE conversation_id = c.id
                    ORDER BY created_at DESC
                    LIMIT 1
                ) AS latest_message,

                (
                    SELECT created_at
                    FROM messages
                    WHERE conversation_id = c.id
                    ORDER BY created_at DESC
                    LIMIT 1
                ) AS latest_message_time

            FROM conversations c

            JOIN properties p
            ON c.property_id = p.id

            JOIN users tenant
            ON c.tenant_id = tenant.id

            JOIN users owner
            ON c.owner_id = owner.id

            WHERE
                c.tenant_id = ?
                OR c.owner_id = ?

            ORDER BY latest_message_time DESC
            `,
            [userId, userId]
        )

    return conversations
}
// =====================================================
// Mark Messages As Read
// =====================================================

async function markMessagesReadService(
    conversationId,
    userId
) {

    await pool.query(
        `
        UPDATE messages

        SET is_read = TRUE

        WHERE conversation_id = ?
        AND sender_id != ?
        `,
        [
            conversationId,
            userId
        ]
    )

    return {
        success: true
    }
}

module.exports = {
    createConversationService,
    sendMessageService,
    getMessagesService,
    getConversationsService,
    markMessagesReadService
}