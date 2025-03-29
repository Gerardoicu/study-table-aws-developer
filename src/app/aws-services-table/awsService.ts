import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {ServiceAws} from './ServiceAws';


@Injectable({
  providedIn: 'root'
})
export class AwsService {

  private apiUrl = 'http://localhost:8080/api/aws-services';

  constructor(private http: HttpClient) { }

  getAwsServices(): Observable<ServiceAws[]> {
    return this.http.get<ServiceAws[]>('/assets/data/aws-services.json');
  }
  /*
  getAwsServices(): Observable<AwsService[]> {
    return this.http.get<AwsService[]>(this.apiUrl).pipe(
      map(services =>
        services.map(service => ({
          ...service,
          dynamicValues: [
            service.category ?? '',
            service.description ?? '',
            service.useCase ?? '',
            service.benefits ?? '',
            service.practicalExample ?? '',
            service.keyConcepts ?? '',
            service.forDummies ?? ''
          ]
        }))
      )
    );
  }

   */
}
