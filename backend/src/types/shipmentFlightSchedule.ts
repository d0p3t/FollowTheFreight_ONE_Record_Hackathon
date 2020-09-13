import ShipmentFlightLocation from './shipmentFlightLocation';

type ShipmentFlightSchedule = {
  flightNumber: string;
  origin: ShipmentFlightLocation;
  destination: ShipmentFlightLocation;
  flightStatus: string;
  expectedDepartureTime: number;
  expectedArrivalTime: number;
  pieces: number;
  weight: number;
  volume: number;
  bookingStatus: string;
};

export default ShipmentFlightSchedule;
