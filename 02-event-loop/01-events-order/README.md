# Порядок вывода сообщений в консоль

В данной задаче вам необходимо (не запуская код) определить, в каком порядке будут выводиться 
сообщения в консоль. Не расстраивайтесь если вывод не соответствует вашим ожиданиям, попробуйте 
понять, в чем вы допустили просчет.

В качестве решения создайте текстовый файл `solution.txt` в папке с заданием, в котором каждый вывод
начинается с новой строки. 

Например,
```text
James
Michael
```

Код для запуска находится в файле `index.js`:
```js
const intervalId = setInterval(() => {
  console.log('James');
}, 10);

setTimeout(() => {
  const promise = new Promise((resolve) => {
    console.log('Richard');
    resolve('Robert');
  });

  promise
      .then((value) => {
        console.log(value);

        setTimeout(() => {
          console.log('Michael');

          clearInterval(intervalId);
        }, 10);
      });

  console.log('John');
}, 10);
```
