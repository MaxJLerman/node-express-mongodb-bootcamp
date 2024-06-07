class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
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

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt"); //? default sort parameter if no sort query is provided
    }

    return this;
  }

  limitFields() {
    this.query = this.query.select("-__v"); //? excluding the __v property provided by MongoDB by default
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    }

    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limitAmount = this.queryString.limit * 1 || 100;
    const skipAmount = (page - 1) * limitAmount;
    this.query = this.query.skip(skipAmount).limit(limitAmount);

    return this;
  }
}

module.exports = APIFeatures;
