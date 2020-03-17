const env = process.env.NODE_ENV || 'development';

const development = {
	env: env,
	app: {
		port: process.env.PORT || 8080,
		host: 'localhost'
	},
	auth: {
		jwtSecret: '0d6581d4b2584100ee759e1cea29dcd353ae8dfa41785a293e6541c6b364adcee3e91e8e660c2f5602ff1a84373f9b89213e4f32806bbf5eafc6e6e8f1a85e42',
		secureCookie: false,
		maxAge: 3600
	},
	db: {
		host: 'localhost',
		port: 27017,
		username: 'example@example.com',
		password: 'Test'
	}
};

const production = {
	env: env,
	app: {
		port: process.env.PORT,
		host: process.env.HOST || '0.0.0.0'
	},
	auth: {
		jwtSecret: process.env.JWT_SECRET,
		secureCookie: true,
		maxAge: 3600
	},
	db: {
		host: process.env.MLAB_HOST,
		port: 27017,
		username: process.env.MLAB_USERNAME,
		password: process.env.MLAB_PASSWORD
	}
};

const config = {
	development,
	production
};

module.exports = config[env];
