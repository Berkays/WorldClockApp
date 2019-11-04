import * as React from 'react';
import { DeviceEventEmitter, TextStyle, View, ViewStyle, SafeAreaView, ActivityIndicator, Platform } from 'react-native';
import { Screen } from '../../components/screen';
import { Text } from '../../components/text';
import { Button } from '../../components/button';
import { Wallpaper } from '../../components/wallpaper';
import { Header } from '../../components/header';
import { color, spacing } from '../../theme';
import { getBlutoothStore } from '../../services/Bluetooth/BLE';
import { ListItem } from 'react-native-elements';
import TouchableScale from 'react-native-touchable-scale';
import { withNavigation, NavigationScreenProps } from 'react-navigation';
import { State } from 'react-native-ble-plx';
import { ProgressDialog } from 'react-native-simple-dialogs';
import { BulletItem } from '../../components/bullet-item';
import LocationServicesDialogBox from 'react-native-android-location-services-dialog-box';

const FULL: ViewStyle = { flex: 1 };
const CONTAINER: ViewStyle = {
    backgroundColor: color.transparent,
    paddingHorizontal: spacing[4],
};
const SEARCH: ViewStyle = {
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[4],
    backgroundColor: '#5D2555',
};
const SEARCH_DISABLED: ViewStyle = {
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[4],
    backgroundColor: '#5D2555',
    opacity: 0.65,
};
const BOLD: TextStyle = { fontWeight: 'bold' };
const SEARCH_TEXT: TextStyle = {
    ...BOLD,
    fontSize: 13,
    letterSpacing: 2,
};
const HEADER: TextStyle = {
    paddingTop: spacing[3],
    paddingBottom: spacing[5] - 1,
    paddingHorizontal: 0,
};
const HEADER_TITLE: TextStyle = {
    ...BOLD,
    fontSize: 12,
    lineHeight: 15,
    textAlign: 'center',
    letterSpacing: 1.5,
};
const TITLE: TextStyle = {
    ...BOLD,
    fontSize: 28,
    lineHeight: 38,
    textAlign: 'center',
    marginBottom: spacing[3],
    paddingTop: spacing[5],
};
const FOOTER_CONTENT: ViewStyle = {
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[4],
};
const NO_DEVICE: TextStyle = {
    ...BOLD,
    fontSize: 18,
    letterSpacing: 1,
    paddingTop: spacing[6],
    textAlignVertical: 'center',
    textAlign: 'center',
};

interface IBLEDevice {
    id?: string;
    name: string;
    status: string;
}

interface IDevicesScreenState {
    isBluetoothEnabled: boolean;
    isLocationEnabled: boolean;
    isScanning: boolean;
    isConnecting: boolean;
    devices?: IBLEDevice[];
}

interface ILocationState {
    alreadyEnabled: boolean;
    enabled: boolean;
    status: string;
}

export interface IDevicesScreenProps extends NavigationScreenProps<{}> { }

const skipToDetails = true;

export class DevicesScreen extends React.Component<IDevicesScreenProps, IDevicesScreenState> {

    constructor(props: IDevicesScreenProps) {
        super(props);
        this.state = {
            isBluetoothEnabled: false,
            isLocationEnabled: false,
            isScanning: false,
            isConnecting: false,
            devices: [{
                name: 'Device 1',
                status: 'Connected',
            },
            {
                name: 'Device 2',
                status: 'Unpaired',
            },
            {
                name: 'Device 3',
                status: 'Unpaired',
            },
            {
                name: 'Device 4',
                status: 'Unpaired',
            }],
        };

        if (skipToDetails) {
            this.props.navigation.navigate('details');
            return;
        }

        this.checkLocationAccess();
        const bt = getBlutoothStore();
        bt.getState().then(state => this.onBluetoothStateChange(state));
        bt.onStateChangeEvent = this.onBluetoothStateChange;
    }

    public componentWillUnmount() {
        const bt = getBlutoothStore();
        bt.onStateChangeEvent = null;
        LocationServicesDialogBox.stopListener();
    }

    public onBluetoothStateChange = (state: State) => {
        console.log(state);
        if (state == State.Resetting)
            return;
        this.setState({ isBluetoothEnabled: state == State.PoweredOn });
        if (this.state.isBluetoothEnabled && this.state.isLocationEnabled && !this.state.isScanning && !this.state.isConnecting)
            this.searchDevices();
    }

    public onLocationStateChange = (status: ILocationState) => {
        this.setState({ isLocationEnabled: status.enabled });
        if (this.state.isLocationEnabled && this.state.isBluetoothEnabled && !this.state.isConnecting && !this.state.isScanning)
            this.searchDevices();
    }

    public checkLocationAccess = () => {
        const instance = this;
        LocationServicesDialogBox.checkLocationServicesIsEnabled({
            message: '<h3 style=\'color: #0af13e\'>Enable Location Services?</h3>Bluetooth functionality requires location services to be enabled.<br/>',
            ok: 'Allow',
            cancel: 'Cancel',
            enableHighAccuracy: false,
            showDialog: true,
            openLocationServices: true,
            preventOutSideTouch: false,
            preventBackClick: false,
            providerListener: true,
        }).then(function (success: ILocationState) {
            instance.onLocationStateChange(success);
        }).catch((error: any) => {
            instance.onLocationStateChange({ alreadyEnabled: false, enabled: false, status: 'disabled' });
        });
        DeviceEventEmitter.addListener('locationProviderStatusChange', this.onLocationStateChange);
    }

    public searchDevices = async () => {
        if (!this.state.isBluetoothEnabled || !this.state.isLocationEnabled)
            return;
        this.setState({ devices: [] });
        const bt = getBlutoothStore();

        try {
            this.setState({ isScanning: true });
            await bt.searchDevices();
            this.setState({ isScanning: false });
        }
        catch (err) {
            this.setState({ isScanning: false });
            console.log(err);
        }
    }

    public connectDevice = (index: number) => {
        this.setState({ isConnecting: true });
        console.log('Pressed');
        console.log(index);
        // chooseDevice(index);
        this.props.navigation.navigate('details');
        this.setState({ isConnecting: false });
    }

    public renderList = () => {
        if (!this.state.isBluetoothEnabled) {
            return <Text style={NO_DEVICE} text='Bluetooth is disabled.' />;
        }
        if (!this.state.isLocationEnabled) {
            return <Text style={NO_DEVICE} text='Location services is disabled.' />;
        }
        if (this.state.isScanning) {
            return <ActivityIndicator style={NO_DEVICE} size='large' color='#ffffff' animating={this.state.isScanning} />;
        }
        if (this.state.devices.length == 0) {
            return <Text style={NO_DEVICE} text='No devices found.'></Text>;
        }
        return this.state.devices.map((item, index) => <ListItem
            key={index}
            leftAvatar={{ source: { uri: 'https://i.ibb.co/47GZgSV/clock.png' }, rounded: true }}
            title={item.name}
            containerStyle={{ borderRadius: 10, height: 70 }}
            subtitle={item.status}
            onPress={() => { this.connectDevice(index); }}
            bottomDivider
            chevron={{ color: 'black' }}
            style={{ marginBottom: 9 }}
            Component={TouchableScale}
            friction={15}
            tension={500}
            activeScale={0.90}
        />,
        );
    }

    public renderSearchBtn = () => {
        let btnStyle = SEARCH;
        let btnText = 'Refresh device list';
        let btnDisabled = false;
        if (this.state.isBluetoothEnabled) {
            if (this.state.isScanning) {
                btnStyle = SEARCH_DISABLED;
                btnDisabled = true;
                btnText = 'Refreshing...';
            }
            if (!this.state.isLocationEnabled) {
                return <React.Fragment>
                    <Header
                        headerText='Enable location services to scan devices'
                        style={HEADER}
                        titleStyle={HEADER_TITLE} />
                    <Button
                        style={SEARCH}
                        textStyle={SEARCH_TEXT}
                        text={'Enable location services'}
                        onPress={this.checkLocationAccess}
                    />
                </React.Fragment>;
            }

            return <React.Fragment>
                <Header
                    headerText='Tap a device to connect'
                    style={HEADER}
                    titleStyle={HEADER_TITLE} />
                <Button
                    style={btnStyle}
                    textStyle={SEARCH_TEXT}
                    text={btnText}
                    onPress={this.searchDevices}
                    disabled={btnDisabled}
                />
            </React.Fragment>;
        }
        else {
            return <React.Fragment>
                <Header
                    headerText='Enable bluetooth to scan devices'
                    style={HEADER}
                    titleStyle={HEADER_TITLE} />
                <Button
                    style={SEARCH_DISABLED}
                    textStyle={SEARCH_TEXT}
                    text={btnText}
                    disabled={true}
                />
            </React.Fragment>;
        }
    }

    public render() {
        return (
            <View style={FULL}>
                <ProgressDialog
                    visible={this.state.isConnecting}
                    dialogStyle={{ borderRadius: 10 }}
                    animationType='slide'
                    activityIndicatorSize='large'
                    title='Connecting'
                    message='Please, wait...'
                />
                <Wallpaper />
                <Screen style={CONTAINER} preset='scroll' backgroundColor={color.transparent}>
                    <Text style={TITLE} preset='header' text='Device discovery' />
                    <BulletItem text='Make sure the device is powered on.' />
                    <BulletItem text='Enable bluetooth by pushing the BT button on device.' />
                    {this.renderList()}
                </Screen>
                <SafeAreaView>
                    <View
                        style={{
                            borderBottomColor: '#be5baf',
                            borderBottomWidth: 2,
                        }}
                    />
                    <View style={FOOTER_CONTENT}>
                        {this.renderSearchBtn()}
                    </View>
                </SafeAreaView>
            </View>
        );
    }
}

export default withNavigation(DevicesScreen);
