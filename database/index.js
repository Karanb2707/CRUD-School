const mysql = require('mysql2')

const pool = mysql.createPool({
    host: process.env.DB_HOST || '130.162.54.212', // Fallback to a default IP if DB_HOST is not set
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DBNAME,
    port: 3306
});

pool.getConnection((err, conn) =>{
    if(err) console.log(err)
    console.log("Connectd successfully")
})

module.exports = pool.promise()