const mongoose = require('mongoose');
const { Schema } = mongoose;

const ProductSchema  = new Schema({
    nameProduct: { type: String },
    shopId: { type: mongoose.Schema.Types.ObjectId, ref:'shops', require: true },
    price: { type: Number, require: true},
    stock: { type : Number, require: true },
    image: { type: String},
},{
    timestamps: true
})

module.exports = mongoose.model('products' , ProductSchema );