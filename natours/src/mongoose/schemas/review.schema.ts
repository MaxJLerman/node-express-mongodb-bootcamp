import { Document, Model, Types } from "mongoose";

export interface IReview extends Document {
  review: string;
  rating: number;
  createdAt?: Date;
  tour: Types.ObjectId;
  user: Types.ObjectId;
}

//* used interface because Review model uses static methods
export interface ReviewModel extends Model<IReview> {
  calculateAverageRatings(this: Model<IReview>, tourId: Types.ObjectId): void;
}
