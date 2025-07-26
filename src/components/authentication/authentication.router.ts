import { Router } from "express";
import {
    changeRolesController,
    createUserController,
    getAllUsersController,
    getUserByIdController,
    loginUserController,
    verifyUserController,
    googleAuthRedirectController,
    googleAuthCallbackController
} from "./authentication.controller";
import {asyncHandler} from "../utils/asyncHandler";
import {adminRoleAuth} from "../../middleware/bearAuth";
import passport from "passport";

const router = Router();

router.post("/auth/register", asyncHandler(createUserController));
router.post("/auth/verify", asyncHandler(verifyUserController));
router.post("/auth/login", asyncHandler(loginUserController));

// Google OAuth routes
// Route to initiate Google OAuth
router.get("/auth/google",
    passport.authenticate('google', { scope: ['profile', 'email'] }),
    googleAuthRedirectController // This controller is usually not hit directly
);

// Route to handle Google OAuth callback
router.get("/auth/google/callback",
    passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL}/auth?error=google_auth_failed`, session: false }), // session: false because we use JWT
    asyncHandler(googleAuthCallbackController)
);

router.get("/auth/user/:id", asyncHandler(getUserByIdController));
router.get("/auth/users",  asyncHandler(getAllUsersController));
router.patch("/auth/user/roles", asyncHandler(changeRolesController));


export default router;
