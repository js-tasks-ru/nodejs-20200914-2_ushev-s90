# Модели товара и категории (решение)

Любая модель mongoose должна содержать схему данных, так что наша первая задача состоит в том, чтобы 
объявить схему данных наших будущих моделей категории и товара.

Схема создается инстанцированием класса `mongoose.Schema` с передачей конфигурации полей в качестве 
первого аргумента и дополнительными настройками - вторым.


Так будет выглядеть схема для категорий товаров:
```js
const schema = new mongoose.Schema({/*
  fieldName: { ...fieldProperties... }
*/}, {/*
  ...settings...
*/});
```

Приступим к объявлению полей модели категории:
```js
const subCategorySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  }
});

const categorySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  
  subcategories: [subCategorySchema]
});
```

Обратите внимание, в данном случае мы объявили подкатегории как отдельную схему, это позволит нам
использовать их идентификаторы в дальнейшем при создании и поиске товаров.

Теперь, когда схема готова - можно создать модель с помощью метода `mongoose.model`. В качестве 
аргументов в нее передаются:
- название модели
- схема данных
- название коллекции [опционально]

Обратите внимание, название коллекции можно не передавать - в этом случае `mongoose` будет 
использовать множественное число, образованное от названия модели (`Category` -> `categories`).


Аналогичным образом создаётся и схема для товаров:
```js
const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  
  description: {
    type: String,
    required: true,
  },
  
  price: {
    type: Number,
    required: true,
  },
  
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  
  subcategory: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  
  images: [String],

});
```

Так как мы не планируем в будущем специальным образом обращаться к изображениям товара, то и 
объявить их можно просто как массив строк (в дальнейшем там будут храниться ссылки на изображения 
товаров).
