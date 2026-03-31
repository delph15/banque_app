const bcrypt = require("bcrypt");
const password = "123456";

async function hashPassword() {
  const hash = await bcrypt.hash(password, 10);
  console.log(hash);
}

hashPassword();