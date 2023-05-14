import * as express from 'express';
import * as mongoose from "mongoose";
import { controller } from './controllers/app.controller';
import bodyParser = require('body-parser');
require('dotenv').config();
// Initialize Express app
const app = express();

app.use(bodyParser.raw({type: 'image/png', limit : '200mb'}))

app.use("/", controller);
// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || "mongodb://db:27017/bucket-service").then(() => {
  // Start Express app
  const port = process.env.PORT || "8080";
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
});

export default app;