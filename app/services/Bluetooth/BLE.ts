import { BleManager, Device, State } from 'react-native-ble-plx';

let bluetoothStore: Bluetooth;
export function getBlutoothStore() {
    if (!bluetoothStore) {
        bluetoothStore = new Bluetooth();
    }

    return bluetoothStore;
}

export interface IStatus {
    ok: boolean;
    power: boolean;
    brightness: number;
    time: Date;
    name: string;
}

export class Bluetooth {
    public manager: BleManager = null;
    public devices: Map<string, Device>;
    public activeDevice: Device = null;
    public isConnected: boolean = false;

    public onStateChangeEvent: (state: State) => void;

    public readonly SERVICE_UUID: string = '1800';
    public readonly CHARACTERISTIC_UUID: string = '1800';
    public readonly SCAN_TIMEOUT: number = 5000;

    constructor() {
        this.manager = new BleManager();
        this.manager.onStateChange((state) => {
            if (this.onStateChangeEvent)
                this.onStateChangeEvent(state);
        });
    }

    public async getState(): Promise<State> {
        if (this.manager)
            return await this.manager.state();
        else
            return State.PoweredOff;
    }

    public async searchDevices(): Promise<boolean> {
        console.log('Scanning devices');
        try {
            const state = await this.getState();
            if (state != State.PoweredOn)
                return false;

            this.manager.startDeviceScan([this.SERVICE_UUID], {
                allowDuplicates: false,
            }, (error, device) => {
                if (error) {
                    console.log(error);
                    return;
                }
                if (this.devices.has(device.id) == false) {
                    this.devices.set(device.id, device);
                    console.log(device.name);
                }
            });
            await this.timeout(this.SCAN_TIMEOUT);
            this.manager.stopDeviceScan();
            return true;
        } catch (err) {
            console.log(err);
            return false;
        }
    }

    public async connectDevice(device: Device): Promise<boolean> {
        this.manager.stopDeviceScan();
        if (this.isConnected) {
            this.manager.cancelDeviceConnection(this.activeDevice.id);
            this.isConnected = null;
        }
        try {
            const connectedDevice = await this.manager.connectToDevice(device.id, { timeout: 10000 });
            if (connectedDevice) {
                this.isConnected = true;
                this.activeDevice = connectedDevice;
                await connectedDevice.discoverAllServicesAndCharacteristics();
                const data = Buffer.from('0F030101010116030001FF', 'hex');
                const characteristic = await connectedDevice.writeCharacteristicWithResponseForService(this.SERVICE_UUID, this.CHARACTERISTIC_UUID, data.toString('base64'));
                console.log(characteristic.value);
                await characteristic.read();
                console.log(characteristic.value);
                return true;
            } else {
                console.log('cant connect');
                this.isConnected = null;
                return false;
            }
        } catch
        {
            return false;
        }
    }

    public async sendCommand(command: string): Promise<IStatus> {
        try {
            if (this.activeDevice != null && this.isConnected == true) {
                const characteristic = await this.activeDevice.writeCharacteristicWithResponseForService(this.SERVICE_UUID, this.CHARACTERISTIC_UUID, command);
                await characteristic.read(); // Read response
                const response = this.parseResponse(characteristic.value);
                return response;
            } else {
                return null;
            }
        } catch
        {
            return null;
        }
    }

    private parseResponse(response: string): IStatus {
        
        return null;
    }

    private timeout(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
