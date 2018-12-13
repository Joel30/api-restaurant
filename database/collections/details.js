const mongoose = require("../connect");
var mon = require('mongoose');
var Schema = mon.Schema;
var detailSchema = new Schema({
    idmenu : String,
    idorder : String,
    quantity : Number,
    registerdate : Date
});
var detail = mongoose.model("detail", detailSchema);
module.exports = detail;
