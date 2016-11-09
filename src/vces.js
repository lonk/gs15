import { des } from './des';

// Chiffrement VCES
export function vces() {
    return des(des('Je suis une licorne !!!!', '00007412', 'crypt').data, '00007412', 'uncrypt');
}
