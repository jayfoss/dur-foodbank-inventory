const env = process.env.NODE_ENV || 'development';

const development = {
	env: env,
	app: {
		port: 8080,
		host: 'localhost'
	},
	auth: {
		jwtSecret: '123',
		secureCookie: false
	},
	db: {
		host: 'localhost',
		port: 8090,
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
