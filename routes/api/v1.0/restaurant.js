
var express = require('express');
var multer = require('multer');
var router = express.Router();
var fs = require('fs');
//var _ = require("underscore");
var RESTAURANT = require("../../../database/collections/restaurant");

var jwt = require("jsonwebtoken");

var storage = multer.diskStorage({
  destination: "./public/restaurants",
  filename: function (req, file, cb) {
    console.log("-------------------------");
    console.log(file);
    cb(null, "IMG_" + Date.now() + ".jpg");
  }
});
var upload = multer({
  storage: storage
}).single("img");;

//VERIFICACION DE TOKEN
//Middelware
function verifytoken (req, res, next) {
    //Recuperar el header
    const header = req.headers["authorization"];
    if (header  == undefined) {
        res.status(403).json({
            msn: "No autotizado"
        });
    } else {
        req.token = header.split(" ")[1];
        jwt.verify(req.token, "llavesecreta", (err, authData) => {
            if (err) {
                res.status(403).json({
                    msn: "No autotizado"
                });
            } else {
                next();
            }
        });
    }
}


////////////////////// RESTAURANT //////////////////////

//API RESTAURANTE
//VALIDACION DE RESTAURANT------------------------------------------------
router.post("/restaurant", /*verifytoken,*/ (req, res) => {
    var restaurant = req.body;

    var name_reg = /\w{3,}/g
    var nit_reg =  /\w{3,}/g
    var property_reg =  /\w{3,}/g
    var street_reg =  /\w{3,}/g

    console.log(restaurat);
    var pr = restaurat.name.match(name_reg);
    console.log(pr);
    //console.log(restaurant);
    if(restaurant.name.match(name_reg) == null){
      res.status(400).json({
        msn : "EL NOMBRE DEL RESTAURANT NO ES CORRECTO"
      });
      return;
    }
    if(restaurant.nit.match(nit_reg) == null){
      res.status(400).json({
        msn : "NIT INCORRECTO"
      });
      return;
    }
    if(restaurant.phone.match(phone_reg) == null||restaurant.phone.length!=8){
      res.status(400).json({
        msn : "EL TELEFONO NO ES CORRECTO"
      });
      return;
    }
    if(restaurant.street.match(street_reg) == null){
      res.status(400).json({
        msn : "EL NOMBRE DE LA CALLE NO EXISTE"
      });
      return;
    }
    if(restaurant.property.match(property_reg) == null){
      res.status(400).json({
        msn : "EL NOMBRE DE LA PROPIEDAD NO EXISTE"
      });
      return;
    }

    var restaurantdata = {
      name: restaurant.name,
      nit : restaurant.nit,
      property: restaurant.property,
      street : restaurant.street,
      registerdate: new Date
    };


    data["registerdate"] = new Date();
    //validacion
    var newrestaurant = new RESTAURANT(data);
    newrestaurant.save().then( (rr) => {
        //content type
        res.status(200).json({
            "id" : rr._id,
            "msn" : "Restaurante Agregado"
        });
    });
});
//GET RESTAURANT
router.get("/restaurant", verifytoken, (req, res) =>{
    var skip = 0;
    var limit = 10;
    if (req.query.skip != null) {
        skip = req.query.skip;
    }
    if (req.query.limit != null) {
        limit = req.query.limit;
    }
    RESTAURANT.find({}).skip(skip).limit(limit).exec((err, docs) => {
        if (err) {
            res.status(500).json({
                "msn": "Error en la db"
            });
            return;
        }
        res.status(200).json(docs);
    })
})
//PATCH RESTAURANT
router.patch("/restaurant", verifytoken, (req, res) => {
    var params = req.body;
    var id = req.query.id;
    //Collection of data

    var keys = Object.keys(params);
    var updatekeys = ["name", "nit", "property", "street", "phone", "Lon", "Lat", "logo", "picture"];
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
    RESTAURANT.findOneAndUpdate({_id: id}, objupdate ,(err, docs) => {
        if (err) {
            res.status(500).json({
              msn: "Existe un error en la base de datos"
            });
            return;
        }
        var id = docs._id
        res.status(200).json({
            msn: id
        });
    });
});

router.delete("/restaurant", verifytoken,  (req, res) => {
  //var url = req.url;
  var id = req.body._id;
  console.log(id);
  //console.log(req);
  RESTAURANT.find({_id : id}).remove().exec( (err, docs) => {
      res.status(200).json(docs);
  });
});
//----------------PUT------------------------------
router.put("/restaurant",/* verifytoken,*/(req, res) => {
  var url = req.url;
  var id = url.split("/")[2];
  var keys  = Object.keys(req.body);
  var oficialkeys = ["name", "nit", "property", "street", "phone", "Lon", "Lat", "logo", "picture"];
  //var result = _.difference(oficialkeys, keys);
  console.log(id);
  console.log(keys);
  //console.log(result);
  /*if (result.length > 0) {
    res.status(400).json({
      "msn" : "Existe un error en el formato de envio puede hacer uso del metodo patch si desea editar solo un fragmentode la informacion"
    });
    return;
  }

  var restaurat = {
    name : req.body.name,
    nit : req.body.nit,
    property : req.body.property,
    street : req.body.street,
    phone : req.body.phone,
    Lon : req.body.Lon,
    Lat : req.body.Lat,
    logo : req.body.logo,
    picture: req.body.picture
  };
  Home.findOneAndUpdate({_id: id}, restaurat, (err, params) => {
      if(err) {
        res.status(500).json({
          "msn": "Error no se pudo actualizar los datos"
        });
        return;
      }
      res.status(200).json(params);
      return;
  });*/
});

//5c0d1ff927d0071f2e8e958e
//UPLOAD IMG RESTAURANT PICTURE
router.post("/uploadrestaurant", verifytoken, (req, res) => {
    var params = req.query;
    var id = params.id;
    RESTAURANT.findOne({_id: id}).exec((err, docs) => {
        if (err) {
            res.status(501).json({
                "msn" : "Problemas con la base de datos"
            });
            return;
        }
        if (docs != undefined) {
            upload(req, res, (err) => {
                if (err) {
                    res.status(500).json({
                        "msn" : "Error al subir la imagen"
                    });
                    return;
                }
                var url = req.file.path.replace(/public/g, "");
                RESTAURANT.update({_id : id}, {$set: {picture: url}}, (err, docs) =>{
                    if (err) {
                        res.status(200).json({
                            "msn": err
                        });
                        return;
                    }
                    res.status(200).json(docs);
                });
            });
        }
    });
});

//UPLOAD IMG RESTAURANT LOGO
router.post("/logorestaurant", verifytoken, (req, res) => {
    var params = req.query;
    var id = params.id;
    RESTAURANT.findOne({_id: id}).exec((err, docs) => {
        if (err) {
            res.status(501).json({
                "msn" : "Problemas con la base de datos"
            });
            return;
        }
        if (docs != undefined) {
            upload(req, res, (err) => {
                if (err) {
                    res.status(500).json({
                        "msn" : "Error al subir la imagen"
                    });
                    return;
                }
                var url = req.file.path.replace(/public/g, "");
                RESTAURANT.update({_id : id}, {$set: {logo: url}}, (err, docs) =>{
                    if (err) {
                        res.status(200).json({
                            "msn": err
                        });
                        return;
                    }
                    res.status(200).json(docs);
                });
            });
        }
    });
});


module.exports = router;
