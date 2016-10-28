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

// Permute une chaine de caractère en fonction d'une table de permutation
function permute(input, table) {
    return input
        .split('')
        .map((value, index, inputArray) => inputArray[table[index]-1])
        .join('');
}

// Chiffrement DES
function des(text, key) {
    const initialBinary  = stringToBinary(text);
    const blocks         = divideInBlocks(initialBinary, 64);

    blocks.map(block => {
        const permutedBinary = permute(block, IP);
        return permutedBinary;
    });

    return blocks.join('');
}

// Chiffrement VCES
export function vces() {
    return des('testtestt', 'abcd');
}
