const mongoose = require("mongoose");
const slugify = require("slugify");

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A tour must have a name"],
      unique: true,
      trim: true,
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
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, "A tour must have a price"],
    },
    priceDiscount: Number,
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
  console.log("Saving...");

  next();
});

//* post-save hook: middleware that runs after a "save" or "create" but not "insertMany" event
tourSchema.post("save", function (document, next) {
  console.log(document);

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

const Tour = mongoose.model("Tour", tourSchema);

module.exports = Tour;
