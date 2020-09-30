# Стрим, разбивающий текст на строки (Решение)

Из прошлой задачи мы знаем, что для изменения данных нам необходимо реализовать свой класс 
`Transform` стрима, объявив методы `_transform` и `_flush`.

В метод `_transform` как мы знаем будут переданы три аргумента:
1. chunk - `Buffer` или `String` с данными
2. encoding - кодировка данных (использоваться в данной задаче не будет)
3. callback - коллбек, который необходимо вызвать по окончании обработки данных

Для того, чтобы записать измененные данные в буфер стрима мы будем пользоваться методом 
`this.push()`.

Первым делом приведем полученный чанк данных к строке и разделим ее по символу переноса. Далее 
добавим каждую строку в буфер стрима: 
```js
_transform(chunk, encoding, callback) {
  const str = chunk.toString();
  const lines = str.split(os.EOL);
  
  for (const line of lines) {
    this.push(line);
  }
  
  callback();
}
```

Наш код выполняет задачу, но как показывают тесты - выполняет ее лишь частично, если строка 
оказывается "разнесена" по разным чанкам, то такие ситуации стрим обрабатывает некорректно. Мы можем
это исправить, отслеживая ситуацию, когда последняя строка в чанке не заканчивается символом 
переноса, и "запоминая" часть этой строки для следующего вызова `_transform`.

```js
class LineSplitStream extends stream.Transform {
  constructor(options) {
    super(options);

    this.remainder = '';
  }

  _transform(chunk, encoding, callback) {
    const str = this.remainder + chunk.toString();
    const lines = str.split(os.EOL);
    const lastLine = lines.pop();
    this.remainder = '';

    for (const line of lines) {
      this.push(line);
    }

    if (str.endsWith(os.EOL)) {
      this.push(lastLine);
    } else {
      this.remainder = lastLine;
    }

    callback();
  }

  _flush(callback) {
    if (this.remainder) {
      this.push(this.remainder);
    }

    callback();
  }
}
```

Обратите внимание, если по какой-то причине последняя строка не будет содержать переноса строки -
мы должны вернуть эту строку из нашего стрима. Для этого добавим логику в метод `_flush`, который
и будет возвращать по окончании работы стрима сохраненную часть строки.   
