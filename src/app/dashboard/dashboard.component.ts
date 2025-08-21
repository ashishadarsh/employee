import { Component, OnInit } from '@angular/core';
import { NgApexchartsModule } from 'ng-apexcharts';
import {
  ApexNonAxisChartSeries,
  ApexResponsive,
  ApexChart,
  ApexPlotOptions,
  ApexAxisChartSeries,
  ApexXAxis,
  ApexStroke
} from 'ng-apexcharts';
import { DataService } from '../data.service';

const STATUS_CATEGORIES = ['To Do', 'Analyse', 'Development', 'QA', 'Done'];

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NgApexchartsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  // KPI Cards
  totalTasks = 0;
  completedTasks = 0;
  toDoTasks = 0;
  analyseTasks = 0;
  developmentTasks = 0;
  qaTasks = 0;

  // Pie / Donut / Radial
  pieSeries: ApexNonAxisChartSeries = [];
  donutSeries: ApexNonAxisChartSeries = [];
  radialSeries: number[] = [];
  pieChartOptions!: { series: ApexNonAxisChartSeries; chart: ApexChart; labels: string[]; responsive: ApexResponsive[] };
  donutChartOptions!: { series: ApexNonAxisChartSeries; chart: ApexChart; labels: string[]; responsive: ApexResponsive[] };
  radialChartOptions!: { series: number[]; chart: ApexChart; plotOptions: ApexPlotOptions; labels: string[] };

  // Line / Area
  lineSeries: ApexAxisChartSeries = [];
  lineChartOptions!: { series: ApexAxisChartSeries; chart: ApexChart; xaxis: ApexXAxis; stroke: ApexStroke };
  areaSeries: ApexAxisChartSeries = [];
  areaChartOptions!: { series: ApexAxisChartSeries; chart: ApexChart; xaxis: ApexXAxis; stroke: ApexStroke; fill: any };

  // Bar / Stacked Bar
  barSeries: ApexAxisChartSeries = [];
  barChartOptions!: { series: ApexAxisChartSeries; chart: ApexChart; xaxis: ApexXAxis };
  stackedBarSeries: ApexAxisChartSeries = [];
  stackedBarOptions!: { series: ApexAxisChartSeries; chart: ApexChart; xaxis: ApexXAxis; plotOptions: any };

  // Radar
  radarSeries: ApexAxisChartSeries = [];
  radarChartOptions!: { series: ApexAxisChartSeries; chart: ApexChart; labels: string[] };

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.initializeCharts();
    this.fetchTasks();
  }

  initializeCharts() {
    // Pie Chart
    this.pieChartOptions = {
      series: [],
      chart: { type: 'pie', height: 300 },
      labels: STATUS_CATEGORIES,
      responsive: [{ breakpoint: 480, options: { chart: { width: 300 }, legend: { position: 'bottom' } } }]
    };

    // Donut Chart
    this.donutChartOptions = {
      series: [],
      chart: { type: 'donut', height: 300 },
      labels: STATUS_CATEGORIES,
      responsive: [{ breakpoint: 480, options: { chart: { width: 300 }, legend: { position: 'bottom' } } }]
    };

    // Radial Chart
    this.radialChartOptions = {
      series: [],
      chart: { height: 300, type: 'radialBar' },
      plotOptions: {
        radialBar: {
          dataLabels: {
            name: { fontSize: '14px' },
            value: { fontSize: '20px' },
            total: { show: true, label: 'Total', formatter: () => '100%' }
          }
        }
      },
      labels: STATUS_CATEGORIES
    };

    // Line Chart
    this.lineChartOptions = {
      series: [],
      chart: { type: 'line', height: 300, zoom: { enabled: false } },
      xaxis: { categories: [] },
      stroke: { curve: 'smooth' }
    };

    // Area Chart
    this.areaChartOptions = {
      series: [],
      chart: { type: 'area', height: 300, zoom: { enabled: false } },
      xaxis: { categories: [] },
      stroke: { curve: 'smooth' },
      fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.6, opacityTo: 0.1, stops: [0, 90, 100] } }
    };

    // Bar Chart
    this.barChartOptions = {
      series: [],
      chart: { type: 'bar', height: 300 },
      xaxis: { categories: [] }
    };

    // Stacked Bar
    this.stackedBarOptions = {
      series: STATUS_CATEGORIES.map(cat => ({ name: cat, data: [] })),
      chart: { type: 'bar', height: 300, stacked: true },
      xaxis: { categories: [] },
      plotOptions: { bar: { horizontal: false } }
    };

    // Radar Chart
    this.radarChartOptions = {
      series: [{ name: 'Tasks', data: [] }],
      chart: { type: 'radar', height: 300 },
      labels: STATUS_CATEGORIES
    };
  }

  fetchTasks() {
    this.dataService.tasks$.subscribe((tasks: any[]) => {
      if (!tasks) return;

      // KPI Cards
      this.totalTasks = tasks.length;
      this.completedTasks = tasks.filter(t => t.status === 'Done').length;
      this.developmentTasks = tasks.filter(t => t.status === 'Development').length;
      this.toDoTasks = tasks.filter(t => t.status === 'To Do').length;
      this.analyseTasks = tasks.filter(t => t.status === 'Analyse').length;
      this.qaTasks = tasks.filter(t => t.status === 'QA').length;

      // Grouped counts by status in fixed order
      const groupedCounts = STATUS_CATEGORIES.map(
        status => tasks.filter(t => t.status === status).length
      );

      // Pie / Donut
      this.pieSeries = groupedCounts;
      this.pieChartOptions.series = groupedCounts;

      this.donutSeries = groupedCounts;
      this.donutChartOptions.series = groupedCounts;

      // Radial (percentages)
      this.radialSeries = groupedCounts.map(v =>
        this.totalTasks ? Math.round((v / this.totalTasks) * 100) : 0
      );
      this.radialChartOptions.series = this.radialSeries;

      // Line Chart (tasks over time)
      const tasksOverTime = this.groupTasksByDate(tasks);
      const sortedDates = Object.keys(tasksOverTime).sort(
        (a, b) => new Date(a).getTime() - new Date(b).getTime()
      );
      this.lineSeries = [{ name: 'Tasks', data: sortedDates.map(d => tasksOverTime[d]) }];
      this.lineChartOptions.series = this.lineSeries;
      this.lineChartOptions.xaxis.categories = sortedDates;

      // Area Chart (same as line)
      this.areaSeries = [{ name: 'Tasks', data: sortedDates.map(d => tasksOverTime[d]) }];
      this.areaChartOptions.series = this.areaSeries;
      this.areaChartOptions.xaxis.categories = sortedDates;

      // Bar Chart (tasks per employee)
      const tasksByEmployee = this.groupTasksByEmployee(tasks);
      const employeeNames = Object.keys(tasksByEmployee);
      const employeeValues = Object.values(tasksByEmployee);
      this.barSeries = [{ name: 'Tasks', data: employeeValues }];
      this.barChartOptions.series = this.barSeries;
      this.barChartOptions.xaxis.categories = employeeNames;

      // Stacked Bar (status per employee)
      const employees = [...new Set(tasks.map(t => t.assignedTo))];
      this.stackedBarOptions.series = STATUS_CATEGORIES.map(status => ({
        name: status,
        data: employees.map(e => tasks.filter(t => t.assignedTo === e && t.status === status).length)
      }));
      this.stackedBarOptions.xaxis.categories = employees;

      // Radar Chart (overall category totals)
      this.radarChartOptions.series = [{ name: 'Tasks', data: groupedCounts }];
    });
  }

  private groupTasksByDate(tasks: any[]): Record<string, number> {
    return tasks.reduce((acc, t) => {
      const date = new Date(t.createdAt).toLocaleDateString();
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private groupTasksByEmployee(tasks: any[]): Record<string, number> {
    return tasks.reduce((acc, t) => {
      acc[t.assignedTo] = (acc[t.assignedTo] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }
}
