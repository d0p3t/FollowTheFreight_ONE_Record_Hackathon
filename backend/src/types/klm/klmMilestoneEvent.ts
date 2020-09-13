import KLMMeasurement from './klmMeasurement';

type KLMMilestoneEvent = {
  EventCode: string;
  EventLocation: string;
  TotalPieceCount: number;
  TransportIdentifier?: string;
  ModeCode?: number;
  ModeCodeDescription?: string;
  TotalGrossWeight?: KLMMeasurement;
  EventActualTime?: string;
  Sequence: number;
  LastStatus: boolean;
};

export default KLMMilestoneEvent;
