import { ConnectionOptions, ScanOptions } from 'react-native-ble-plx';

export const scanOptions: ScanOptions = {
    allowDuplicates: false,
};

export const connectionOptions: ConnectionOptions = {
    autoConnect: false,
    timeout: 5000,
};
