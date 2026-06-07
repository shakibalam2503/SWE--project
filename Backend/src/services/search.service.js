const axios = require('axios');

async function searchPropertiesService(query, sessionId) {
    try {
        const rasaResponse = await axios.post('http://localhost:5005/webhooks/rest/webhook', {
            sender: sessionId,
            message: query
        });

        const messages = rasaResponse.data;
        let textResponses = [];
        let properties = [];
        let landmarkData = null;

        for (const msg of messages) {
            if (msg.text) {
                textResponses.push(msg.text);
            }
            if (msg.custom) {
                if (msg.custom.properties) properties = msg.custom.properties;
                if (msg.custom.landmarkData) landmarkData = msg.custom.landmarkData;
                if (msg.custom.landmark) landmarkData = msg.custom.landmark; // Fallback for rasa-chatbot
            }
            // For easyrent-ai-assistant which might use json_message internally
            if (msg.json_message) {
                if (msg.json_message.properties) properties = msg.json_message.properties;
                if (msg.json_message.landmarkData) landmarkData = msg.json_message.landmarkData;
            }
        }

        const combinedText = textResponses.join('\n\n');

        return {
            properties: properties,
            landmarkData: landmarkData,
            text: combinedText || "I couldn't process your request at the moment."
        };
    } catch (error) {
        console.error("Error communicating with Rasa:", error.message);
        throw new Error("Failed to communicate with the intelligent search assistant.");
    }
}

module.exports = {
    searchPropertiesService,
};