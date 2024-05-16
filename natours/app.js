const fs = require("fs");
const express = require("express");
const morgan = require("morgan");

const app = express();

//* morgan middleware
app.use(morgan("dev"));

app.use(express.json()); //* middleware, in the middle of the request & response, gives us access to props on req parameter

//* custom muddlewares
app.use((req, res, next) => {
  console.log("hello from the middleware");
  next();
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`),
);

const getAllTours = (req, res) => {
  res.status(200).json({
    status: "success",
    requestedAt: req.requestTime,
    results: tours.length,
    data: {
      tours,
    },
  });
};

const getOneTour = (req, res) => {
  const id = req.params.id * 1; //* converts string to number

  if (id > tours.length) {
    return res.status(404).json({ status: "fail", message: "invalid ID" });
  }

  const tour = tours.find((element) => element.id === id);

  res.status(200).json({
    status: "success",
    data: {
      tour,
    },
  });
};

const createTour = (req, res) => {
  console.log(req.body);

  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);

  tours.push(newTour);
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      res.status(201).json({
        status: "success",
        data: {
          tour: newTour,
        },
      });
    },
  );
};

const updateTour = (req, res) => {
  const id = req.params.id * 1;

  if (id > tours.length) {
    return res.status(404).json({ status: "fail", message: "invalid ID" });
  }

  res.status(200).json({
    status: "success",
    data: {
      tour: "updated tour here",
    },
  });
};

const deleteTour = (req, res) => {
  const id = req.params.id * 1;

  if (id > tours.length) {
    return res.status(404).json({ status: "fail", message: "invalid ID" });
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
};

//* neither GET (all) or POST requests need an id parameter, so can be chained together like so:
app.route("/api/v1/tours").get(getAllTours).post(createTour);

//* rest of the headers do need an id parameter, so can be chained together like so:
app
  .route("/api/v1/tours/:id")
  .get(getOneTour)
  .patch(updateTour)
  .delete(deleteTour);

const port = 3000;
app.listen(port, () => {
  console.log(`listening on port ${port}...`);
});
