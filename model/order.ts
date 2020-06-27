import {Wine} from "./wine.ts";

export interface Order {
    phone: any;
    wines: Wine[];
    status: OrderStatus;
}

export enum OrderStatus {
    CONFIRM = "CONFIRM",
    PENDING = "PENDING"
}