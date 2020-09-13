import KLMMeasurement from './klmMeasurement';

type KLMFlightPlan = {
  DepartureLocation: string;
  ArrivalLocation: string;
  TotalPieceCount: number;
  TotalGrossWeight: KLMMeasurement;
  TotalVolume: KLMMeasurement;
  IsStackable: boolean;
  IsTurnable: boolean;
  TransportIdentifier: string;
  ModeCode: number;
  ModeCodeDescription: string;
  VehicleType: string;
  TransportScheduledDepartureTime: string;
  TransportScheduledArrivalTime: string;
  BookingStatus: string;
  BookingStatusDescription: string;
};

export default KLMFlightPlan;
