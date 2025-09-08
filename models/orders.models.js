const mongoose = require('mongoose');
const { Schema } = mongoose;

const OrdersSchema  = new Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref:'products', require: true },     //id product
    customerId: { type: mongoose.Schema.Types.ObjectId, ref:'customers', require: true }, 
    quantity: { type: Number , require: true},
    totalprice: { type: Number, require :true},
    status: { type: String, require: true }
    //paid , unpaid
},{
    timestamps: true
})

module.exports = mongoose.model('orders' , OrdersSchema );
