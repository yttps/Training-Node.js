const mongoose = require('mongoose');
const { Schema } = mongoose;

const AdminSchema  = new Schema({
    Username: { type: String },
    Password: { type: String },
    Role: { type: String, default: "1" }

},{
    timestamps: true
})

module.exports = mongoose.model('admin' , AdminSchema );