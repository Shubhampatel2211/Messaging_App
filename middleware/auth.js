const User = require('../model/user');
const jwt = require('jsonwebtoken');
const validator = require('../middleware/validation')

const ResponseController = require('../controller/responsecontroller')
class Auth {
	async authenticate(req, res, next) {
		try {
			if ('authorization' in req.headers && req.headers.authorization != null && req.headers.authorization != '') {
				let token = req.headers.authorization;
				var decoded = jwt.verify(token, 'practice')
				if (decoded.iat < decoded.exp) {
					next();
				}
			} else {
				throw Error('token not found');
			}
		} catch (error) {
			return ResponseController.error(error, res);
		}
	}


	async authenticatelogin(req, res, next) {
		try {
			var default_auth_token = "@#Slsjpoq$S1o08#MnbAiB%UVUVY*5EU@exS1o!08L9TSlsjpo#FKDFJSDLFJSDLFJSDLFJSDQY";

			if ('authorization' in req.headers && req.headers.authorization != null && req.headers.authorization != '') {
				if (req.headers.authorization == default_auth_token) {
					await validator.loginValidation(req.body)
					var [check] = await db.query(`select * from users where mobileno='${req.body.mobileno}' and status='1'`)
					if (check.length > 0) {
						next();
					} else {
						var error = Error("your account is not active")
						throw error
					}
				} else {
					var err = Error("default token invalid")
					throw err;
				}
			} else {
				var err = Error("default token missing")
				throw err;
			}
		} catch (error) {
			return ResponseController.error(error, res);
		}
	}


	async authenticateotp(req, res, next) {
		try {
			var default_auth_token = "@#Slsjpoq$S1o08#MnbAiB%UVUVY*5EU@exS1o!08L9TSlsjpo#FKDFJSDLFJSDLFJSDLFJSDQY";
			if ('authorization' in req.headers && req.headers.authorization != null && req.headers.authorization != '') {
				if (req.headers.authorization == default_auth_token) {
					next();
				} else {
					var err = Error("default token invalid")
					throw err;
				}
			} else {
				var err = Error("default token missing")
				throw err;
			}
		} catch (error) {
			return ResponseController.error(error, res);
		}
	}

}
module.exports = new Auth();