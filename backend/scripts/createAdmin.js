require('dns').setServers(['8.8.8.8', '1.1.1.1']);
require('dotenv').config();
const bcrypt = require('bcryptjs'), mongoose = require('mongoose');
const { User } = require('../models');

(async () => {
  const [name, email, pw, role = 'admin'] = process.argv.slice(2);
  if (!name || !email || !pw) {
    console.log('usage: node scripts/createAdmin.js "Name" email password [admin|superadmin|volunteer]');
    process.exit(1);
  }
  if (!['admin', 'superadmin', 'volunteer'].includes(role)) {
    console.log('role must be admin, superadmin or volunteer');
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGODB_URI);
  await User.findOneAndUpdate(
    { email: email.toLowerCase() },
    { name, role, password: await bcrypt.hash(pw, 10) },
    { upsert: true }
  );
  console.log(`${role} ready: ${email}`);
  process.exit(0);
})();