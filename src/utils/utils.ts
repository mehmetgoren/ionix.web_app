import {PublishService} from 'src/utils/services/websocket_services';
import {SourceModel} from 'src/utils/models/source_model';
import axios from 'axios';
import {StoreService} from 'src/utils/services/store_service';
import {LocalService} from 'src/utils/services/local_service';
import {ProbeResult} from 'src/utils/models/various';
import {date} from 'quasar'
import Scrollbar from 'smooth-scrollbar';
import {GalleryLocationsService} from 'src/utils/services/gallery_locations_service';


export const localIp = '127.0.0.1';

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
      return new Date(year, Math.max(month - 1, 0), day, hour, minute, second);
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

export function getTodayString(separator = '_'): string {
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

export function getCurrentHour(): string {
  const today = new Date();
  const hour = today.getHours();
  let hourStr = hour.toString();
  if (hour < 10) {
    hourStr = '0' + hourStr;
  }
  return hourStr;
}

export function getAddedHour(addHour: number): string {
  const today = new Date();
  const currentHour = today.getHours();
  today.setHours(currentHour + addHour);
  const hour = today.getHours();
  let hourStr = hour.toString();
  if (hour < 10) {
    hourStr = '0' + hourStr;
  }
  return hourStr;
}

export function getPrevHourDatetime(prevHour: number, separator = '_') {
  const now = new Date();
  const prevHourDate = date.addToDate(now, {hours: -1 * prevHour})

  const month = prevHourDate.getMonth() + 1;
  let monthStr = month.toString();
  if (month < 10) {
    monthStr = '0' + monthStr;
  }
  const day = prevHourDate.getDate();
  let dayStr = day.toString();
  if (day < 10) {
    dayStr = '0' + dayStr;
  }

  const pvHour = prevHourDate.getHours();
  let hourStr = pvHour.toString();
  if (pvHour < 10) {
    hourStr = '0' + hourStr;
  }
  return `${prevHourDate.getFullYear()}${separator}${monthStr}${separator}${dayStr}${separator}${hourStr}`;
}

export function timeSince(date: Date, t: any): string {
  // @ts-ignore
  const seconds = Math.floor((new Date() - date) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) {
    return Math.floor(interval) + ' ' + t('years');
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    return Math.floor(interval) + ' ' + t('months');
  }
  interval = seconds / 86400;
  if (interval > 1) {
    return Math.floor(interval) + ' ' + t('days');
  }
  interval = seconds / 3600;
  if (interval > 1) {
    return Math.floor(interval) + ' ' + t('hours');
  }
  interval = seconds / 60;
  if (interval > 1) {
    return Math.floor(interval) + ' ' + t('minutes');
  }
  return Math.floor(seconds) + ' ' + t('seconds');
}

export function isNullOrUndefined(val: any) {
  return val === undefined || val === null;
}

export function isNullOrEmpty(val: string | undefined | null) {
  //@ts-ignore
  return isNullOrUndefined(val) ? true : val.length === 0;
}

export function parseQueryString(queryString: string = window.location.search): any {
  return new Proxy(new URLSearchParams(queryString), {
    get: (searchParams, prop) => searchParams.get(<any>prop),
  });
}

export function startStream(storeService: StoreService, publishService: PublishService, gls: GalleryLocationsService,  source: SourceModel) {
  if (isNullOrEmpty(source?.id)) {
    return;
  }
  gls.registerGsLocation(<string>source.id);
  storeService.setSourceLoading(<string>source.id, true);
  void publishService.publishStartStream(source);
}

export function stopStream(storeService: StoreService, publishService: PublishService, gls: GalleryLocationsService, source: SourceModel) {
  if (isNullOrEmpty(source?.id)) {
    return;
  }
  gls.removeGsLocation(<string>source.id);
  publishService.publishStopStream(source).then(() => {
    setTimeout(() =>{
      storeService.setNotifySourceStreamStatusChanged();
    }, 3000);
  }).catch(console.error);
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

export function downloadFile2(url: string) {
  const a: any = document.createElement('a');
  try {
    a.target = '_blank'
    a.href = url;
    a.download = url.substr(url.lastIndexOf('/') + 1);
    document.body.appendChild(a);
    a.click();
  } finally {
    document.body.removeChild(a);
  }
}

export function downloadObjectAsJson(exportObj: any, exportName:string){
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportObj));
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute('href',     dataStr);
  downloadAnchorNode.setAttribute('download', exportName + '.json');
  document.body.appendChild(downloadAnchorNode); // required for firefox
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}

export function parseIP(address: string | null | undefined): string | null {
  if (address === null || address === undefined) {
    return null;
  }
  if (address.indexOf('localhost') !== -1) {
    return 'localhost';
  }

  const r = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/; //http://www.regular-expressions.info/examples.html
  const results = address.match(r);
  if (results && results.length) {
    return results[0];
  }
  return null;
}


export function parsePort(address: string | null | undefined): number | null {
  if (address === null || address === undefined) {
    return null;
  }
  const r = /:\d{1,5}/;
  const results = address.match(r);
  if (results && results.length) {
    return parseInt(results[0].substring(1));
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

export function isFaceDirNameValid(name: string): boolean {
  const re = '/^[^\s^\x00-\x1f\\?*:"";<>|\/.][^\x00-\x1f\\?*:"";<>|\/]*[^\s^\x00-\x1f\\?*:"";<>|\/.]+$/g';
  return name.match(re) === null;
}

export function formatJson(json: string): string {
  return JSON.stringify(JSON.parse(json), null, '\t');
}

export function setupLocale(localService: LocalService, locale: any, $q: any) {
  let localeTemp: any = localService.getLang();
  if (!localeTemp) {
    localeTemp = $q.lang.getLocale();
    localService.setLang(localeTemp);
  }
  locale.value = localeTemp;
}

export function getImageSrc(locale: any) {
  if (locale.value === 'ar') {
    return 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KDTwhLS0gVXBsb2FkZWQgdG86IFNWRyBSZXBvLCB3d3cuc3ZncmVwby5jb20sIEdlbmVyYXRvcjogU1ZHIFJlcG8gTWl4ZXIgVG9vbHMgLS0+Cjxzdmcgd2lkdGg9IjgwMHB4IiBoZWlnaHQ9IjgwMHB4IiB2aWV3Qm94PSIwIDAgNjQgNjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIGFyaWEtaGlkZGVuPSJ0cnVlIiByb2xlPSJpbWciIGNsYXNzPSJpY29uaWZ5IGljb25pZnktLWVtb2ppb25lIiBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJ4TWlkWU1pZCBtZWV0Ij4KDTxjaXJjbGUgY3g9IjMyIiBjeT0iMzIiIHI9IjMwIiBmaWxsPSIjNjk5NjM1Ij4KDTwvY2lyY2xlPgoNPGcgZmlsbD0iI2ZmZmZmZiI+Cg08cGF0aCBkPSJNMzEuNyAyNi43Yy0uMS0uOS40LTEuOCAxLjMtMS42Yy43LjEgMS41LjggMS4xIDEuNWMtLjYgMS4xLTIuMiAxLjEtMy4yIDEuN2MuMS42IDMtLjEgMy41LS4xczEgLjIuNy44Yy0uMy42LTEuMy42LTEuOS43Yy0uNi4xLTEuNi4xLTEuOS42Yy0uNi44LjYuOSAxIDEuMWMxIC41LS42IDEtMSAuOWMtMS41LS4zLTEuOC0xLjEtMi43LTIuMWMtLjkgMS4yLTMuNyAzLjktNC4zIDEuMWMtMSAuNC0yIC45LTMuMSAxYy41LS43IDEuNS0xIDIuMy0xLjRjMS0uNSAxLTEuNCAxLjYtMi4yYy4yLjMgMCAuNy4xIDEuMWMuOC0uNCAxLjgtMS4yIDEuNC0yLjJjMC0uMS0xLjItMi41LS4yLTIuMWMuOS40LjYgMS4zLjggMmMuMyAxLjMtLjMgMi0xLjMgMi44Yy0uNC4zLTEuNSAxLjUtLjIgMS41Yy45IDAgMS43LTEgMi4yLTEuNmMuNi0uOC40LTEuNiAwLTIuNWMtLjMtLjctMS0yLjItLjEtMi43Yy43IDEuMSAxIDIuNCAxLjMgMy43Yy4yIDEuMS40IDIuMiAxLjYgMi41Yy0uMS0uOC40LTEuNCAxLjEtMS43Yy0uNS0uNC0zLjMuMS0yLjItMS40Yy4xLS43IDIuMS0xIDIuMS0xLjQiPgoNPC9wYXRoPgoNPHBhdGggZD0iTTE2LjQgMzAuNGMuNSAxLjQgMi4yLjkgMy4yLjVjMS42LS44IDEuNi0yIDEuNi0zLjZjLS42LjMtLjUgMS40LS43IDEuOWMtLjQuOC0xLjcgMS41LTIuNiAxLjRjLTEuMy0uMi0xLjktMi40LS45LTMuMmMuMi43LS4zIDIuMi45IDIuM2MuOS4xIDIuNy0xIDIuNC0yYy0xLjIuNC0xLjkgMC0xLjUtMS4zYy4zLTEuMiAxLjUtLjMgMiAuM2MxLjktMS4xLTEuNS01LjMuNS02LjRjLjQuNyAxIDEuNi41IDIuM2MtLjYuOCAwIDIuNS4xIDMuNGMxLS45LjIuNyAxIC44Yy41LjEuNy0xLjIgMS0xLjJjLjEuMy4xIDEuMi42IDEuMWMuNi0uMi0uMS0xIC41LTEuMmMuMi41LjEgMi0uNiAxLjljLS42LS4xLS41LS41LTEuMi0uMWMtLjYuMy0uOCAwLTEuMi0uM2MtLjEgMS4yLjMgMi41LS40IDMuNmMtLjYuOS0xLjggMS40LTIuOCAxLjZjLTIuNi41LTMuMy0yLjEtMi40LTQuMmMuMi42LS4yIDEuNyAwIDIuNCI+Cg08L3BhdGg+Cg08cGF0aCBkPSJNNDAuOCAzMC45Yy41IDEuMyAxLjUtMS40IDEuOC0xLjhjLjgtMS4yIDIgMS45IDIuNS0uMWMuMy0xLjMtLjEtMi42LS4yLTMuOWMtLjEtLjktLjQtMS43LTEtMi40Yy0uNi0uOC0xLjItMS41LS45LTIuNWMxIC40IDEgMS4yIDEuNSAyYy4xLS42LS4zLTEuNC4xLTEuOWMuNS0uNy45IDEuMi45IDEuNGMuMS41LS40LjctLjEgMS41Yy4yLjYuNiAxLjIgMSAxLjdjLS4xLS42LTEtNC43IDAtNC43Yy4zIDAgLjYgMS4yLjYgMS40Yy4yLjYtLjIgMS4xLS4yIDEuOGMtLjEgMS4yLjEgMi42LjkgMy41Yy40LjUgMS45IDIuMyAxLjEgMi45Yy0uNi0uNy0xLTEuNS0xLjUtMi4yYzAgLjguMiAxLjctLjIgMi4zYy0uNC0uMi0uMi0xLjUtLjItMS44YzAtMS4xLS43LTItMS4zLTIuOWMtLjIgMS41IDEgNC4zLS40IDUuNGMtLjkuOC0yLjEtMS0yLjQtLjNjLS4zLjUtMSAyLjMtMS44IDIuMWMtMS0uMi0xLjctMy0uNi0zLjNjLjEuNS4xIDEuMi40IDEuOCI+Cg08L3BhdGg+Cg08cGF0aCBkPSJNMTkuNCAyNC4xYy43LjEgMC0yLjMgMC0yLjdjLjEtLjQuNC0uNi42LS4yYy4zLjYuMyAxLjMuNCAxLjljMCAuNS4xIDEuMS0uMyAxLjVjLS42LjYtMS40LjMtMS43LS41Yy0xLjQgMS4yLjQgMy4zLS44IDQuNWMtLjItMS4xIDAtMi4zLS40LTMuM2MtLjItLjUtMS4xLS4zLTEuMi0xLjJjMC0uNC4zLTEuNS0uMS0xLjhjLS4yLjQtLjQgMy41LTEuNCAyLjZjLS44LS42LS42LTIuNi0uMy0zLjRjLjYuMy0uMSAyLjUuNyAyLjZjLjQuMS41LTEuNi42LTEuOWMuMy0uNSAxLjMtMS45IDEuMS0uNWMtLjEuNi0uNiAyLjUuNiAyLjRjLS4xLTEtLjItMi0uNC0zYy0uMS0uNS4yLTEuNS42LS42Yy4zLjYuMS45IDAgMS41Yy0uMS43LjIgMS40LjMgMmMuNi0uNS0uMi0yLjQuMy0zLjJjMS4yLjctLjEgMy4xIDEuNCAzLjMiPgoNPC9wYXRoPgoNPHBhdGggZD0iTTMyLjMgMjQuM2MtLjUuNy0xLjQuMS0xLjgtLjRjLS41LjYtMS41IDEuNi0yLjMuOGMtLjYtLjYuMS0xLjctLjQtMi4yYy0uMy41LS44IDIuOS0xLjcgMS44Yy0uNS0uNi0xLjItMi43LS4xLTMuMmMtLjEuOC0uMyAxLjcuMiAyLjRzMS0xLjEgMS4yLTEuNWMuMy0uNyAxLjMtMS45IDEuMS0uNGMtLjEuNi0uMyAyIC4zIDIuNGMuNC4zLjktLjIgMS4xLS41Yy40LS41LjItMS4zLjEtMS45Yy0uMS0uNS0uMy0xLjEgMC0xLjZjLjQtLjYuNy44LjcgMS4xYzAgLjMuNCAzLjQgMS4xIDIuNGMuNy0uOS0xLjItMi45LjEtMy40Yy41LS4yIDEuNCAxLjguNCAxLjJjLjMuOS43IDIuMiAwIDMiPgoNPC9wYXRoPgoNPHBhdGggZD0iTTM2LjEgMjUuNWMuMSAxLjMgMS4yIDQuOS0uMyA1LjdjLS4yLS40IDAtMSAuMS0xLjVjLjEtLjktLjEtMS44LS4yLTIuNmMtLjItMS45LS40LTMuMy0xLjctNC44Yy0uMy0uNC0uOC0uNy0uOS0xLjNjMC0uMi0uMS0xLjEuMy0uOWMuMy4xIDIgMS42IDEuMSAxLjZjLjEuMi41IDEgLjcgMWMwLS41LS42LTIgMC0yLjNjLjUtLjMgMS4xIDEuNi45IDJjLS4yLjUtLjIuOCAwIDEuNWMuMi44LjcgMS41IDEuMSAyLjJjLjYgMSAxLjggMi40IDEuNSAzLjdjLS42LS4zLTEtMS43LTEuMy0yLjNjLS4yLS41LS40LTEtLjctMS40Yy0uMS0uMS0uNy0uOS0uNi0uNHYtLjIiPgoNPC9wYXRoPgoNPHBhdGggZD0iTTUwIDI3LjRjLjEgMi4xLS42IDQuOC0zLjIgNC44YzAtLjYgMS4zLTEuMiAxLjctMS41YzEtLjguOS0yLjMuOC0zLjRjLS4xLTEuNS0uMi0zLS41LTQuNWMtLjEtLjktLjYtMi4yLjItMi44Yy41LjQgMS4yIDEuNS45IDEuOWMtLjUuNiAwIDUuMS4xIDUuNSI+Cg08L3BhdGg+Cg08cGF0aCBkPSJNMzcuMiAzMS45YzIuNi0xLjUgMS44LTQuNyAxLjYtNy4yYy0uMS0uNy0uMS0xLjQtLjItMi4xYzAtLjUtLjQtMS4yLS4yLTEuN2MuNS0xLjMuOS0uMSAxIC43Yy4xLjUtLjMuNi0uMiAxYy4xLjguMSAxLjYuMiAyLjRjLjEgMS4zLjMgMi42LjIgMy44Yy0uMiAxLjktMS4yIDQtMy41IDMuNmMuMS0uMi44LS4zIDEuMS0uNSI+Cg08L3BhdGg+Cg08cGF0aCBkPSJNNDEuNCAyNi45Yy4xIDEgLjUgMi44IDAgMy43Yy0uNC42LS40LS40LS41LS41Yy0uMS0uOC0uMS0xLjYtLjEtMi41Yy0uMi0yLjItLjktNC40LS45LTYuNWMwLTIuNyAyLjMgMS41IDEgMS4zYy4xIDEuNS4zIDMgLjUgNC41Ij4KDTwvcGF0aD4KDTxwYXRoIGQ9Ik0yNS4xIDIxLjhjLjIuNS0yLjMgMS44LTIuNiAxLjhjLS4xLS41IDEuMS0xLjIgMS40LTEuNGMuMy0uMy41LS4zLjQtLjdjLS4yLS40LS4xLTEuMS40LTEuM2MxLS4zLjMgMS4yLjQgMS42Ij4KDTwvcGF0aD4KDTxwYXRoIGQ9Ik0xNC44IDMwLjdjMCAuOC4zLjQuNy4yYy4yLjQtLjMgMS41LS44IDFjLS43LS43LS4xLTIuMy4yLTNjLjIuNS0uMiAxLjMtLjEgMS44Ij4KDTwvcGF0aD4KDTxwYXRoIGQ9Ik00MyAyNC41Yy4xLS40LS4yLS44LjEtMS4yYy40LS41LjguMS42LjNjLS4yLjItLjUtLjItLjUuNGMwIC4zLjIuOS0uMSAxLjJjLS4yLS4xLTEuMS0xLjQtMS0xLjZjLjQtLjQuOC44LjkuOSI+Cg08L3BhdGg+Cg08cGF0aCBkPSJNMTYuOSAyNi4yYy0uMi40LTIuNSAxLjctMi42IDEuNGMwLS4zIDIuOS0yIDIuNi0xLjQiPgoNPC9wYXRoPgoNPHBhdGggZD0iTTMzLjkgMzEuM2MtLjMuOSAxIC4xIDEuMyAwYy0uNC43LTEuOCAxLjMtMS42IDBjLS4xIDAtLjMuMS0uNC4xYy0uMi0uMiAxLTEgLjctLjEiPgoNPC9wYXRoPgoNPHBhdGggZD0iTTQ0LjggMzFjLjMgMCAuOC45LjUgMS4xYy0uMi4yLTEuMS4zLS42LS4xYy42LS42LjEtMSAuMS0xIj4KDTwvcGF0aD4KDTxwYXRoIGQ9Ik0zMC43IDI1LjljLjEtLjIuMS0uNS4yLS43YzEgLjgtMS42IDIuMS0xLjEuMmMuMi4yLjIuNS40LjZjMC0uMi4xLS41LjEtLjdjLjIuMi4yLjUuNC42Ij4KDTwvcGF0aD4KDTxwYXRoIGQ9Ik00Mi40IDI3LjJjLS4zLS40IDEuNS0xLjUgMS44LTEuN2MuMi4zLTEuMiAxLjQtMS44IDEuNyI+Cg08L3BhdGg+Cg08cGF0aCBkPSJNNDggMjMuMmMtLjItLjYtLjgtMS44LS4yLTIuM2MuNC4zLjYgMS44LjIgMi4zIj4KDTwvcGF0aD4KDTxwYXRoIGQ9Ik0zNy4xIDIxLjJjLS4xLS4yLS40LS40LS40LS43Yy4xLS40LjMtLjMuNS0uMWMuMy40LjUgMS41IDAgMS44YzAtLjMuMS0uNy0uMS0xIj4KDTwvcGF0aD4KDTxwYXRoIGQ9Ik0yNC45IDIzLjljMCAuNi0xIDEuMi0xLjEuNGMtLjEtLjMuNC0xLjQuNi0xLjFjLS40LjktLjQgMS4yLjUuNyI+Cg08L3BhdGg+Cg08cGF0aCBkPSJNMzcuNCAyMi44Yy40IDEgLjIuMS42LS4xYy43IDEuMy0xLjUgMS0xIC4yYy4xLjEuMi4zLjIuNGMuMS0uMS4xLS4zLjItLjUiPgoNPC9wYXRoPgoNPHBhdGggZD0iTTQzLjggMjcuNGMtLjUtLjQuMS0uOS40LS40Yy4yLjMuMiAxLjEtLjIgMS4zYzAtLjMuMS0uNy0uMi0uOSI+Cg08L3BhdGg+Cg08cGF0aCBkPSJNMjMuMyAyOS42YzAtLjItLjEtMS43LjItMS41Yy40LjIuMyAxLjMtLjIgMS41Ij4KDTwvcGF0aD4KDTxwYXRoIGQ9Ik0xOS4xIDIwLjJjLjEuMy4yLjcuNC4yYy44LjktMiAuNi0xLS4zYzAgLjEuMi43LjYuMSI+Cg08L3BhdGg+Cg08cGF0aCBkPSJNMjkuMyAyMi40YzAtLjQtLjYtMi4xLS4xLTIuMWMuNi4xLjUgMS42LjEgMi4xIj4KDTwvcGF0aD4KDTxwYXRoIGQ9Ik0xNS4zIDIxLjVjLS4zLS4xLjItLjYgMC0xYy0uMi4xLS40LS4yLS4yLS40Yy44LS42LjUgMS40LjIgMS40Ij4KDTwvcGF0aD4KDTxwYXRoIGQ9Ik00MS4yIDQxLjhsLS40LTEuMmwtLjQgMS4ySDE4LjVzLjIgMS44IDIuNCAxLjhoMTkuNFY0NWg1LjN2LTMuMmgtNC40bTMuNCAyLjRINDF2LTFoMy42djEiPgoNPC9wYXRoPgoNPC9nPgoNPC9zdmc+';
  }
  if (locale.value === 'tr-TR') {
    return 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGlkPSJmbGFnLWljb25zLXRyIiB2aWV3Qm94PSIwIDAgNjQwIDQ4MCI+CiAgPGcgZmlsbC1ydWxlPSJldmVub2RkIj4KICAgIDxwYXRoIGZpbGw9IiNlMzBhMTciIGQ9Ik0wIDBoNjQwdjQ4MEgweiIvPgogICAgPHBhdGggZmlsbD0iI2ZmZiIgZD0iTTQwNyAyNDcuNWMwIDY2LjItNTQuNiAxMTkuOS0xMjIgMTE5LjlzLTEyMi01My43LTEyMi0xMjAgNTQuNi0xMTkuOCAxMjItMTE5LjggMTIyIDUzLjcgMTIyIDExOS45eiIvPgogICAgPHBhdGggZmlsbD0iI2UzMGExNyIgZD0iTTQxMyAyNDcuNWMwIDUzLTQzLjYgOTUuOS05Ny41IDk1LjlzLTk3LjYtNDMtOTcuNi05NiA0My43LTk1LjggOTcuNi05NS44IDk3LjYgNDIuOSA5Ny42IDk1Ljl6Ii8+CiAgICA8cGF0aCBmaWxsPSIjZmZmIiBkPSJtNDMwLjcgMTkxLjUtMSA0NC4zLTQxLjMgMTEuMiA0MC44IDE0LjUtMSA0MC43IDI2LjUtMzEuOCA0MC4yIDE0LTIzLjItMzQuMSAyOC4zLTMzLjktNDMuNSAxMi0yNS44LTM3eiIvPgogIDwvZz4KPC9zdmc+Cg==';
  }
  return 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGlkPSJmbGFnLWljb25zLWdiIiB2aWV3Qm94PSIwIDAgNjQwIDQ4MCI+CiAgPHBhdGggZmlsbD0iIzAxMjE2OSIgZD0iTTAgMGg2NDB2NDgwSDB6Ii8+CiAgPHBhdGggZmlsbD0iI0ZGRiIgZD0ibTc1IDAgMjQ0IDE4MUw1NjIgMGg3OHY2Mkw0MDAgMjQxbDI0MCAxNzh2NjFoLTgwTDMyMCAzMDEgODEgNDgwSDB2LTYwbDIzOS0xNzhMMCA2NFYwaDc1eiIvPgogIDxwYXRoIGZpbGw9IiNDODEwMkUiIGQ9Im00MjQgMjgxIDIxNiAxNTl2NDBMMzY5IDI4MWg1NXptLTE4NCAyMCA2IDM1TDU0IDQ4MEgwbDI0MC0xNzl6TTY0MCAwdjNMMzkxIDE5MWwyLTQ0TDU5MCAwaDUwek0wIDBsMjM5IDE3NmgtNjBMMCA0MlYweiIvPgogIDxwYXRoIGZpbGw9IiNGRkYiIGQ9Ik0yNDEgMHY0ODBoMTYwVjBIMjQxek0wIDE2MHYxNjBoNjQwVjE2MEgweiIvPgogIDxwYXRoIGZpbGw9IiNDODEwMkUiIGQ9Ik0wIDE5M3Y5Nmg2NDB2LTk2SDB6TTI3MyAwdjQ4MGg5NlYwaC05NnoiLz4KPC9zdmc+Cg==';
}

export function toBase64(file: File): Promise<any>{
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

export function createTrDateLocale(): any {
  return {
    days: ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'],
    daysShort: ['Pzr', 'Pts', 'Sal', 'Çar', 'Per', 'Cum', 'Cts'],
    months: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'],
    monthsShort: ['Ock', 'Şbt', 'Mrt', 'Nsn', 'Mys', 'Hzn', 'Tmz', 'Ağs', 'Eyl', 'Ekm', 'Ksm', 'Arl']
  };
}

export function createLongDateLocale(): any {
  return { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
}

export function scrollbarInit(elemId: string): Scrollbar | null {
  const elm = document.querySelector('#' + elemId);
  if (elm) {
    //@ts-ignore
    return Scrollbar.init(elm)
  }
  return null;
}

export function isFullScreen(): boolean {
  return !window.screenTop && !window.screenY;
}

export function isMaximized(): boolean {
  const w = window.innerWidth / screen.availWidth;
  const h = window.innerHeight / screen.availHeight;
  return ((w + h) / 2.) > .94;
}

export function listenWindowSizeChangesForScrollBar(refHeight: any) {
  window.addEventListener('resize', function () {
    setTimeout(() => {
      const multiplier = .95;
      const isFoM = isFullScreen() || isMaximized();
      refHeight.value = (window.innerHeight * multiplier) - (isFoM ? 0 : 32);
    });
  }, true);
}

export async function databindWithLoading(loading: any, fn: () => Promise<void>) {
  loading.value = true;
  try {
    await fn();
  } finally {
    loading.value = false;
  }
}

export function validateModel<T>(t:any, empty: T, viewModel:T): string[]{
  const ret: string[] = [];
  for (const [field, value] of Object.entries(<any>empty)){
    if (!value || Array.isArray(value)) continue; // means nullable or array

    const typeName = typeof value;
    if (typeName === 'object'){
      //@ts-ignore
      const addItems = validateModel(t, empty[field], viewModel[field]);
      for(const item of addItems){
        ret.push(item);
      }
    }
    //@ts-ignore
    const viewValue = viewModel[field];
     switch (typeName){
       case 'string':
         if (!viewValue){
           ret.push(`${t('please_enter_value')} for ${t(field)}`);
         }
         break;
       case 'number':
         if (!viewValue){
           ret.push(`${t('please_enter_value')} for ${t(field)}`);
         }else if (isNaN(viewValue)){
           ret.push(`${t('please_enter_valid_number')} for ${t(field)}`);
         }
         break;
       case 'boolean':
         if (isNullOrUndefined(viewValue)){
           ret.push(`${t('please_enter_value')} for ${t(field)}`);
         }
         break;
     }
  }
  return ret;
}

export async function doUserLogout(localService: LocalService, storeService: StoreService, router: any) {
  localService.setCurrentUser(null);
  storeService.setCurrentUser(null);
  await router.push('/');
  setTimeout(() => {
    window.location.reload();
  }, 250);
}

export function findBestSettings(source: SourceModel, probeResult: ProbeResult): boolean {
  const f = probeResult.format;
  if (f.nb_streams < 1) {
    return false;
  }
  const hasAudio = f.nb_streams > 1;
  const v = probeResult.streams[0]; //video
  const fps = parseFloat(v.avg_frame_rate.split('/')[0]);
  if (f.format_name === 'rtsp') {
    source.rtsp_transport = 1; //TCP
  }
  source.ms_type = 1; //SRS Realtime
  source.stream_type = 0; //FLV
  // if (parseFloat(v.start_time) > 0.) {
  //   source.booster_enabled = true;
  // }
  // source.input_frame_rate = fps;
  source.stream_video_codec = 3; // copy
  source.preset = 1; // ultra fast
  // source.stream_frame_rate = fps;
  // source.stream_width = v.width;
  // source.stream_height = v.height;
  source.ffmpeg_reader_width = 1280;
  source.ffmpeg_reader_height = 720;
  source.ffmpeg_reader_frame_rate = fps;

  const a = hasAudio ? probeResult.streams[1] : null;
  const audioCodecs = hasAudio ? new LocalService().createAudioCodecs() : null;
  if (hasAudio) {
    // @ts-ignore
    for (const opt of audioCodecs) {
      if (opt.label.toLowerCase() === a?.codec_name) {
        source.stream_audio_codec = opt.value;
        break;
      }
    }
    source.stream_audio_channel = 0; //Source
    source.stream_audio_quality = 0; //Auto
    source.stream_audio_sample_rate = 0; //Auto
    source.stream_audio_volume = 100;
  }

  source.snapshot_frame_rate = 1.0;
  source.snapshot_width = 1280;
  source.snapshot_height = 720;

  source.record_file_type = 0; //MP4
  source.record_preset = 1; //ultra fast
  source.record_video_codec = 6; //copy
  source.record_segment_interval = 15;
  source.record_frame_rate = 0.0;
  if (hasAudio) {
    source.record_audio_codec = source.stream_audio_codec;
    source.record_audio_channel = source.stream_audio_channel;
    source.record_audio_quality = source.stream_audio_quality;
    source.record_audio_sample_rate = source.stream_audio_sample_rate; //Auto
    source.record_audio_volume = source.stream_audio_volume;
  }

  source.log_level = 5; //Warning

  return true;
}
