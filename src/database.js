const mysql = require('mysql')

const mysqlConnection = mysql.createPool({
    connectionLimit:100,
    host: '35.239.178.56',
    user: 'admin_tracker',
    password: 'aggropla',
    database: 'prod_control'
});
module.exports = mysqlConnection;