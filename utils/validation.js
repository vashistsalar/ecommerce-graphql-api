const yup = require('yup');

const productSchema = yup.object({
  name: yup.string().required(),
  price: yup.number().required().positive(),
  category: yup.string().required(),
  stock: yup.number().required().min(0),
  description: yup.string().max(500)
});

const registerSchema = yup.object({
  email: yup.string().email().required(),
  password: yup.string().min(6).required()
});

exports.validateProductInput = input => productSchema.validate(input);
exports.validateRegisterInput = input => registerSchema.validate(input);
