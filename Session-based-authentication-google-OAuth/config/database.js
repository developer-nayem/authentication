require('dotenv').config();
const mongoose = require('mongoose');

mongoose.set('strictQuery', false);
mongoose.connect(process.env.MONGO_URL)
.then(() => {
    console.log('MongoDB is Successfully Connected');
}).catch((err) => {
    console.log(err.message);
})
