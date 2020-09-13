import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import ShipmentInfo from '../../types/shipmentInfo';

abstract class ApiIntegration {
  token = '';
  tokenExpiresAt: number = Date.now();
  clientId: string;
  clientSecret: string;
  axiosInstance: AxiosInstance;

  constructor(clientId: string, clientSecret: string, axiosConfig: AxiosRequestConfig) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.axiosInstance = axios.create(axiosConfig);
    this.setAxiosInstanceInterceptors();
  }

  protected abstract authorize(): Promise<boolean>;
  public abstract getShipmentInfo(airwayBillNumber: string): Promise<ShipmentInfo>;

  private setAxiosInstanceInterceptors() {
    this.axiosInstance.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        console.log(error);
        return error;
      }
    );
  }

  public isAuthorized(): boolean {
    if (this.token === '' || this.tokenExpiresAt < Date.now()) {
      return false;
    }
    return true;
  }
}

export default ApiIntegration;
