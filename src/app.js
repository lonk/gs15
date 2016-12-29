import fs       from 'fs';
import inquirer from 'inquirer';
import { vces } from './vces';
import { des }  from './des';
import { aes }  from './aes';
import { rsa, keysGenerator } from './rsa';

let lastResult;
let lastKey;

function writeInFile(file, data) {
    fs.writeFile(file, data, (err) => {
        if (err) throw err;
    });
}

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
                    key     : 4,
                    name    : 'Chiffrement RSA avec module multiple',
                    disabled: 'Indisponible pour le moment',
                    value   : 4
                },
                {
                    key     : 5,
                    name    : 'Déchiffrement RSA',
                    disabled: 'Indisponible pour le moment',
                    value   : 5
                },
                {
                    key     : 6,
                    name    : 'Signature RSA avec module multiple',
                    disabled: 'Indisponible pour le moment',
                    value   : 6
                },
                {
                    key     : 7,
                    name    : 'Vérifier une signature RSA',
                    disabled: 'Indisponible pour le moment',
                    value   : 7
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

        switch(answers.algo) {
            case 1:
                algo = vces;
                type = 'crypt';
                break;
            case 2:
                algo = vces;
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

        if ([1, 2, 8, 9, 10, 11].indexOf(answers.algo) !== -1) {
            inquirer.prompt([
                {
                    type   : 'input',
                    name   : 'text',
                    message: `Entrez le texte à ${(type == 'uncrypt' ? 'dé' : '')}chiffrer (ne rien entrer si vous souhaitez copier le dernier résultat)`
                },
                {
                    type   : 'input',
                    name   : 'key',
                    message: `Entrez la clé de ${(type == 'uncrypt' ? 'dé' : '')}chiffrement (ne rien entrer si vous souhaitez garder la même clé)`
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
