import { Component } from '@angular/core';
import {AppAwsServicesTableComponent} from './aws-services-table/app-aws-services-table.component';

@Component({
  selector: 'app-root',
  imports: [AppAwsServicesTableComponent],
  templateUrl: './app.component.html',
  standalone: true,
  styleUrls: ['./app.component.scss']
})
export class AppComponent { }
