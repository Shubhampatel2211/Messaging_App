class ResponseController {
	async success(result, message, res) {
		let data = {
			message: message || 'success',
			status: 200,
			details: result,
		}
		res.writeHead(data.status, { 'Content-Type': 'application/json' })
		res.write(JSON.stringify(data))
		res.end();
	}
	async error(error, res) {
		let errorCode = error.code || 501;
		let errorMessage = error.message || '';
		res.writeHead(errorCode, { 'Content-Type': 'application/json' })
		res.write(JSON.stringify({ status: errorCode, message: errorMessage, data: {} }))
		res.end();
	}
}
module.exports = new ResponseController()