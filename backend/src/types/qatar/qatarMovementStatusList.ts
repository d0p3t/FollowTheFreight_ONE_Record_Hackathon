import QatarULD from './qatarUld';

type QatarMovementStatusList = {
  movementStatus: string;
  cargoTrackingMvtULDSOs: QatarULD[];
  createdDate: string;
  eventAirport: string;
  eventDate: string;
  shipmentWeight: number;
  shipmentVolume: number;
  shipmentPieces: number;
  partOrTotal: string;
  movementDetails: string;
};

export default QatarMovementStatusList;
