const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
    username: { type:String },
    password: { type: String},
    role: { type: String },
    token: { type: String, default: '' },
    status: { type: String },
    // status: { type: String, default: "0", enum: ["0", "1"] },
},{
    timestamps: true
})

module.exports = mongoose.model('users' , userSchema);