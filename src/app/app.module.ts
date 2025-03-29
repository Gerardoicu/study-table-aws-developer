import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { AppAwsServicesTableComponent } from './aws-services-table/app-aws-services-table.component';
import {TimeFormatPipe} from './timeFormatPipe';

@NgModule({
  declarations: [

  ],
  imports: [
    BrowserModule,
    AppAwsServicesTableComponent,
    AppComponent,
    TimeFormatPipe
  ],
  providers: [],
  bootstrap: []
})
export class AppModule { }
