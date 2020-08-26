import {Context, Status, STATUS_TEXT} from "https://deno.land/x/oak/mod.ts";
import {fetchPayload} from "../helper/token.ts";
import {selectWineById} from "../repository/wineRepo.ts";
import {Response} from "../helper/Response.ts"
import {Order, OrderInfo, OrderStatus} from "../model/order.ts";
import {
    addMoreWineToOrder,
    addWineToOrder,
    createOrder,
    minusWineFromOrder, selectOrderConfirmByMonth,
    selectOrderByPhone,
    updateOrderStatus
} from "../repository/orderRepo.ts";
import {Wine} from "../model/wine.ts";
import {User} from "../model/user.ts";
import {selectUserByPhone, updatePointMember} from "../repository/userRepo.ts";

export const addToCartHandler = async (context: any) => {
    const data = await fetchPayload(context);
    const {wineId} = context.params as { wineId: string };

    const wine: Wine = await selectWineById(wineId);
    if (!wine) {
        return Response(context, Status.NotFound, {
            status: Status.NotFound,
            message: STATUS_TEXT.get(Status.NotFound),
        });
    }

    const order: Order = await selectOrderByPhone(data?.phone);
    if (!order) {
        const order: Order = {
            phone: data?.phone,
            wines: [],
            status: OrderStatus.PENDING,
        };
        await createOrder(order);
        const oderInfo: OrderInfo = {
            wine: wine,
            amount: 1,
        }
        await addWineToOrder(oderInfo, data?.phone);
        return Response(context, Status.OK, {
            status: Status.OK,
            message: STATUS_TEXT.get(Status.OK),
        });
    }

    const wineExist = await selectOrderByPhone(data?.phone);
    const _wines = wineExist["wines"];
    const _objOrderInfo = [];
    let _orderInfo = null;
    for (let i = 0; i < _wines.length; i++) {
        _objOrderInfo[i] = _wines[i];
        _orderInfo = _objOrderInfo[i]["orderInfo"];
        if (_orderInfo["wine"]._id.$oid == wineId) {
            const w = await addMoreWineToOrder(data?.phone, i, _wines)
            console.log(w)
            return Response(context, Status.Accepted, {
                status: Status.Accepted,
                message: STATUS_TEXT.get(Status.Accepted),
            });
        }
    }

    // if (wineExist) {
    //     return Response(context, Status.Conflict, {
    //         status: Status.Conflict,
    //         message: STATUS_TEXT.get(Status.Conflict),
    //     });
    // }

    console.log("no conflict")
    if (order.status = OrderStatus.PENDING) {
        const oderInfo: OrderInfo = {
            wine: wine,
            amount: 1,
        }
        await addWineToOrder(oderInfo, data?.phone);
        return Response(context, Status.OK, {
            status: Status.OK,
            message: STATUS_TEXT.get(Status.OK),
        });
    }

    return Response(context, Status.NotFound, {
        status: Status.NotFound,
        message: STATUS_TEXT.get(Status.NotFound),
    });
};

export const minusFromCartHandler = async (context: any) => {
    const data = await fetchPayload(context);
    const {wineId} = context.params as { wineId: string };

    const wine: Wine = await selectWineById(wineId);
    if (!wine) {
        return Response(context, Status.NotFound, {
            status: Status.NotFound,
            message: STATUS_TEXT.get(Status.NotFound),
        });
    }

    const order: Order = await selectOrderByPhone(data?.phone);
    if (!order) {
        return Response(context, Status.NotFound, {
            status: Status.NotFound,
            message: STATUS_TEXT.get(Status.NotFound),
        });
    }

    const wineExist = await selectOrderByPhone(data?.phone);
    const _wines = wineExist["wines"];
    const _objOrderInfo = [];
    let _orderInfo = null;

    if (_wines.length == 0) {
        return Response(context, Status.NotFound, {
            status: Status.NotFound,
            message: STATUS_TEXT.get(Status.NotFound),
        });
    }
    for (let i = 0; i < _wines.length; i++) {
        _objOrderInfo[i] = _wines[i];
        _orderInfo = _objOrderInfo[i]["orderInfo"];
        if (_orderInfo["wine"]._id.$oid == wineId) {
            const w = await minusWineFromOrder(data?.phone, i, _wines)
            console.log(w)
            if (!w) {
                return Response(context, Status.NotFound, {
                    status: Status.NotFound,
                    message: STATUS_TEXT.get(Status.NotFound),
                });
            }
            return Response(context, Status.Accepted, {
                status: Status.Accepted,
                message: STATUS_TEXT.get(Status.Accepted),
            });
        }
    }

    return Response(context, Status.NotFound, {
        status: Status.NotFound,
        message: STATUS_TEXT.get(Status.NotFound),
    });
}

export const checkoutHandler = async (context: Context) => {
    const data = await fetchPayload(context);
    const user: User = await selectUserByPhone(data?.phone);
    const order: Order = await selectOrderByPhone(data?.phone);
    if (!order) {
        return Response(context, Status.NotFound, {
            status: Status.NotFound,
            message: STATUS_TEXT.get(Status.NotFound),
        });
    }

    const wineExist = await selectOrderByPhone(data?.phone);
    const _wines = wineExist["wines"];
    const _objOrderInfo = [];
    let _orderInfo = null;


    if (_wines.length == 0) {
        return Response(context, Status.NotFound, {
            status: Status.NotFound,
            message: STATUS_TEXT.get(Status.NotFound),
        });
    }
    let total: number = 0;
    for (let i = 0; i < _wines.length; i++) {
        _objOrderInfo[i] = _wines[i];
        _orderInfo = _objOrderInfo[i]["orderInfo"];
        total += _orderInfo.wine.price * _orderInfo.amount;
        console.log(total);
    }

    const upsertedId = await updateOrderStatus(data?.phone, total, user);
    if (!upsertedId) {
        return Response(context, Status.ExpectationFailed, {
            status: Status.ExpectationFailed,
            message: STATUS_TEXT.get(Status.ExpectationFailed),
        });
    }

    const point = total/1000;
    console.log(point);
    if(point >= 1){
        const updatedPoint = updatePointMember(data?.phone, point);
        console.log(updatedPoint);
        if(!updatedPoint) {
            return Response(context, Status.ExpectationFailed, {
                status: Status.ExpectationFailed,
                message: STATUS_TEXT.get(Status.ExpectationFailed),
            });
        }
    }

    return Response(context, Status.OK, {
        status: Status.OK,
        message: STATUS_TEXT.get(Status.OK),
    });
};

export const shoppingCartHandler = async (context: Context) => {
    const data = await fetchPayload(context);
    const order = await selectOrderByPhone(data?.phone);

    if (!order) {
        return Response(context, Status.NotFound, {
            status: Status.NotFound,
            message: STATUS_TEXT.get(Status.NotFound),
        });
    }

    return Response(context, Status.OK, {
        status: Status.OK,
        message: STATUS_TEXT.get(Status.OK),
        data: {
            wines: order.wines,
        },
    });
};

export const orderConfirmStatisticHandler = async (context: any) => {
    const data = await fetchPayload(context);

    const ocs = await selectOrderConfirmByMonth(8);
    console.log(ocs);
    return Response(context, Status.OK, {
        status: Status.OK,
        message: STATUS_TEXT.get(Status.OK),
        data: {
            order: ocs,
        },
    });
}
