import * as React from 'react';
import { View, ViewStyle, TextStyle, SafeAreaView, Platform } from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import { Text } from '../../components/text';
import { Screen } from '../../components/screen';
import { Wallpaper } from '../../components/wallpaper';
import { color, spacing } from '../../theme';
import { Divider, Button } from 'react-native-elements';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/Ionicons';
import DialogInput from 'react-native-dialog-input';
import TouchableScale from 'react-native-touchable-scale';
import { getBlutoothStore } from '../../services/Bluetooth/BLE';
import * as Command from '../../services/Bluetooth/Commands';
import { State } from 'react-native-ble-plx';

const FULL: ViewStyle = { flex: 1 };
const CONTAINER: ViewStyle = {
    backgroundColor: color.transparent,
    paddingHorizontal: spacing[4],
};
const TEXT: TextStyle = {
    color: color.palette.white,
    fontFamily: 'Montserrat',
};
const BOLD: TextStyle = { fontWeight: 'bold' };
const ITALIC: TextStyle = { fontStyle: 'italic' };
const TIME: TextStyle = {
    ...TEXT,
    textAlign: 'center',
    paddingTop: spacing[2],
    fontSize: 50,
};
const DATE: TextStyle = {
    ...TEXT,
    ...ITALIC,
    textAlign: 'center',
    paddingBottom: spacing[2],
    fontSize: 16,
};
const TITLE: TextStyle = {
    ...TEXT,
    ...BOLD,
    fontSize: 22,
    lineHeight: 28,
    marginBottom: spacing[4],
    paddingTop: spacing[4],
};
const SEARCH_TEXT: TextStyle = {
    ...BOLD,
    fontSize: 16,
    letterSpacing: 1.5,
};
const FOOTER_CONTENT: ViewStyle = {
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[4],
};
const GRID: ViewStyle = {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: 15,
};
const GRID_BTN: ViewStyle = {
    height: 80,
    aspectRatio: 1,
    borderWidth: 1,
    borderColor: color.palette.white,
    borderRadius: 10,
    justifyContent: 'flex-end',
    paddingBottom: 8,
    marginHorizontal: 5,
    marginBottom: 15,
};
const GRID_BTN_ICON: ViewStyle = {
    alignSelf: 'center',
    paddingBottom: 8,
};
const GRID_BTN_TEXT: TextStyle = {
    textAlign: 'center',
    fontSize: 12,
};

interface IDeviceDetailsScreenState {
    isLoading: boolean;
    device_name: string;
    device_name_prompt: boolean;
    device_date: Date;
    date_show: boolean;
    date_mode: string;
    device_led_power: boolean;
    device_led_brightness: number;
}

export interface IDetailsScreenProps extends NavigationScreenProps<{}> { }

export class DeviceDetailsScreen extends React.Component<IDetailsScreenProps, IDeviceDetailsScreenState> {

    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            device_name: 'Updating...',
            device_name_prompt: false,
            device_date: new Date(),
            date_show: false,
            date_mode: 'date',
            device_led_power: false,
            device_led_brightness: 50,
        };

        // this.bluetoothStatusHandler = setInterval(this.checkBluetoothState, 5000);
        const bt = getBlutoothStore();
        bt.onStateChangeEvent = this.onBluetoothStateChange;

        // this.getDeviceStatus();
    }

    public onBluetoothStateChange = (state: State) => {
        if (state == State.PoweredOn) {
            console.log('HELLO');
        }
        else if (state != State.Resetting) {
            console.log('isLoading...');
        }
    }

    public showDateTimePicker = (mode: string) => {
        this.setState({
            date_show: true,
            date_mode: mode,
        });
    }

    public datepicker = () => {
        this.showDateTimePicker('date');
    }

    public timepicker = () => {
        this.showDateTimePicker('time');
    }

    public setDate = async (event, date) => {
        if (event.type == 'dismissed')
            return;
        date = date || this.state.device_date;

        if (this.state.date_mode == 'date') {
            this.setState({ date_mode: 'time' });
            this.timepicker();
        }

        this.setState({
            date_show: Platform.OS === 'ios' ? true : false,
            device_date: date,
        });

        if (this.state.date_mode == 'time') {
            this.setState({ isLoading: true });
            const bt = getBlutoothStore();

            const setDate = this.state.device_date;
            const cmd = Command.setTime(
                setDate.getFullYear(),
                setDate.getMonth(),
                setDate.getDate(),
                setDate.getHours(),
                setDate.getMinutes(),
                setDate.getDay());
            const response = await bt.sendCommand(cmd);

            this.setState({
                isLoading: false,
                device_date: response.time,
            });
        }
    }

    public getTime = () => {
        return this.state.device_date.toTimeString().substr(0, 5);
    }

    public getDate = () => {
        return this.state.device_date.toLocaleDateString();
    }

    public togglePower = async () => {
        this.setState({ isLoading: true });
        const bt = getBlutoothStore();

        const cmd = Command.toggleLEDPower();
        const response = await bt.sendCommand(cmd);

        this.setState({
            isLoading: false,
            device_led_power: response.power,
        });
    }

    public setLedBrightness = async () => {
        this.setState({ isLoading: true });
        const bt = getBlutoothStore();

        let cmd = Command.getStatus();
        let response = await bt.sendCommand(cmd);

        let value = response.brightness + 25;
        if (value > 100)
            value = 25;

        cmd = Command.setLEDBrightness(value);
        response = await bt.sendCommand(cmd);

        this.setState({
            isLoading: false,
            device_led_brightness: response.brightness,
        });
    }

    public setDeviceName = async (value: string) => {
        this.setState({ isLoading: true });
        const bt = getBlutoothStore();

        const cmd = Command.setName(value);
        const response = await bt.sendCommand(cmd);

        this.setState({
            isLoading: false,
            device_name: response.name,
            device_name_prompt: false,
        });
    }

    public disableBT = async () => {
        this.setState({ isLoading: true });
        const bt = getBlutoothStore();

        const cmd = Command.setDisableBT();
        await bt.sendCommand(cmd);

        this.setState({
            isLoading: false,
        });

        this.props.navigation.goBack(null);
    }

    public getDeviceStatus = () => {
        // this.setState({isLoading: true});
        const bt = getBlutoothStore();
        const cmd = Command.getStatus();
        console.log('CMD: ' + cmd);
        // const response = await bt.sendCommand(cmd);
        this.setState({
            isLoading: false,
            // device_date: response.time,
            // device_led_brightness: response.brightness,
            // device_led_power: response.power,
        });
    }

    public showSetName = () => {
        this.setState({
            device_name_prompt: true,
        });
    }

    public closeSetName = () => {
        this.setState({
            device_name_prompt: false,
        });
    }

    public componentWillUnmount() {
        const bt = getBlutoothStore();
        bt.onStateChangeEvent = null;
    }

    public renderDatePicker = () => {
        return this.state.date_show && <DateTimePicker value={this.state.device_date}
            mode={this.state.date_mode as any}
            display='default'
            onChange={this.setDate} />;
    }

    public renderSetName = () => {
        return <DialogInput isDialogVisible={this.state.device_name_prompt}
            title={'Set device name'}
            message={''}
            hintInput={'Device Bluetooth Name'}
            submitInput={(inputText: string) => { this.setDeviceName(inputText); }}
            closeDialog={() => { this.closeSetName(); }}>
        </DialogInput>;
    }

    public render() {
        return (
            <View style={FULL}>
                <Wallpaper />
                <Screen style={CONTAINER} preset='scroll' backgroundColor={color.transparent}>
                    {this.renderSetName()}
                    <Text style={TITLE} preset='header'>Device: {this.state.device_name}</Text>
                    <Divider />
                    <Text style={TIME} preset='header' text={this.getTime()} />
                    <Text style={DATE} text={this.getDate()} />
                    <View style={GRID}>
                        <TouchableScale style={GRID_BTN} onPress={this.datepicker}>
                            <Icon name='ios-calendar' size={28} color='#FFF' style={GRID_BTN_ICON} />
                            <Text style={GRID_BTN_TEXT}>Date</Text>
                        </TouchableScale>
                        <TouchableScale style={GRID_BTN} onPress={this.showSetName}>
                            <Icon name='ios-pricetag' size={28} color='#FFF' style={GRID_BTN_ICON} />
                            <Text style={GRID_BTN_TEXT}>Name</Text>
                        </TouchableScale>
                        <TouchableScale style={GRID_BTN} onPress={this.disableBT}>
                            <Icon name='ios-bluetooth' size={28} color='#FFF' style={GRID_BTN_ICON} />
                            <Text style={GRID_BTN_TEXT}>Bluetooth</Text>
                        </TouchableScale>
                        <TouchableScale style={GRID_BTN} onPress={this.setLedBrightness}>
                            <Icon name='ios-sunny' size={28} color='#FFF' style={GRID_BTN_ICON} />
                            <Text style={GRID_BTN_TEXT}>{this.state.device_led_brightness}%
                            </Text>
                        </TouchableScale>
                        <TouchableScale style={GRID_BTN} onPress={this.togglePower}>
                            <Icon name='ios-power' size={28} color='#FFF' style={GRID_BTN_ICON} />
                            <Text style={GRID_BTN_TEXT}>Power</Text>
                        </TouchableScale>
                        <TouchableScale style={GRID_BTN}><Text style={GRID_BTN_TEXT}>Test</Text></TouchableScale>
                    </View>
                </Screen>
                <SafeAreaView>
                    <View style={FOOTER_CONTENT}>
                        <Button
                            title='Get status'
                            titleStyle={SEARCH_TEXT}
                            type='outline'
                            raised
                        />
                    </View>
                </SafeAreaView>
                {this.renderDatePicker()}
            </View>
        );
    }
}
