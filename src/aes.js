import {
    divideInBlocks,
    stringToBinary,
    binaryToString,
    binaryXOR
} from './utils';

// Matrice A de SubBytes
const A  = [1, 0, 0, 0, 1, 1, 1, 1,
            1, 1, 0, 0, 0, 1, 1, 1,
            1, 1, 1, 0, 0, 0, 1, 1,
            1, 1, 1, 1, 0, 0, 0, 1,
            1, 1, 1, 1, 1, 0, 0, 0,
            0, 1, 1, 1, 1, 1, 0, 0,
            0, 0, 1, 1, 1, 1, 1, 0,
            0, 0, 0, 1, 1, 1, 1, 1];

// Vecteur C de SubBytes
const c = [1, 1, 0, 0, 0, 1, 1, 0];

// Matrice de la transformation MixColumns, convertie en binaire
const M =  [2, 3, 1, 1,
            1, 2, 3, 1,
            1, 1, 2, 3,
            3, 1, 1, 2]
            .map(byte => byte.toString(2));

// Génération des vecteurs du corps de Galois
const gf256 = generationRijndael();

// Génération de la table RCON
const rcon = generationRcon();

// Retourne le degré d'un polynome
function degree(poly) {
    let degree = -1;
    let i      = 0;

    while (degree == -1 && i < poly.length) {
        if (poly[i] > 0) {
            degree = poly.length - i - 1;
        }
        i++;
    }

    return degree;
}

// Retourne le produit de deux polynomes dans Rijndael
function multiplyRijndael(polyA, polyB) {
    const degreeA = degree(polyA);
    const degreeB = degree(polyB);

    const revertedA = JSON.parse(JSON.stringify(polyA)).reverse();
    const revertedB = JSON.parse(JSON.stringify(polyB)).reverse();

    let revertedR = [0, 0, 0, 0, 0, 0, 0, 0, 0];

    for (let iA = 0; iA <= degreeA; iA++) {
        if (revertedA[iA] > 0) {
            for (let iB = 0; iB <= degreeB; iB++) {
                if (revertedB[iB] > 0) {
                    revertedR[iA + iB] += 1;
                }
            }
        }
    }

    if (revertedR[8] == 1) { // L'opération de modulo est équivalente à remplacer X^8 par X^4 + X^3 + X + 1
        revertedR[4] += 1;
        revertedR[3] += 1;
        revertedR[1] += 1;
        revertedR[0] += 1;
    }

    revertedR = revertedR.slice(0, 8);

    revertedR = revertedR.map(x => x % 2);

    return revertedR.reverse();
}

// Génère la table de Rijndael
function generationRijndael() {
    let table = [
        [0, 0, 0, 0, 0, 0, 0, 1], // polynome générateur à la puissance 0
        [0, 0, 0, 0, 0, 0, 1, 1]  // polynome générateur
    ];

    const generator = table[1];

    // Il y a 255 éléments non nuls dans la table. On en connaît déjà 2, il faut trouver les 253 autres
    for (let i = 1; i < 255; i++) {
        table.push(multiplyRijndael(table[i], generator));
    }

    table = table.map(vector => vector.join(''));

    return table;
}

function generationRcon() {
    let table = [
        [1, 0, 0, 0, 1, 1, 0, 1],
        [0, 0, 0, 0, 0, 0, 0, 1],
        [0, 0, 0, 0, 0, 0, 1, 0]
    ];

    // Seules les 10 premières valeurs sont utilisées pour AES-128, mais la taille réelle de la table est de 256
    for (let i = 3; i < 256; i++) {
        table.push(multiplyRijndael(table[i - 1], table[2]));
    }

    table = table.map(vector => vector.join(''));

    return table;
}

function subByte(vector) {
    const decimalValue = gf256.indexOf(vector);
    let reversedVector = '00000000'.split('');
    if (vector !== '00000000') {
        const reversedDecimal = 255 - decimalValue;
        // Reverse absent du cours, mais nécessaire pour obtenir la bonne S-box
        reversedVector        = gf256[reversedDecimal].split('').reverse();
    }

    let result = [];

    let line = 0;
    for (let i = 0; i < 64; i += 8) {
        line         = Math.floor(i/8);
        result[line] = 0;
        for (let j = i; j < i + 8; j++) {
            result[line] += A[j] * parseInt(reversedVector[j%8]);
        }
    }

    result = result.map((byte, index) => ((byte + c[index]) % 2));

    return result.reverse().join('');
}

function subBytes(state) {
    return state.map(byte => subByte(byte));
}

// Décale un tableau de n positions vers la gauche
function leftShiftArray(input, n) {
    if (n == 0) {
        return input;
    }

    input.push(input.shift());
    n -= 1;

    return leftShiftArray(input, n);
}

function shiftRows(state) {
    let stateCopy = [];
    for (let i = 0; i < state.length; i++) {
        let step = Math.floor(i / 4);

        stateCopy.push(state[((i % 4)*5 + step*4) % 16]);
    }

    return stateCopy;
}

function mixColumn(column) {
    let result = [];
    let line   = 0;

    for (let i = 0; i < 16; i += 4) {
        line         = Math.floor(i/4);
        result[line] = '00000000';
        for (let j = i; j < i + 4; j++) {
            result[line] = binaryXOR(result[line], multiplyRijndael(column[j%4].split(''), M[j].split('')).join(''));
        }
    }

    return result;
}

function mixColumns(state) {
    const a = mixColumn(state.slice(0, 4));
    const b = mixColumn(state.slice(4, 8));
    const c = mixColumn(state.slice(8, 12));
    const d = mixColumn(state.slice(12, 16));

    return a.concat(b, c, d);
}

function keyExpansion(key) {
    let keyArray    = divideInBlocks(key, 32);
    let extendedKey = keyArray;
    let i           = 1;

    while (extendedKey.length * 4 < 176) {
        let t;

        if ((extendedKey.length * 4) % 16 === 0) {
            let bytes = divideInBlocks(extendedKey.slice(-1).pop(), 8);
            bytes     = leftShiftArray(bytes, 1);
            bytes     = subBytes(bytes);
            bytes[0]  = binaryXOR(bytes[0], rcon[i]);
            t         = bytes.join('');
            i++;
        }

        for (let j = 0; j < 4; j++) {
            const pos = extendedKey.length - 4;
            t = binaryXOR(extendedKey[pos], t);
            extendedKey.push(t);
        }
    }

    return extendedKey.join('');
}

function addRoundKey(state, roundKey) {
    return divideInBlocks(binaryXOR(state.join(''), roundKey), 8);
}

/*  Dev functions

function toHex(binary) {
    return divideInBlocks(binary, 8).map(b => parseInt(b, 2).toString(16)).join(' ');
}

function printHexMatrix(state) {
    for (let i = 0; i < 4; i++) {
        console.log(toHex(`${state[i]}${state[4 + i]}${state[8 + i]}${state[12 + i]}`));
    }
}*/

export function aes(text, key) {
    const binaryKey = stringToBinary(key);

    if (binaryKey.length != 128) {
        return {
            type: 'error',
            data: 'The key must be 128-bits long'
        };
    }

    const initialBinary = stringToBinary(text);
    const blocks        = divideInBlocks(initialBinary, 128);

    const extendedKey   = keyExpansion(binaryKey);
    const dividedKey    = divideInBlocks(extendedKey, 128);

    const modifiedBlocks = blocks.map(block => {
        let state = divideInBlocks(block, 8);
        state     = addRoundKey(state, dividedKey[0]);
        for (let i = 1; i <= 10; i++) {
            state = subBytes(state);
            state = shiftRows(state);
            if (i < 10) {
                state = mixColumns(state);
            }
            state = addRoundKey(state, dividedKey[i]);
        }

        return state.join('');
    });

    return {
        type: 'result',
        data: binaryToString(modifiedBlocks.join(''))
    };
}

console.log(aes('Sbcdabcdabcdabcd', '0123012301230123'));
