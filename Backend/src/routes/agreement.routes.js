/**
 * @file src/routes/agreement.routes.js
 * @description Agreement draft routes
 * @author Shakib
 */

const express =
    require("express")

const router =
    express.Router()

const {

    verifyToken

} = require("../middlewares/auth.middleware")

const {

    getAgreementDraftController,

    updateAgreementDraftController,

    getMyAgreementDraftsController,

    sendAgreementForSignatureController,

    getOwnerAgreementDraftsController,
    signAgreementController

} = require("../controllers/agreement.controller")

// =====================================================
// Tenant Drafts
// =====================================================

router.get(
    "/my",
    verifyToken,
    getMyAgreementDraftsController
)

// =====================================================
// Owner Drafts
// =====================================================

router.get(
    "/owner",
    verifyToken,
    getOwnerAgreementDraftsController
)

// =====================================================
// Get Single Draft
// =====================================================

router.get(
    "/drafts/:id",
    verifyToken,
    getAgreementDraftController
)

// =====================================================
// Update Draft
// =====================================================

router.patch(
    "/drafts/:id",
    verifyToken,
    updateAgreementDraftController
)
router.patch(
    "/:id/send-signature",
    verifyToken,
    sendAgreementForSignatureController
)
router.patch(
    "/:id/sign",
    verifyToken,
    signAgreementController
)

module.exports =
    router
