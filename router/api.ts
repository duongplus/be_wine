import {Application, Router} from "https://deno.land/x/oak/mod.ts";
import {signInHandler, signUpHandler, testApiHandler} from "../controller/userController.ts";

const router = new Router();
router
    .get("/api/test", testApiHandler)
    .post("/api/user/sign-in", signInHandler)
    .post("/api/user/sign-up", signUpHandler);

export default router;