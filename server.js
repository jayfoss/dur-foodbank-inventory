const serverApp = require('./src/app');
const config = require('./config');
serverApp.app.listen(config.app.port, config.app.host);
