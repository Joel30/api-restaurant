const mongoose = require("../connect");
var mon = require('mongoose');
var Schema = mon.Schema;
var clientSchema = new Schema({
    name : String,
    email : String,
    phone : Number,
    ci : String,
    password : String,
    registerdate : Date,
});
var client = mongoose.model("client", clientSchema);
module.exports = client;
