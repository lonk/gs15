import {
    stringToBinary,
    divideInBlocks
} from './utils';

const r = [7, 12, 17, 22,  7, 12, 17, 22,  7, 12, 17, 22,  7, 12, 17, 22,
            5,  9, 14, 20,  5,  9, 14, 20,  5,  9, 14, 20,  5,  9, 14, 20,
            4, 11, 16, 23,  4, 11, 16, 23,  4, 11, 16, 23,  4, 11, 16, 23,
            6, 10, 15, 21,  6, 10, 15, 21,  6, 10, 15, 21,  6, 10, 15, 21];

const k = generateK();

function littleEndian(binary) {
    const blocks  = divideInBlocks(binary, 8);
    let newBlocks = [];

    for (let i = blocks.length - 1; i >= 0; i--) {
        newBlocks.push(blocks[i]);
    }

    return newBlocks.join('');
}

function binaryToHex(binary) {
    let chars = divideInBlocks(binary, 4);
    chars = chars.map(char => {
        return parseInt(char, 2).toString(16);
    });

    return chars.join('');
}

function toUint32(x) {
    return (new Uint32Array([x]))[0];
}

function toUint64(x) {
    return (new Uint64Array([x]))[0];
}

function add32(a, b) {
    if (typeof a != 'number') {
        a = parseInt(a, 2);
    }

    if (typeof b != 'number') {
        b = parseInt(b, 2);
    }

    return toUint32(a + b);
}

function add322(a, b, c, d) {
    if (typeof a != 'number') {
        a = parseInt(a, 2);
    }

    if (typeof b != 'number') {
        b = parseInt(b, 2);
    }

    return toUint32(a + b);
}

function generateK() {
    let k = [];
    for (let i = 0; i < 64; i++) {
        k[i] = Math.floor(Math.abs(Math.sin(i + 1) * Math.pow(2, 32)));
    }

    return k;
}

function rightPad(binary, len, modulo) {
    if (!modulo) {
        modulo = len + 1;
    }

    if (binary.length % modulo !== len) {
        return rightPad(binary + '0', len, modulo);
    }

    return binary;
}

function leftPad(binary, len, modulo) {
    if (!modulo) {
        modulo = len + 1;
    }

    if (binary.length % modulo !== len) {
        return leftPad('0' + binary, len, modulo);
    }

    return binary;
}

function F(X, Y, Z) {
    return toUint32((X & Y) | (~X & Z));
}

function G(X, Y, Z) {
    return toUint32((X & Z) | (Y & ~Z));
}

function H(X, Y, Z) {
    return toUint32(X ^ Y ^ Z);
}

function I(X, Y, Z) {
    return toUint32(Y ^ (X | ~Z));
}

function leftShift(num, cnt) {
  return (num << cnt) | (num >>> (32 - cnt));
}

export function md5(text) {
    let binary = stringToBinary(text);
    const b    = littleEndian(leftPad(binary.length.toString(2), 64));
    binary     = rightPad(binary + '1', 448, 512);
    binary     = binary + b;

    const blocks = divideInBlocks(binary, 512);

    let a0 = 0x67452301;
    let b0 = 0xEFCDAB89;
    let c0 = 0x98BADCFE;
    let d0 = 0x10325476;

    blocks.forEach(block => {
        let words = divideInBlocks(block, 32).map(b => parseInt(littleEndian(b), 2));

        let A = a0;
        let B = b0;
        let C = c0;
        let D = d0;
        let dTemp;

        for(let i = 0; i < 64; i++) {
            let res;
            let g;

            if (i >= 0 && i <= 15) {
                res = F(B, C, D);
                g   = i;
            } else if (i >= 16 && i <= 31) {
                res = G(B, C, D);
                g   = (5 * i + 1) % 16;
            } else if (i >= 32 && i <= 47) {
                res = H(B, C, D);
                g   = (3 * i + 5) % 16;
            } else if (i >= 48 && i <= 63) {
                res = I(B, C, D);
                g   = (7 * i) % 16;
            }

            dTemp = D;
            D = C;
            C = B;
            B = toUint32(B + leftShift(A + res + k[i] + words[g], r[i]));
            A = dTemp;
        }

        a0 = toUint32(a0 + A);
        b0 = toUint32(b0 + B);
        c0 = toUint32(c0 + C);
        d0 = toUint32(d0 + D);
    });

    return {
        type: 'result',
        data: binaryToHex(littleEndian(leftPad(a0.toString(2), 32))
            + littleEndian(leftPad(b0.toString(2), 32))
            + littleEndian(leftPad(c0.toString(2), 32))
            + littleEndian(leftPad(d0.toString(2), 32)))
    };
}
