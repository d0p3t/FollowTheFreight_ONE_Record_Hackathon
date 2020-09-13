import csv from 'csv-parser';
import fs from 'fs';
import path from 'path';
import { Airport } from '../types/airport';

class Loader {
  private dataFilePath: string;
  private data: Airport[];

  constructor(dataFilePath: string) {
    this.dataFilePath = path.resolve(__dirname, dataFilePath);
    this.data = [];
  }

  public loadFile() {
    console.log('Loading Airport Data...');

    fs.createReadStream(this.dataFilePath)
      .pipe(
        csv([
          'Id',
          'Name',
          'City',
          'Country',
          'IATACode',
          'ICAOCode',
          'Latitude',
          'Longitude',
          'Altitude',
          'Timezone',
          'DST',
          'TzDatabaseTimeZone',
          'Type',
          'Source'
        ])
      )
      .on('data', (airport: Airport) => this.data.push(airport))
      .on('end', () => {
        console.log(`Loaded ${this.data.length} airports from airports.dat`);
      });
  }

  public get AirportData(): Airport[] {
    return this.data;
  }
}

export default new Loader('airports.dat');
