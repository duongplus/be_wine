import {Application, Router} from "https://deno.land/x/oak/mod.ts";
import {signInHandler, signUpHandler, testApiHandler} from "../controller/userController.ts";
// import {jwtMiddleware} from "../middleware/jwtMiddleware.ts";

const router = new Router();
router
    .get("/api/test", testApiHandler)
    .post("/api/user/sign-in", signInHandler)
    .post("/api/user/sign-up", signUpHandler)
    // .post("/api/user/profile", jwtMiddleware, signInHandler)
;

export default router;