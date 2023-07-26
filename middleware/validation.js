const promise = require('bluebird');
const Joi = require('joi');
class Validator {

  async register_validation(body) {
    try {
      const joiSchema = Joi.object({
        name: Joi.string().required(),
        email: Joi.string().required(),
        password: Joi.string().required()
          .messages({
            'string.name': `name must be string `,
            'string.email': `email must be string`,
            'string.password': `password must be string`
          })
      });

      return await joiSchema.validateAsync(body);
    } catch (e) {
      let error = { message: e.details ? e.details[0].message : e.message, code: 400 };
      console.log(e);
      return promise.reject(error);
    }
  }

  async login_validation(body) {
    try {
      const joiSchema = Joi.object({
        email: Joi.string().required(),
        password: Joi.string().required()
          .messages({
            'string.email': `email must be string`,
            'string.password': `password must be string`
          })
      });
      return await joiSchema.validateAsync(body);
    } catch (e) {
      let error = { message: e.details ? e.details[0].message : e.message, code: 400 };
      console.log(e);
      return promise.reject(error);
    }
  }

}
module.exports = new Validator();