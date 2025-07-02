import { Express } from "express";
import {
    changeRolesController,
    createUserController, getAllUsersController,
    getUserByIdController,
    loginUserController,
    verifyUserController
} from "./authentication.controller";

const userRoute = (app: Express) => {
    // route
    app.route("/auth/register").post(
        async (req, res, next) => {
            try {
                await createUserController(req, res)
            } catch (error) {
                next(error)
            }

        }
    )

    // verify user route
    app.route("/auth/verify").post(
        async (req, res, next) => {
            try {
                await verifyUserController(req, res)
            } catch (error) {
                next(error)
            }
        }
    )

    // login route
    app.route("/auth/login").post(
        async (req, res, next) => {
            try {
                await loginUserController(req, res)
            } catch (error) {
                next()
            }
        }

    )

    //Get user details
    app.route("/auth/user/:id").get(
        async (req, res, next) => {
            try{
                await getUserByIdController(req, res)
            }catch(error){
                next()
            }
        }
    )

    //All users
    app.route("/auth/users").get(
        async (req, res, next) => {
            try{
                await getAllUsersController(req,res)
            }catch(error){
                next()
            }
        }
    )

    //change roles
    app.route("/auth/user/role").put(
        async(req, res, next) =>{
            await changeRolesController(req, res)
        })
}

export default userRoute;