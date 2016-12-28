import bigInt from 'big-integer';

function largePrimeGenerator() {
    const largeNumber = bigInt.randBetween("1e30", "1e31");

    // Test de Fermat en premier (plus rapide mais peut donner des faux positifs)
    if (largeNumber.isProbablePrime()) {
        // Test de Miller-Rabin si Fermat ok, permet d'éviter les faux positifs
        if (largeNumber.isPrime()) {
            return largeNumber;
        }
    }

    return largePrimeGenerator();
}

