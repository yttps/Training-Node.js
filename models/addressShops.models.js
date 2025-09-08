const mongoose = require('mongoose');
const { Schema } = mongoose;

const addressShopsSchema  = new Schema({
    subdistrict: { type: String , require:true },
    district: { type: String , require:true},
    province: { type: String , require:true},
    country: { type: String , require:true},
    zipcode: { type: String , require:true},
    address: { type: String , require:true},
    status: { type: Number , require: 0 },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref:'customers', require: true },
},{
    timestamps: true
})

module.exports = mongoose.model('addressShops' , addressShopsSchema );