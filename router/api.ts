import {Application, Router} from "https://deno.land/x/oak/mod.ts";
import {profileHandler, signInHandler, signUpHandler, checkAdminHandler} from "../controller/userController.ts";
import {jwtMiddleware} from "../middleware/jwtMiddleware.ts";
import {wineListHandler, addWineHandler, wineDetailHandler, wineCateHandler} from "../controller/wineController.ts";
import {addToCartHandler} from "../controller/orderController.ts";

const router = new Router();
router
    .post("/api/user/sign-in", signInHandler)
    .post("/api/user/sign-up", signUpHandler)
    .get("/api/check", jwtMiddleware, checkAdminHandler)
    .get("/api/user/profile", jwtMiddleware, profileHandler)
    .get("/api/wine/list", wineListHandler)
    .post("/api/wine/add", jwtMiddleware, addWineHandler)
    .get("/api/wine/detail/:id", wineDetailHandler)
    .get("/api/wine/cate/:cateId", wineCateHandler)
    .post("/api/order/add-to-cart/:wineId", jwtMiddleware, addToCartHandler)

;

export default router;