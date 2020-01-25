const env = process.env.NODE_ENV || 'development';

const development = {
	env: env,
	app: {
		port: 8080,
		host: 'localhost'
	},
	auth: {
		jwtSecret: '123',
		secureCookie: false,
		maxAge: 3600
	},
	db: {
		host: 'localhost',
		port: 27017,
		username: 'test',
		password: 'test'
	}
};

const production = {
	env: env
};

const config = {
	development,
	production
};

module.exports = config[env];
