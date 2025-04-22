const Joi = require("joi");

const userSchema = Joi.object({
	firstName: Joi.string().min(2),
	lastName: Joi.string().min(2),
	email: Joi.string().email().required(),
	username: Joi.string().min(5).required(),
	password: Joi.string().min(5).required(),
});

const validateUser = (req, res, next) => {
	const { error } = userSchema.validate(req.body, { abortEarly: false });

	if (error) {
		const errors = error.details.map((detail) => detail.message);
		return res.status(400).json({ message: errors });
	}
	next();
};

const collectionSchema = Joi.object({
	title: Joi.string().min(3).required(),
});

const validateCollection = (req, res, next) => {
	const { error } = collectionSchema.validate(req.body, { abortEarly: false });
	if (error) {
		const errors = error.details.map((detail) => detail.message);
		return res.status(400).json({ message: errors });
	}
	next();
};

const productSchema = Joi.object({
	name: Joi.string().min(3).required(),
	description: Joi.string(),
	price: Joi.number().positive().required(),
	collection: Joi.string().min(3),
});

const validateProduct = (req, res, next) => {
	const { error } = productSchema.validate(req.body, { abortEarly: false });
	if (error) {
		const errors = error.details.map((detail) => detail.message);
		return res.status(400).json({ message: errors });
	}
	next();
};
module.exports = { validateUser, validateCollection, validateProduct };
