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

function keysGenerator() {
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
            p   : p.toString(),
            q   : q.toString(),
            dp  : dp.toString(),
            dq  : dq.toString(),
            qinv: qinv.toString()
        }
    };
}

function crypt(char, key) {
    return char.modPow(key.e, key.n);
}

export function rsa(text, key) {
    const asciiText = text.split('').map(c => bigInt(c.charCodeAt(0)));

    const cryptedText = asciiText.map(c => crypt(c, key).toString());

    return {
        type: 'result',
        data: cryptedText
    };
}

console.log(rsa('Test GS15 !', keysGenerator().public));
