const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const envConfigs =  require('../../config/db').default;

const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = envConfigs[env];
const db:{[key: string]: any} = {};

let sequelize: any;
sequelize = new Sequelize('postgres://postgres:mysecretpassword@postgis:5432/postgres', {
  dialect: 'postgres',
  pool: {
    max: 10,
    acquire: 60000*2, // Increase the acquire timeout to 60 seconds
    idle: 10000
  },
});

sequelize.authenticate().then(() => {
  console.log('Connection has been established successfully.');
}).catch((err: any) => {
  console.error('Unable to connect to the database:', err);
});

fs
  .readdirSync(__dirname)
  .filter((file: string) => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach((file: string) => {
    const model = sequelize['import'](path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;