const mongoose = require("mongoose");
const slugify = require("slugify");

const User = require("./userModel");

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A tour must have a name"],
      unique: true,
      trim: true,
      maxlength: [40, "A tour must have less than or equal to 40 characters"],
      minlength: [10, "A tour must have more than or equal to 10 characters"],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, "A tour must have a duration"],
    },
    maxGroupSize: {
      type: Number,
      required: [true, "A tour must have a max group size"],
    },
    difficulty: {
      type: String,
      required: [true, "A tour must have a difficulty"],
      enum: {
        values: ["easy", "medium", "difficult", "impossible"],
        message: "Difficulty can be: easy/medium/difficult/impossible",
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, "Rating must be avove 1.0"],
      max: [5, "Rating must be below 5.0"],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, "A tour must have a price"],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (value) {
          //! can't use "this" keyword on updating a document, "this" only points to the current document on a new document creation
          return value < this.price;
        },
        message: "Discount price ({VALUE}) should be below regular price",
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, "A tour must have a summmary"],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, "A tour must have a cover image"],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      type: {
        type: String,
        default: "Point",
        enum: ["Point"],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: "Point",
          enum: ["Point"],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: Array,
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

//? creates a property on a tour object that only exists in the response, not in the database
tourSchema.virtual("durationWeeks").get(function () {
  return this.duration / 7;
});

//* pre-save hook: middleware that runs before a "save" or "create" but not "insertMany" event (document is saved to database)
tourSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });

  next();
});

tourSchema.pre("save", function (next) {
  if (process.env.NODE_ENV === "development") {
    console.log("Saving...");
  }

  next();
});

tourSchema.pre("save", async function (next) {
  const guidesPromises = this.guides.map(async (guideId) =>
    User.findById(guideId),
  );
  this.guides = await Promise.all(guidesPromises);

  next();
});

//* post-save hook: middleware that runs after a "save" or "create" but not "insertMany" event
tourSchema.post("save", function (document, next) {
  if (process.env.NODE_ENV === "development") {
    console.log(document);
  }

  next();
});

//* pre-query hook: middleware that runs before a query is executed, matches all events starting with "find" eg. find, findOne, findOneAndUpdate, findOneAndDelete
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } }); //? filters out documents that have a "secretTour" property set to true

  this.start = Date.now();

  next();
});

tourSchema.post(/^find/, function (documents, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds`);

  next();
});

//* aggregation middleware
tourSchema.pre("aggregate", function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });

  console.log(this.pipeline());

  next();
});

const Tour = mongoose.model("Tour", tourSchema);

module.exports = Tour;
