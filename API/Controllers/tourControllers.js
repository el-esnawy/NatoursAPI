const fs = require("fs");

// TO parse it to JS Object
const tours = JSON.parse(
  fs.readFileSync(
    `C:/Users/meles/Music/Desktop/Web Development/Projects/In-Progress Projects/Natours API/dev-data/data/tours-simple.json`
  )
);

// ROUTE HANDLERS

exports.checkID = (req, res, next, val) => {
  const id = val * 1;
  const tour = tours.find((el) => el.id === id);

  if (id > tours.length || !tour) {
    return res.status(404).json({
      status: "Fail",
      message: "Invalid ID ",
    });
  }
  req.tour = tour;
  next();
};

exports.checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res.status(400).json({
      status: "error",
      message: "A Tour must have a name and price",
    });
  }
  next();
};

exports.getAllTours = (req, res) => {
  res.status(200).json({
    status: "success",
    requestAt: req.requestTime,
    results: tours.length,
    data: {
      tours,
    },
  });
};

exports.getTourByID = (req, res) => {
  const { tour } = req;
  res.status(200).json({
    status: "success",
    data: {
      tour,
    },
  });
};

exports.createTour = (req, res) => {
  const newID = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newID }, req.body);
  tours.push(newTour);
  fs.writeFile(
    `C:/Users/meles/Music/Desktop/Web Development/Projects/In-Progress Projects/Natours API/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      // 201 stands for created
      res.status(201).json({
        status: "success",
        data: {
          tour: newTour,
        },
      });
      console.log(err);
    }
  );
};

exports.updateTourByID = (req, res) => {
  res.status(200).json({
    status: "success",
    data: {
      tour: "<TOUR UPDATED>",
    },
  });
};

exports.deleteTourByID = (req, res) => {
  res.status(204).json({
    status: "success",
    data: null,
  });
};
