var express = require('express');
var multer = require('multer')
var router = express.Router();
var fs = require('fs');
var jwt = require("jsonwebtoken");

var DETAILS = require("../../../database/collections/details");
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


router.post("/details", (req, res) => {
  var detail = req.body;
  console.log(detail);
  //Validacion de datosssss
  detail["registerdate"] = new Date();
  //validacion
  var newdetail = new DETAILS(detail);
  newdetail.save().then( (rr) => {
      //content type
      res.status(200).json({
          "id" : rr._id,
          "msn" : "Restaurante Agregado"
      });
  });
  //validacion de datos

});

////////////////// GET///////////////////
// get id menus

router.get("/menus",(req,res)=>{
  var idm = req.query.idm;
  //var idmq = req.query.idm;
  console.log(idm);
  //console.log(idmq);
  DETAILS.find({idmenu: idm}).exec((err,docs)=>{
    if(err){
      res.status(500).json({
        "msn":"Error en la Base de Datos"
      });
      return;
    }
    res.status(200).json(docs);
  });

});

//get id orders
router.get("/orders",(req,res)=>{
  var ido = req.query.ido;

  DETAILS.find({idorder: idm}).exec((err,docs)=>{
    if(err){
      res.status(500).json({
        "msn":"Error en la Base de Datos"
      });
      return;
    }
    res.status(200).json(docs);
  });

});


module.exports = router;
