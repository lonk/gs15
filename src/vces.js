import * as des from './des';
import * as aes from './aes';
import {
    stringToBinary,
    binaryToString,
    divideInBlocks
} from './utils';

// Définition du nombre d'itérations souhaitées. Il peut être compris entre 1 et 11.
const nbRounds = 10;


// Fonction de chiffrement VCES pour un bloc de 128 bits
function crypt(blocks, desKeys1, desKeys2, aesKeys) {
    const block = blocks.slice(-1).pop();
    const step  = blocks.length - 1;

    // On sépare le bloc en deux, et on leur applique à chacun une tournée de Feistel
    const splitedBlock = divideInBlocks(block, 32);
    const desBlock     = des.feistel([ splitedBlock[0] ], [ splitedBlock[1] ], [ desKeys1[step] ], 1)
        + des.feistel([ splitedBlock[2] ], [ splitedBlock[3] ], [ desKeys2[step] ], 1);

    // On applique les 4 primitives d'AES à la suite sur le block obtenu
    const aesBlock = aes.addRoundKey(
        aes.mixColumns(
            aes.shiftRows(
                aes.mixColumns(desBlock)
            )
        ), aesKeys[step]).join('');

    blocks.push(aesBlock);

    if (blocks.length <= nbRounds) {
        return crypt(blocks, desKeys1, desKeys2, aesKeys);
    }

    return aesBlock;
}

// Chiffrement VCES
export function vces(text, key, type) {
    const binaryKey = stringToBinary(key);
    if (binaryKey.length != 128) {
        return {
            type: 'error',
            data: 'The key must be 128-bits long'
        };
    }

    // Génération des sous clés pour les tournées d'AES et de DES, selon leur implémentation DES et AES-128
    const midKeys  = divideInBlocks(binaryKey, 64);
    const desKeys1 = des.subKeysFromKey(midKeys[0]).slice(0, nbRounds);
    const desKeys2 = des.subKeysFromKey(midKeys[1]).slice(0, nbRounds);
    const aesKeys  = aes.keyExpansion(binaryKey).slice(0, nbRounds);

    // Génération des blocks VCES, avec 0-padding s'il ne s'agit pas d'un multiple de 128
    const initialBinary = stringToBinary(text);
    const blocks        = divideInBlocks(initialBinary, 128);

    const modifiedBlocks = blocks.map(block => {
        if (type == 'uncrypt') {
            return null;
        }

        return crypt([ block ], desKeys1, desKeys2, aesKeys);
    });

    return {
        type: 'result',
        data: binaryToString(modifiedBlocks.join(''))
    };
}
