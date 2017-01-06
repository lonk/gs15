import fs       from 'fs';
import inquirer from 'inquirer';
import { vces } from './vces';
import { des }  from './des';
import { aes }  from './aes';
import { md5 }  from './md5';
import { rsa, keysGenerator } from './rsa';
import { divideInBlocks } from './utils';

let lastResult;
let lastKey;

// Fonction permettant de lire tout le contenu d'un fichier
function writeInFile(file, data) {
    fs.writeFile(file, data, (err) => {
        if (err) throw err;
    });
}

// Fonction principale, appelée après chaque action
function ask() {
    inquirer.prompt([
        {
            type   : 'list',
            name   : 'algo',
            message: 'Selectionnez votre fonction de chiffrement',
            choices: [
                {
                    key  : 1,
                    name : 'Chiffrement symétrique VCES',
                    value: 1
                },
                {
                    key  : 2,
                    name : 'Déchiffrement VCES',
                    value: 2
                },
                {
                    key  : 3,
                    name : 'Génération des clés publiques et privées RSA',
                    value: 3
                },
                {
                    key  : 4,
                    name : 'Chiffrement RSA avec module multiple',
                    value: 4
                },
                {
                    key  : 5,
                    name : 'Déchiffrement RSA',
                    value: 5
                },
                {
                    key  : 6,
                    name : 'Signature RSA',
                    value: 6
                },
                {
                    key  : 7,
                    name : 'Vérifier une signature RSA',
                    value: 7
                },
                {
                    key  : 8,
                    name : 'Chiffrement symétrique DES',
                    value: 8
                },
                {
                    key  : 9,
                    name : 'Déchiffrement DES',
                    value: 9
                },
                {
                    key  : 10,
                    name : 'Chiffrement symétrique AES',
                    value: 10
                },
                {
                    key  : 11,
                    name : 'Déchiffrement AES',
                    value: 11
                }
            ]
        }
    ]).then(answers => {
        let algo;
        let type;

        // En fonction de l'algorithme choisi, on modifie la façon de se comporter de l'algorithme
        switch(answers.algo) {
            case 1:
                algo = vces;
                type = 'crypt';
                break;
            case 2:
                algo = vces;
                type = 'uncrypt';
                break;
            case 4:
                algo = rsa;
                type = 'crypt';
                break;
            case 5:
                algo = rsa;
                type = 'uncrypt';
                break;
            case 8:
                algo = des;
                type = 'crypt';
                break;
            case 9:
                algo = des;
                type = 'uncrypt';
                break;
            case 10:
                algo = aes;
                type = 'crypt';
                break;
            case 11:
                algo = aes;
                type = 'uncrypt';
                break;
        }

        if (answers.algo == 3) {
            inquirer.prompt([
                {
                    type   : 'input',
                    name   : 'alias',
                    message: 'Entrez l\'alias à utiliser pour enregistrer les clés'
                }
            ]).then(data => {
                const keys = keysGenerator();

                writeInFile(`${data.alias}.public`, JSON.stringify(keys.public));
                writeInFile(`${data.alias}.private`, JSON.stringify(keys.private));

                console.log(`Les clés ont bien été enregistrées sous l'alias ${data.alias}`);

                setTimeout(ask, 1000);
            });
        }

        if ([4, 5].indexOf(answers.algo) !== -1) {
            inquirer.prompt([
                {
                    type   : 'input',
                    name   : 'text',
                    message: `Entrez le texte à ${(type == 'uncrypt' ? 'dé' : '')}chiffrer (défaut: ${lastResult})`
                },
                {
                    type   : 'input',
                    name   : 'alias',
                    message: 'Entrez l\'alias à utiliser pour lire les clés'
                }
            ]).then(data => {
                const file = `${data.alias}.${(type == 'uncrypt' ? 'private' : 'public')}`;

                fs.readFile(file, (err, keyFile) => {
                    if (err) throw err;

                    if (!data.text) {
                        data.text = lastResult;
                    }

                    const key = JSON.parse(keyFile);

                    const result = algo(data.text, key, type);
                    if (result.type == 'error') {
                        console.log(`Erreur: ${result.data}`);
                        return ask();
                    }

                    lastResult = result.data;
                    console.log(`Le résultat ${(type == 'uncrypt' ? 'dé' : '')}chiffré est: ${JSON.stringify(result.data)}`);

                    setTimeout(ask, 1000);
                });
            });
        }

        if (answers.algo == 6) {
            inquirer.prompt([
                {
                    type   : 'input',
                    name   : 'text',
                    message: `Entrez le message à signer (défaut: ${lastResult})`
                },
                {
                    type   : 'input',
                    name   : 'alias',
                    message: 'Entrez l\'alias à utiliser pour lire les clés'
                }
            ]).then(data => {
                const file = `${data.alias}.private`;

                if (!data.text) {
                    data.text = lastResult;
                }

                const hash = md5(data.text);
                console.log(`Hash: ${hash.data}`);

                fs.readFile(file, (err, keyFile) => {
                    if (err) throw err;

                    const key = JSON.parse(keyFile);

                    const signature = rsa(hash.data, key, 'sign');
                    if (signature.type == 'error') {
                        console.log(`Erreur: ${signature.data}`);
                        return ask();
                    }

                    lastResult = signature.data;
                    console.log(`La signature est: ${JSON.stringify(signature.data)}`);

                    setTimeout(ask, 1000);
                });
            });
        }

        if (answers.algo == 7) {
            inquirer.prompt([
                {
                    type   : 'input',
                    name   : 'check',
                    message: 'Entrez le texte à vérifier'
                },
                {
                    type   : 'input',
                    name   : 'text',
                    message: `Entrez la signature du texte à vérifier (défaut: ${lastResult})`
                },
                {
                    type   : 'input',
                    name   : 'alias',
                    message: 'Entrez l\'alias à utiliser pour lire les clés'
                }
            ]).then(data => {
                const file = `${data.alias}.public`;

                if (!data.text) {
                    data.text = lastResult;
                }

                fs.readFile(file, (err, keyFile) => {
                    if (err) throw err;

                    const key = JSON.parse(keyFile);
                    const hash = rsa(data.text, key, 'unsign');
                    if (hash.type == 'error') {
                        console.log(`Erreur: ${hash.data}`);
                        return ask();
                    }

                    if (hash.data == md5(data.check).data) {
                        console.log('Le message est authentique');
                    } else {
                        console.log('Le message n\'est pas authentique');
                    }

                    setTimeout(ask, 1000);
                });
            });
        }

        if ([1, 2, 8, 9, 10, 11].indexOf(answers.algo) !== -1) {
            inquirer.prompt([
                {
                    type   : 'input',
                    name   : 'text',
                    message: `Entrez le texte à ${(type == 'uncrypt' ? 'dé' : '')}chiffrer (défaut: ${lastResult})`
                },
                {
                    type   : 'input',
                    name   : 'key',
                    message: `Entrez la clé de ${(type == 'uncrypt' ? 'dé' : '')}chiffrement (défaut: ${lastKey})`
                }
            ]).then(data => {
                if (!data.text) {
                    data.text = lastResult;
                }
                if (!data.key) {
                    data.key = lastKey;
                }

                const result = algo(data.text, data.key, type);
                if (result.type == 'error') {
                    console.log(`Erreur: ${result.data}`);
                    return ask();
                }

                lastResult = result.data;
                lastKey    = data.key;
                console.log(`Le résultat ${(type == 'uncrypt' ? 'dé' : '')}chiffré est: ${JSON.stringify(result.data)}`);

                setTimeout(ask, 1000);
            });
        }
    });
}

ask();
