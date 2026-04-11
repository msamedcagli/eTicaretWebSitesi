require('dotenv').config(); // .env dosyasındaki değişkenleri sisteme yükler
const sql = require('mssql/msnodesqlv8');

// connectionString içindeki ${...} ifadeleri .env dosyasından bilgileri çeker
const config = {
    connectionString: `Driver={ODBC Driver 17 for SQL Server};Server=${process.env.DB_SERVER};Database=EticaretDB;Trusted_Connection=yes;`,
};

async function connectDB() {
    try {
        await sql.connect(config);
        console.log('🚀 SQL Server bağlantısı başarıyla kuruldu!');
    } catch (err) {
        console.error('❌ Veritabanı bağlantı hatası:', err);
        console.log('💡 İpucu: .env dosyasındaki DB_SERVER bilgisinin doğruluğunu kontrol edin.');
    }
}

module.exports = {
    sql,
    connectDB
};