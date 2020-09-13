import ApiIntegration from './ApiIntegration';
import qs from 'querystring';
import ShipmentInfo from '../../types/shipmentInfo';
import ShipmentFlightSchedule from '../../types/shipmentFlightSchedule';
import ShipmentMilestoneEvent from '../../types/shipmentMilestoneEvent';
import KLMFlightPlan from '../../types/klm/klmFlightPlan';
import KLMMilestoneEvent from '../../types/klm/klmMilestoneEvent';
import loader from '../../data/loader';
import ShipmentFlightLocation from '../../types/shipmentFlightLocation';
import { Airport, AirportShort } from '../../types/airport';

class KLMApi extends ApiIntegration {
  constructor(clientId: string, clientSecret: string) {
    super(clientId, clientSecret, {
      baseURL: 'https://api-ute2-ext.airfranceklm.com',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
  }

  protected async authorize(): Promise<boolean> {
    if (this.isAuthorized()) {
      return true;
    }

    const requestBody = {
      grant_type: 'client_credentials'
    };

    const result = await this.axiosInstance.post('/cargo/tracking/oauth', qs.stringify(requestBody), {
      auth: {
        username: this.clientId,
        password: this.clientSecret
      }
    });

    if (result.status !== 200) {
      return false;
    }

    this.token = `Bearer ${result.data.access_token}`;
    this.tokenExpiresAt = Date.now() + Number(result.data.expires_in);
    return true;
  }

  public async getShipmentInfo(airwayBillNumber: string): Promise<ShipmentInfo> {
    if (!(await this.authorize())) {
      return { status: 500, error: 'Could not authenticate to Lufthansa API', airwayBillNumber: airwayBillNumber };
    }

    const result = await this.axiosInstance.get(`/cargo/tracking/v2/public/shipments/${airwayBillNumber}`, {
      headers: {
        Authorization: this.token
      },
      params: {
        expand: 'shipment-characteristics,milestones,flight-plans'
      }
    });

    if (result.status !== 200) {
      return { status: result.status, error: 'Something went wrong', airwayBillNumber: airwayBillNumber };
    }

    const shipment = result.data.Shipments[0].Shipment;
    const shipmentCharacteristics = result.data.Shipments[0].ShipmentCharacteristics;
    const shipmentFlightPlans = result.data.Shipments[0].FlightPlan.SegmentDetails;

    const schedules: ShipmentFlightSchedule[] = [];

    shipmentFlightPlans.forEach((flightPlan: KLMFlightPlan) => {
      const departureAirportInfo = loader.AirportData.find((a) => a.IATACode === flightPlan.DepartureLocation);
      const arrivalAirportInfo = loader.AirportData.find((a) => a.IATACode === flightPlan.ArrivalLocation);
      const origin: ShipmentFlightLocation = {
        airportCode: departureAirportInfo?.IATACode ?? '',
        airportName: departureAirportInfo?.Name ?? '',
        airportCity: departureAirportInfo?.City ?? '',
        airportCountry: departureAirportInfo?.Country ?? '',
        longitude: Number(departureAirportInfo?.Longitude) ?? 0,
        latitude: Number(departureAirportInfo?.Latitude) ?? 0
      };

      const destination: ShipmentFlightLocation = {
        airportCode: arrivalAirportInfo?.IATACode ?? '',
        airportName: arrivalAirportInfo?.Name ?? '',
        airportCity: arrivalAirportInfo?.City ?? '',
        airportCountry: arrivalAirportInfo?.Country ?? '',
        longitude: Number(arrivalAirportInfo?.Longitude) ?? 0,
        latitude: Number(arrivalAirportInfo?.Latitude) ?? 0
      };

      const flightSchedule: ShipmentFlightSchedule = {
        flightNumber: flightPlan.TransportIdentifier,
        origin: origin,
        destination: destination,
        flightStatus: '?',
        expectedDepartureTime: Date.parse(flightPlan.TransportScheduledDepartureTime),
        expectedArrivalTime: Date.parse(flightPlan.TransportScheduledArrivalTime),
        pieces: flightPlan.TotalPieceCount,
        weight: flightPlan.TotalGrossWeight.Value,
        volume: flightPlan.TotalVolume.Value,
        bookingStatus: flightPlan.BookingStatusDescription
      };
      schedules.push(flightSchedule);
    });

    const milestoneEvents: KLMMilestoneEvent[] = result.data.Shipments[0].Milestones.Events;
    const shipmentMilestoneEvents: ShipmentMilestoneEvent[] = [];

    milestoneEvents.forEach((milestoneEvent: KLMMilestoneEvent) => {
      const shipmentMilestoneEvent: ShipmentMilestoneEvent = {
        code: milestoneEvent.EventCode,
        date: Date.parse(milestoneEvent.EventActualTime ?? '0'),
        location: milestoneEvent.EventLocation,
        pieces: milestoneEvent.TotalPieceCount,
        weight: milestoneEvent.TotalGrossWeight?.Value ?? 0,
        volume: 0
      };
      shipmentMilestoneEvents.push(shipmentMilestoneEvent);
    });

    const departureAirport: Airport | undefined = loader.AirportData.find(
      (a) => a.IATACode === shipment.OriginDestination.DepartureLocation
    );
    const arrivalAirport: Airport | undefined = loader.AirportData.find(
      (a) => a.IATACode === shipment.OriginDestination.ArrivalLocation
    );

    const bookingDeparture: AirportShort = {
      code: shipment.OriginDestination.DepartureLocation,
      name: departureAirport?.Name ?? '',
      city: departureAirport?.City ?? '',
      country: departureAirport?.Country ?? '',
      latitude: Number(departureAirport?.Latitude ?? 0),
      longitude: Number(departureAirport?.Longitude ?? 0)
    };
    const bookingArrival: AirportShort = {
      code: shipment.OriginDestination.ArrivalLocation,
      name: arrivalAirport?.Name ?? '',
      city: arrivalAirport?.City ?? '',
      country: arrivalAirport?.Country ?? '',
      latitude: Number(arrivalAirport?.Latitude ?? 0),
      longitude: Number(arrivalAirport?.Longitude ?? 0)
    };
    const shipmentInfo: ShipmentInfo = {
      status: 200,
      error: '',
      airwayBillNumber: airwayBillNumber,
      data: {
        airwayBillNumber: shipment.AirWaybillNumber,
        origin: shipment.OriginDestination.DepartureLocation,
        originInfo: bookingDeparture,
        destination: shipment.OriginDestination.ArrivalLocation,
        destinationInfo: bookingArrival,
        toa: Date.parse(shipment.EstimatedPickupTime),
        lat: Date.parse(shipment.LatestAcceptanceTime),
        status: shipment.ShipmentStage.Status,
        productType: shipmentCharacteristics.CommodityName,
        flightPlan: {
          schedules: schedules
        },
        weight: shipmentCharacteristics.TotalGrossWeight.Value,
        volume: shipmentCharacteristics.TotalVolume.Value,
        numberOfPieces: shipmentCharacteristics.TotalPieceCount,
        milestoneEvents: shipmentMilestoneEvents
      }
    };

    return shipmentInfo;
  }
}

export default KLMApi;
