import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'urlEncode'})
export class UrlEncodePipe implements PipeTransform {
  transform(value: string): string {
    let regex = / /gi;
    return value.replace(regex, "_");
  }
}