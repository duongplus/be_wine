import {Status, STATUS_TEXT, Context} from "https://deno.land/x/oak/mod.ts";
import {fetchPayload} from "../helper/token.ts";
import {selectWineById} from "../repository/wineRepo.ts";
import {Response} from "../helper/Response.ts"
import {Order, OrderInfo, OrderStatus} from "../model/order.ts";
import {
    addMoreWineToOrder,
    addWineToOrder,
    checkWineExist,
    createOrder,
    selectOrderByPhone,
    updateOrderStatus
} from "../repository/orderRepo.ts";
import {Wine} from "../model/wine.ts";

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
    for(let i=0; i<_wines.length; i++) {
        _objOrderInfo[i] = _wines[i];
        _orderInfo = _objOrderInfo[i]["orderInfo"];
        if(_orderInfo["wine"]._id.$oid == wineId){
            const w = await addMoreWineToOrder(data?.phone, i, _wines)
            console.log(w)
            return Response(context, Status.Conflict, {
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
    const oderInfo: OrderInfo = {
        wine: wine,
        amount: 1,
    }
    await addWineToOrder(oderInfo, data?.phone);
    return Response(context, Status.OK, {
        status: Status.OK,
        message: STATUS_TEXT.get(Status.OK),
    });
};

export const checkoutHandler = async (context: Context) => {
    const data = await fetchPayload(context);
    const upsertedId = await updateOrderStatus(data?.phone);
    if (!upsertedId) {
        return Response(context, Status.ExpectationFailed, {
            status: Status.ExpectationFailed,
            message: STATUS_TEXT.get(Status.ExpectationFailed),
        });
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
