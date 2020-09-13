import express from 'express';

import shipment from './routes/shipment';

const app = express();

import Loader from './data/loader';

import cors from 'cors';

app.use(cors());

app.use('/shipment', shipment);



app.get('/', (req, res) => {
  res.json({ hello: 'world' });
});

app.get('*', (req, res) => res.send('unauthorized'));

app.listen(8080, () => {
  Loader.loadFile();
  console.log('Listening on port 8080');
});