import LufthansaFlight from './lufthansaFlight';
import LufthansaMilestoneTotals from './lufthansaMilestoneTotals';

type LufthansaMilestone = {
  flight: LufthansaFlight;
  actualTotals: LufthansaMilestoneTotals[];
  station: string;
  events: any;
  plannedTotals: LufthansaMilestoneTotals;
  type: string;
  plannedTime: string;
};

export default LufthansaMilestone;
