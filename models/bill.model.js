const mongoose = require('mongoose');
const { Schema } = mongoose;
    
const addressCustomersSchema  = new Schema({
    totalAmount: { type: Number , require:true },
    status: { type: String , require:true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref:'customers', require: true },
    shopId: { type: mongoose.Schema.Types.ObjectId, ref:'shops', require: true },
    cartId: { type: mongoose.Schema.Types.ObjectId, ref:'cart', require: true },
},{
    timestamps: true
})

module.exports = mongoose.model('addressCustomers' , addressCustomersSchema );