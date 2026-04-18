require('dotenv').config();
const sql = require('mssql/msnodesqlv8');

// Senin .env dosyandaki isimlerle birebir eşitledim
const config = {
    connectionString: `Driver={ODBC Driver 17 for SQL Server};Server=${process.env.DB_HOST};Database=${process.env.DB_NAME};Trusted_Connection=yes;`,
};

async function connectDB() {
    try {
        await sql.connect(config);
        console.log('🚀 SQL Server bağlantısı başarıyla kuruldu!');
    } catch (err) {
        console.error('❌ Veritabanı bağlantı hatası:', err);
        console.log('💡 İpucu: .env dosyasındaki DB_HOST ve DB_NAME bilgilerini kontrol edin.');
    }
}

module.exports = {
    sql,
    connectDB
};