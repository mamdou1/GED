const mysql = require('mysql2/promise');

async function createConnection() {
  return await mysql.createConnection({
    port:3307,
    host: '127.0.0.1',
    user: 'padme',
    password: 'padme',
    database: 'padme',
  });
}

async function find() {
  const connection = await createConnection();
  const [rows] = await connection.query('SELECT * FROM agent');
  await connection.end();
  return rows;
}

async function test() {
  const sites = await find();
  console.log(sites);
}

test().catch(err => console.error(err));
