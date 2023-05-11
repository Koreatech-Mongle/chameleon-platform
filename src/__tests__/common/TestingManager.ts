import axios from 'axios';
import PlatformServer from '../../server/core/PlatformServer';
import {wrapper} from 'axios-cookiejar-support';
import {CookieJar} from 'tough-cookie';
import {PlatformAPI} from '../../platform/PlatformAPI';
import * as FormData from 'form-data';

export class TestingManager {
    static async init() {
        PlatformServer.loadConfig();
        PlatformServer.init({});
        await PlatformServer.initializeDB(true);
        PlatformAPI.instance = wrapper(axios.create({
            baseURL: 'http://localhost:' + PlatformServer.config.httpPort,
            timeout: 3000, jar: new CookieJar()
        }));

        PlatformAPI.toFormData = (data: any) => {
            const formData = new FormData();
            Object.entries(data).forEach(([name, value]: [string, any]) =>
                Array.isArray(value) ? value.forEach(v => formData.append(name, v)) : formData.append(name, value)
            );
            return formData as any;
        };
    }
}

