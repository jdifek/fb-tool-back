const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const facebookAccountsRoutes = require('./routes/facebookAccountsRoutes');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const { errorHandler } = require('./utils/errorHandler');
const adAccountsRoutes = require('./routes/adAccountsRoutes');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/accounts', facebookAccountsRoutes);
app.use('/ad-accounts', adAccountsRoutes);
app.use('/proxies', require('./routes/proxyRoutes'));


app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(errorHandler);

const PORT = process.env.PORT || 1222;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

