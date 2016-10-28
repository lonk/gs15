import bigInt   from 'big-integer';
import inquirer from 'inquirer';

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
                name    : 'Chiffrement RSA avec module multiple',
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
                name    : 'Déchiffrement RSA',
                disabled: 'Indisponible pour le moment',
                value   : 4
            },
            {
                key     : 5,
                name    : 'Vérifier une signature RSA',
                disabled: 'Indisponible pour le moment',
                value   : 5
            }
        ]
    }
]).then(answers => {
    switch(answers.algo) {
        case 1:
            console.log('VCES');
            break;
        default:
            console.log('Algorithme indisponible')
    }
});