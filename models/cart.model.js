const mongoose = require('mongoose');
const { Schema } = mongoose;

const cartSchema  = new Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref:'products', require: true },     //id product
    customerId: { type: mongoose.Schema.Types.ObjectId, ref:'customers', require: true }, 
    quantity: { type: Number , require: true},
    totalprice: { type: Number, require :true},
},{
    timestamps: true
})

module.exports = mongoose.model('cart' , cartSchema );