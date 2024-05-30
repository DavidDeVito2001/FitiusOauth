const mongoose = require("mongoose");

//Creamos el esquema de nuestro documento en la bd
const userSchema = mongoose.Schema({
  googleId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true }, // Nuevo campo para el nombre del usuario
  name: { type: String }, // Añadir otros campos que quieras almacenar
  picture: { type: String }
});

userSchema.statics.findOrCreate = async function (condition, profile) {
  try {
    //buscamos si hay un user igual en la bd
    let user = await this.findOne(condition);
    // si no hay user
    if (!user) {
      //creamos la variable email
      const email =
      //si profile.email es igual a profile.email número de indices mayor a 0 entonces el valor de email es profile.emails[0].value sino nulo
        profile.emails && profile.emails.length > 0
          ? profile.emails[0].value
          : null;
      //Si el mail no existe hay error    
      if (!email) {
        throw new Error("Email is required");
      }
      //sino se crea el usuario
      user = await this.create({
        googleId: profile.id,
        email: email,
        name : profile.displayName,
        picture: profile.photos[0].value
  
      });
    }
    return user;
  } catch (err) {
    throw err;
  }
};

const User = mongoose.model("User", userSchema);

module.exports = User;
