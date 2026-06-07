const express = require("express")

const router = express.Router()

const {
    createPropertyController,
    getAllPropertiesController,
    getPropertyByIdController,
    getOwnerPropertiesController,
    deletePropertyController,
    updatePropertyController,
} = require("../controllers/property.controller")

const { verifyToken, authorizeRoles } = require("../middlewares/auth.middleware")

const uploadPropertyImages = require("../middlewares/uploadProperty.middleware")

router.post(
    "/",
    verifyToken,
    authorizeRoles("owner"),
    uploadPropertyImages.array("property_images", 10),
    createPropertyController
)

router.get("/", getAllPropertiesController)

router.get("/my-properties",
    verifyToken,
    authorizeRoles("owner"),
    getOwnerPropertiesController
)

router.get("/:id", getPropertyByIdController)

router.put(
    "/:id",
    verifyToken,
    authorizeRoles("owner"),
    uploadPropertyImages.array("property_images", 10),
    updatePropertyController
)

router.delete("/:id", verifyToken, authorizeRoles("owner"), deletePropertyController)


module.exports = router