import {Schema, model } from "mongoose";

const saleViewSchema =  new Schema(
    {
        date : {
            type: Date, // time should be start of the date
            required: true,
            unique: true
        },
        sale_count: {
            type:Number,
            default:null
        },
        total_due_for_today: {
            type:Number,
            default:null
        },
        total_profit_for_today: {
            type:Number,
            default:null
        },
        total_revenue_for_today: {
            type:Number,
            default:null
        },
        cash_payment_count:{
            type:Number,
            default:null
        },
        card_payment_count:{
            type:Number,
            default:null
        },
    }
)

const SaleView = model("SaleView", saleViewSchema);

export default SaleView;