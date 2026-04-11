const sql = require('mssql/msnodesqlv8');

const config = {
    connectionString: 'Driver={ODBC Driver 17 for SQL Server};Server=SEMIHPC\\SQLEXPRESS;Database=EticaretDB;Trusted_Connection=yes;',
};

async function connectDB() {
    try {
        await sql.connect(config);
        console.log('🚀 SQL Server bağlantısı başarıyla kuruldu!');
    } catch (err) {
        console.error('❌ Veritabanı bağlantı hatası:', err);
    }
}

module.exports = {
    sql,
    connectDB
};