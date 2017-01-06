import {
    stringToBinary,
    divideInBlocks
} from './utils';

// Constantes R de MD5
const r = [7, 12, 17, 22,  7, 12, 17, 22,  7, 12, 17, 22,  7, 12, 17, 22,
            5,  9, 14, 20,  5,  9, 14, 20,  5,  9, 14, 20,  5,  9, 14, 20,
            4, 11, 16, 23,  4, 11, 16, 23,  4, 11, 16, 23,  4, 11, 16, 23,
            6, 10, 15, 21,  6, 10, 15, 21,  6, 10, 15, 21,  6, 10, 15, 21];

// Génération des constantes K liées au sinus
const k = generateK();

function generateK() {
    let k = [];
    for (let i = 0; i < 64; i++) {
        k[i] = Math.floor(Math.abs(Math.sin(i + 1) * Math.pow(2, 32)));
    }

    return k;
}

// Conversion d'une série de bits (string) en little endian
function littleEndian(binary) {
    const blocks  = divideInBlocks(binary, 8);
    let newBlocks = [];

    for (let i = blocks.length - 1; i >= 0; i--) {
        newBlocks.push(blocks[i]);
    }

    return newBlocks.join('');
}

// Conversion d'une chaine de caractères binaire en hexadécimal
function binaryToHex(binary) {
    let chars = divideInBlocks(binary, 4);
    chars = chars.map(char => {
        return parseInt(char, 2).toString(16);
    });

    return chars.join('');
}

// Conversion d'un entier en entier non signé de 32 bits
function toUint32(x) {
    return (new Uint32Array([x]))[0];
}

// Ajout à droite de 0 à une chaîne de caractères, jusqu'à atteindre une longeur de len mod modulo
function rightPad(binary, len, modulo) {
    if (!modulo) {
        modulo = len + 1;
    }

    if (binary.length % modulo !== len) {
        return rightPad(binary + '0', len, modulo);
    }

    return binary;
}

// Ajout à gauche de 0 à une chaîne de caractères, jusqu'à atteindre une longeur de len mod modulo
function leftPad(binary, len, modulo) {
    if (!modulo) {
        modulo = len + 1;
    }

    if (binary.length % modulo !== len) {
        return leftPad('0' + binary, len, modulo);
    }

    return binary;
}

// Fonctions F, G, H et I de MD5
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

// Décallage cyclique des bits d'un entier non signé de 32 bits de cnt caractères vers la gauche
function leftShift(num, cnt) {
  return (num << cnt) | (num >>> (32 - cnt));
}

// Hashage MD5
export function md5(text) {
    // On converti la chaîne de caractères en binaire, puis la modifie selon MD5
    let binary = stringToBinary(text);
    const b    = littleEndian(leftPad(binary.length.toString(2), 64));
    binary     = rightPad(binary + '1', 448, 512);
    binary     = binary + b;

    // MD5 traite des blocks de 512 bits
    const blocks = divideInBlocks(binary, 512);

    // Préparation des variables
    let a0 = 0x67452301;
    let b0 = 0xEFCDAB89;
    let c0 = 0x98BADCFE;
    let d0 = 0x10325476;

    blocks.forEach(block => {
        // On travaille sur des mots de 32 bits, encodés en Little endian, que l'on converti en entier
        let words = divideInBlocks(block, 32).map(b => parseInt(littleEndian(b), 2));

        let A = a0;
        let B = b0;
        let C = c0;
        let D = d0;
        let dTemp;

        // 64 rondes
        for(let i = 0; i < 64; i++) {
            let res;
            let g;

            // Toutes les 16 rondes, on change de fonction
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

            // On s'assure que les variables ainsi obtenues soient des entiers de 32 bits non signés, pour ne pas rallonger le hash
            dTemp = D;
            D = C;
            C = B;
            B = toUint32(B + leftShift(A + res + k[i] + words[g], r[i]));
            A = dTemp;
        }

        // On s'assure que les variables soient des entiers de 32 bits non signés, pour ne pas rallonger le hash
        a0 = toUint32(a0 + A);
        b0 = toUint32(b0 + B);
        c0 = toUint32(c0 + C);
        d0 = toUint32(d0 + D);
    });

    // Affichage du résultat, converti en hexadécimal, et encodé en big endian
    return {
        type: 'result',
        data: binaryToHex(littleEndian(leftPad(a0.toString(2), 32))
            + littleEndian(leftPad(b0.toString(2), 32))
            + littleEndian(leftPad(c0.toString(2), 32))
            + littleEndian(leftPad(d0.toString(2), 32)))
    };
}
