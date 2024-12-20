import html from '@elysiajs/html';
import { Elysia } from 'elysia';

export default (app: Elysia) => {
  return app
    .use(html())
    .get('/', () => {
      return '<h1>Hello ZKill!</h1>';
    });
};
