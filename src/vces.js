import bigInt from 'big-integer';

// Table de permutation initiale
const IP = [58, 50, 42, 34, 26, 18, 10, 2,
            60, 52, 44, 36, 28, 20, 12, 4,
            62, 54, 46, 38, 30, 22, 14, 6,
            64, 56, 48, 40, 32, 24, 16, 8,
            57, 49, 41, 33, 25, 17, 9, 1,
            59, 51, 43, 35, 27, 19, 11, 3,
            61, 53, 45, 37, 29, 21, 13, 5,
            63, 55, 47, 39, 31, 23, 15, 7];

// Table de développement
const ET = [32, 1, 2, 3, 4, 5,
            4, 5, 6, 7, 8, 9,
            8, 9, 10, 11, 12, 13,
            12, 13, 14, 15, 16, 17,
            16, 17, 18, 19, 20, 21,
            20, 21, 22, 23, 24, 25,
            24, 25, 26, 27, 28, 29,
            28, 29, 30, 31, 32, 1];

// Permuted choice 1
const PC1 = [57, 49, 41, 33, 25, 17, 9,
            1, 58, 50, 42, 34, 26, 18,
            10, 2, 59, 51, 43, 35, 27,
            19, 11, 3, 60, 52, 44, 36,
            63, 55, 47, 39, 31, 23, 15,
            7, 62, 54, 46, 38, 30, 22,
            14, 6, 61, 53, 45, 37, 29,
            21, 13, 5, 28, 20, 12, 4];

// Permuted choice 2
const PC2 = [14, 17, 11, 24, 1, 5,
            3, 28, 15, 6, 21, 10,
            23, 19, 12, 4, 26, 8,
            16, 7, 27, 20, 13, 2,
            41, 52, 31, 37, 47, 55,
            30, 40, 51, 45, 33, 48,
            44, 49, 39, 56, 34, 53,
            46, 42, 50, 36, 29, 32];

// Table de permutation finale
const FP = [40, 8, 48, 16, 56, 24, 64, 32,
            39, 7, 47, 15, 55, 23, 63, 31,
            38, 6, 46, 14, 54, 22, 62, 30,
            37, 5, 45, 13, 53, 21, 61, 29,
            36, 4, 44, 12, 52, 20, 60, 28,
            35, 3, 43, 11, 51, 19, 59, 27,
            34, 2, 42, 10, 50, 18, 58, 26,
            33, 1, 41, 9, 49, 17, 57, 25];


// Converti une chaine de caractère en binaire
function stringToBinary(text) {
    const buffer = new Buffer(text, 'binary');
    let binary   = '';

    buffer.forEach(decimal => {
        const bits = decimal.toString(2);
        binary += '00000000'.substr(bits.length)+bits;
    });

    return binary;
}


// Divise une chaine de caractères en blocks de n caractères
function divideInBlocks(text, size) {
    const arrayText = text.split('');
    const blocks    = [];

    let i     = 0;
    let index = 0;
    for (const value of arrayText) {
        index = Math.floor(i/size);
        if (!blocks[index]) {
            blocks[index] = '';
        }

        blocks[index] += value;
        i++;
    }

    if (blocks[index].length < size) {
        const saveLength = blocks[index].length;
        for (let j = 0; j < (size - saveLength); j++) {
            blocks[index] += '0';
        }
    }

    return blocks;
}

// Permute (en étendant, ou raccourcissant si besoin) une chaine de caractère selon une table d'expansion
function permute(input, table) {
    const inputArray = input.split('');

    return table
        .map((value, index) => inputArray[table[index]-1])
        .join('');
}

// Décale une chaine de caractères de n caractères vers la gauche
function leftShift(input, n) {
    if (n == 0) {
        return input;
    }

    const inputArray = input.split('');
    inputArray.push(inputArray.shift());
    n -= 1;

    return leftShift(inputArray.join(''), n);
}

// Effectue un XOR sur une série de bits
function binaryXOR(x, y) {
    return (parseInt(x, 2) ^ parseInt(y, 2)).toString(2);
}

// Fonction F de la tournée de Feistel
function feistelFunction(R, K) {
    const extendedR = permute(R, ET);
    const xor1      = binaryXOR(extendedR, K);

    return '';
}

// Récursions sur les tournées de feistel
function feistel(L, R, key) {
    const step = L.length + 1;

    L[step] = R[step - 1];
    // R calculation todo

    if (step < 16) {
        return feistel(L, R, key);
    } else {
        return [L, R];
    }
}

function generateKeys(keys28, keys) {
    const step = keys.length + 1;
    let shiftN = 2;

    if (step == 1 || step == 2 || step == 9 || step == 16) {
        shiftN = 1;
    }

    const leftKey  = leftShift(keys28[0], shiftN);
    const rightKey = leftShift(keys28[1], shiftN);
    const rKey     = leftKey + rightKey;
    const key      = permute(rKey, PC2);

    keys.push(key);

    if (step < 16) {
        return generateKeys(keys28, keys);
    } else {
        return keys;
    }
}

// Chiffrement DES
function des(text, key) {
    const binaryKey = stringToBinary(key);

    if (binaryKey.length != 64) {
        return {
            type: 'error',
            data: 'The key must be 64-bits long'
        };
    }

    const initialBinary = stringToBinary(text);
    const blocks        = divideInBlocks(initialBinary, 64);

    blocks.map(block => {
        const permutedBinary = permute(block, IP);
        const dividedBlock   = divideInBlocks(permutedBinary, 32);

        // Génération des 16 clés Ki
        const key56  = permute(binaryKey, PC1);
        const keys28 = divideInBlocks(key56, 28);
        const keys   = generateKeys(keys28, []);

        // 16 tournées de Feistel
        const L      = [ dividedBlock[0] ];
        const R      = [ dividedBlock[1] ];

        const finalBlocks = feistel(L, R, keys);

        return {
            type: 'result',
            data: finalBlocks
        };
    });

    return blocks.join('');
}

// Chiffrement VCES
export function vces() {
    return des('testtest', 'abcdabcd');
}
