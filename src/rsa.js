import bigInt from 'big-integer';

function largePrimeGenerator() {
    const largeNumber = bigInt.randBetween("1e30", "1e31");

    // Test de Fermat en premier (plus rapide mais peut donner des faux positifs)
    if (largeNumber.isProbablePrime()) {
        // Test de Miller-Rabin si Fermat ok, permet d'éviter les faux positifs
        if (largeNumber.isPrime()) {
            return largeNumber;
        }
    }

    return largePrimeGenerator();
}

// Génération d'un e compatible avec p, q et phi(n)
function eGenerator(p, q, phin) {
    let e = null;
    let i = bigInt(3);

    while (!e && i.lt(phin)) {
        if (bigInt.gcd(i, phin).eq(1)) {
            e = i;
        }

        i = i.plus(1);
    }

    return e;
}

// Génération des clés selon les règles de RSA
export function keysGenerator() {
    const p    = largePrimeGenerator();
    const q    = largePrimeGenerator();
    const n    = p.multiply(q);
    const phin = p.minus(1).multiply(q.minus(1));
    const e    = eGenerator(p, q, phin);
    const d    = e.modInv(phin);
    const dp   = d.mod(p.minus(1));
    const dq   = d.mod(q.minus(1));
    const qinv = q.modInv(p);

    return {
        public: {
            e: e.toString(),
            n: n.toString()
        },
        private: {
            n   : n.toString(),
            d   : d.toString(),
            p   : p.toString(),
            q   : q.toString(),
            dp  : dp.toString(),
            dq  : dq.toString(),
            qinv: qinv.toString()
        }
    };
}

// Chiffrement RSA avec le padding PCKS#1
function crypt(char, key) {
    return char.modPow(key.e, key.n);
}

// Déchifffrement RSA simple
function simpleUncrypt(char, key) {
    return char.modPow(key.d, key.n);
}

// Déchifffrement RSA avec le padding PCKS#1
function uncrypt(char, key) {
    const mp = char.modPow(key.dp, key.p);
    const mq = char.modPow(key.dq, key.q);

    const m2 = (mp.minus(mq)).multiply(key.q);

    const m = m2.multiply(key.qinv).plus(mq);

    return m;
}

// Chiffrement RSA
export function rsa(text, key, type) {
    let result;

    if (type == 'sign') {
        const asciiText = text.split('').map(c => bigInt(c.charCodeAt(0)));

        const cryptedText = asciiText.map(c => simpleUncrypt(c, key).toString());

        result = cryptedText.join(' ');
    } else if (type == 'unsign') {
        const asciiText = text.split(' ').map(c => crypt(bigInt(c), key));

        result = asciiText.map(c => String.fromCharCode(c)).join('');
    } else if (type == 'uncrypt') {
        const asciiText = text.split(' ').map(c => uncrypt(bigInt(c), key));

        result = asciiText.map(c => String.fromCharCode(c)).join('');
    } else {
        const asciiText = text.split('').map(c => bigInt(c.charCodeAt(0)));

        const cryptedText = asciiText.map(c => crypt(c, key).toString());

        result = cryptedText.join(' ');
    }

    return {
        type: 'result',
        data: result
    };
}
