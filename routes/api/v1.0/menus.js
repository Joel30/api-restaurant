var express = require('express');
var multer = require('multer');
var router = express.Router();
var fs = require('fs');
var jwt = require('jsonwebtoken');

const MENUS = require('../../../database/collections/menus');

var storage_menus = multer.diskStorage({
  destination: "./public/menus",
  filename: function (req, file, cb) {
    console.log("-------------------------");
    console.log(file);
    cb(null, "MENU_" + Date.now() + ".jpg");
  }
});
var upload_menu = multer({
  storage: storage_menus
}).single("img");
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

router.post("/",verifytoken,(req, res)=>{
  var infomenu=req.body;
  // validacion
  var name_reg = /\w{3,}/g
   var price_reg =/\d{1,3}.\d{0,2}/g
   var des_reg =/\w{3,}/g
   if(infomenu.name.match(name_reg) == null){
    res.status(200).json({
      msn : "menu  no registrado"
    });
    return;
   }
   if(infomenu.price.match(price_reg) == null){
    res.status(200).json({
      msn : "el precio  no establecido"
    });
    return;
   }
   if(infomenu.des.match(des_reg) == null){
    res.status(200).json({
      msn : "descripcion no introducida"
    });
    return;
   }

  //validacion
  var menudata = {
    //idrestaurant: String,
    name: infomenu.name,
    price: infomenu.price,
    description: infomenu.description,
    registerdate: new date,
  }
  //-------
  infomenu["registerdate"]=new Date();
  console.log("servicio encontrado");
  var menus= new MENUS(infomenu);
  console.log("ruta del modelo encontrado");
  menus.save().then((rr)=>{
      res.status(200).json({
        "msn": "item agregado con exito"
      });
  });

});
//n subida de imagenes
router.post("/uploadmenus",verifytoken,(req,res)=>{
  var id =req.query.id;
  if(id == null){
    res.status(300).json({
      "msn":"se debe especificar id"
    });
    return;
  }
  MENUS.find({_id:id}).exec((err,docs)=>{
    if(err){
      res.status(300).json({
        "msn":"se debe especificar id"
      });
      return;
    }
    if(docs.length==1){
      upload_menu(req,res,(err)=>{
        if(err){
          res.status(300).json({
            "msn":"error al subir imagen"
          });
          return;
        }
        var url = req.file.path.replace(/public/g, "");

        MENUS.update({_id: id}, {$set:{picture:url}}, (err, docs) => {
          if (err) {
            res.status(200).json({
              "msn" : err
            });
            return;
          }
          res.status(200).json(docs);
        });
        res.status(200).json({
          "msn": "imagen subido con exito"
        });
      });
    }else{
      res.status(300).json({
        "msn":"el id del restaurant no a sido encontrado"
      });
    }

  });
});

router.patch("/",verifytoken,(req,res)=>{
  var params = req.body;
  var id = req.query.id;
  //Collection of data
  var keys = Object.keys(params);
  var updatekeys = ["name", "price", "description", "picture"];
  var newkeys = [];
  var values = [];
  //seguridad
  for (var i  = 0; i < updatekeys.length; i++) {
    var index = keys.indexOf(updatekeys[i]);
    if (index != -1) {
        newkeys.push(keys[index]);
        values.push(params[keys[index]]);
    }
  }
  var objupdate = {}
  for (var i  = 0; i < newkeys.length; i++) {
      objupdate[newkeys[i]] = values[i];
  }
  console.log(objupdate);
  MENUS.findOneAndUpdate({_id: id}, objupdate ,(err, docs) => {
    if (err) {
      res.status(500).json({
          msn: "Existe un error en la base de datos"
      });
      return;
    }
    var id = docs._id
    res.status(200).json({
      msn: docs
    })
  });
});

router.get("/",(req,res)=>{
  var skip = 0;
  var limit = 20;
  var idr = req.query.idr;
  if(req.query.skip != undefined)
    skip = req.query.skip;
  if(req.query.limit != undefined)
    limit = req.query.limit;
  MENUS.find({idrestaurant: idr}).skip(skip).limit(limit).exec((err,docs)=>{
    if(err){
      res.status(500).json({
        "msn":"Error en la base de datos"
      });
      return;
    }
    res.status(200).json(docs);
  });

});


router.delete("", verifytoken, (req, res) => {
  //var url = req.url;
  var id = req.query.id;
  MENUS.find({_id : id}).remove().exec( (err, docs) => {
      res.status(200).json(docs);
  });
});
router.patch('/:id', function (req, res, next) {
  let idUser = req.params.id;
  let userData = {};
  Object.keys(req.body).forEach((key) => {
      userData[key] = req.body[key];
  })

  MENUS.findByIdAndUpdate(idUser, userData).exec((err, result) => {
      if (err) {
          res.status(500).json({
              error: err
          });
          return;
      }
      if (result) {
          res.status(200).json({
              message: "Se actualizaron los datos"

          })
      }
  })
});

module.exports = router;
