import { apiServerBase } from 'config';
import SignalR from './signalr';

class SignalRManager {
  private socket: SignalR | null = null;

  public constructor() {
    //
  }

  public async initSocket(): Promise<SignalR | null> {
    const signalR = new SignalR({ url: apiServerBase + '/api/app/push/dao' });
    try {
      await signalR.initAndStart();
      this.socket = signalR;
      console.log('SignalR initialized successfully.');
    } catch (e) {
      console.error('Error initializing SignalR:', e);
      this.socket = null; // Ensure that the socket remains null in case of failure
    }
    return this.socket;
  }

  public getSocket(): SignalR | null {
    return this.socket;
  }
}

const instance = new SignalRManager();
export default instance;
