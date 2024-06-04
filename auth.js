//importamos el passport 
const passport = require("passport");
//importamos la googleStrategy de oauth2.0 de GOOGLE
const GoogleStrategy = require("passport-google-oauth2").Strategy;
//importamos dotenv para variables de entorno
const dotenv = require("dotenv");
//creamos User que es el model de la BD
const User = require("./models/user.model.js");
//inicializamos las variables de entorno
dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      //credenciales de google cloud
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      //url despues de autenticarse que index tiene un lógica
      callbackURL: "http://localhost:3000/auth/google/callback",
      passReqToCallback: true,
      pkce: true,
      state: true
    },
    async function (request, accessToken, refreshToken, profile, done) {
      try {
        console.log(profile)
        //Buscar un usuario y si no esta se crea: lógica en models/user.model.js
        const user = await User.findOrCreate({ googleId: profile.id }, profile);
        
        return done(null, user);
      } catch (err) {
        console.error("Error al buscar o crear usuario:", err);
        return done(err);
      }
    }
  )
);

// Serializar usuario
passport.serializeUser(function (user, done) {
  done(null, user.id);
});

// Deserializar usuario
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});
