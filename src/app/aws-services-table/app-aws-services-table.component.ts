import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TimeFormatPipe } from '../timeFormatPipe';
import { ServiceAws } from './ServiceAws';
import { AwsService } from './awsService';

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
  selectedCell: { x: number; id: number } | null = null;
  timer: any = null;
  elapsedTime: number = 0;

  columns = [
    { key: 'description', label: 'Description' }
  ];

  constructor(
    private awsServiceService: AwsService,
    private cdr: ChangeDetectorRef
  ) {}

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

  onCellClick(event: MouseEvent, x: number, id: number): void {
    event.preventDefault();
    if (event.button !== 0) return;

    if (!this.selectedCell) {
      this.selectedCell = { x, id };
      console.log(`🟢 Celda seleccionada: (${x}, id=${id})`);
    } else {
      const { x: x1, id: id1 } = this.selectedCell;
      const x2 = x;
      const id2 = id;

      if (x1 !== x2 || id1 !== id2) {
        const y1 = this.awsServicesShuffle.findIndex(s => s.id === id1);
        const y2 = this.awsServicesShuffle.findIndex(s => s.id === id2);

        if (y1 !== -1 && y2 !== -1) {
          this.swapDescriptions(y1, y2);
          this.touchedCells.add(`${x1},${y1}`);
          this.touchedCells.add(`${x2},${y2}`);
        }
      }

      this.selectedCell = null;
    }
  }

  swapDescriptions(y1: number, y2: number): void {
    const temp = this.awsServicesShuffle[y1].description;
    this.awsServicesShuffle[y1].description = this.awsServicesShuffle[y2].description;
    this.awsServicesShuffle[y2].description = temp;

    if (this.isTableResolved()) {
      this.stopTimer();
      this.saveBestTime(this.elapsedTime);
    }

    this.cdr.detectChanges();
  }

  getCellStatus(x: number, id: number): 'correct' | 'incorrect' | 'untouched' {
    const y = this.awsServicesShuffle.findIndex(s => s.id === id);
    if (y === -1) return 'untouched';

    const touched = this.touchedCells.has(`${x},${y}`);
    if (!touched) return 'untouched';

    const original = this.awsServices[y][this.columns[x].key as keyof ServiceAws];
    const actual = this.awsServicesShuffle[y][this.columns[x].key as keyof ServiceAws];

    return actual === original ? 'correct' : 'incorrect';
  }

  getColumnValue(service: ServiceAws, columnKey: string): string {
    return <string>service[columnKey as keyof ServiceAws] ?? '';
  }

  reset(): void {
    this.awsServicesShuffle = this.awsServices.map(service => ({ ...service }));
    this.filteredAwsServices = [...this.awsServicesShuffle];
    this.selectedCell = null;
    this.touchedCells.clear();
    this.cdr.detectChanges();
  }

  shuffle(): void {
    const descriptions = this.awsServices.map(service => service.description ?? '');
    const shuffledDescriptions = this.shuffleArray(descriptions);

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

  shuffleArray(values: string[]): string[] {
    const shuffled = [...values];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
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

  startTimer(): void {
    this.stopTimer();
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
}
