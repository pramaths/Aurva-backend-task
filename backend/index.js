const express = require('express');
const cors = require('cors');
const scanRoutes = require('./routes/scanRoutes');
const resultRoutes = require('./routes/resultRoutes');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const connectDB = require('./config/database');
const morgan = require('morgan');
const path = require('path');

const envFile = process.env.NODE_ENV === 'production' ? '../.env.production' : '../.env';

require('dotenv').config({ path: path.resolve(__dirname, envFile) });

const app = express();
connectDB();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(morgan('dev'));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(cors());

app.use('/api', scanRoutes);
app.use('/api', resultRoutes);

app.get('/', (req, res) => {
    res.send('Give me Job🚀🚀🚀');
}); 

console.log('hey',process.env.BACKEND_PORT);
app.listen(process.env.BACKEND_PORT, () => {
    console.log(`Server is running on port ${process.env.BACKEND_PORT}`);
    }
);