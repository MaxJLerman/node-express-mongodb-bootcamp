import { Query } from "mongoose";

interface QueryString {
  page?: string;
  sort?: string;
  limit?: string;
  fields?: string;
  [key: string]: any; //? for other possible query parameters
}

class APIFeatures<T> {
  query: Query<T[], T>;
  queryString: QueryString;

  constructor(query: Query<T[], T>, queryString: QueryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter(): this {
    const queryObject = { ...this.queryString };
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((element) => delete queryObject[element]); //* filtering out protected fields

    let queryString = JSON.stringify(queryObject);
    queryString = queryString.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`, //* adding MongoDB syntax $ if needed for respective value comparisons
    ); //

    this.query = this.query.find(JSON.parse(queryString));

    return this;
  }

  sort(): this {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt"); //? default sort parameter if no sort query is provided
    }

    return this;
  }

  limitFields(): this {
    this.query = this.query.select("-__v"); //? excluding the __v property provided by MongoDB by default
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    }

    return this;
  }

  paginate(): this {
    const page = parseInt(this.queryString.page as string, 10) || 1;
    const limitAmount = parseInt(this.queryString.limit as string, 10) || 100;
    const skipAmount = (page - 1) * limitAmount;
    this.query = this.query.skip(skipAmount).limit(limitAmount);

    return this;
  }
}

export default APIFeatures;
