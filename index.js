const express = require("express");
const app = express();

require('dotenv').config();

const schoolRouter = require('./routes/school.router');

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use("/api/schools", schoolRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server Running on port ${PORT}.....`);
});
