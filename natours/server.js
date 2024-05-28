const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({ path: "./config.env" });
const app = require("./app");

const database = process.env.DATABASE.replace(
  "<DATABASE_PASSWORD>",
  process.env.DATABASE_PASSWORD,
);
mongoose.connect(database).then(() => {
  console.log("database connection successful");
});

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "A tour must have a name"],
    unique: true,
  },
  price: {
    type: Number,
    required: [true, "A tour must have a price"],
  },
  rating: {
    type: Number,
    default: 4.5,
  },
});
const Tour = mongoose.model("Tour", tourSchema);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening on port ${port}...`);
});
