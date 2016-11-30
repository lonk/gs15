import { des } from './des';
import { aes } from './aes';

// Chiffrement VCES
export function vces() {
    //return des(des('abcdabcd', '00007412', 'crypt').data, '00007412', 'uncrypt');

    return aes('abcdabcdabcdabcd', '1234123412341234');
}
