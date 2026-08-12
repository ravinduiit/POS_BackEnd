import Sale from "../models/Sale.js";
import saleView from "../models/saleView.js";
import Product from "../models/Product.js";

export const todaySaleData = async (req, res) => {
  try {

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const startOfTomorrow = new Date(startOfToday);
    startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

    const todaysaleData = await saleView.findOne({
      date: {
        $gte: startOfToday,
        $lt: startOfTomorrow,
      },
    });

    res.status(200).json({
      success: true,
      todaysaleData: todaysaleData,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to get today's sales data.",
      error: error.message,
    });
  }
};

export const lowStockProducts = async (req, res) => {
    try {
        const lowStockProducts = await Product.find({
            $expr: {
                $lte: ["$stockQty", "$reorderLevel"]
            }
        }).select("product_id name quantity reorderLevel").limit(5);

        res.status(200).json({
            success: true,
            lowStockProducts: lowStockProducts,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to get low stock products.",
            error: error.message,
        });
    }
};

// last 5 days chart 
export const lastFewDaysSale =  async (req, res) => {
    try {
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const startOfBeforeDay = new Date(startOfToday);
        startOfBeforeDay.setDate(startOfBeforeDay.getDate() - 5);

        const todaysaleData = await saleView.find({
        date: {
            $gte: startOfBeforeDay,
            $lt: startOfToday,
        },
        }, {date:1, total_revenue_for_today:1, total_profit_for_today:1}).sort(date);

        res.status(200).json({
            success: true,
            todaysaleData: todaysaleData,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to get today's sales data.",
            error: error.message,
        });
    }
}

export const recentSale =  async (req, res) => {
    try{
        const recentSale = await Sale.find({},selling_id, customer_id, paymentMethod, sale_type, grandTotal, createdAt, dueAmount).limit(5);
        res.status(200).json({
            success: true,
            todaysaleData: recentSale,
        });
    }catch{
        res.status(500).json({
            success: false,
            message: "Failed to get today's sales data.",
            error: error.message,
        });
    }
}