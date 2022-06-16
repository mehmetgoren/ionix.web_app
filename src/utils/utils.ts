import { PublishService } from 'src/utils/services/websocket_services';
import { SourceModel } from 'src/utils/models/source_model';
import axios from 'axios';
import { StoreService } from 'src/utils/services/store_service';
import {LocalService} from 'src/utils/services/local_service';


export function parseQs(qs = window.location.search): any {
  const urlSearchParams = new URLSearchParams(qs);
  const ret:any = {};
  const arr  = urlSearchParams.entries().next().value;
  ret[arr[0].replace('node?', '')] = arr[1];
  return ret;
}

export function myDateToJsDate(dateString: string): Date {
  if (dateString) {
    const splits = dateString.split('_');
    if (splits.length && splits.length > 5) {
      const year = parseInt(splits[0]);
      const month = parseInt(splits[1]);
      const day = parseInt(splits[2]);
      const hour = parseInt(splits[3]);
      const minute = parseInt(splits[4]);
      const second = parseInt(splits[5]);
      return new Date(year, month, day, hour, minute, second);
    }
  }
  return new Date(0);
}

export function fixArrayDates(list: any[], ...fields: string[]) {
  list.forEach(item => {
    fields.forEach(field => {
      if (item[field]) {
        item[field] = myDateToJsDate(item[field]);
      }
    });
  });
}

export function getTodayString(separator = '_') {
  const today = new Date();
  const month = today.getMonth() + 1;
  let monthStr = month.toString();
  if (month < 10) {
    monthStr = '0' + monthStr;
  }
  const day = today.getDate();
  let dayStr = day.toString();
  if (day < 10) {
    dayStr = '0' + dayStr;
  }
  return `${today.getFullYear()}${separator}${monthStr}${separator}${dayStr}`;
}

export function getCurrentHour(){
  const today = new Date();
  const hour = today.getHours();
  let hourStr = hour.toString();
  if (hour < 10) {
    hourStr = '0' + hourStr;
  }
  return hourStr;
}

export function isNullOrUndefined(val: any) {
  return val === undefined || val === null;
}

export function isNullOrEmpty(val: string | undefined | null) {
  //@ts-ignore
  return isNullOrUndefined(val) ? true : val.length === 0;
}

export function startStream(storeService: StoreService, publishService: PublishService, source: SourceModel) {
  if (isNullOrEmpty(source?.id)) {
    console.error('invalid source object. Streaming request will not ben sent');
    return;
  }
  storeService.setSourceLoading(<string>source.id, true);
  publishService.publishStartStream(source).then(() => {
    console.log('stream request has been started');
  }).catch((err) => {
    console.log('stream request had an error: ' + err);
  });
}

export function createEmptyBase64Image(): string {
  return 'R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=';
}

export function downloadFile(url: string, fileName: string, fileType: string) {
  axios({
    url: url,
    method: 'GET',
    responseType: 'blob' // important
  }).then((response: any) => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('downloadjs')(response.data, fileName, fileType);
  }).catch(console.error);
}

export function parseIP(address: string): string | null {
  const r = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/; //http://www.regular-expressions.info/examples.html
  const results = address.match(r);
  if (results && results.length) {
    return results[0];
  }
  return null;
}

export function checkIpIsLoopBack(ip: string): boolean {
  if (isNullOrEmpty(ip)) {
    return false;
  }
  const re = /^(127\.[\d.]+|[0:]+1|localhost)$/;
  return ip.match(re) !== null;
}

export function deepCopy(source: any): any {
  if (!source) {
    return source;
  }
  return JSON.parse(JSON.stringify(source));
}

export function isFrDirNameValid(name: string): boolean{
  const re = '/^[^\s^\x00-\x1f\\?*:"";<>|\/.][^\x00-\x1f\\?*:"";<>|\/]*[^\s^\x00-\x1f\\?*:"";<>|\/.]+$/g';
  return name.match(re) === null;
}

export function generateHtmlColor(): string {
  return '#'+(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0');
}

export async function userLogout(localService: LocalService, storeService: StoreService, router: any){
  localService.setCurrentUser(null);
  storeService.setCurrentUser(null);
  await router.push('/');
  setTimeout(() => {
    window.location.reload();
  }, 250);
}
