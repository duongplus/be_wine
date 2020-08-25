import {Application, Router} from "https://deno.land/x/oak/mod.ts";
import {
    profileHandler,
    signInHandler,
    signUpHandler,
    checkAdminHandler,
    changePasswordHandler
} from "../controller/userController.ts";
import {jwtMiddleware} from "../middleware/jwtMiddleware.ts";
import {
    wineListHandler,
    addWineHandler,
    wineDetailHandler,
    wineCateHandler,
    exportAnImage
} from "../controller/wineController.ts";
import {
    addToCartHandler,
    checkoutHandler,
    minusFromCartHandler,
    shoppingCartHandler
} from "../controller/orderController.ts";

const router = new Router();
router
    .post("/api/user/sign-in", signInHandler)
    .post("/api/user/sign-up", signUpHandler)
    .post("/api/user/change-pass", jwtMiddleware, changePasswordHandler)
    .get("/image", exportAnImage)
    //=> {
    //         // exportAnImage.response.headers.set('Content-Type', 'image/png');
    //         // exportAnImage.response.headers.set('Content-Type', 'application/json');
    //     }
    .get("/api/check", jwtMiddleware, checkAdminHandler)
    .get("/api/user/profile", jwtMiddleware, profileHandler)
    .get("/api/wine/list", wineListHandler)
    .post("/api/wine/add", jwtMiddleware, addWineHandler)
    .get("/api/wine/detail/:id", wineDetailHandler)
    .get("/api/wine/cate/:cateId", wineCateHandler)
    .post("/api/order/add-to-cart/:wineId", jwtMiddleware, addToCartHandler)
    .post("/api/order/minus-to-cart/:wineId", jwtMiddleware, minusFromCartHandler)
    .get("/api/order/shopping-cart", jwtMiddleware, shoppingCartHandler)
    .post("/api/order/checkout", jwtMiddleware, checkoutHandler);
;

export default router;