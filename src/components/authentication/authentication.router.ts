import { Router } from "express";
import {
    changeRolesController,
    createUserController, getAllUsersController,
    getUserByIdController,
    loginUserController,
    verifyUserController
} from "./authentication.controller";
import {asyncHandler} from "../utils/asyncHandler";
import {adminRoleAuth} from "../../middleware/bearAuth";

const router = Router();

router.post("/auth/register", asyncHandler(createUserController));
router.post("/auth/verify", asyncHandler(verifyUserController));
router.post("/auth/login", asyncHandler(loginUserController));
router.get("/auth/user/:id", asyncHandler(getUserByIdController));
// router.get("/auth/users", adminRoleAuth,  asyncHandler(getAllUsersController));
router.get("/auth/users",  asyncHandler(getAllUsersController));
router.patch("/auth/user/roles", asyncHandler(changeRolesController));


export default router;