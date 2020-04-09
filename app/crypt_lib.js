var CryptoJS = require("crypto-js");

function CryptoJSAesEncrypt(passphrase, plain_text){
    var salt = CryptoJS.lib.WordArray.random(256);
    var iv = CryptoJS.lib.WordArray.random(16);
    var key = CryptoJS.PBKDF2(passphrase, salt, { hasher: CryptoJS.algo.SHA512, keySize: 64/8, iterations: 999 });

    var encrypted = CryptoJS.AES.encrypt(plain_text, key, {iv: iv});

    var data = {
        ciphertext : CryptoJS.enc.Base64.stringify(encrypted.ciphertext),
        salt : CryptoJS.enc.Hex.stringify(salt),
        iv : CryptoJS.enc.Hex.stringify(iv)    
    }
    return JSON(data);
}
function CryptoJSAesDecrypt(passphrase,obj_json){
    var encrypted = obj_json.ciphertext;
    var salt = CryptoJS.enc.Hex.parse(obj_json.salt);
    var iv = CryptoJS.enc.Hex.parse(obj_json.iv);   

    var key = CryptoJS.PBKDF2(passphrase, salt, { hasher: CryptoJS.algo.SHA512, keySize: 64/8, iterations: 999});

    var decrypted = CryptoJS.AES.decrypt(encrypted, key, { iv: iv});

    return decrypted.toString(CryptoJS.enc.Utf8);
}

function hash(data, time){
    return CryptoJS.SHA256(data).toString(CryptoJS.enc.Base64);
}

const crypt_lib = {
    hash: hash,
	encrypt: CryptoJSAesEncrypt,
	decrypt: CryptoJSAesDecrypt,
};

export default crypt_lib;