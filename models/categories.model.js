const mongoose = require('mongoose');
const { Schema } = mongoose;

const CategoriesSchema  = new Schema({
    NameCategory: { type: String },
},{
    timestamps: true
})

module.exports = mongoose.model('categories' , CategoriesSchema );