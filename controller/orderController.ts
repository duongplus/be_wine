import {Context, Status, STATUS_TEXT} from "https://deno.land/x/oak/mod.ts";
import {fetchPayload} from "../helper/token.ts";
import {selectWineById, updateCapacityWineById} from "../repository/wineRepo.ts";
import {Response} from "../helper/Response.ts"
import {Order, OrderInfo, OrderStatus} from "../model/order.ts";
import {
    addMoreWineToOrder,
    addWineToOrder,
    createOrder,
    minusWineFromOrder, selectOrderConfirmByMonth,
    selectOrderByPhone,
    updateOrderStatus, updateAmountWineInOrder
} from "../repository/orderRepo.ts";
import {Wine} from "../model/wine.ts";
import {User} from "../model/user.ts";
import {selectUserByPhone, updatePointMember} from "../repository/userRepo.ts";
import {ROLE} from "../model/user.ts";

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

    if((wine.capacity == 0)) {
        return Response(context, Status.NotFound, {
            status: Status.NotFound,
            message: "Hết rượu",
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
            if (_orderInfo["wine"].capacity <= 0) {
                return Response(context, Status.NotFound, {
                    status: Status.NotFound,
                    message: STATUS_TEXT.get(Status.NotFound),
                });
            }
            if (_orderInfo["amount"] < _orderInfo["wine"].capacity) {
                const w = await addMoreWineToOrder(data?.phone, i, _wines)
                console.log(w)
                return Response(context, Status.Accepted, {
                    status: Status.Accepted,
                    message: STATUS_TEXT.get(Status.Accepted),
                });
            }
            return Response(context, Status.NotAcceptable, {
                status: Status.NotAcceptable,
                message: STATUS_TEXT.get(Status.NotAcceptable),
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
                console.log("minusWineFromOrder")
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
    console.log("last minus")
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
    let _wines = wineExist["wines"];
    let _objOrderInfo = [];
    let _orderInfo = null;

    if (_wines.length == 0) {
        console.log("_wines.length == 0")
        return Response(context, Status.NotFound, {
            status: Status.NotFound,
            message: STATUS_TEXT.get(Status.NotFound),
        });
    }

    _orderInfo = null;
    for (let i = 0; i < _wines.length; i++) {
        _objOrderInfo[i] = _wines[i];
        _orderInfo = _objOrderInfo[i]["orderInfo"];
        const wine: Wine = await selectWineById(_orderInfo.wine._id.$oid)
        if(wine.capacity <=0 ){
            console.log("wine.capacity", wine.capacity)
            const deleteWine = await minusWineFromOrder(data?.phone, i, _wines)
            if(!deleteWine) {
                return Response(context, Status.ExpectationFailed, {
                    status: Status.ExpectationFailed,
                    message: STATUS_TEXT.get(Status.ExpectationFailed),
                });
            }
            return Response(context, Status.NotAcceptable, {
                status: Status.NotAcceptable,
                message: STATUS_TEXT.get(Status.NotAcceptable),
                data: _wines
            });

        }
        if (_orderInfo.amount > wine.capacity) {
            console.log(wine.capacity)
            console.log("_orderInfo.amount > _orderInfo.wine.capacity")
            const updatedAmount = await updateAmountWineInOrder(data?.phone, i, _wines, wine.capacity)
            console.log(updatedAmount)
            if (!updatedAmount) {
                return Response(context, Status.ExpectationFailed, {
                    status: Status.ExpectationFailed,
                    message: STATUS_TEXT.get(Status.ExpectationFailed),
                });
            }
            return Response(context, Status.NotAcceptable, {
                status: Status.NotAcceptable,
                message: STATUS_TEXT.get(Status.NotAcceptable),
            });
        }
    }

    _orderInfo = null;
    for (let i = 0; i < _wines.length; i++) {
        _objOrderInfo[i] = _wines[i];
        _orderInfo = _objOrderInfo[i]["orderInfo"];
        // if(_orderInfo.wine.capacity <= 0) {
        //     console.log("_orderInfo.wine.capacity <= 0")
        //     const deleteWine = await minusWineFromOrder(data?.phone, i, _wines)
        //     if(!deleteWine) {
        //         return Response(context, Status.ExpectationFailed, {
        //             status: Status.ExpectationFailed,
        //             message: STATUS_TEXT.get(Status.ExpectationFailed),
        //         });
        //     }
        // }
        const updateCapacity = await updateCapacityWineById(_orderInfo.wine._id.$oid, -(_orderInfo.amount))
        console.log("-(_orderInfo.amount)", -(_orderInfo.amount))
        if (!updateCapacity) {
            console.log("!updateCapacity")
            return Response(context, Status.ExpectationFailed, {
                status: Status.ExpectationFailed,
                message: STATUS_TEXT.get(Status.ExpectationFailed),
            });
        }
    }

    let total: number = 0;
    for (let i = 0; i < _wines.length; i++) {
        _objOrderInfo[i] = _wines[i];
        _orderInfo = _objOrderInfo[i]["orderInfo"];
        total += _orderInfo.wine.price * _orderInfo.amount;
        console.log(total);
    }

    const point = total / 100000;
    console.log(point);
    if (point >= 1) {
        const updatedPoint = updatePointMember(data?.phone, point);
        console.log(updatedPoint);
        if (!updatedPoint) {
            return Response(context, Status.ExpectationFailed, {
                status: Status.ExpectationFailed,
                message: STATUS_TEXT.get(Status.ExpectationFailed),
            });
        }
    }

    const upsertedId = await updateOrderStatus(data?.phone, total, user, _wines);
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

export const orderConfirmStatisticHandler = async (context: any) => {
    const payload = await fetchPayload(context);

    const user: User = await selectUserByPhone(payload?.phone);
    if (user.role != ROLE.ADMIN) {
        return Response(context, Status.Unauthorized, {
            status: Status.Unauthorized,
            message: "Permission deny"
        })
    }
    const { month } = context.params as { month: string };
    const ocs = await selectOrderConfirmByMonth(month);
    console.log(ocs);
    return Response(context, Status.OK, {
        status: Status.OK,
        message: STATUS_TEXT.get(Status.OK),
        data: {
            order: ocs,
        },
    });
}

export const getCountOrder = async (context: any) => {
    const data = await fetchPayload(context);

    let count:number = 0;
    const wineOrderExist = await selectOrderByPhone(data?.phone);
    if(!wineOrderExist) {
        return Response(context, Status.OK, {
            status: Status.OK,
            message: STATUS_TEXT.get(Status.OK),
            data: 0,
        });
    }
    const _wine = wineOrderExist["wines"];
    const _orderInfoObject = []
    let _orderInfo = null;
    for(let i = 0; i< _wine.length; i++){
        _orderInfoObject[i] = _wine[i];
        _orderInfo = _orderInfoObject[i]["orderInfo"];
        count += _orderInfo.amount;
    }
    console.log("get count")
    return Response(context, Status.OK, {
        status: Status.OK,
        message: STATUS_TEXT.get(Status.OK),
        data: count,
    });
}