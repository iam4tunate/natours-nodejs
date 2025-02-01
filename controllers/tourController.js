const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');

//! MongoDB checks ObjectId validity so this middleware is not necessary
// exports.checkID = (req, res, next, val) => {
//   console.log(`Tour id is: ${val}`);
//   if (req.params.id * 1 > tours.length) {
//     return res.status(404).json({
//       status: 'fail',
//       message: 'Invalid ID',
//     });
//   }
//   next();
// };

//! Mongoose MODEL will takee care of this so no need for creating a middle ware for it
// exports.checkBody = (req, res, next) => {
//   if (!req.body.name || !req.body.price) {
//     return res.status(400).json({
//       status: 'fail',
//       message: 'Missing name or price',
//     });
//   }
//   next();
// };

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = 'price,-ratingsAverage'; // sort by price in ascending order and ratingsAverage in descending order
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty'; // fields to be included in the response (Field Limiting)
  next();
};

// Using the APIFeatures class for Reusable Code
exports.getAllTours = async (req, res) => {
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const tours = await features.query;

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: { tours },
  });
};

//  Using the method chaining approach | code is not reusable
// exports.getAllTours = async (req, res) => {
//   try {
//     console.log(req.query); // {difficulty: 'easy', duration: 500, page:'2', sort: 'price'}
//     // In some cases, certain fields in a query (like page) are not meant for filtering or querying data. Instead, they serve specific purposes, such as enabling pagination. These fields should be excluded from the query logic to ensure they don't interfere with the filtering process. i.e any params that is not part of the tour data must be excluded.

//     // 1a) Filtering
//     const queryObj = { ...req.query };
//     const excludedFields = ['page', 'sort', 'limit', 'fields'];
//     excludedFields.forEach((el) => delete queryObj[el]);

//     // 1b) Advanced Filtering (greater than, less than, etc)
//     let queryStr = JSON.stringify(queryObj);
//     queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
//     // /tours?price[lt]=400 | price can be any property in the tour data

//     let query = Tour.find(JSON.parse(queryStr)); // if no advanced filtering is needed, use queryObj

//     // 2) Sorting
//     // ?sort=-price,ratingsAverage | adding minus sign (-price) sorts in descending order
//     if (req.query.sort) {
//       const sortBy = req.query.sort.split(',').join(' '); // sort('price ratingsAverage')
//       query = query.sort(sortBy);
//     } else {
//       query = query.sort('-createdAt'); // default sorting, if no sort query is passed
//     }

//     // 3) Field Limiting | Defining the fields included in all response objects.
//     // ?fields=name,duration,difficulty,price
//     // ?fields=-name,-duration,-difficulty,-price | minus sign excludes the field
//     if (req.query.fields) {
//       // Note: -name is for excluding name field, name is for including name field
//       const fields = req.query.fields.split(',').join(' '); // 'name duration difficulty price'
//       query = query.select(fields);
//     } else {
//       query = query.select('-__v'); // excluding __v field | Mongoose uses __v to keep track of the version of the document, so we can just exclude it from the response
//     }

//     // 4) Pagination
//     // ?page=2&limit=10 | page 2, 10 results per page
//     const page = req.query.page * 1 || 1; // default page is 1
//     const limit = req.query.limit * 1 || 100; // default limit is 100
//     const skip = (page - 1) * limit; // skip the first 10 results

//     query = query.skip(skip).limit(limit);

//     // const query = await Tour.find() // using mongoose methods
//     //   .where('duration')
//     //   .equals(5)
//     //   .where('difficulty')
//     //   .equals('easy');

//     const tours = await query;

//     res.status(200).json({
//       status: 'success',
//       results: tours.length,
//       data: { tours },
//     });
//   } catch (err) {
//     res.status(404).json({
//       status: 'fail',
//       message: err,
//     });
//   }
// };

exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id); // .id depends on the parmas passed in route handler

    res.status(200).json({
      status: 'success',
      data: tour,
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.createTour = async (req, res) => {
  try {
    // const newTour = new Tour({}) this method also works
    // newTour.save()

    const newTour = await Tour.create(req.body); //Better method

    res.status(201).json({
      status: 'success',
      data: { newTour },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    //findByIdAndUpdate works on PATCH cos it only updates the fields that are passed in the body
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true, // run the validators in the schema, e.g a string would be rejected
    });

    res.status(200).json({
      status: 'success',
      data: { tour },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: 'success',
      message: 'Tour deleted successfully',
      data: null,
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.getTourStats = async (req, res) => {
  try {
    const stats = await Tour.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4.5 } }, // filter
      },
      {
        $group: {
          _id: null,
          //  _id: { $toUpper: '$difficulty' }, // if you want to group by difficulty |$toUpper is not necessary => _id: '$difficulty'
          numTours: { $sum: 1 },
          numRatings: { $sum: '$ratingsQuantity' },
          avgRating: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      },
      {
        $sort: { avgPrice: 1 }, // sort by average price in ascending order | avgPrice: the new name of the field must be used | -1 for descending order
      },
      // {
      //   $match: { _id: { $ne: 'EASY' } }, // exclude easy difficulty
      // },
    ]);

    res.status(200).json({
      status: 'success',
      data: { stats },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.getMonthlyPlan = async (req, res) => {
  try {
    const year = req.params.year * 1;
    const plan = await Tour.aggregate([
      {
        $unwind: '$startDates', // deconstructs an array field from the input documents to output a document for each element
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`), // greater than or equal to January 1st of the year
            $lte: new Date(`${year}-12-31`), // less than or equal to December 31st of the year
          },
        },
      },
      {
        $group: {
          _id: { $month: '$startDates' }, // group by month
          numTourStarts: { $sum: 1 }, // count the number of tours that start in that month
          tours: { $push: '$name' }, // push the name of the tours that start in that month into an array
        },
      },
      {
        $addFields: { month: '$_id' }, // add a new field called month with the value of _id
      },
      {
        $project: { _id: 0 }, // exclude _id field from the response
      },
      {
        $sort: { numTourStarts: -1 }, // sort by the number of tours that start in that month in descending order
      },
      {
        $limit: 12, // limit the number of results to 12
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: { plan },
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};
