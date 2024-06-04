const crypto = require('crypto')


//Función para encryptar a base64
function base64URLEncode(str){
    return str.toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

//Función para encryptar sha256
function sha256(buffer){
    return crypto.createHash('sha256').update(buffer).digest();
}

//Función para crear el code_verifier
function generateVerifier(){
    return base64URLEncode(crypto.randomBytes(32));
}

//Función para convertir el code_verifier a el code_challenge
function generateCodeChallenge(verifier){
    return base64URLEncode(sha256(verifier));
}



module.exports = {
    generateVerifier,
    generateCodeChallenge,
}

