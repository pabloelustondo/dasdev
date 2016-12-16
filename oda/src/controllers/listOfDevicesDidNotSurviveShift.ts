/**
 * Created by vdave on 11/30/2016.
 */
import {Route, Get, Post, Delete, Patch, Example} from 'tsoa';
import {SDS} from '../models/user';
// import * as https from 'https';
const config = require('../../appconfig.json');
import * as querystring from 'querystring';

import * as rp from 'request-promise';
@Route('Devices')
export class CountDevicesNotSurvivedShiftController {
    /**
     * Number of devices that did not last the full shift for a given date, shift time, and shift duration.
     * If no dateAndShift field is provided, the default date of previous day with a shift starting at 00:00 UTC
     * is used as data and shift time.
     *
     *     The duration is a number representing the length of the shift in hours.
     *     Eg. A shift of 8 hours can be represented as 8, 8.0
     *     A shift of 7.5 hours can be represented as 7.5
     *
     *     The shiftStartTime field must be in date format YYYY-MM-DDTHH:MM:SS
     *     where YYYY-MM-DD = Year in 4 digits, followed by month, followed by day of the month
     *     T - A static string value
     *     HH:MM:SS - Hour, minute and seconds.
     *
     */

    @Get('Battery/Summary/ListOfDevicesNotSurvivedShift')
    @Example<any>({
        'createdAt': '2016-11-29T20:30:21.385Z',
        'metadata': [
            'CountDevicesNotLastedShift: Count of devices that did not last full shift',
            'TotalActiveDevices: Total devices active per day'
        ],
        'data': [
            {
                'DeviceId': 1,
                'BatteryChargeLevel': '[100,90,80,70,60,50,40,30,20,10,0,0,10,20,30,20]'
            },
            {
                'DeviceId': 2,
                'BatteryChargeLevel': '[100, 100, 100, 90, 90, 90, 90, 30, 0, 0, 0, 0, 10, 70, 30, 20]'
            },
            {
                'DeviceId': 3,
                'BatteryChargeLevel': '[100,90,80,70,60,50,40,30,20,10,0,0, 0, 0, 0, 0]'
            },
            {
                'DeviceId': 4,
                'BatteryChargeLevel': '[100, 70, 30, 10, 0, 0, 0, 0, 0, 0, 0, 0, 90, 0, 0, 0]'
            },
        ]
    })
    public async Get(duration: number, rowsSkip: number, rowsTake: number, shiftStartTime?: Date, ): Promise<SDS> {

        if (!shiftStartTime) {
            let todayDate = new Date();
            todayDate.setHours(todayDate.getHours() - todayDate.getHours() , 0 , 0 , 0);
            todayDate.setDate(todayDate.getDate() - 1);
            shiftStartTime = todayDate;
        }

        const xqs = {duration: duration, date : shiftStartTime};
        console.log(xqs);
        const xurl = 'https://' + config['aws-hostname'] + config['aws-deviceNotLasted'];

        const options: rp.OptionsWithUrl = {
            headers: {
                'x-api-key': config['aws-x-api-key']
            },
            json: true,
            method: 'GET',
            qs: xqs,
            url: xurl
        };

        let p = await rp(options); // request library used
        let mData = ['CountDevicesNotLastedShift: Count of devices that did not last full shift', 'TotalActiveDevices: Total devices active per day'];

        const user: SDS = {
            createdAt: new Date(),
            metadata: mData,
            data: p
        };

        return user;
    }
}
/**
 * Created by vdave on 12/14/2016.
 */
/**
 * Created by vdave on 12/16/2016.
 */