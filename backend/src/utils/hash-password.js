import bcrypt from 'bcryptjs';

const password = process.argv[2];
if (!password) {
  console.error('Uso: npm run hash-password -- <senha>');
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 10);
console.log(hash);
