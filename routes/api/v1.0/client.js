
var express = require('express');
var multer = require('multer');
var router = express.Router();
var fs = require('fs');
var jwt = require("jsonwebtoken");
var sha1 = require('sha1');

const CLIENT = require("../../../database/collections/client");

/*var storage = multer.diskStorage({
  destination: "./public/restaurants",
  filename: function (req, file, cb) {
    console.log("-------------------------");
    console.log(file);
    cb(null, "IMG_" + Date.now() + ".jpg");
  }
});
var upload = multer({
  storage: storage
}).single("img");*/
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
          });
        } else {
          next();
        }
      });
  }
}
//METODO POST LOGIN

router.post("/login", (req, res, next) => {
  var email = req.body.email;
  var password = req.body.password  ;
  console.log(email,password);
  var result = CLIENT.findOne({email: email,password: sha1(password)}).exec((err, doc) => {
    if (err) {
      console.log("error");
      res.status(200).json({
        msn : "No se pudo realizar la peticion "
      });
      return;
    }
    if (doc) {
      //res.status(200).json(doc);
      jwt.sign({email: doc.email, password: sha1(doc.password)}, "seponeunallavesecreta", (err, token) => {
          console.log("sesion exitosa");
          res.status(200).json({
            token : token
          });
      })
    } else {
      console.log("error enviar token");
      res.status(200).json({
        msn : "Este usuario no esta registrado en la base de datos"
      });
    }
  });
});
router.post("/client", (req, res) => {
  var client = req.body;
  //VALIDACION DE DATOS DEL CLIENT
  var name_reg = /\w{3,}/g
  var email_reg = /\w{1,}@[\w.]{1,}[.][a-z]{2,3}/g
  var phone_reg = /\d{7}[0-9]/g
  var ci_reg =/\d{1,}\w{1,3}/g
  var password_reg =/\w{6,}/g
  //var prueba = client.email.match(phone_reg)
  console.log(client);
  if(client.name.match(name_reg) == null){
    res.status(400).json({
      msn : "EL NOMBRE NO ES CORRECTO"
    });
    return;
  }
  if(client.email.match(email_reg) == null){
    res.status(400).json({
      msn : "EMAIL INCORRECTO"
    });
    return;
  }
  //console.log(client.phone.length);
  //console.log(prueba);
  //console.log(client.phone.match(phone_reg));
  if(client.phone.match(phone_reg) == null||client.phone.length!=8){
    res.status(400).json({
      msn : "EL TELEFONO NO ES CORRECTO"
    });
    return;
  }
  if(client.password.match(password_reg) == null){
    res.status(400).json({
      msn : "PASSWORD INCORRECTO REQUIERE MAS DE 6 CARACTERES"
    });
    return;
  }

  if(client.ci==undefined || client.ci.match(ci_reg) == null){
    res.status(400).json({
      msn : "CI VACIO"
    });
    return;
  }

  var clientdata = {
    name: client.name,
    email: client.email,
    phone: client.phone,
    ci: client.ci,
    password: sha1(client.password),
    registerdate: new Date
  };
  //VALIDACION
  client["registerdate"] = new Date();
  var cli = new CLIENT(clientdata);
  cli.save().then((docs) => {
    res.status(200).json(docs);
  });
});

//METODO GET..........................

router.get("/client",(req, res) => {

  CLIENT.find({}).exec((err, docs) => {
    if (err) {
      res.status(500).json({
        "msn" : "Error en la base de datos"
      });
      return;
    }
    res.status(200).json(docs);
  });
});
// METODO PATCH...............................................
router.patch("/client", function (req, res) {
  var params = req.body;
  var id = req.query.id;
  //Collection of data
  var keys = Object.keys(params);
  var updatekeys = ["name", "email", "phone", "ci"];
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
  CLIENT.findOneAndUpdate({_id: id}, objupdate ,(err, docs) => {
    if (err) {
      res.status(500).json({
          msn: "Existe un error en la base de datos"
      });
      return;
    }
    var id = docs._id
    res.status(200).json({
      msn: id
    })
  });
});

//METODO DELETE............................................
router.delete('/client', function (req, res, next) {
  let idUser = req.body._id;
  console.log(idUser);
  CLIENT.findOne({_id: idUser}).remove().exec((err, result) => {
      if (err) {
          res.status(500).json({
              error: err
          });
          return;
      }
      if (result) {
          res.status(200).json({
              message: "Cliente eliminado",
              //result: result
          })
      }
  })
});

module.exports = router;
