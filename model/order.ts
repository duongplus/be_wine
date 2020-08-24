import {Wine} from "./wine.ts";

export interface Order {
    phone: any;
    wines: OrderInfo[];
    status: OrderStatus;
}

export interface OrderInfo {
    wine: Wine;
    amount: number;
}

export enum OrderStatus {
    CONFIRM = "CONFIRM",
    PENDING = "PENDING"
}