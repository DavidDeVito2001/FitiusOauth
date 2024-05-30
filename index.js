//@fileoverview: Este es el archivo principal de la app, Aca inicializamos la sessiones, fijamos el puerto que vamos a usar
// realizamos la conexión con la base de datos, y tenemos las rutas con algunas funciones

const express = require("express");
//importamos el archivos ./auth
require("./auth");
const app = express();
//importamos la libreria file system
const fs = require("fs");
//importamos libreria express-session
const session = require("express-session");
//volvemos variable el archivo secret.json
const sessionConfig = JSON.parse(
  fs.readFileSync("./ArchivosJson/secret.json", "utf-8")
);

//importamon dotenv para las variables de entorno
const dotenv = require("dotenv");
//lo inicializamos
dotenv.config();
//definimos el puerto
const port = process.env.PORT || 3001;
//importamos mongoose para la BD
const mongoose = require("mongoose");
//importamos passport para empezar a utilizar el protocolo oauth 2.0
const passport = require("passport");


//Incializamos el body-parser para analizar cuerpos de solicitudes http en formato URL codificado 
app.use(require("body-parser").urlencoded({ extended: true }));
//inicializamos la session
app.use(session(sessionConfig));
//inicializamos las session con passport
app.use(passport.initialize());
app.use(passport.session());

//Función para saber si el usuario esta loggeado al momento de querer entrar a una ruta
function isLoggedIn(req, res, next) {
  //Si req.user contiene usuario se pasa al siguiente middleware sino error 401
  req.user ? next() : res.sendStatus(401);
}

//ruta principal con url para authenticarte con google utilzando el protocolo oauth 2.0
app.get("/", (req, res) => {
  res.send("<a href='/auth/google'> Auntenticate con Google</a>");
});


app.get("/auth/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

//Estas es la URI de redireccionamiento que definimos en nuestro google cloud
app.get('/auth/google/callback',
    //si la autenticación falla lo mandamos al inicio
    passport.authenticate('google', { failureRedirect: '/' }),
    function(req, res) {
        //sino falla lo redireccionamos a la ruta privada /protected
        res.redirect('/protected');
    }
);

//Si falla algo en la autenticación los redirecionamos a esta ruta
app.get("/auth/failure", (req, res) => {
  res.send("Algo no esta bien");
});

//Ruta protegida que pueden entrar solo los loggeados
//Aca se encuentran las clases privadas y un link para ver los datos de la cuenta
app.get("/protected", isLoggedIn, (req, res) => {
  res.status(201).send(`
  Hola  ${req.user.name} <p>información de tu cuenta <a href=/account>Perfil</a></p>
  <br>
  <h3>Clases privadas disponibles:</h3>
  <div>
    <ul>
        <li>Advanced Calisthenics</li>
        <li>Full-body resistance"</li>
    </ul>
  </div>
  <br>
  <h3><a href=/logout>logout</a></h3>
  `);
});

//Ruta con datos de las cuenta loggeada, también privada
app.get('/account', isLoggedIn, (req, res)=>{
    res.send(`
    <h1>Info de la cuenta</h1>
    <img src=${req.user.picture}>
    <p>nombre: ${req.user.name}</p>
    <p>email: ${req.user.email}</p>`)
});

//ruta para hacer logout
app.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) { return next(err); }
        res.redirect('/');
    });
});


//Conexión MongoDb Atlas
mongoose
  .connect(
    "mongodb+srv://daviddevito01:ezedv211201@cluster0.etr7fpe.mongodb.net/Usuario?retryWrites=true&w=majority&appName=Cluster0"
  )
  .then(() => {
    console.log("Connected!");
    app.listen(port, () => {
      console.log(`port: ${port}`);
    });
  })
  .catch(() => {
    console.log("fallo la conexón");
  });
