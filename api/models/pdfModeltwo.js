'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PdfSchema = new Schema({
  url: {
    type: String,
    required: 'Kindly enter the name of the task'
  },
  created_date: {
    type: Date,
    default: Date.now
  },
  pdf_s3_link: {
    type: String
  },
  catalog_Url: {
    type: String
  }
});

module.exports = mongoose.model('Pdf', PdfSchema);