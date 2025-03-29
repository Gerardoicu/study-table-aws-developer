// src/app/app.routes.ts
import { Routes } from '@angular/router';
import {AppComponent} from './app.component';


export const routes: Routes = [
  { path: '', component: AppComponent },
  { path: '**', redirectTo: '' } // fallback a home si la ruta no existe
];
