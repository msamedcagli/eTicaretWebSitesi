require('dotenv').config();
const sql = require('mssql/msnodesqlv8');

// .env dosyasındaki isimlerle uyumlu hale getirildi
const config = {
    connectionString: `Driver={ODBC Driver 17 for SQL Server};Server=${process.env.DB_SERVER};Database=${process.env.DB_DATABASE};Trusted_Connection=yes;`,
};

let pool;

async function connectDB() {
    if (pool && pool.connected) return pool;

    try {
        console.log('📡 Veritabanına bağlanılıyor...');
        pool = await new sql.ConnectionPool(config).connect();
        console.log('🚀 SQL Server bağlantısı başarıyla kuruldu!');
        return pool;
    } catch (err) {
        pool = null;
        console.error('❌ Veritabanı bağlantı hatası (Detay):', err.message);
        console.error('Bağlantı dizesi:', config.connectionString);
        throw err;
    }
}

module.exports = {
    sql,
    connectDB
};