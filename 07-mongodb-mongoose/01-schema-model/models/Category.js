const mongoose = require('mongoose');
const connection = require('../libs/connection');

const subCategorySchema = new mongoose.Schema({
});

const categorySchema = new mongoose.Schema({
  subcategories: [subCategorySchema],
});

module.exports = connection.model('Category', categorySchema);
