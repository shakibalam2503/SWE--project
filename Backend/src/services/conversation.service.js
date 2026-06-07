const { client } =
    require("../config/redis")

async function getConversationContext(
    sessionId
) {

    const context =
        await client.get(sessionId)

    return context
        ? JSON.parse(context)
        : {}
}

async function saveConversationContext(
    sessionId,
    context
) {

    await client.set(
        sessionId,
        JSON.stringify(context),
        "EX",
        60 * 60
    )
}

function mergeContexts(
    oldContext,
    newContext
) {

    return {
        ...oldContext,

        ...Object.fromEntries(

            Object.entries(newContext)
                .filter(

                    ([_, value]) =>

                        value !== null
                        &&
                        value !== ""

                        &&
                        !(

                            Array.isArray(value)
                            &&
                            value.length === 0
                        )
                )
        )
    }
}

module.exports = {
    getConversationContext,
    saveConversationContext,
    mergeContexts,
}