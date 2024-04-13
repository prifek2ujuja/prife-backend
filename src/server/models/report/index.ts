import mongoose, { Schema } from 'mongoose';

const DailyProductReportScheme = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
    },
    openingStock: {
      type: Number,
    },
    closingStock: {
      type: Number,
      default: 0,
    },
    addedStock: {
      type: Number,
      default: 0,
    },
    removedStock: {
      type: Number,
      default: 0,
    },
    sales: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const DailyProductReport = mongoose.model(
    "DailyProductReport",
    DailyProductReportScheme
)

const DailyReportScheme = new Schema({
    productsReport: {
        type: [DailyProductReportScheme]
    }
}, {
    timestamps: true,
})

const DailyReport = mongoose.model(
  "DailyReport",
  DailyReportScheme
);



export default DailyReport;