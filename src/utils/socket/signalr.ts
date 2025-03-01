import { HubConnection, HubConnectionBuilder, HttpTransportType } from '@microsoft/signalr';
import { toast } from 'react-toastify';
// import { IBidInfo, IBidInfosResponse } from './types';

type SignalRParams = {
  url: string;
};

// type ReceiveDataType = IBidInfo | IBidInfosResponse;

type HandlerFn = (data: any) => void;

const messageType: Array<string> = [
  'ReceivePointsProduce',
  'ReceiveUserBalanceProduce',
  'RequestUserBalanceProduce',
];

export default class SignalR {
  public connection: HubConnection | null;
  private url: string;
  private handlerMap: Map<string, Array<HandlerFn>>;

  get connectionState() {
    return this.connection?.state;
  }

  constructor({ url }: SignalRParams) {
    this.url = url;
    this.connection = new HubConnectionBuilder()
      .withUrl(this.url, {
        skipNegotiation: true,
        transport: HttpTransportType.WebSockets,
      })
      .withAutomaticReconnect([0, 2000, 5000, 5000, 5000, 10000, 10000, 10000])
      .build();
    this.handlerMap = new Map();
  }

  initAndStart = () => {
    this.connection?.onclose((err) => {
      console.log('signalR---onclose', err);
    });

    this.connection?.onreconnecting((err) => {
      console.log('signalR---onreconnecting', err);
    });

    this.connection?.onreconnected(() => {
      console.log('signalR---onreconnected');
    });
    console.log('signalR---initAndStart');
    this.listen();

    return new Promise((resolve, reject) => {
      this.connection
        ?.start()
        .then(() => {
          resolve(this.connection);
        })
        .catch((e) => {
          toast.error('The establishment of a WebSocket connection with the service failed.');
          console.log('signalR---initAndStart---err', e);
          reject(e);
        });
    });
  };

  listen = () => {
    try {
      messageType.length &&
        messageType.forEach((name) => {
          this.connection?.on(name, (data) => {
            this.dispatchMessage(name, data);
          });
        });
    } catch (err) {
      console.log('listen err', err);
    }
  };

  registerHandler = (message: string, handler: HandlerFn) => {
    try {
      const handlers = this.handlerMap.get(message);
      if (handlers) {
        this.handlerMap.set(message, [...handlers, handler]);
      } else {
        this.handlerMap.set(message, [handler]);
      }
    } catch (err) {
      console.log('registerHandler err', err);
    }
  };

  unRegisterHandler = (message: string, handler: HandlerFn) => {
    try {
      const handlers = this.handlerMap.get(message);
      if (handlers) {
        this.handlerMap.set(
          message,
          handlers.filter((fn) => fn !== handler),
        );
      }
    } catch (err) {
      console.log('unsubscribe err', err);
    }
  };

  dispatchMessage = (message: string, data: any) => {
    try {
      const handlers = this.handlerMap.get(message);
      handlers &&
        handlers.forEach((handler) => {
          handler(data);
        });
    } catch (err) {
      console.log('dispatchMessage err', err);
    }
  };

  sendEvent = (name: string, ...rest: any[]) => {
    try {
      if (this.connection?.state === 'Connected') {
        if (rest.length === 0) {
          return this.connection.invoke(name);
        } else if (rest.length === 1) {
          return this.connection.invoke(name, rest[0]);
        } else if (rest.length === 2) {
          return this.connection.invoke(name, rest[0], rest[1]);
        } else if (rest.length === 3) {
          return this.connection.invoke(name, rest[0], rest[1], rest[2]);
        } else {
          console.log('too much params');
          return null;
        }
      } else {
        console.log('Connection is not in a connected state');
        return null;
      }
    } catch (err) {
      console.log('subscribeEvent err', err);
      return null;
    }
  };

  destroy(): void {
    this.handlerMap.clear();
    this.connection?.stop();
  }
}
