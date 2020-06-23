import {Application, Router} from "https://deno.land/x/oak/mod.ts";
import {profileHandler, signInHandler, signUpHandler,checkAdminHandler} from "../controller/userController.ts";
import {jwtMiddleware} from "../middleware/jwtMiddleware.ts";
import {wineListHandler, addWineHandler, wineDetailHandler} from "../controller/wineController.ts";

const router = new Router();
router
    .post("/api/user/sign-in", signInHandler)
    .post("/api/user/sign-up", signUpHandler)
    .get("/api/check", jwtMiddleware, checkAdminHandler)
    .get("/api/user/profile", jwtMiddleware, profileHandler)
    .get("/api/wine/list", wineListHandler)
    .post("/api/wine/add", jwtMiddleware, addWineHandler)
    .get("/api/wine/detail/:id", wineDetailHandler)

;

export default router;