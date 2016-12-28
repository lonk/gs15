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
    let i = p.plus(1);
    if (q.gt(p)) {
        i = q.plus(1);
    }

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
