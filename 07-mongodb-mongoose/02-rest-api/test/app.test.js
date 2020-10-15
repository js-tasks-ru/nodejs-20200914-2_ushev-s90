const app = require('../app');
const Category = require('../models/Category');
const Product = require('../models/Product');
const connection = require('../libs/connection');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const axios = require('axios');
const expect = require('chai').expect;

const client = axios.create({
  validateStatus: () => true,
});

describe('mongodb-mongoose/rest-api', () => {
  describe('получение категорий и товаров', function() {
    let _server;
    let category;
    let product;

    before(async () => {
      await Category.deleteMany();
      await Product.deleteMany();

      category = await Category.create({
        title: 'Category1',
        subcategories: [{
          title: 'Subcategory1',
        }],
      });

      product = await Product.create({
        title: 'Product1',
        description: 'Description1',
        price: 10,
        category: category.id,
        subcategory: category.subcategories[0].id,
        images: ['image1'],
      });

      await new Promise((resolve) => {
        _server = app.listen(3000, resolve);
      });
    });

    after(async () => {
      await Category.deleteMany();
      await Product.deleteMany();
      connection.close();
      _server.close();
    });

    describe('категории', () => {
      it('по запросу должен возвращаться список категорий', async () => {
        const response = await client.get('http://localhost:3000/api/categories');

        expect(
            response.data,
            'ответ сервера содержит массив .categories'
        ).to.have.property('categories').that.is.an('array');

        const categories = response.data.categories;

        expect(
            categories[0],
            'категория содержит поля title, id и subcategories'
        ).to.have.keys(['title', 'id', 'subcategories']);

        expect(
            categories[0],
            'категория содержит массив subcategories'
        ).to.have.property('subcategories').that.is.an('array');

        expect(
            categories[0].id,
            'идентификатор категории содержит тоже значение, что и в базе'
        ).to.equal(category.id);

        expect(
            categories[0].subcategories[0].id,
            'идентификатор подкатегории содержит тоже значение, что и в базе'
        ).to.equal(category.subcategories[0].id);
      });
    });

    describe('товары', () => {
      describe('получение списка товаров по подкатегории', () => {
        it('если товары есть в базе - должен вернуться массив с товарами', async () => {
          const response = await client.get('http://localhost:3000/api/products');

          expect(
              response.data,
              'ответ сервера содержит массив .products'
          ).to.have.property('products').that.is.an('array');

          expect(
              response.data.products,
              'массив должен содержать существующие продукты в базе',
          ).to.be.lengthOf(1);
          expect(
              response.data.products[0],
              'id должен соответствовать id созданного продукта',
          ).to.have.property('id', product.id);
        });

        it('если товаров не найдено - должен возвращаться пустой массив', async () => {
          const response = await client.get('http://localhost:3000/api/products', {
            params: {subcategory: (new ObjectId()).toString()},
          });

          expect(
              response.data,
              'ответ сервера содержит массив .products'
          ).to.have.property('products').that.is.an('array');

          expect(
              response.data.products,
              'массив пустой'
          ).to.be.empty;
        });

        it('товары по существующей подкатегории', async () => {
          const response = await client.get('http://localhost:3000/api/products', {
            params: {subcategory: category.subcategories[0].id},
          });

          expect(
              response.data,
              'ответ сервера содержит массив .products'
          ).to.have.property('products').that.is.an('array');

          const products = response.data.products;

          expect(
              products[0],
              'товар содержит поля title, id, category, subcategory, price, description и images'
          ).to.have.keys([
            'title', 'id', 'category', 'subcategory', 'price', 'description', 'images',
          ]);

          expect(
              products[0].id,
              'идентификатор товара содержит тоже значение, что и в базе'
          ).to.equal(product.id);
        });
      });

      describe('получение товара по идентификатору', () => {
        it('сервер должен вернуть ошибку если идентификатор невалидный', async () => {
          const response = await client.get('http://localhost:3000/api/products/invalid-id');
          expect(response.status).to.equal(400);
        });

        it('сервер должен вернуть статус 404', async () => {
          const response = await client
              .get('http://localhost:3000/api/products/5d208f60e13792398c2aa944');

          expect(response.status).to.equal(404);
        });

        it('сервер должен вернуть товар по его айди', async () => {
          const response = await client.get(`http://localhost:3000/api/products/${product.id}`);

          expect(
              response.data,
              'ответ сервера содержит ключ .product'
          ).to.have.property('product');

          expect(response.data.product.id).to.equal(product.id);
        });
      });
    });
  });
});
