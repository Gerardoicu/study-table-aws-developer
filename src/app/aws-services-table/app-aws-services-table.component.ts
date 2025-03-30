import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TimeFormatPipe } from '../timeFormatPipe';
import {ServiceAws} from './ServiceAws';
import {AwsService} from './awsService';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-aws-services-table',
  standalone: true,
  imports: [CommonModule, TimeFormatPipe, FormsModule],
  templateUrl: './app-aws-services-table.component.html',
  styleUrls: ['./app-aws-services-table.component.scss']
})
export class AppAwsServicesTableComponent implements OnInit {
  searchQuery: string = '';
  filteredAwsServices: ServiceAws[] = [];
  bestTime: number | null = null;
  touchedCells = new Set<string>();
  awsServices: ServiceAws[] = [];
  awsServicesShuffle: ServiceAws[] = [];
  selectedCell: { x: number; y: number } | null = null;
  timer: any = null;
  elapsedTime: number = 0;
  columns = [
    { key: 'description', label: 'Description' }
  ];

  constructor(
    private awsServiceService: AwsService,
    private cdr: ChangeDetectorRef
  ) {}

  startTimer(): void {
    this.stopTimer(); // Reinicia cualquier timer anterior
    this.elapsedTime = 0;
    this.timer = setInterval(() => {
      this.elapsedTime++;
      this.cdr.detectChanges();
    }, 1000);
  }
  stopTimer(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
  getBestTime(): number | null {
    const value = localStorage.getItem('bestTime');
    return value ? Number(value) : null;
  }
  saveBestTime(time: number): void {
    const currentBest = localStorage.getItem('bestTime');
    if (!currentBest || time < Number(currentBest)) {
      localStorage.setItem('bestTime', time.toString());
    }
  }

  ngOnInit(): void {
    this.bestTime = this.getBestTime();
    this.awsServiceService.getAwsServices().subscribe(services => {
      this.awsServices = services.map(service => ({ ...service }));
      this.awsServicesShuffle = this.awsServices.map(service => ({ ...service }));
      this.filteredAwsServices = [...this.awsServicesShuffle];
    });
  }

  onSearchChange(): void {
    const query = this.searchQuery.toLowerCase().trim();

    if (!query) {
      this.filteredAwsServices = [...this.awsServicesShuffle];
      return;
    }

    this.filteredAwsServices = this.awsServicesShuffle.filter(service =>
      service.service.toLowerCase().includes(query) ||
      service.description.toLowerCase().includes(query)
    );
  }
  getColumnValue(service: ServiceAws, columnKey: string): string {
    return <string>service[columnKey as keyof ServiceAws] ?? '';
  }

  onCellClick(event: MouseEvent, x: number, y: number): void {
    event.preventDefault();

    if (event.button !== 0) return; // solo click izquierdo

    if (!this.selectedCell) {
      // Primer click: seleccionar celda
      this.selectedCell = { x, y };
      console.log(`🟢 Celda seleccionada: (${x}, ${y})`);
    } else {
      const { x: x1, y: y1 } = this.selectedCell;
      const x2 = x;
      const y2 = y;

      if (x1 !== x2 || y1 !== y2) {
        this.swapValues(x1, y1, x2, y2);
        console.log(`🔁 Intercambio ejecutado: (${x1}, ${y1}) ↔ (${x2}, ${y2})`);
      }

      // Deseleccionar después del segundo click
      this.selectedCell = null;
    }
  }

  swapValues(x1: number, y1: number, x2: number, y2: number): void {
    const row1 = this.awsServicesShuffle[y1];
    const row2 = this.awsServicesShuffle[y2];

    if (!row1 || !row2) return;

    const key1 = this.columns[x1].key;
    const key2 = this.columns[x2].key;

    // Guardar que ambas celdas fueron tocadas
    this.touchedCells.add(`${x1},${y1}`);
    this.touchedCells.add(`${x2},${y2}`);

    // @ts-ignore
    const temp = row1[key1];
    // @ts-ignore
    row1[key1] = row2[key2];
    // @ts-ignore
    row2[key2] = temp;
    if (this.isTableResolved()) {
      this.stopTimer();
      this.saveBestTime(this.elapsedTime);
    }
    this.cdr.detectChanges();
  }

  reset(): void {
    this.awsServicesShuffle = this.awsServices.map(service => ({ ...service }));
    this.selectedCell = null;
    this.touchedCells.clear();
    this.filteredAwsServices = [...this.awsServicesShuffle];

    this.cdr.detectChanges();
  }

  shuffle(): void {
    // Obtener todas las descripciones
    const descriptions = this.awsServices.map(service => service.description ?? '');

    // Mezclarlas
    const shuffledDescriptions = this.shuffleArray(descriptions);

    // Asignarlas a una nueva lista de servicios, manteniendo el resto igual
    this.awsServicesShuffle = this.awsServices.map((service, index) => ({
      ...service,
      description: shuffledDescriptions[index]
    }));
    
    this.filteredAwsServices = [...this.awsServicesShuffle];
    this.selectedCell = null;
    this.touchedCells.clear();
    this.startTimer();
    this.cdr.detectChanges();
  }

  isTableResolved(): boolean {
    return this.awsServices.every((originalService, rowIndex) => {
      const shuffledService = this.awsServicesShuffle[rowIndex];
      return this.columns.every(col => {
        const key = col.key as keyof ServiceAws;
        return originalService[key] === shuffledService[key];
      });
    });
  }
  shuffleArray(values: string[]): string[] {
    const shuffled = [...values];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  getCellStatus(x: number, y: number): 'correct' | 'incorrect' | 'untouched' {
    const touched = this.touchedCells.has(`${x},${y}`);
    if (!touched) return 'untouched';

    const original = this.awsServices[y][this.columns[x].key as keyof ServiceAws];
    const actual = this.awsServicesShuffle[y][this.columns[x].key as keyof ServiceAws];

    return actual === original ? 'correct' : 'incorrect';
  }


}
