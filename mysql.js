const mysql = require('mysql')
const DB = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'admin123',
  database: 'protein'
})
// root:admin123@tcp(127.0.0.1:3306)/protein

module.exports = DB;