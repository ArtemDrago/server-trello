require('dotenv').config();
const express = require('express');
const sequelize = require('./db');
const models = require('./models/models.js');
const cors = require('cors');
const path = require('path');
const router = require('./routers/index');
// const fileUpload = require('express-fileupload');

// const errorHandler = require('./middleware/ErrorHandlerMiddleware');


const PORT = process.env.PORT || 5000;

const app = express();
app.use(cors());
app.use(express.json());
// app.use(express.static(path.resolve(__dirname, 'static')));
// app.use(fileUpload({}));
app.use('/', router);

//Обработка ошибок . последний middleware
// app.use(errorHandler)

const start = async () => {
   try {
      await sequelize.authenticate();
      await sequelize.sync();
      app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
   } catch (e) {
      console.log(e);
   }
};
start();
