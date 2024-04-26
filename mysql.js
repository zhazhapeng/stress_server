const mysql = require('mysql')

var DBPool  = mysql.createPool({
  connectionLimit : 10,
  host: 'localhost',
  user: 'root',
  password: 'jiangfan123',
  database: 'protein'
});

// const DB = mysql.createConnection({
//   host: 'localhost',
//   user: 'root',
//   password: 'jiangfan123',
//   database: 'protein'
// })
// root:admin123@tcp(127.0.0.1:3306)/protein

module.exports = DBPool;