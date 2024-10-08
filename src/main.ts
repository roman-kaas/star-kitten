import { StarKitten } from '$lib/StarKitten';
import * as Sentry from '@sentry/bun';

if (process.env.NODE_ENV === 'production') {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
  });
}

global.App = new StarKitten();
await global.App.start();

process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection:', error);
  Sentry.captureException(error);
});
