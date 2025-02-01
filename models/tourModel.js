const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxLength: [40, 'A tour name must have less or equal than 40 characters'],
      minLength: [10, 'A tour name must have more or equal than 10 characters'],
      // validate: [validator.isAlpha, 'Tour name must only contain characters'], // validator is a library that comes with express
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
    },
    ratingsAverage: {
      type: Number,
      default: 0,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // this only points to current doc on NEW document creation does not on UPDATE. this check can be done on the frontend.
          return val < this.price; // checkin if the discount price is less than the original price
        },
        message: 'Discount price ({VALUE}) should be below the regular price',
      },
    },
    summary: {
      type: String,
      trim: true, //"  hello  " remove all whtespaces begfore and after
      required: [true, 'A tour must have a summary'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false, // exclude this field from the response | alternative '-createdAt' in Field Limiting in Controller
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: { virtuals: true }, // include virtual properties in the response
    toObject: { virtuals: true }, // include virtual properties in the response
  }
);

//Note: we cannot use virtual properties in query, because they are tehnically not part of the database, they're only calculated after we've gotten the response from the database
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7; // this refers to the current document, that's why we use function() keyword
});

// DOCUMENT MIDDLEWARE: only runs before .save() and .create() | it is not triggered bu insertMany, findByIdAndDelete and the rest | this keyword points to the currently processed document
tourSchema.pre('save', function (next) {
  // console.log('this', this); // this refers to the currently processed document
  // 'slug' field has to be added to the schema object.
  this.slug = slugify(this.name, { lower: true }); // Adding a slug field to the document before saving it to the database
  next();
});

tourSchema.post('save', function (doc, next) {
  // doc is the document that was just saved to the database | no 'this' keyword
  // console.log(doc);
  next();
});

// QUERY MIDDLEWARE: runs before or after a certain query is executed | this keyword points to the current query not the document
//use case is to exclude tours with secretTour field from the response | add secretTour field to the schema object
tourSchema.pre(/^find/, function (next) {
  // /^find/ is a regular expression that matches all strings that start with find which works for find, findOne, findOneAndDelete, findOneAndUpdate
  // tourSchema.pre('find', function (next) {
  // tourSchema.pre('findOne', function (next) {
  // tourSchema.pre('findOneAndDelete', function (next) {
  // tourSchema.pre('findOneAndUpdate', function (next) {
  this.find({ secretTour: { $ne: true } }); // this refers to the current query
  this.start = Date.now();
  next();
});

// AGGREGATION MIDDLEWARE: runs before or after an aggregation happens | this keyword points to the current aggregation object
tourSchema.pre('aggregate', function (next) {
  this.pipeline(); // returns an array of all the stages in the aggregation pipeline
  console.log(this.pipeline());
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } }); // remove all documents that have secretTour set to 'true'
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  // docs is the documents that were returned by the query | no 'this' keyword
  // console.log(`Query took ${Date.now() - this.start} milliseconds`);
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
