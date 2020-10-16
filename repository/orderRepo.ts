import Db from "../db/database.ts";
import {Order, OrderInfo, OrderStatus} from "../model/order.ts";
import {Wine} from "../model/wine.ts";
import {User} from "../model/user.ts";

const orderCollection = Db.collection("orders");

export const selectOrderByPhone = async (phone: any) => {
    return await orderCollection.findOne({
        phone: phone,
        status: OrderStatus.PENDING
    })
}

export const createOrder = async (order: Order) => {
    return await orderCollection.insertOne(order);
}

export const addWineToOrder = async (orderInfo: OrderInfo, phone: any) => {
    return await orderCollection.updateOne({
        phone: phone, status: OrderStatus.PENDING
    }, {
        $push: {
            "wines": {orderInfo}
        }
    })
}

export const updateAmountWineInOrder = async (phone: any, index: number, wines: OrderInfo[], amount: number) => {
    // @ts-ignore
    wines[index]["orderInfo"].amount = amount;
    // @ts-ignore
    wines[index]["orderInfo"].wine.capacity = amount;
    return await orderCollection.updateOne({
            phone: phone, status: OrderStatus.PENDING
        },
        {
            $set: {
                wines: wines
            }
        })
}

export const addMoreWineToOrder = async (phone: any, index: number, wines: OrderInfo[]) => {
    // const query = "wines."+index+".orderInfo.amount:1";
    // @ts-ignore
    wines[index]["orderInfo"].amount += 1;
    return await orderCollection.updateOne({
            phone: phone, status: OrderStatus.PENDING
        },
        {
            $set: {
                wines: wines
            }
        })
}

export const minusWineFromOrder = async (phone: any, index: number, wines: OrderInfo[]) => {
    // @ts-ignore
    const amount = wines[index]["orderInfo"].amount -= 1;
    if (amount > 0) {
        return await orderCollection.updateOne({
                phone: phone, status: OrderStatus.PENDING
            },
            {
                $set: {
                    wines: wines
                }
            })
    }
    wines.splice(index, 1);
    return await orderCollection.updateOne({
            phone: phone, status: OrderStatus.PENDING
        },
        {
            $set: {
                wines: wines
            }
        });
}

export const deleteWineFromOrder = async (phone: any, index: number, wines: OrderInfo[]) => {
    wines.splice(index, 1);
    return await orderCollection.updateOne({
            phone: phone, status: OrderStatus.PENDING
        },
        {
            $set: {
                wines: wines
            }
        });
}

// export const checkWineExist = async (phone: any, wineId: any) => {
//     return await orderCollection.find({
//         phone: phone,
//     });
// };

export const updateOrderStatus = async (phone: any, total: number, user: User, wines: any) => {
    const date: Date = new Date();
    date.setUTCHours(date.getUTCHours() + 7);
    let percentDiscount = 0;
    if (user.point > 1000) {
        percentDiscount = 20;
    } else if (user.point > 500) {
        percentDiscount = 15;
    } else if (user.point > 250) {
        percentDiscount = 10;
    } else {
        percentDiscount = 0;
    }
    const discount = total * (percentDiscount / 100);
    const netTotal = total - discount;
    return await orderCollection.updateOne({
        phone: phone, status: OrderStatus.PENDING,
    }, {
        phone: phone,
        total: total,
        percentDiscount: percentDiscount,
        discount: discount,
        netTotal: netTotal,
        date: date.toISOString(),
        status: OrderStatus.CONFIRM,
        wines: wines
    });
};

export const selectOrderConfirmByMonth = async (m: any) => {
    let month = m.toString();
    if (month.length == 1) month = "0" + month;
    const date: Date = new Date();
    // date.setUTCHours(date.getUTCHours() + 7);
    let year = date.getFullYear();
    let gtDate = year + "-" + month + "-01";
    let ltDate = "";
    switch (m) {
        case 2:
            year % 400 == 0 || (year % 4 == 0 && year % 100 != 0) ?
                ltDate = year + "-" + month + "-29" :
                ltDate = year + "-" + month + "-28";
            break;
        case 4:
            ltDate = year + "-" + month + "-30";
            break;
        case 6:
            ltDate = year + "-" + month + "-30";
            break;
        case 9:
            ltDate = year + "-" + month + "-30";
            break;
        case 11:
            ltDate = year + "-" + month + "-30";
            break;
        default:
            ltDate = year + "-" + month + "-31";
            break;
    }
    const isoGtDate = new Date(gtDate);
    isoGtDate.setHours(0, 0, 0);
    const isoLtDate = new Date(ltDate);
    isoLtDate.setHours(23, 59, 59);
    return await orderCollection.find({
            status: OrderStatus.CONFIRM,
            date: {$gte: isoGtDate.toISOString(), $lt: isoLtDate.toISOString()}
        }
    )
}

export const SelectOrderConfirm = async (phone: any) => {
    return await orderCollection.find({
        status: OrderStatus.CONFIRM,
        phone: phone,
    });
}