import http from 'http';
import express, { Express } from 'express';
import morgan from 'morgan';

import router from './routes/userRoutes';

const app: Express = express();

app.use(morgan('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use('/', router);

const server = http.createServer(app);

server.listen(9000, () => {
  console.log('\x1b[35m%s\x1b[0m', 'Aplicação iniciada');
});
