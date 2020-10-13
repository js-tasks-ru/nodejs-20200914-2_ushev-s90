const mongoose = require('mongoose');
const connection = require('../libs/connection');

const productSchema = new mongoose.Schema({
});

module.exports = connection.model('Product', productSchema);
