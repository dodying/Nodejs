// ==Headers==
// @Name:               createConnection
// @Description:        createConnection
// @Version:            1.0.474
// @Author:             dodying
// @Created:            2021-03-29 19:56:47
// @Modified:           2023-04-23 18:51:18
// @Namespace:          https://github.com/dodying/Nodejs
// @SupportURL:         https://github.com/dodying/Nodejs/issues
// @Require:            mysql2
// ==/Headers==

// 导入原生模块

// 导入第三方模块
const mysql = require('mysql2/promise');

// 设置
let connectionTimeout = 5 * 60 * 1000;
let connectionWrapper = {
  connectionLastTime: null,
  connection: null,
  status: null,
  code: null,
};
let connectionConfig = {};
let connectionConfigLast = {};
let connecting = false;

// Function
const createConnection = async (objConfig) => {
  const config = { ...connectionConfig, ...objConfig || {} };

  await new Promise((resolve, reject) => {
    let id;
    id = setInterval(() => {
      if (!connecting) {
        clearInterval(id);
        connecting = true;
        id = null;
        resolve();
      }
    }, 200);
  });

  const isInfoSame = Object.keys(connectionConfigLast).every((i) => connectionConfigLast[i] === config[i]);
  if (connectionWrapper.code === 1 && isInfoSame && new Date().getTime() - connectionWrapper.connectionLastTime < connectionTimeout) {
    connecting = false;
    return connectionWrapper;
  }

  connectionConfigLast = { ...config };

  console.log('re-connection');

  try {
    connectionWrapper.connection?.end?.();
  } catch (error) {
    console.trace({ error, message: error.message });
  }
  try {
    const { database, ...configLeft } = config;
    connectionWrapper.connection = await mysql.createConnection({
      host: config.host,
      user: config.user,
      password: config.password,
      keepAliveInitialDelay: 10000,
      enableKeepAlive: true,
      dateStrings: true,
      // timezone: '+00:00',
      ...configLeft,
    });
    connectionWrapper.connection.on('error', (error) => {
      if (['PROTOCOL_CONNECTION_LOST'].includes(error.code)) {
        connecting = false;
        createConnection(config);
      } else {
        console.trace('Database error:', { error });
      }
    });
  } catch (error) {
    if (error.message.match('Too many connections')) {
      connecting = false;
      return createConnection(config);
    }
    console.trace({ error, message: error.message });

    connecting = false;
    connectionWrapper = {
      ...mysql,
      connectionLastTime: null,
      connection: null,
      status: 'Connection Failed, please check info',
      code: -1,
    };
    return connectionWrapper;
  }

  const [rows] = await connectionWrapper.connection.query('SHOW DATABASES');

  if (rows.filter((i) => i.Database === config.database).length) {
    await connectionWrapper.connection.query(`USE ${config.database}`);

    connecting = false;
    connectionWrapper = {
      ...mysql,
      ...connectionWrapper,
      connectionLastTime: new Date().getTime(),
      status: `Connection Success, and use ${config.database}`,
      code: 1,
    };
  } else {
    connecting = false;
    connectionWrapper = {
      ...mysql,
      ...connectionWrapper,
      connectionLastTime: null,
      status: `Connection Success, but not exists ${config.database}`,
      code: 0,
    };
  }

  return connectionWrapper;
};

createConnection.set = function (objConfig) {
  connectionConfig = { ...connectionConfig, ...objConfig || {} };
};
createConnection.setTimeout = function (timeout) {
  connectionTimeout = timeout || 5 * 60 * 1000;
};

module.exports = createConnection;
