import { Document, Types } from "mongoose";

export interface ITour extends Document {
  name: string;
  slug?: string;
  duration: number;
  maxGroupSize: number;
  difficulty: "easy" | "medium" | "difficult" | "impossible";
  ratingsAverage: number;
  ratingsQuantity: number;
  price: number;
  priceDiscount?: number;
  summary: string;
  description?: string;
  imageCover: string;
  images?: Array<string>;
  createdAt?: Date;
  startDates?: Array<Date>;
  secretTour?: boolean;
  startLocation?: {
    type?: string;
    coordinates?: Array<number>;
    address?: string;
    description?: string;
  };
  locations?: Array<{
    type?: string;
    coordinates?: Array<number>;
    address?: string;
    description?: string;
    day?: number;
  }>;
  guides?: Types.ObjectId[];
}
