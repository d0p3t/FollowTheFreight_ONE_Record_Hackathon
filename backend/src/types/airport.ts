type Airport = {
  Id: string;
  Name: string;
  City: string;
  Country: string;
  IATACode: string;
  ICAOCode: string;
  Latitude: string;
  Longitude: string;
  Altitude: string;
  Timezone: string;
  DST: string;
  TzDatabaseTimeZone: string;
  Type: string;
  Source: string;
};

type AirportShort = {
  code: string;
  name: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
};
export { Airport, AirportShort };
