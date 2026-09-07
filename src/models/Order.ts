import { Schema, models, model, Types } from "mongoose";
import { ORDER_STATUSES } from "@/lib/constants";

export interface IOrderItem {
  product: Types.ObjectId | string;
  name: string;
  image?: string;
  price: number;
  size?: string;
  color?: string;
  quantity: number;
}

export interface IOrder {
  _id: string;
  orderNumber: string;
  items: IOrderItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  currency: string;

  customer: {
    fullName: string;
    email: string;
    phone: string;
  };
  shippingAddress: {
    line1: string;
    line2?: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
  };
  notes?: string;

  paymentMethod: "bank_transfer";
  bankDetailsShown: {
    accountTitle: string;
    bankName: string;
    accountNumber: string;
    iban?: string;
    swift?: string;
  };
  paymentReference?: string; // customer-entered transaction ref, optional

  status: (typeof ORDER_STATUSES)[number];
  statusHistory: { status: string; at: Date; note?: string }[];

  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    image: { type: String },
    price: { type: Number, required: true },
    size: { type: String },
    color: { type: String },
    quantity: { type: Number, required: true, min: 1 }
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    items: { type: [OrderItemSchema], required: true },
    subtotal: { type: Number, required: true },
    shippingFee: { type: Number, required: true, default: 0 },
    total: { type: Number, required: true },
    currency: { type: String, required: true, default: "EUR" },

    customer: {
      fullName: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true }
    },
    shippingAddress: {
      line1: { type: String, required: true },
      line2: { type: String },
      city: { type: String, required: true },
      state: { type: String },
      postalCode: { type: String, required: true },
      country: { type: String, required: true }
    },
    notes: { type: String },

    paymentMethod: { type: String, enum: ["bank_transfer"], default: "bank_transfer" },
    bankDetailsShown: {
      accountTitle: String,
      bankName: String,
      accountNumber: String,
      iban: String,
      swift: String
    },
    paymentReference: { type: String },

    status: { type: String, enum: ORDER_STATUSES, default: "pending_payment", index: true },
    statusHistory: {
      type: [
        {
          status: String,
          at: { type: Date, default: Date.now },
          note: String
        }
      ],
      default: []
    }
  },
  { timestamps: true }
);

export default models.Order || model<IOrder>("Order", OrderSchema);
