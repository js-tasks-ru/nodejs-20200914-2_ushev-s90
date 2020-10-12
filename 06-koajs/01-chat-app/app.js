const path = require('path');
const Koa = require('koa');
const app = new Koa();
const subscribers = {}

app.use(require('koa-static')(path.join(__dirname, 'public')));
app.use(require('koa-bodyparser')());

const Router = require('koa-router');
const router = new Router();

router.get('/subscribe', async (ctx, next) => {
  const id = ctx.request.query.r;
  subscribers[id] = ctx.res;
  await new Promise((resolve, reject) => {
    ctx.res.on('close', () => {
      delete subscribers[id];
      resolve(`Client id=${id} disconnected`);
    }).on('finish', () =>{
      resolve('Message received');
    })
  })
});

router.post('/publish', async (ctx, next) => {
  const message = ctx.request.body.message;
  if (message) {
    for (const id in subscribers) {
      //console.log(`your message: ${message} delivered to id: ${id}`);
      const res = subscribers[id];
      res.statusCode = 200;
      res.end(message);
    }

    ctx.response.status = 200;
    ctx.response.body = 'You have successfully send message';
  } else {
    ctx.response.status = 400;
    ctx.response.body = 'Your message is empty!';
  }
});

app.use(router.routes());

module.exports = app;
