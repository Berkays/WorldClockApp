import { Buffer } from 'buffer';

const START_SIGNAL: number = 0x0F;
const TERMINATE_SIGNAL: number = 0xFF;

const CMD_SET_LED_PWR: number = 0x01;
const CMD_SET_BRIGHTNESS: number = 0x02;
const CMD_SET_TIME: number = 0x03;
const CMD_SET_DISABLE_BT: number = 0x04;
const CMD_SET_NAME: number = 0x05;
const CMD_GET_STATUS: number = 0x06;

const statusCommand = new Uint8Array([START_SIGNAL, CMD_GET_STATUS, TERMINATE_SIGNAL]);

export function toggleLEDPower(): string {
    const data = new Uint8Array(4);
    data[0] = START_SIGNAL;
    data[1] = CMD_SET_LED_PWR;
    data[data.length - 1] = TERMINATE_SIGNAL;

    return Buffer.from(data).toString('base64');
}

export function setLEDBrightness(value: number): string {
    const data = new Uint8Array(4);
    data[0] = START_SIGNAL;
    data[1] = CMD_SET_BRIGHTNESS;
    data[2] = value;
    data[data.length - 1] = TERMINATE_SIGNAL;

    return Buffer.from(data).toString('base64');
}

export function setTime(year: number, month: number, date: number, hour: number, minute: number, dayOfWeek: number): string {
    const data = new Uint8Array(10);
    data[0] = START_SIGNAL;
    data[1] = CMD_SET_TIME;
    data[2] = year;
    data[3] = month;
    data[4] = date;
    data[5] = hour;
    data[6] = minute;
    data[7] = 0;
    data[8] = dayOfWeek;
    data[data.length - 1] = TERMINATE_SIGNAL;

    return Buffer.from(data).toString('base64');
}

export function setDisableBT(): string {
    const data = new Uint8Array(3);
    data[0] = START_SIGNAL;
    data[1] = CMD_SET_DISABLE_BT;
    data[data.length - 1] = TERMINATE_SIGNAL;

    return Buffer.from(data).toString('base64');
}

export function setName(name: string): string {
    const nameBuffer = new Buffer(name);
    const data = new Uint8Array(nameBuffer.byteLength + 3);
    data[0] = START_SIGNAL;
    data[1] = CMD_SET_NAME;
    for (let index = 0; index < nameBuffer.length; index++) {
        data[index + 2] = nameBuffer.readUInt8(index);
    }
    data[data.length - 1] = TERMINATE_SIGNAL;

    return Buffer.from(data).toString('base64');
}

export function getStatus(): string {
    return Buffer.from(statusCommand).toString('base64');
}
