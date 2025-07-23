import express from 'express';
import authRoutes from './routes/auth.routes';

import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(authRoutes);

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
