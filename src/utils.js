// Converti une chaine de caractère en binaire
export function stringToBinary(text) {
    const buffer = new Buffer(text, 'binary');
    let binary   = '';

    buffer.forEach(decimal => {
        const bits = decimal.toString(2);
        binary += '00000000'.substr(bits.length)+bits;
    });

    return binary;
}

// Converti un binaire en chaine de caractères
export function binaryToString(binary) {
    let chars = divideInBlocks(binary, 8);
    chars = chars.map(char => {
        return String.fromCharCode(parseInt(char, 2));
    });

    return chars.join('');
}

// Divise une chaine de caractères en blocks de n caractères
export function divideInBlocks(text, size) {
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

// Effectue un XOR sur une série de bits
export function binaryXOR(x, y) {
   const yArray = y.split('');

    return x
       .split('')
       .map((value, index) => value ^ yArray[index])
       .join('');
}
