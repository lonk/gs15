import {
    divideInBlocks,
    stringToBinary,
    binaryToString
} from './utils';

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
    for (let i = 2; i < 255; i++) {
        table.push(multiplyRjindael(table[i], generator));
    }

    return table;
}

export function aes(text, key) {
    const gf256 = generationRjindael();

    const binaryKey = stringToBinary(key);

    if (binaryKey.length != 128) {
        return {
            type: 'error',
            data: 'The key must be 128-bits long'
        };
    }

    const initialBinary = stringToBinary(text);
    const blocks        = divideInBlocks(initialBinary, 128);

    const modifiedBlocks = blocks.map(block => {
        const matrix = divideInBlocks(block, 8);

        console.log(matrix);
    });

    return true;
}
