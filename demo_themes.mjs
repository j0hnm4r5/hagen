import { createHagen } from './src/index.ts';

console.log('\n=== Default Theme (Truecolor) ===');
const logger1 = createHagen({ enableColor: true });
logger1.log({ label: 'API', color: 0 }, 'Server started on port 3000');
logger1.log({ label: 'DB', color: 1 }, 'Connected to database');
logger1.log({ label: 'CACHE', color: 2 }, 'Redis connected');
logger1.info('Application initialized');
logger1.success('All systems operational');
logger1.warn('High memory usage detected');
logger1.error('Failed to connect to external service');

console.log('\n=== Nord Theme (Truecolor) ===');
const logger2 = createHagen({ enableColor: true, theme: 'nord' });
logger2.log({ label: 'API', color: 0 }, 'Server started');
logger2.info('Nord theme demo');
logger2.success('Looks great!');

console.log('\n=== Catppuccin Mocha Theme (Truecolor) ===');
const logger3 = createHagen({ enableColor: true, theme: 'catppuccin-mocha' });
logger3.log({ label: 'API', color: 0 }, 'Server started');
logger3.info('Catppuccin theme demo');
logger3.error('Error example');

console.log('\n=== ANSI-256 Mode ===');
const logger4 = createHagen({ enableColor: true, colorMode: 'ansi256' });
logger4.log({ label: 'API', color: 0 }, '256-color mode');
logger4.success('Using 256 color palette');

console.log('\n=== ANSI-16 Mode ===');
const logger5 = createHagen({ enableColor: true, colorMode: 'ansi16' });
logger5.log({ label: 'API', color: 0 }, '16-color mode');
logger5.warn('Basic ANSI colors');
