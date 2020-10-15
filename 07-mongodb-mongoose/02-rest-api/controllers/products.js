var mongoose = require('mongoose');
const Product = require('../models/Product');

module.exports.productsBySubcategory = async function productsBySubcategory(
  ctx,
  next
) {
  const { subcategory } = ctx.request.query;
  if (!subcategory) {
    ctx.response.status = 400;
    ctx.body = 'Please, specify subcategory param';
  } else {
    const products = await Product.find({ subcategory });
    ctx.response.status = 200;
    ctx.body = { products };
  }
};

module.exports.productList = async function productList(ctx, next) {
  const products = await Product.find({});
  ctx.response.status = 200;
  ctx.body = { products };
};

module.exports.productById = async function productById(ctx, next) {
  const { id } = ctx.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    ctx.response.status = 400;
    ctx.body = 'Invalid product ID';
  } else {
    const product = await Product.findById(id);
    if (!product) {
      ctx.response.status = 404;
      ctx.body = 'Product not found';
    } else {
      ctx.response.status = 200;
      ctx.body = { product };
    }
  }
};
