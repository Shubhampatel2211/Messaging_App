const promise = require('bluebird')
var b = require('bcrypt')
class User {

	async user_register(filename, body) {
		try {
			let { name, email, password } = body
			let unique = Date.now()
			const hash = await b.hash(password, 10);
			var data = await db.query(`INSERT INTO user (user_id,user_name,user_email,user_password,image) VALUES ('${unique}','${name}', '${email}', '${hash}','${filename}');`)
			if (data) {
				return promise.resolve(body);
			} else {
				return promise.reject(err)
			}
		}
		catch (error) {
			return promise.reject(error)
		}
	}

	async user_login(body) {
		try {
			let { email, password } = body
			var [emailcheck] = await db.query(`SELECT * FROM user WHERE user_email ='${email}'`)
			if (emailcheck.length > 0) {
				var result = b.compareSync(`${password}`, emailcheck[0].user_password)
				if (!result) {
					var data = {
						status: 200,
						message: 'password is not valid',
						detail: {}
					}
					return promise.reject(data)
				}
				else {
					var [update] = await db.query(`UPDATE user set flag='1' WHERE user_email ='${email}';`)
					if (update) {
						var [data] = await db.query(`SELECT * FROM user WHERE user_email ='${email}'`)
						return promise.resolve(data)
					} else {
						var err = { message: "cant update flag" }
						return promise.reject(err)
					}
				}
			}
			else {
				var errs = { message: "user email does not exists" }
				return promise.reject(errs)
			}
		}
		catch (error) {
			return promise.reject(error)
		}
	}

	async connectUser(user_id, name) {
		try {
			let list = [];
			var [get_data] = await db.query(`select user_id,name from user`);
			if (get_data.length > 0) {
				for (let i in get_data) {
					let details = {
						user_id: get_data[i].user_id,
						name: get_data[i].name
					}
					list.push(details)
					console.log("==========>", details)
				}
				console.log("--------------->>>>>>>", list)
				return promise.resolve(list);
			} else {
				var [data] = await db.query(`insert into user(user_id,name) values('${user_id}','${name}')`)

				if (data.length > 0) {
					for (let i in data) {
						let details = {
							user_id: data[i].user_id,
							name: data[i].name
						}
						list.push(details)
					}
					return promise.resolve(list);

				} else {
					var e = "data not found"
					return promise.reject(e)
				}
			}
		} catch (error) {
			return promise.reject(error)
		}
	}

	async user_connected(body) {
		return new Promise(async (resolve, reject) => {
			try {
				let { sender_id, socket_id } = body;

				var [get_data] = await db.query(`select sender_id,socket_id from user`);

				if (get_data.length > 0) {
					for (let i in get_data) {
						let details = {
							user_id: get_data[i].user_id,
							name: get_data[i].name
						}
						list.push(details)
					}
					return promise.resolve(list);
				} else {
					var [data] = await db.query(`insert into user(user_id,name) values('${user_id}','${name}')`)

					if (data.length > 0) {
						for (let i in data) {
							let details = {
								user_id: data[i].user_id,
								name: data[i].name
							}
							list.push(details)
						}
						return promise.resolve(list);

					} else {
						var e = "data not found"
						return promise.reject(e)
					}
				}
			} catch (error) {
				return reject(error);
			}
		});
	}

	async user_list(user_id) {
		try {
			var [lastmessage] = await db.query(`SELECT m.message_id, m.sender_id, m.receiver_id, m.message, m.created_date FROM chat_message m JOIN (SELECT MAX(created_date) AS max_timestamp, CASE WHEN sender_id = '${user_id}' THEN receiver_id ELSE sender_id END AS other_user_id
			FROM chat_message WHERE (sender_id = '${user_id}' OR receiver_id = '${user_id}') and NOT message='no_message' GROUP BY other_user_id) sub ON ( (m.sender_id = '${user_id}' AND m.receiver_id = sub.other_user_id)  OR (m.sender_id = sub.other_user_id AND m.receiver_id ='${user_id}'))
			AND m.created_date = sub.max_timestamp 	ORDER BY m.created_date desc`);

			var [data] = await db.query(`select user_id,user_name,image from user WHERE not user_id='${user_id}'`)

			for (let i = 0; i < data.length; i++) {
				for (let j = 0; j < lastmessage.length; j++) {
					if ((lastmessage[j].sender_id == user_id && lastmessage[j].receiver_id == data[i].user_id) ||
						(lastmessage[j].sender_id == data[i].user_id && lastmessage[j].receiver_id == user_id)) {
						data[i].message = lastmessage[j].message

						var date = lastmessage[j].created_date
						date = date.toISOString()
						console.log("date+++++++++++++++++++++++++", date)
						let dates = date.substr(0, 10) + " " + date.substr(11, 12);
						data[i].date = dates
					} else {
					}
				}

				var [unread] = await db.query(`select count(is_read) as count,receiver_id,sender_id from chat_message WHERE is_read='0'and receiver_id='${user_id}' and message not in ('no_message') group by sender_id;`)

				for (let k = 0; k < unread.length; k++) {
					if (data[i].user_id == unread[k].sender_id && unread[k].receiver_id == user_id) {
						data[i].unread = unread[k].count
					}
				}
			}

			for (let p = 0; p < data.length; p++) {
				if (!data[p].date) {
					data[p].date = '1900-01-01 00:00:00.000'
				}
			}
			data.sort(function (a, b) {
				return new Date(b.date) - new Date(a.date);
			});
			console.log("message retrived data", data)
			return promise.resolve(data);
		}
		catch (error) {
			return promise.reject(error);
		}
	}

	async socketChatMessage(msgData) {
		return new Promise(async (resolve, reject) => {
			try {
				let date = new Date();
				var [chatMessage] = await db.query(`insert into chat_message(sender_id,receiver_id,message,roomid,date,time)values(
					'${msgData.sender_id}','${msgData.receiver_id}','${msgData.message}','${msgData.room_id}','${msgData.date}','${msgData.time}') `)

				let [chatMessages] = await db.query(`select * from chat_message where roomid='${msgData.room_id}' and message not in ('no_message') and is_deleted = '0' order by message_id asc;`)
				return resolve(chatMessages);
			}
			catch (error) {
				return reject(error);
			}
		});
	};

	async listChatMessages(room_id) {
		return new Promise(async (resolve, reject) => {
			try {
				let [chatMessages] = await db.query(`select * from chat_message where roomid='${room_id}' and message not in ('no_message') and is_deleted = '0' order by message_id asc;`)
				return resolve(chatMessages);
			}
			catch (error) {
				return reject(error);
			}
		});
	};


	async read_message(room_id) {
		return new Promise(async (resolve, reject) => {
			try {
				let [readmessage] = await db.query(`UPDATE chat_message SET is_read='1' WHERE roomid ='${room_id}'`)
				return resolve("success");
			}
			catch (error) {
				return reject(error);
			}
		});
	};

	async deleteChatMessages(message_id) {
		return new Promise(async (resolve, reject) => {
			try {
				let [deleted] = await db.query(`UPDATE chat_message set is_deleted='1' WHERE message_id ='${message_id}';`)
				if (deleted.length > 0) {
					return resolve(true)
				} else {
					return reject(false)
				}
			}
			catch (error) {
				return reject(error);
			}
		});
	};

	async changeOnlineStatus(user_id, status) {
		return new Promise(async (resolve, reject) => {
			try {
				let [change_online] = await db.query(`UPDATE user set is_online='${status}' WHERE user_id ='${user_id}';`)
				if (change_online) {
					var [list] = await db.query(`select user_id,is_online from user where user_id='${user_id}';`)
					return resolve(list)
				} else {
					return reject(false)
				}
			}
			catch (error) {
				return reject(error);
			}
		});
	};

	async checkOnlineStatus(sender_id, receiver_id) {
		return new Promise(async (resolve, reject) => {
			try {
				var [checkOnlineStatus] = await db.query(`select user_id,is_online from user where user_id='${receiver_id}'; `)
				if (checkOnlineStatus == null) {
					return resolve({
						user_id: receiver_id,
						is_online: false
					});
				}
				return resolve({
					user_id: checkOnlineStatus[0].user_id,
					is_online: checkOnlineStatus[0].is_online
				});
			}
			catch (error) {
				return reject(error);
			}
		});
	};


	async check_room(roomid) {
		return new Promise(async (resolve, reject) => {
			try {
				var [fetch] = await db.query(`select * from chat_message where roomid='${roomid}'`)
				if (fetch.length > 0) {
					return resolve(true)
				} else {
					return resolve(false)
				}
			}
			catch (error) {
				return reject(error);
			}
		});
	};


	async create_room(body) {
		return new Promise(async (resolve, reject) => {
			try {
				let { room_id, sender_id, receiver_id, date, time } = body
				var [fetch] = await db.query(`insert into chat_message(sender_id,receiver_id,roomid,date,time)values(
					'${sender_id}','${receiver_id}','${room_id}','${date}','${time}') `)
				if (fetch.length > 0) {
					return resolve(true)
				} else {
					return resolve(false)
				}
			}
			catch (error) {
				return reject(error);
			}
		});
	};

	async imageupload(req, message) {
		return new Promise(async (resolve, reject) => {
			try {
				let date = new Date();
				var path = 'http://localhost:7000/uploads/'

				message = JSON.parse(message)

				var [chatMessage] = await db.query(`insert into chat_message(sender_id,receiver_id,message,type,roomid,date,time)values(
					'${message.sender_id}','${message.receiver_id}','${req.file.filename}','1','${message.room_id}','${message.date}','${message.time}') `)

				let [chatMessages] = await db.query(`select *, CASE WHEN message IS null  THEN "" ELSE CONCAT('${path}',message)  END AS user_images  from chat_message where roomid='${message.room_id}' and message not in ('no_message') and is_deleted = '0' order by message_id asc;`)

				return resolve({});
			}
			catch (error) {
				return reject(error);
			}
		});
	};


	async filesupload(req, message) {
		return new Promise(async (resolve, reject) => {
			try {
				let date = new Date();
				var path = 'http://localhost:7000/uploads/'
				message = JSON.parse(message);

				var [chatMessage] = await db.query(`insert into chat_message(sender_id,receiver_id,message,type,roomid,date,time)values(
					'${message.sender_id}','${message.receiver_id}','${req.file.filename}','2','${message.room_id}','${message.date}','${message.time}') `);

				let [chatMessages] = await db.query(`select *, CASE WHEN message IS null  THEN "" ELSE CONCAT('${path}',message)  END AS user_images  from chat_message where roomid='${message.room_id}' and message not in ('no_message') and is_deleted = '0' order by message_id asc;`);
				return resolve("success");
			}
			catch (error) {
				return reject(error);
			}
		});
	};

	async update_profile(image, body) {
		return new Promise(async (resolve, reject) => {
			try {
				let { email, name, password, user_id } = body
				const hash = await b.hash(password, 10);
				let [update] = await db.query(`UPDATE user set user_name='${name}',user_password='${hash}',image='${image}',user_email='${email}' WHERE user_id ='${user_id}';`)
				if (update) {
					let [data] = await db.query(`select *,CASE WHEN image in ('noimage') THEN "" ELSE CONCAT('http://192.168.1.111:7000/profile/',image)  END as profilepic from user where user_id='${user_id}'`)
					return resolve(data)
				} else {
					return resolve(false)
				}
			}
			catch (error) {
				return reject(error);
			}
		});
	};

	async logout(body) {
		return new Promise(async (resolve, reject) => {
			try {
				let { user_id } = body
				let [logout] = await db.query(`UPDATE user set flag='0' WHERE user_id ='${user_id}';`)
				if (logout) {
					return resolve("logout sucess")
				} else {
					return resolve(false)
				}
			}
			catch (error) {
				return reject(error);
			}
		});
	}

}

module.exports = new User();