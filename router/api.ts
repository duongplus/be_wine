import {Application, Router} from "https://deno.land/x/oak/mod.ts";
import {
    profileHandler,
    signInHandler,
    signUpHandler,
    checkAdminHandler,
    changePasswordHandler, changeDisplayNameHandler, getAllUserHandler, passwordRecoveryHandler
} from "../controller/userController.ts";
import {jwtMiddleware} from "../middleware/jwtMiddleware.ts";
import {
    wineListHandler,
    addWineHandler,
    wineDetailHandler,
    wineCateHandler,
    exportAnImage, wineUpdateHandler, addCateHandler, findAllWineHandler
} from "../controller/wineController.ts";
import {
    addToCartHandler,
    checkoutHandler, getCountOrder, historyHandler,
    minusFromCartHandler, orderConfirmStatisticHandler,
    shoppingCartHandler
} from "../controller/orderController.ts";

const router = new Router();
router
    .post("/api/user/sign-in", signInHandler)
    .post("/api/user/sign-up", signUpHandler)
    .post("/api/user/change-pass", jwtMiddleware, changePasswordHandler)
    .post("/api/user/change-name", jwtMiddleware, changeDisplayNameHandler)
    .get("/api/user/all-user", jwtMiddleware, getAllUserHandler)
    .post("/api/user/password-recovery", jwtMiddleware, passwordRecoveryHandler)
    .get("/image", exportAnImage)
    //=> {
    //         // exportAnImage.response.headers.set('Content-Type', 'image/png');
    //         // exportAnImage.response.headers.set('Content-Type', 'application/json');
    //     }
    .get("/api/check", jwtMiddleware, checkAdminHandler)
    .get("/api/user/profile", jwtMiddleware, profileHandler)
    .post("/api/wine/add-cate", jwtMiddleware, addCateHandler)
    .get("/api/wine/all-wine", findAllWineHandler)
    .get("/api/wine/list", wineListHandler)
    .post("/api/wine/add", jwtMiddleware, addWineHandler)
    .post("/api/wine/update/:wineId", jwtMiddleware, wineUpdateHandler)
    .get("/api/wine/detail/:id", wineDetailHandler)
    .get("/api/wine/cate/:cateId", wineCateHandler)
    .post("/api/order/add-to-cart/:wineId", jwtMiddleware, addToCartHandler)
    .post("/api/order/minus-from-cart/:wineId", jwtMiddleware, minusFromCartHandler)
    .get("/api/order/shopping-cart", jwtMiddleware, shoppingCartHandler)
    .post("/api/order/checkout", jwtMiddleware, checkoutHandler)
    .get("/api/order/statistic/:month", jwtMiddleware, orderConfirmStatisticHandler)
    .get("/api/order/count", jwtMiddleware, getCountOrder)
    .get("/api/user/history", jwtMiddleware, historyHandler)
;

export default router;