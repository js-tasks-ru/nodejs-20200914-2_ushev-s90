const Category = require('../models/Category');
const Product = require('../models/Product');
const connection = require('../libs/connection');
const mongoose = require('mongoose');
const expect = require('chai').expect;

describe('mongodb-mongoose/schema-model', () => {
  after(() => {
    connection.close();
  });

  describe('модель категории', () => {
    it('у модели есть поля title и subcategories', () => {
      const fields = Category.schema.obj;

      expect(fields, 'у модели есть поле title').to.have.property('title');
      expect(fields, 'у модели есть поле subcategories').to.have.property('subcategories');
    });

    it('поле title имеет правильную конфигурацию', () => {
      const title = Category.schema.obj.title;

      expect(title.type, 'title - строковое поле').to.eql(String);
      expect(title.required, 'title - обязательное поле').to.be.true;
    });

    it('поле subcategories имеет правильную конфигурацию', () => {
      const subcategories = Category.schema.obj.subcategories;

      expect(subcategories, 'subcategories - массив').to.be.an('array');

      const title = subcategories[0].obj.title;
      expect(title.type, 'title - строковое поле').to.eql(String);
      expect(title.required, 'title - обязательное поле').to.be.true;
    });
  });

  describe('модель товара', () => {
    it('у модели есть поля: title, description, price, category, subcategory и images', () => {
      const fields = Product.schema.obj;

      expect(fields, 'у модели есть поле title').to.have.property('title');
      expect(fields, 'у модели есть поле description').to.have.property('description');
      expect(fields, 'у модели есть поле price').to.have.property('price');
      expect(fields, 'у модели есть поле category').to.have.property('category');
      expect(fields, 'у модели есть поле subcategory').to.have.property('subcategory');
      expect(fields, 'у модели есть поле images').to.have.property('images');
    });

    it('поле title имеет правильную конфигурацию', () => {
      const title = Product.schema.obj.title;

      expect(title.type, 'title - строковое поле').to.eql(String);
      expect(title.required, 'title - обязательное поле').to.be.true;
    });

    it('поле description имеет правильную конфигурацию', () => {
      const description = Product.schema.obj.description;

      expect(description.type, 'description - строковое поле').to.eql(String);
      expect(description.required, 'description - обязательное поле').to.be.true;
    });

    it('поле price имеет правильную конфигурацию', () => {
      const price = Product.schema.obj.price;

      expect(price.type, 'price - числовое поле').to.eql(Number);
      expect(price.required, 'price - обязательное поле').to.be.true;
    });

    it('поле category имеет правильную конфигурацию', () => {
      const category = Product.schema.obj.category;

      expect(category.type, 'category - ObjectId').to.eql(mongoose.Schema.Types.ObjectId);
      expect(category.required, 'category - обязательное поле').to.be.true;
    });

    it('поле subcategory имеет правильную конфигурацию', () => {
      const subcategory = Product.schema.obj.subcategory;

      expect(subcategory.type, 'subcategory - ObjectId').to.eql(mongoose.Schema.Types.ObjectId);
      expect(subcategory.required, 'subcategory - обязательное поле').to.be.true;
    });

    it('поле images имеет правильную конфигурацию', () => {
      const images = Product.schema.obj.images;

      expect(images, 'images - массив').to.be.an('array');
      expect(images[0], 'images - массив строк').to.eql(String);
    });
  });
});
