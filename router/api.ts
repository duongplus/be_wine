import {Application, Router} from "https://deno.land/x/oak/mod.ts";
import {profileHandler, signInHandler, signUpHandler} from "../controller/userController.ts";
import {jwtMiddleware} from "../middleware/jwtMiddleware.ts";

const router = new Router();
router
    .post("/api/user/sign-in", signInHandler)
    .post("/api/user/sign-up", signUpHandler)
    .get("/api/user/profile", jwtMiddleware, profileHandler)
;

export default router;