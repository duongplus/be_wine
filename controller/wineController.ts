import {Context, Status, STATUS_TEXT} from "https://deno.land/x/oak/mod.ts";
import {Response} from "../helper/Response.ts"
import {Wine} from "../model/wine.ts";
import {
    checkWineExist,
    saveWine,
    selectWineByCateId,
    selectWineById,
    updateCapacityWine
} from "../repository/wineRepo.ts"
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

export const wineListHandler = async (context: Context) => {
    const cates = [
        {
            "cateId": "1",
            "cateName": "Red Wines"
        },
        {
            "cateId": "2",
            "cateName": "White Wines"
        },
        {
            "cateId": "3",
            "cateName": "Rose Wines"
        },
        {
            "cateId": "4",
            "cateName": "Orange Wines"
        },
        {
            "cateId": "5",
            "cateName": "Champagne"
        },
        {
            "cateId": "6",
            "cateName": "Sparking Wines"
        },
        {
            "cateId": "7",
            "cateName": "Fortified Wines"
        },
    ]

    return Response(context, Status.OK, {
        status: Status.OK,
        message: STATUS_TEXT.get(Status.OK),
        data: cates
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
