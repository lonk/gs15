import {
    divideInBlocks,
    stringToBinary,
    binaryToString,
    binaryXOR
} from './utils';

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

// S-boxes 1 à 8
const S = [[14, 4, 13, 1, 2, 15, 11, 8, 3, 10, 6, 12, 5, 9, 0, 7,
            0, 15, 7, 4, 14, 2, 13, 1, 10, 6, 12, 11, 9, 5, 3, 8,
            4, 1, 14, 8, 13, 6, 2, 11, 15, 12, 9, 7, 3, 10, 5, 0,
            15, 12, 8, 2, 4, 9, 1, 7, 5, 11, 3, 14, 10, 0, 6, 13],
            [15, 1, 8, 14, 6, 11, 3, 4, 9, 7, 2, 13, 12, 0, 5, 10,
            3, 13, 4, 7, 15, 2, 8, 14, 12, 0, 1, 10, 6, 9, 11, 5,
            0, 14, 7, 11, 10, 4, 13, 1, 5, 8, 12, 6, 9, 3, 2, 15,
            13, 8, 10, 1, 3, 15, 4, 2, 11, 6, 7, 12, 0, 5, 14, 9],
            [10, 0, 9, 14, 6, 3, 15, 5, 1, 13, 12, 7, 11, 4, 2, 8,
            13, 7, 0, 9, 3, 4, 6, 10, 2, 8, 5, 14, 12, 11, 15, 1,
            13, 6, 4, 9, 8, 15, 3, 0, 11, 1, 2, 12, 5, 10, 14, 7,
            1, 10, 13, 0, 6, 9, 8, 7, 4, 15, 14, 3, 11, 5, 2, 12],
            [7, 13, 14, 3, 0, 6, 9, 10, 1, 2, 8, 5, 11, 12, 4, 15,
            13, 8, 11, 5, 6, 15, 0, 3, 4, 7, 2, 12, 1, 10, 14, 9,
            10, 6, 9, 0, 12, 11, 7, 13, 15, 1, 3, 14, 5, 2, 8, 4,
            3, 15, 0, 6, 10, 1, 13, 8, 9, 4, 5, 11, 12, 7, 2, 14],
            [2, 12, 4, 1, 7, 10, 11, 6, 8, 5, 3, 15, 13, 0, 14, 9,
            14, 11, 2, 12, 4, 7, 13, 1, 5, 0, 15, 10, 3, 9, 8, 6,
            4, 2, 1, 11, 10, 13, 7, 8, 15, 9, 12, 5, 6, 3, 0, 14,
            11, 8, 12, 7, 1, 14, 2, 13, 6, 15, 0, 9, 10, 4, 5, 3],
            [12, 1, 10, 15, 9, 2, 6, 8, 0, 13, 3, 4, 14, 7, 5, 11,
            10, 15, 4, 2, 7, 12, 9, 5, 6, 1, 13, 14, 0, 11, 3, 8,
            9, 14, 15, 5, 2, 8, 12, 3, 7, 0, 4, 10, 1, 13, 11, 6,
            4, 3, 2, 12, 9, 5, 15, 10, 11, 14, 1, 7, 6, 0, 8, 13],
            [4, 11, 2, 14, 15, 0, 8, 13, 3, 12, 9, 7, 5, 10, 6, 1,
            13, 0, 11, 7, 4, 9, 1, 10, 14, 3, 5, 12, 2, 15, 8, 6,
            1, 4, 11, 13, 12, 3, 7, 14, 10, 15, 6, 8, 0, 5, 9, 2,
            6, 11, 13, 8, 1, 4, 10, 7, 9, 5, 0, 15, 14, 2, 3, 12],
            [13, 2, 8, 4, 6, 15, 11, 1, 10, 9, 3, 14, 5, 0, 12, 7,
            1, 15, 13, 8, 10, 3, 7, 4, 12, 5, 6, 11, 0, 14, 9, 2,
            7, 11, 4, 1, 9, 12, 14, 2, 0, 6, 10, 13, 15, 3, 5, 8,
            2, 1, 14, 7, 4, 10, 8, 13, 15, 12, 9, 0, 3, 5, 6, 11]];

// Permutation en sortie du réseau de Festeil
const P = [16, 7, 20, 21,
            29, 12, 28, 17,
            1, 15, 23, 26,
            5, 18, 31, 10,
            2, 8, 24, 14,
            32, 27, 3, 9,
            19, 13, 30, 6,
            22, 11, 4, 25];

// Table de permutation finale
const FP = [40, 8, 48, 16, 56, 24, 64, 32,
            39, 7, 47, 15, 55, 23, 63, 31,
            38, 6, 46, 14, 54, 22, 62, 30,
            37, 5, 45, 13, 53, 21, 61, 29,
            36, 4, 44, 12, 52, 20, 60, 28,
            35, 3, 43, 11, 51, 19, 59, 27,
            34, 2, 42, 10, 50, 18, 58, 26,
            33, 1, 41, 9, 49, 17, 57, 25];

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

// Transforme un block en sa valeur dans la S-box correspondante
function SBox(block, Si) {
    const blockArray = block.split('');
    const line       = parseInt(`${blockArray[0]}${blockArray[5]}`, 2);
    const column     = parseInt(`${blockArray[1]}${blockArray[2]}${blockArray[3]}${blockArray[4]}`, 2);
    const index      = line*16 + column;
    const binary     = Si[index].toString(2);
    return '0000'.substr(binary.length)+binary;
}

// Fonction F de la tournée de Feistel
function feistelFunction(R, key) {
    const extendedR   = permute(R, ET);
    const xor1        = binaryXOR(extendedR, key);
    const blocks6     = divideInBlocks(xor1, 6);
    const boxedBlocks = blocks6.map((block, index) => SBox(block, S[index]));
    const generated   = boxedBlocks.join('');

    return permute(generated, P);
}

// Récursions sur les tournées de feistel (16 max)
export function feistel(L, R, K, nbRounds) {
    const step = L.length;

    L[step] = R[step - 1];

    const tempR = feistelFunction(R[step - 1], K[step - 1]);
    R[step]     = binaryXOR(L[step - 1], tempR);

    if (step < nbRounds) {
        return feistel(L, R, K, nbRounds);
    }

    return R[nbRounds] + L[nbRounds];
}

// Génération des 16 clés
function generateKeys(keys28, keys) {
    const step = keys.length + 1;
    let shiftN = 2;

    if (step == 1 || step == 2 || step == 9 || step == 16) {
        shiftN = 1;
    }

    const leftKey  = leftShift(keys28[step - 1][0], shiftN);
    const rightKey = leftShift(keys28[step - 1][1], shiftN);
    const rKey     = leftKey + rightKey;
    const key      = permute(rKey, PC2);

    keys.push(key);
    keys28.push([leftKey, rightKey]);

    if (step < 16) {
        return generateKeys(keys28, keys);
    }
    return keys;
}

// Génération des 16 clés à partir de la clé binaire
export function subKeysFromKey(key) {
    const key56  = permute(key, PC1);
    const keys28 = [ divideInBlocks(key56, 28) ];

    return generateKeys(keys28, []);
}

// Chiffrement DES
export function des(text, key, type) {
    const binaryKey = stringToBinary(key);

    if (binaryKey.length != 64) {
        return {
            type: 'error',
            data: 'The key must be 64-bits long'
        };
    }

    // Génération des 16 clés Ki
    let keys = subKeysFromKey(binaryKey);

    if (type == 'uncrypt') {
       keys = keys.reverse();
    }

    const initialBinary = stringToBinary(text);
    const blocks        = divideInBlocks(initialBinary, 64);

    const modifiedBlocks = blocks.map(block => {
        const permutedBinary = permute(block, IP);
        const dividedBlock   = divideInBlocks(permutedBinary, 32);

        // 16 tournées de Feistel
        const L = dividedBlock[0];
        const R = dividedBlock[1];

        const finalBlock  = feistel([ L ], [ R ], keys, 16);
        const result      = permute(finalBlock, FP);
        return result;
    });

    return {
        type: 'result',
        data: binaryToString(modifiedBlocks.join(''))
    };
}
