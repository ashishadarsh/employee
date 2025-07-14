import { Component, OnInit, ViewChild } from '@angular/core';
import { ChartComponent, NgApexchartsModule } from "ng-apexcharts";

import {
  ApexNonAxisChartSeries,
  ApexResponsive,
  ApexChart
} from "ng-apexcharts";
import { DataService } from '../data.service';

export type ChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  responsive: ApexResponsive[];
  labels: any;
};

@Component({
  selector: 'app-dashboard',
  imports: [NgApexchartsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  @ViewChild("chart") chart!: ChartComponent;
  public chartOptions: Partial<ChartOptions>;

  public tasks: any;
  public error: string = '';

  constructor(private dataService: DataService) {
    this.chartOptions = {
      series: [],
      chart: {
        width: 380,
        type: "pie"
      },
      labels: [],
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 200
            },
            legend: {
              position: "bottom"
            }
          }
        }
      ]
    };
  }

  ngOnInit(): void {
    this.fetchTasks();
  }

  fetchTasks() {
    this.dataService.tasks$.subscribe(
      (data: any[]) => {
        this.tasks = data;
        console.log({ data });


        const groupedData = this.groupTasksByStatus(data);

        this.chartOptions = {
          ...this.chartOptions,
          series: Object.values(groupedData),
          labels: Object.keys(groupedData)
        };
      },
      (error) => {
        this.tasks = null;
        this.error = 'Failed to load employee tasks.';
        console.error(error);
      }
    );
  }

  private groupTasksByStatus(tasks: { status: string }[]): Record<string, number> {
    return tasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }
}
