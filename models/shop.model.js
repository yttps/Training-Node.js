const mongoose = require('mongoose');
const { Schema } = mongoose;

const ShopSchema  = new Schema({
    nameShop: { type: String , require: true },
    phone: { type: Number, require: true},
    email: { type : String, require: true },
    image: { type: String },
    role: { type: String },
    token: { type: String, default: '' },
    status: { type: String, default: "0", enum: ["0", "1"] },
},{
    timestamps: true
})

module.exports = mongoose.model('shops' , ShopSchema );