const bcrypt = require('bcrypt');

async function createHash() {
    const password = 'password123';
    const saltRounds = 10;

    try {
        const hash = await bcrypt.hash(password, saltRounds);
        console.log('New hash:', hash);
    } catch (error) {
        console.error('Error generating hash:', error);
    }
}

createHash();