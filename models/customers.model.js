const mongoose = require('mongoose');
const { Schema } = mongoose;

const CustomerSchema  = new Schema({
    Firstname: { type: String , require: true },
    Lastname: { type: String , require: true },
    Email: { type: String, require: true},
    Profile: { type: String , default: "" },
},{
    timestamps: true
})

module.exports = mongoose.model('customers' , CustomerSchema );
