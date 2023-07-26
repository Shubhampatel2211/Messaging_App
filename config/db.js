const mysql = require('mysql2');
class Database {

	connect(server) {
		try {
			var db = mysql.createConnection({
				host: 'localhost',
				user: 'root',
				database: 'whatsapp_lite',
				password: 'tristate123',
				socketPath: '/var/run/mysqld/mysqld.sock',
			})

			db.connect(function (err, result) {
				if (err) {
					console.error('error connecting: ' + err);
					if (err) throw err;
				} else {
					console.log("database connected successfully")
				}
			});
			return db.promise();

		} catch (error) {
			return reject(error);
		}
	}


}

module.exports = new Database;