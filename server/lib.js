var assert = require('better-assert');
var bitcoinjs = require('bitcoinjs-lib');
var crypto = require('crypto');
var encKey = process.env.ENC_KEY || 'devkey';

exports.encrypt = function (text) {
    var cipher = crypto.createCipher('aes-256-cbc', encKey);
    var crypted = cipher.update(text,'utf8','hex');
    crypted += cipher.final('hex');
    return crypted;
};

exports.randomHex = function(bytes) {
    var buff;

    try {
        buff = crypto.randomBytes(bytes);
    } catch (ex) {
        console.log('Caught exception when trying to generate hex: ', ex);
        buff = crypto.pseudoRandomBytes(bytes);
    }

    return buff.toString('hex');
};

exports.sha = function(str) {
    var shasum = crypto.createHash('sha256');
    shasum.update(str);
    return shasum.digest('hex');
};

exports.isInvalidUsername = function(input) {
    if (typeof input !== 'string') return 'NOT_STRING';
    if (input.length === 0) return 'NOT_PROVIDED';
    if (input.length < 3) return 'TOO_SHORT';
    if (input.length > 50) return 'TOO_LONG';
    if (!/^[a-z0-9_\-]*$/i.test(input)) return 'INVALID_CHARS';
    if (input === '__proto__') return 'INVALID_CHARS';
    return false;
};

exports.isInvalidPassword = function(password) {
    if (typeof password !== 'string') return 'NOT_STRING';
    if (password.length === 0) return 'NOT_PROVIDED';
    if (password.length < 7) return 'TOO_SHORT';
    if (password.length > 200) return 'TOO_LONG';
    return false;
};

exports.isInvalidEmail = function(email) {
    if (typeof email !== 'string') return 'NOT_STRING';
    if (email.length > 100) return 'TOO_LONG';
    if (email.indexOf('@') === -1) return 'NO_@'; // no @ sign
    if (!/^[-0-9a-zA-Z.+_]+@[-0-9a-zA-Z.+_]+\.[a-zA-Z]{2,4}$/i.test(email)) return 'NOT_A_VALID_EMAIL'; // contains whitespace
    return false;
};

exports.isUUIDv4 = function(uuid) {
    return (typeof uuid === 'string') && uuid.match(/^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i);
};

exports.isEligibleForGiveAway = function(lastGiveAway) {
    if (!lastGiveAway)
        return true;

    var created = new Date(lastGiveAway);
    var timeElapsed = (new Date().getTime() - created.getTime()) / 60000; //minutes elapsed since last giveaway

    if (timeElapsed > 60)
        return true;

    return Math.round(60 - timeElapsed);
};

var derivedPubKey = process.env.BIP32_DERIVED_KEY;
if (!derivedPubKey)
    throw new Error('Must set env var BIP32_DERIVED_KEY');


var hdNode = bitcoinjs.HDNode.fromBase58(derivedPubKey);

exports.deriveAddress = function(index) {
    return hdNode.derive(index).pubKey.getAddress().toString();
};

exports.formatSatoshis = function(n, decimals) {
    if (typeof decimals === 'undefined')
        decimals = 2;

    return (n/100).toFixed(decimals).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
};

function gamma (alpha, beta) {
    if (alpha >= 1)
        throw new Error('Gamma requires low alpha');

    var x;
    while (true) {
        var u = Math.random();
        var b = (Math.E + alpha) / Math.E;
        var p = b * u;
        if (p <= 1.0) {
            x = Math.pow(p, 1.0 / alpha);
        } else {
            x = - Math.log((b - p) / alpha);
        }
        var u1 = Math.random();
        if (p > 1.0) {
            if (u1 <= Math.pow(x, (alpha - 1.0))) {
                break;
            }
        } else if (u1 <= Math.exp(-x)) {
            break;
        }
    }
    return x * beta;
}

exports.gRand = function(avg) {
    var beta = avg * 5;
    return Math.round(gamma(avg / beta, beta));
};

exports.isInt = function (n) {
    return (typeof n === 'number') && (n === (n | 0));
};

exports.hasOwnProperty = function(obj, propName) {
    return Object.prototype.hasOwnProperty.call(obj, propName);
};

exports.getOwnProperty = function(obj, propName) {
    return Object.prototype.hasOwnProperty.call(obj, propName) ? obj[propName] : undefined;
};