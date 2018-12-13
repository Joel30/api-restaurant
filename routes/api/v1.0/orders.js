var express = require('express');
var multer = require('multer');
var router = express.Router();
var fs = require('fs');
var jwt = require('jsonwebtoken');

var ORDERS = require('../../../database/collections/orders');

//verificacion verifytoken

//Middelware
function verifytoken (req, res, next) {
  //Recuperar el header
  const header = req.headers["authorization"];
  if (header  == undefined) {
      res.status(403).json({
        msn: "No autotizado"
      })
  } else {
      req.token = header.split(" ")[1];
      jwt.verify(req.token, "seponeunallavesecreta", (err, authData) => {
        if (err) {
          res.status(403).json({
            msn: "No autotizado"
          })
        } else {
          next();
        }
      });
  }
}

//////// POST ///////////

router.post("/orders", /*verifytoken,*/ (req, res) => {
    var data = req.body;
    console.log(data);
    data["registerdate"] = new Date();
    //validacion
    var neworder = new ORDERS(data);
    neworder.save().then( (rr) => {
        //content type
        res.status(200).json({
            "id" : rr._id,
            "msn" : "Orden Agregada"
        });
    });
});

////////////// GET //////////////

router.get("/orders", /*verifytoken,*/ (req, res) =>{
    var skip = 0;
    var limit = 10;
    if (req.query.skip != null) {
        skip = req.query.skip;
    }
    if (req.query.limit != null) {
        limit = req.query.limit;
    }
    ORDERS.find({}).skip(skip).limit(limit).exec((err, docs) => {
        if (err) {
            res.status(500).json({
                "msn": "Error en la Base de Datos"
            });
            return;
        }
        res.status(200).json(docs);
    })
})

//////// UPDATE ///////////////////
/*router.update("/order", verifytoken, (req, res, next) =>{
    var id = req.body._id;
    var orderss = req.body;
    //console.log(id);
    ORDERS.findByIdAndUpdate({_id : id}, {$set:orderss}, (err, docs) =>{
        if (err) {
            res.status(404).json({
                "msn": err
            });
            return;
        }
        res.status(200).json(docs);
    });
});*/
////////// DELETE //////////////////
router.delete("/orders", /*verifytoken, */ (req, res) => {
  //var url = req.url;
  var id = req.body._id;
  console.log(id);
  //console.log(req);
  ORDERS.find({_id : id}).remove().exec( (err, docs) => {
      res.status(200).json(docs);
  });
});

module.exports = router;
