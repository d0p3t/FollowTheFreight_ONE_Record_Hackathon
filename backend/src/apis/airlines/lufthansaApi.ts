import qs from 'querystring';
import ApiIntegration from './ApiIntegration';
import ShipmentInfo from '../../types/shipmentInfo';
import ShipmentFlightSchedule from '../../types/shipmentFlightSchedule';
import LufthansaMilestone from '../../types/lufthansa/lufthansaMilestone';
import ShipmentMilestoneEvent from '../../types/shipmentMilestoneEvent';
import loader from '../../data/loader';
import ShipmentFlightLocation from '../../types/shipmentFlightLocation';
import { Airport, AirportShort } from '../../types/airport';

class LufthansaApi extends ApiIntegration {
  constructor(clientId: string, clientSecret: string) {
    super(clientId, clientSecret, {
      baseURL: 'https://api.lufthansa.com',
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
      grant_type: 'client_credentials',
      client_id: this.clientId,
      client_secret: this.clientSecret
    };

    const result = await this.axiosInstance.post('/v1/oauth/token', qs.stringify(requestBody));

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

    const splitAWB = airwayBillNumber.split('-');
    const result = await this.axiosInstance.get('/v2/cargo/shipment/tracking', {
      headers: {
        Authorization: this.token
      },
      params: {
        aWBPrefix: splitAWB[0],
        aWBNumber: splitAWB[1]
      }
    });

    if (result.status !== 200) {
      return { status: result.status, error: 'Could not get shipment info', airwayBillNumber: airwayBillNumber };
    }

    const shipmentTrackingStatus = result.data.shipmentTrackingStatus;
    const booking = shipmentTrackingStatus.booking;
    const milestones = shipmentTrackingStatus.milestonePlan.milestones.milestone;

    const schedules: ShipmentFlightSchedule[] = [];
    const shipmentMilestoneEvents: ShipmentMilestoneEvent[] = [];

    milestones.forEach((milestone: LufthansaMilestone) => {
      const departureAirportInfo = loader.AirportData.find((a) => a.IATACode === milestone.flight.flightSegmentOrigin);
      const arrivalAirportInfo = loader.AirportData.find(
        (a) => a.IATACode === milestone.flight.flightSegmentDestination
      );

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
        flightNumber: `${milestone.flight.flightCarrierCode}${milestone.flight.flightNumber}`,
        origin: origin,
        destination: destination,
        flightStatus: '?',
        expectedDepartureTime: Date.parse(milestone.plannedTime),
        expectedArrivalTime: 0,
        pieces: milestone.plannedTotals.noOfPieces,
        weight: milestone.plannedTotals.weight,
        volume: 0,
        bookingStatus: milestone.type
      };
      schedules.push(flightSchedule);

      const shipmentMilestoneEvent: ShipmentMilestoneEvent = {
        code: milestone.type,
        date: Date.parse(milestone.plannedTime),
        location: milestone.station,
        pieces: milestone.actualTotals[0].noOfPieces,
        weight: milestone.actualTotals[0].weight,
        volume: 0
      };
      shipmentMilestoneEvents.push(shipmentMilestoneEvent);
    });

    const bookingDepartureAirportInfo: Airport | undefined = loader.AirportData.find(
      (a) => a.IATACode === booking.origin
    );
    const bookingArrivalAirportInfo: Airport | undefined = loader.AirportData.find(
      (a) => a.IATACode === booking.destination
    );

    const bookingDeparture: AirportShort = {
      code: booking.origin,
      name: bookingDepartureAirportInfo?.Name ?? '',
      city: bookingDepartureAirportInfo?.City ?? '',
      country: bookingDepartureAirportInfo?.Country ?? '',
      latitude: Number(bookingDepartureAirportInfo?.Latitude ?? 0),
      longitude: Number(bookingDepartureAirportInfo?.Longitude ?? 0)
    };
    const bookingArrival: AirportShort = {
      code: booking.destination,
      name: bookingArrivalAirportInfo?.Name ?? '',
      city: bookingArrivalAirportInfo?.City ?? '',
      country: bookingArrivalAirportInfo?.Country ?? '',
      latitude: Number(bookingArrivalAirportInfo?.Latitude ?? 0),
      longitude: Number(bookingArrivalAirportInfo?.Longitude ?? 0)
    };
    const shipmentInfo: ShipmentInfo = {
      status: 200,
      error: '',
      airwayBillNumber: airwayBillNumber,
      data: {
        airwayBillNumber: airwayBillNumber,
        origin: booking.origin,
        originInfo: bookingDeparture,
        destination: booking.destination,
        destinationInfo: bookingArrival,
        toa: Date.parse(booking.originalTimeFrame.tOA),
        lat: Date.parse(booking.originalTimeFrame.lAT),
        status: shipmentTrackingStatus.status,
        productType: booking.product.productName,
        flightPlan: {
          schedules: schedules
        },
        weight: booking.totals.weight,
        volume: 0,
        numberOfPieces: booking.totals.noOfPieces,
        milestoneEvents: shipmentMilestoneEvents
      }
    };

    return shipmentInfo;
  }
}

export default LufthansaApi;
