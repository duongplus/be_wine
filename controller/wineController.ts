import {Context, Status, STATUS_TEXT} from "https://deno.land/x/oak/mod.ts";
import {Response} from "../helper/Response.ts"
import {Wine} from "../model/wine.ts";
import {
    checkWineExist, deleteWine, findWine,
    saveWine,
    selectWineByCateId,
    selectWineById,
    updateCapacityWine, updateWine
} from "../repository/wineRepo.ts"
import {findCate, saveCate} from "../repository/cateRepo.ts";
import {fetchPayload} from "../helper/token.ts";
import {ROLE, User} from "../model/user.ts";
import {selectUserByPhone} from "../repository/userRepo.ts";


export const exportAnImage = async (context: Context) => {
    const imageBuf = await Deno.readFileSync("images/fish.png");
    return Response(context, Status.OK, {
        status: Status.OK,
        message: STATUS_TEXT.get(Status.OK),
        data: imageBuf,
    })
}

export const addCateHandler = async (context: any) => {
    const payload = await fetchPayload(context);
    const user: User = await selectUserByPhone(payload?.phone);
    if (user.role != ROLE.ADMIN) {
        return Response(context, Status.Unauthorized, {
            status: Status.Unauthorized,
            message: "Permission deny"
        })
    }
    const body = await context.request.body()
    const data = body.value
    const isSave = await saveCate(data.cateName);

    return Response(context, Status.OK, {
        status: Status.OK,
        message: STATUS_TEXT.get(Status.OK),
        data: isSave,
    })
}

export const wineListHandler = async (context: Context) => {
    const cates = [
        {
            "cateId": "1",
            "cateName": "Vang Đỏ"
        },
        {
            "cateId": "2",
            "cateName": "Vang Trắng"
        },
        {
            "cateId": "3",
            "cateName": "Vang Hồng"
        },
        {
            "cateId": "4",
            "cateName": "Vang Cam"
        },
        {
            "cateId": "5",
            "cateName": "Champagne"
        },
        {
            "cateId": "6",
            "cateName": "Vang Sủi"
        },
        {
            "cateId": "7",
            "cateName": "Vang Mạnh"
        },
        {
            "cateId": "8",
            "cateName": "Rượu khác"
        },
    ]

    const cs = await findCate();

    return Response(context, Status.OK, {
        status: Status.OK,
        message: STATUS_TEXT.get(Status.OK),
        data: cs
    })
};

export const addWineHandler = async (context: Context) => {
    const payload = await fetchPayload(context);
    const user: User = await selectUserByPhone(payload?.phone);
    if (user.role != ROLE.ADMIN) {
        return Response(context, Status.Unauthorized, {
            status: Status.Unauthorized,
            message: "Permission deny"
        })
    }

    const body = await context.request.body()
    const wine: Wine = body.value
    const wineExist = await checkWineExist(wine);
    if(wineExist){
        const updatedWine = await updateCapacityWine(wineExist._id.$oid, wine.capacity)
        if(!updatedWine) {
            return Response(context, Status.ExpectationFailed, {
                status: Status.ExpectationFailed,
                message: STATUS_TEXT.get(Status.ExpectationFailed)
            })
        }
        return Response(context, Status.Accepted, {
            status: Status.Accepted,
            message: STATUS_TEXT.get(Status.Accepted),
        })
    }
    if (!wine) {
        return Response(context, Status.BadRequest, {
            status: Status.BadRequest,
            message: STATUS_TEXT.get(Status.BadRequest)
        })
    }

    const insertId = saveWine(wine);
    if (!insertId) {
        return Response(context, Status.ExpectationFailed, {
            status: Status.ExpectationFailed,
            message: STATUS_TEXT.get(Status.ExpectationFailed)
        })
    }

    return Response(context, Status.OK, {
        status: Status.OK,
        message: STATUS_TEXT.get(Status.OK),
        data: wine
    })

};

export const wineDetailHandler = async (context: any) => {
    const {id} = context.params as { id: string };
    const wine: Wine = await selectWineById(id);

    if (!wine) {
        return Response(context, Status.NotFound, {
            status: Status.NotFound,
            message: STATUS_TEXT.get(Status.NotFound),
        });
    }

    return Response(context, Status.OK, {
        status: Status.OK,
        message: STATUS_TEXT.get(Status.OK),
        data: wine,
    });
};

export const wineCateHandler = async (context: any) => {
    const { cateId } = context.params as { cateId: string };
    const wines: Wine[] = await selectWineByCateId(cateId);

    return Response(context, Status.OK, {
        status: Status.OK,
        message: STATUS_TEXT.get(Status.OK),
        data: wines,
    });
}

export const wineUpdateHandler = async  (context:any) => {
    const { wineId } = context.params as { wineId: string };
    const payload = await fetchPayload(context);
    const user: User = await selectUserByPhone(payload?.phone);
    if (user.role != ROLE.ADMIN) {
        return Response(context, Status.Unauthorized, {
            status: Status.Unauthorized,
            message: "Permission deny"
        })
    }
    const body = await context.request.body()
    const reqData = body.value
    const wine: Wine = reqData;
    const isUpdate = await updateWine(wineId, wine);
    if(!isUpdate){
        return Response(context, Status.NotFound, {
            status: Status.NotFound,
            message: "update fail"
        })
    }
    return Response(context, Status.OK, {
        status: Status.OK,
        message: STATUS_TEXT.get(Status.OK),
    })
}

export const findAllWineHandler = async  (context:any) => {
    const payload = await fetchPayload(context);
    const wines = await findWine();
    if(!wines){
        return Response(context, Status.NotFound, {
            status: Status.NotFound,
            message: STATUS_TEXT.get(Status.NotFound),
        })
    }
    return Response(context, Status.OK, {
        status: Status.OK,
        message: STATUS_TEXT.get(Status.OK),
        data: wines
    })
}

export const deleteWineHandler = async (context: any) => {
    const { wineId } = context.params as { wineId: string };
    const payload = await fetchPayload(context);
    const user: User = await selectUserByPhone(payload?.phone);
    if (user.role != ROLE.ADMIN) {
        return Response(context, Status.Unauthorized, {
            status: Status.Unauthorized,
            message: "Permission deny"
        })
    }
    const deletedWine = await deleteWine(wineId);
    if(!deletedWine){
        return Response(context, Status.NotFound, {
            status: Status.NotFound,
            message: STATUS_TEXT.get(Status.NotFound),
        })
    }
    return Response(context, Status.OK, {
        status: Status.OK,
        message: STATUS_TEXT.get(Status.OK),
    })
}