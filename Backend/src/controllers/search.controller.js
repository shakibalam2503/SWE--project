const {
    searchPropertiesService
} = require("../services/search.service")

async function searchPropertiesController(
    req,
    res,
    next
) {

    try {

        // ─────────────────────────────
        // Extract query + sessionId
        // from request body
        // ─────────────────────────────

        const {
            query,
            sessionId,
        } = req.body

        // ─────────────────────────────
        // Validation
        // ─────────────────────────────

        if (!query) {

            return res.status(400).json({
                message:
                    "Search query is required",
            })
        }

        if (!sessionId) {

            return res.status(400).json({
                message:
                    "Session ID is required",
            })
        }

        // ─────────────────────────────
        // Run intelligent search
        // ─────────────────────────────

        const { properties, landmarkData, text } =
            await searchPropertiesService(
                query,
                sessionId
            )

        // ─────────────────────────────
        // Response
        // ─────────────────────────────

        res.status(200).json({
            success: true,
            properties,
            landmarkData,
            text,
        })

    } catch (error) {

        next(error)
    }
}

module.exports = {
    searchPropertiesController,
}