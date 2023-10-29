import fs from 'fs';
import db from './database/models/index';
import dotenv from 'dotenv';

dotenv.config();


const importData = () => {
    const allInsertSQL:Promise<any>[] = [];
    
    fs
    .readdirSync(__dirname+'/../data/states')
    .forEach((file: string) => {
        fs.readFile(__dirname+'/../data/states/'+file, 'utf8', function(err, contents) {
            const state = file.split('.')[0];

            const data = JSON.parse(contents);

            const stateData = {
                type: data.features[0].geometry.type,
                coordinates: data.features[0].geometry.coordinates,
            };

            const stateDataStringified = JSON.stringify(stateData);

            const sql = `INSERT INTO states(name, coordinates) VALUES ('${state}',ST_GeomFromGeoJSON('${stateDataStringified}')::geometry(${data.features[0].geometry.type}, 4326))`

            const promise = new Promise((resolve, reject)=>{
                db.sequelize.query(sql, { type: db.sequelize.QueryTypes.INSERT }).then((res: any) => {
                    // console.log(res)
                    resolve(res)
                }).catch((err: any) => {
                    // console.log(err);
                    reject(err)
                })
            })

            allInsertSQL.push(promise);
        });
    });

    Promise.all(allInsertSQL).then((res: any) => {
        // console.log(res)
    }).catch((err: any) => {
        // console.log(err);
    })
}

importData();
