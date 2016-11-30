import {
    divideInBlocks,
    stringToBinary,
    binaryToString
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

// Dimension de A
const lengthA = 8;

// Vecteur C de SubBytes
const c = [1, 1, 0, 0, 0, 1, 1, 0];

// Génération des vecteurs du corps de Galois
const gf256 = generationRjindael();

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

// Retourne le produit de deux polynomes dans Rjindael
function multiplyRjindael(polyA, polyB) {
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

// Génère la table de Rjindael
function generationRjindael() {
    let table = [
        [0, 0, 0, 0, 0, 0, 0, 0], // élément nul
        [0, 0, 0, 0, 0, 0, 0, 1], // polynome générateur à la puissance 0
        [0, 0, 0, 0, 0, 0, 1, 1]  // polynome générateur
    ];

    const generator = table[2];

    // Il y a 255 éléments non nuls dans la table. On en connaît déjà 2, il faut trouver les 253 autres
    for (let i = 2; i < 256; i++) {
        table.push(multiplyRjindael(table[i], generator));
    }

    table = table.map(vector => vector.join(''));

    return table;
}

function subBytes(vector) {
    const decimalValue    = gf256.indexOf(vector) - 1; // -1 car on a l'élément nul dans le tableau
    const reversedDecimal = 255 - decimalValue;
    const reversedVector  = gf256[reversedDecimal + 1].split(''); // +1 car on a l'élément nul dans le tableau
    let result            = [];

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

    const expandedKey   = keyExpansion(binaryKey);

    const modifiedBlocks = blocks.map(block => {
        const state = divideInBlocks(block, 8);

        //console.log(state);
    });

    return true;
}
