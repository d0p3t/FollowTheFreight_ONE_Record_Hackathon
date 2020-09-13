import { Airport, AirportShort } from './airport';
import ShipmentFlightPlan from './shipmentFlightPlan';
import ShipmentMilestoneEvent from './shipmentMilestoneEvent';

type ShipmentInfo = {
  status: number;
  error?: string;
  airwayBillNumber: string;
  data?: {
    airwayBillNumber: string;
    origin: string;
    originInfo: AirportShort;
    destination: string;
    destinationInfo: AirportShort;
    toa: number;
    lat: number;
    status: string;
    productType: string;
    flightPlan: ShipmentFlightPlan;
    weight: number;
    volume: number;
    numberOfPieces: number;
    milestoneEvents: ShipmentMilestoneEvent[];
  };
};

export default ShipmentInfo;
