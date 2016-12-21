import inquirer from 'inquirer';
import { vces } from './vces';

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
                key     : 2,
                name    : 'Déchiffrement VCES',
                disabled: 'Indisponible pour le moment',
                value   : 2
            },
            {
                key     : 3,
                name    : 'Chiffrement RSA avec module multiple',
                disabled: 'Indisponible pour le moment',
                value   : 3
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
                name    : 'Vérifier une signature RSA',
                disabled: 'Indisponible pour le moment',
                value   : 6
            }
        ]
    }
]).then(answers => {
    switch(answers.algo) {
        case 1:
            inquirer.prompt([
                {
                    type   : 'input',
                    name   : 'text',
                    message: 'Entrez le texte à chiffrer'
                },
                {
                    type   : 'input',
                    name   : 'key',
                    message: 'Entrez la clé de chiffrement'
                }
            ]).then(data => {
                const result = vces(data.text, data.key, 'crypt');
                if (result.type == 'error') {
                    console.log(`Erreur: ${result.data}`);
                    return;
                }

                console.log(`Le résultat chiffré est: ${JSON.stringify(result.data)}`);
            });
            break;
        default:
            console.log('Algorithme indisponible');
    }
});
