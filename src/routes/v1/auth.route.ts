import authController from "@controllers/auth.controller";
import validate from "@middleware/validate";
import authValidation from "@validations/auth.validation";
import express from "express";

const router = express.Router();

router.post("/register", validate(authValidation.register), authController.register);
router.post("/login", validate(authValidation.login), authController.login)
router.post("/social", authController.socialLogin)
router.post("/refresh",   validate(authValidation.refreshTokens), authController.refreshTokens)


export default router;
