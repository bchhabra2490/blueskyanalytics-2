import fs from 'fs';
import db from './database/models/index';
import dotenv from 'dotenv';
import csv from 'csv-parser';
import readline from 'readline';

dotenv.config();
const escapeHtml = (unsafe: string) => {
    return unsafe.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
}

const importPopulationData  = ()=>{
    const rows:any = []
    const fileStream = fs.createReadStream(__dirname+'/../data/individuals.csv');

    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity, // Handle all line endings (CR+LF, LF, or CR)
    });

    rl.on('line', (line) => {
        // Parse the line using csv-parser
        const data = line.split(',');

        if(data.length < 7) { // Skip the first line
            return;
        }

        const firstName = escapeHtml(data[0]);
        const lastName = escapeHtml(data[1]);
        const features = data[2] + ', ' + data[3] + ',' + data[4] + ',' + data[5] + ',' + data[6]

        const geometry = JSON.parse(features).geometry
        const stateData = {
            type: geometry.type,
            coordinates: geometry.coordinates
        }

        const stateDataStringified = JSON.stringify(stateData)

        rows.push({firstName, lastName, stateDataStringified, stateData})
        // Process the data here (e.g., insert into a database)
      });
      
      rl.on('close', () => {
        // All lines have been read
        console.log('Finished processing the CSV file.', rows.length);

        let sql = `INSERT INTO populations(first_name, last_name, coordinates) VALUES`;
        let count = 0
        for(const row of rows){
            sql += `('${row.firstName}', '${row.lastName}', ST_GeomFromGeoJSON('${row.stateDataStringified}')::geometry(${row.stateData.type}, 4326)),`;
            count++;

            if(count % 1000 === 0) {
                sql = sql.slice(0, -1);
                db.sequelize.query(sql, { type: db.sequelize.QueryTypes.INSERT }).then((population: any) => {
                    console.log(population)
                }).catch((err: any) => {
                    console.log(err)
                });

                sql = `INSERT INTO populations(first_name, last_name, coordinates) VALUES`;
            }
        }
        if(sql.endsWith(',')){

            sql = sql.slice(0, -1);
            db.sequelize.query(sql, { type: db.sequelize.QueryTypes.INSERT }).then((population: any) => {
                console.log(population)
            }).catch((err: any) => {
                console.log(err)
            });
        }

      });
}

importPopulationData()