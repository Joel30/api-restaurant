const mongoose = require("../connect");
var mon = require('mongoose');
var Schema = mon.Schema;
var ordersSchema = new Schema({
    idmenu : String,
    idrestaurant : String,
    idclient : String,
    street : String,
    lat : String,
    lon : String,
    fullpayment : Number,
    registerdate : Date
});
var order = mongoose.model("orders", ordersSchema);
module.exports = order;
