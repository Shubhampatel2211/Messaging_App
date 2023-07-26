const User = require('../model/user')
const jwt = require('jsonwebtoken');
const validator = require('../middleware/validation')
const ResponseController = require('./responsecontroller');

class Usercontroller {

	async user_register(req, res) {
		try {
			await validator.register_validation(req.body)
			let data = await User.user_register(req.file.filename, req.body);
			return ResponseController.success(data, 'user registerd successsfully', res);
		} catch (error) {
			return ResponseController.error(error, res);
		}
	}

	async user_login(req, res) {
		try {
			await validator.login_validation(req.body)
			var user = await User.user_login(req.body);
			if (user) {
				user[0].authtoken = '';
				let token = jwt.sign({ user: user }, 'practice', { expiresIn: '30d' });
				db.query(`UPDATE user SET authtoken='${token}' where user_email='${user[0].user_email}';`);
				var [userdata] = await db.query(`SELECT *,CASE WHEN image in ('noimage') THEN "" ELSE CONCAT('http://192.168.1.111:7000/profile/',image)  END as profilepic  FROM user WHERE  user_email='${user[0].user_email}'`);
				return ResponseController.success(userdata, 'user login successfully', res);
			}
		} catch (error) {
			return ResponseController.error(error, res);
		}
	}

	async update_profile(req, res) {
		try {
			var image
			if (!req.file) {
				let [images]= await db.query(`SELECT image FROM user WHERE user_id ='${req.body.user_id}';`)
			  image=images[0].image
			}
			else {
				image = req.file.filename
			}
			let data = await User.update_profile(image,req.body);
			return ResponseController.success(data, 'user profile updated successsfully', res);
		}
		catch (error) {
			return ResponseController.error(error, res);
		}
	}


	async logout(req, res) {
		try {
		
			let data = await User.logout(req.body);
			return ResponseController.success(data,'user logged out successsfully', res);
		} catch (error) {
			console.log(error)
			return ResponseController.error(error, res);
		}
	}


	async socketChatMessage(msgData) {
		try {
			return await User.socketChatMessage(msgData);
		} catch (error) {
			console.log(`socketChatMessage controller catch error ->> ${error.message}`);
		}
	}

	async listChatMessages(room_id) {
		try {
			return await User.listChatMessages(room_id);
		} catch (error) {
			console.log(`listChatMessages controller catch error ->> ${error.message}`);
		}
	}


	async deleteChatMessages(message_id) {
		try {
			return await User.deleteChatMessages(message_id);
		} catch (error) {
			console.log(`deleteChatMessages controller catch error ->> ${error.message}`);
		}
	}

	async check_room(roomid) {
		try {

			return await User.check_room(roomid);
		} catch (error) {
			console.log(`socketChatMessage controller catch error ->> ${error.message}`);
		}
	}

	async create_room(body) {
		try {

			return await User.create_room(body);
		} catch (error) {
			console.log(`socketChatMessage controller catch error ->> ${error.message}`);
		}
	}
	async read_message(room_id) {
		try {
			return await User.read_message(room_id);
		} catch (error) {
			console.log(`user_list controller catch error ->> ${error.message}`);
		}
	}

	async changeOnlineStatus(user_id, status) {
		try {
			return await User.changeOnlineStatus(user_id, status);
		} catch (error) {
			console.log(`changeOnlineStatus controller catch error ->> ${error.message}`);
		}
	}


	async checkOnlineStatus(sender_id, receiver_id) {
		try {
			return await User.checkOnlineStatus(sender_id, receiver_id);
		} catch (error) {
			console.log(`deleteChatMessages controller catch error ->> ${error.message}`);
		}
	}

	async connectUser(req, res) {
		try {
			return await User.connectUser(req.body);
		} catch (error) {
			console.log(`connectUser controller catch error ->> ${error.message}`);
		}
	}


	async user_connected(body) {
		try {
			let data = await User.user_connected(body);
			return data
		} catch (error) {
			console.log('error--->>', error)
		}
	}

	async user_list(user_id) {
		try {
			return await User.user_list(user_id);
		} catch (error) {
			console.log(`user_list controller catch error ->> ${error.message}`);
		}
	}

	async imageupload(req, res) {
		try {
			let data = await User.imageupload(req, req.body.message);
			return ResponseController.success(data, 'image entered successsfully', res);
		} catch (error) {
			console.log(error)
			return ResponseController.error(error, res);
		}
	}

	async filesupload(req, res) {
		try {
			let data = await User.filesupload(req, req.body.message);
			return ResponseController.success(data, 'files uploaded successsfully', res);
		} catch (error) {
			console.log(error)
			return ResponseController.error(error, res);
		}
	}
}
module.exports = new Usercontroller()