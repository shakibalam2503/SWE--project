const {
    createPropertyService,
    getAllPropertiesService,
    getPropertyByIdService,
    getOwnerPropertiesService,
    deletePropertyService,
} = require("../services/property.service")

async function createPropertyController(req, res) {
    try {
        console.log('--- CREATE PROPERTY ---');
        console.log('req.body:', req.body);
        console.log('req.files:', req.files ? req.files.length : 'no files');

        const property = await createPropertyService(
            req.user.id,
            req.body,
            req.files
        )

        return res.status(201).json({
            message: "Property created successfully.",
            property,
        })

    } catch (err) {

        return res.status(err.statusCode || 500).json({
            message: err.message || "Internal server error.",
        })
    }
}

async function getAllPropertiesController(req, res) {
    try {

        const properties = await getAllPropertiesService()

        return res.status(200).json({ properties })

    } catch (err) {

        return res.status(500).json({
            message: err.message || "Internal server error.",
        })
    }
}

async function getPropertyByIdController(req, res) {
    try {

        const property = await getPropertyByIdService(req.params.id)

        return res.status(200).json({ property })

    } catch (err) {

        return res.status(err.statusCode || 500).json({
            message: err.message || "Internal server error.",
        })
    }
}

async function getOwnerPropertiesController(req, res) {
    try {

        const properties = await getOwnerPropertiesService(req.user.id)

        return res.status(200).json({ properties })

    } catch (err) {

        return res.status(err.statusCode || 500).json({
            message: err.message || "Internal server error.",
        })
    }
}

async function deletePropertyController(req, res) {
    try {
        await deletePropertyService(req.params.id, req.user.id)
        return res.status(200).json({ message: "Property deleted successfully." })
    } catch (err) {
        return res.status(err.statusCode || 500).json({
            message: err.message || "Internal server error.",
        })
    }
}

async function updatePropertyController(req, res) {
    try {
        await updatePropertyService(
            req.params.id,
            req.user.id,
            req.body,
            req.files
        )

        return res.status(200).json({
            message: "Property updated successfully.",
        })

    } catch (err) {
        return res.status(err.statusCode || 500).json({
            message: err.message || "Internal server error.",
        })
    }
}

module.exports = {
    createPropertyController,
    getAllPropertiesController,
    getPropertyByIdController,
    getOwnerPropertiesController,
    deletePropertyController,
    updatePropertyController,
}