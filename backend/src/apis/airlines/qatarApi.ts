import ApiIntegration from './ApiIntegration';
import ShipmentInfo from '../../types/shipmentInfo';
import ShipmentFlightSchedule from '../../types/shipmentFlightSchedule';
import QatarFlightList from '../../types/qatar/qatarFlightList';
import QatarMovementStatusList from '../../types/qatar/qatarMovementStatusList';
import ShipmentMilestoneEvent from '../../types/shipmentMilestoneEvent';
import loader from '../../data/loader';
import ShipmentFlightLocation from '../../types/shipmentFlightLocation';
import { Airport, AirportShort } from '../../types/airport';

class QatarApi extends ApiIntegration {
  constructor(clientId: string, clientSecret: string) {
    super(clientId, clientSecret, {
      baseURL: 'https://croamisstg.qatarairways.com.qa/cargoapis',
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  protected async authorize(): Promise<boolean> {
    if (this.isAuthorized()) {
      return true;
    }

    const requestBody = {
      clientId: this.clientId,
      clientSecret: this.clientSecret,
      password: 'string',
      userHostKey: 'TESTUSER',
      username: 'string'
    };

    const result = await this.axiosInstance.post('/api/v1/auth/authorize?grant_type=client_credentials', requestBody);

    if (result.status !== 200) {
      return false;
    }

    this.token = `Bearer ${result.data.accessToken}`;
    this.tokenExpiresAt = Date.now() + Number(result.data.expiresIn);
    return true;
  }

  public async getShipmentInfo(airwayBillNumber: string): Promise<ShipmentInfo> {
    if (!(await this.authorize())) {
      return { status: 500, error: 'Could not authenticate to Qatar API.', airwayBillNumber: airwayBillNumber };
    }

    const splitAWB = airwayBillNumber.split('-');

    const requestBody = {
      botRequest: true,
      cargoTrackingRequestSOs: [
        {
          documentNumber: splitAWB[1],
          documentPrefix: splitAWB[0],
          documentType: 'MAWB',
          ipAddress: 'string'
        }
      ],
      emailContent: 'string',
      emailIds: ['string'],
      emailSubject: 'string',
      getAllStatus: true,
      overriddenServiceCode: 0,
      qrCodeUrl: 'string'
    };

    const result = await this.axiosInstance.post('/api/v1/trackShipment', requestBody);

    if (result.status !== 200) {
      return { status: 500, error: `Could not get shipment info`, airwayBillNumber: airwayBillNumber };
    }

    const cargoTrackingSo = result.data.cargoTrackingSOs[0];

    const cargoTrackingFlightList: [] = cargoTrackingSo.cargoTrackingFlightList;
    const schedules: ShipmentFlightSchedule[] = [];

    cargoTrackingFlightList.forEach((flightListEntry: QatarFlightList) => {
      const departedDate = flightListEntry.departedDate.slice(0, -6);
      const arrivalDate = flightListEntry.arrivalDate.slice(0, -6);

      const departureAirportInfo = loader.AirportData.find((a) => a.IATACode === flightListEntry.segmentOfDeparture);
      const arrivalAirportInfo = loader.AirportData.find((a) => a.IATACode === flightListEntry.segmetnOfArrival);
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
        flightNumber: flightListEntry.flightNumber,
        origin: origin,
        destination: destination,
        flightStatus: flightListEntry.flightStatus,
        expectedDepartureTime: Date.parse(`${departedDate} ${flightListEntry.std}`),
        expectedArrivalTime: Date.parse(`${arrivalDate} ${flightListEntry.sta}`),
        pieces: flightListEntry.pieces,
        weight: flightListEntry.weight,
        volume: flightListEntry.volume,
        bookingStatus: flightListEntry.bkgStatus
      };
      schedules.push(flightSchedule);
    });

    const movementStatusList: QatarMovementStatusList[] = cargoTrackingSo.cargoTrackingMvtStausList;
    const shipmentMilestoneEvents: ShipmentMilestoneEvent[] = [];
    movementStatusList.forEach((movement: QatarMovementStatusList) => {
      const shipmentMilestoneEvent: ShipmentMilestoneEvent = {
        code: movement.movementStatus,
        date: Date.parse(movement.eventDate),
        location: movement.eventAirport,
        pieces: movement.shipmentPieces,
        weight: movement.shipmentWeight,
        volume: movement.shipmentVolume
      };
      shipmentMilestoneEvents.push(shipmentMilestoneEvent);
    });

    const departureAirport: Airport | undefined = loader.AirportData.find((a) => a.IATACode === cargoTrackingSo.origin);
    const arrivalAirport: Airport | undefined = loader.AirportData.find(
      (a) => a.IATACode === cargoTrackingSo.destination
    );

    const bookingDeparture: AirportShort = {
      code: cargoTrackingSo.origin,
      name: departureAirport?.Name ?? '',
      city: departureAirport?.City ?? '',
      country: departureAirport?.Country ?? '',
      latitude: Number(departureAirport?.Latitude ?? 0),
      longitude: Number(departureAirport?.Longitude ?? 0)
    };
    const bookingArrival: AirportShort = {
      code: cargoTrackingSo.destination,
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
        airwayBillNumber: airwayBillNumber,
        origin: cargoTrackingSo.origin,
        originInfo: bookingDeparture,
        destination: cargoTrackingSo.destination,
        destinationInfo: bookingArrival,
        toa: 0,
        lat: 0,
        status: '?',
        productType: '?',
        flightPlan: {
          schedules: schedules
        },
        weight: cargoTrackingSo.weight,
        volume: cargoTrackingSo.volume,
        numberOfPieces: cargoTrackingSo.pieces,
        milestoneEvents: shipmentMilestoneEvents
      }
    };

    return shipmentInfo;
  }
}

export default QatarApi;
