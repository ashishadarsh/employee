// dashboard.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  NgApexchartsModule,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexStroke,
  ApexNonAxisChartSeries,
  ApexResponsive,
  ApexPlotOptions,
  ApexDataLabels,
  ApexTitleSubtitle,
  ApexLegend,
  ApexTooltip,
  ApexYAxis,
  ChartType
} from 'ng-apexcharts';
import { Subscription } from 'rxjs';
import { DataService } from '../data.service'; // adjust path if needed
import { CommonModule } from '@angular/common';

// canonical status categories used across charts (order matters)
const STATUS_CATEGORIES = ['To Do', 'Analyse', 'Development', 'QA', 'Done'];

interface StatusHistory {
  value: string;
  createdAt: string;
}

interface Task {
  _id?: string;
  name?: string;
  createdAt?: string;
  assignedTo?: string;
  type?: string;
  status?: string | StatusHistory[];
  // internal fields we add during normalization:
  statusArray?: StatusHistory[];
  latestStatus?: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NgApexchartsModule, CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  // KPI numbers
  totalTasks = 0;
  toDoTasks = 0;
  analyseTasks = 0;
  developmentTasks = 0;
  qaTasks = 0;
  completedTasks = 0;

  // Status chart options (always initialized to non-undefined values)
  statusPieOptions: {
    series: ApexNonAxisChartSeries;
    chart: ApexChart;
    labels: string[];
    responsive: ApexResponsive[];
    title: ApexTitleSubtitle;
  } = {
    series: [],
    chart: { type: 'pie' as ChartType, height: 300 },
    labels: STATUS_CATEGORIES.slice(),
    responsive: [{ breakpoint: 480, options: { chart: { width: 300 }, legend: { position: 'bottom' } } }],
    title: { text: 'Status — Pie' }
  };

  statusDonutOptions = { ...this.statusPieOptions, chart: { type: 'donut' as ChartType, height: 300 }, title: { text: 'Status — Donut' } };

  statusRadialOptions: {
    series: number[];
    chart: ApexChart;
    plotOptions: ApexPlotOptions;
    labels: string[];
    title: ApexTitleSubtitle;
  } = {
    series: [],
    chart: { type: 'radialBar' as ChartType, height: 300 },
    plotOptions: {
      radialBar: {
        dataLabels: {
          name: { fontSize: '12px' },
          value: { fontSize: '16px' },
          total: { show: true, label: 'Total', formatter: () => `${this.totalTasks}` }
        }
      }
    } as any,
    labels: STATUS_CATEGORIES.slice(),
    title: { text: 'Status — Radial (%)' }
  };

  statusAreaStackOptions: {
    series: ApexAxisChartSeries;
    chart: ApexChart;
    xaxis: ApexXAxis;
    stroke: ApexStroke;
    title: ApexTitleSubtitle;
    tooltip: ApexTooltip;
  } = {
    series: [],
    chart: { type: 'area' as ChartType, height: 320, stacked: true },
    xaxis: { categories: [] },
    stroke: { curve: 'smooth' },
    title: { text: 'Status changes over time (stacked area)' },
    tooltip: { shared: true }
  };

  statusLineAggregateOptions: {
    series: ApexAxisChartSeries;
    chart: ApexChart;
    xaxis: ApexXAxis;
    stroke: ApexStroke;
    title: ApexTitleSubtitle;
  } = {
    series: [],
    chart: { type: 'line' as ChartType, height: 320 },
    xaxis: { categories: [] },
    stroke: { curve: 'smooth' },
    title: { text: 'Status events per day (aggregate)' }
  };

  statusLinePerTaskOptions: {
    series: ApexAxisChartSeries;
    chart: ApexChart;
    xaxis: any;
    yaxis: any;
    stroke: ApexStroke;
    dataLabels: ApexDataLabels;
    tooltip: ApexTooltip;
    legend: ApexLegend;
    title: ApexTitleSubtitle;
  } = {
    series: [],
    chart: { type: 'line' as ChartType, height: 420, toolbar: { show: true } },
    xaxis: { type: 'datetime' },
    yaxis: {
      min: 1,
      max: STATUS_CATEGORIES.length,
      tickAmount: STATUS_CATEGORIES.length - 1,
      labels: { formatter: (val: number) => this.statusIndexToLabel(Math.round(val)) }
    },
    stroke: { curve: 'stepline' },
    dataLabels: { enabled: false },
    tooltip: { x: { format: 'dd MMM yyyy HH:mm' } },
    legend: { position: 'top', horizontalAlign: 'center' },
    title: { text: 'Per-Task Status Timeline (Y shows status label)' }
  };

  statusBarOptions: {
    series: ApexAxisChartSeries;
    chart: ApexChart;
    xaxis: ApexXAxis;
    title: ApexTitleSubtitle;
  } = {
    series: [],
    chart: { type: 'bar' as ChartType, height: 320 },
    xaxis: { categories: STATUS_CATEGORIES.slice() },
    title: { text: 'Tasks by Latest Status (Bar)' }
  };

  statusStackedBarOptions: {
    series: ApexAxisChartSeries;
    chart: ApexChart;
    xaxis: ApexXAxis;
    plotOptions: ApexPlotOptions;
    legend: ApexLegend;
    title: ApexTitleSubtitle;
  } = {
    series: [],
    chart: { type: 'bar' as ChartType, height: 360, stacked: true },
    xaxis: { categories: [] },
    plotOptions: { bar: { horizontal: false } },
    legend: { position: 'top' },
    title: { text: 'Status by Assignee (stacked)' }
  };

  statusRadarOptions: {
    series: ApexAxisChartSeries;
    chart: ApexChart;
    labels: string[];
    title: ApexTitleSubtitle;
  } = {
    series: [],
    chart: { type: 'radar' as ChartType, height: 320 },
    labels: STATUS_CATEGORIES.slice(),
    title: { text: 'Status Distribution (Radar)' }
  };

  // Type charts
  typePieOptions: {
    series: ApexNonAxisChartSeries;
    chart: ApexChart;
    labels: string[];
    responsive: ApexResponsive[];
    title: ApexTitleSubtitle;
  } = { series: [], chart: { type: 'pie' as ChartType, height: 300 }, labels: [], responsive: [], title: { text: 'Types — Pie' } };

  typeDonutOptions = { ...this.typePieOptions, chart: { type: 'donut' as ChartType, height: 300 }, title: { text: 'Types — Donut' } };

  typeBarOptions: {
    series: ApexAxisChartSeries;
    chart: ApexChart;
    xaxis: ApexXAxis;
    title: ApexTitleSubtitle;
  } = { series: [], chart: { type: 'bar' as ChartType, height: 320 }, xaxis: { categories: [] }, title: { text: 'Types — Bar' } };

  typePolarOptions: {
    series: ApexNonAxisChartSeries;
    chart: ApexChart;
    labels: string[];
    title: ApexTitleSubtitle;
  } = { series: [], chart: { type: 'polarArea' as ChartType, height: 300 }, labels: [], title: { text: 'Types — Polar Area' } };

  typeRadialOptions: {
    series: number[];
    chart: ApexChart;
    labels: string[];
    plotOptions: ApexPlotOptions;
    title: ApexTitleSubtitle;
  } = { series: [], chart: { type: 'radialBar' as ChartType, height: 300 }, labels: [], plotOptions: {}, title: { text: 'Types — Radial (%)' } };

  private sub?: Subscription;

  // fallback sample data (used if DataService.tasks$ isn't present)
  private sampleTasks: Task[] = [
    {
      _id: 't1',
      name: 'Create login',
      createdAt: '2025-08-01T10:00:00Z',
      assignedTo: 'Alice',
      type: 'Feature',
      status: [
        { value: 'To Do', createdAt: '2025-08-01T10:00:00Z' },
        { value: 'Development', createdAt: '2025-08-02T11:30:00Z' },
        { value: 'QA', createdAt: '2025-08-04T09:00:00Z' }
      ]
    },
    {
      _id: 't2',
      name: 'Fix nav bug',
      createdAt: '2025-08-02T08:00:00Z',
      assignedTo: 'Bob',
      type: 'Bug',
      status: [
        { value: 'To Do', createdAt: '2025-08-02T08:00:00Z' },
        { value: 'Analyse', createdAt: '2025-08-03T14:00:00Z' },
        { value: 'Done', createdAt: '2025-08-05T15:00:00Z' }
      ]
    },
    {
      _id: 't3',
      name: 'Add metrics',
      createdAt: '2025-08-03T09:00:00Z',
      assignedTo: 'Alice',
      type: 'Improvement',
      status: [{ value: 'To Do', createdAt: '2025-08-03T09:00:00Z' }]
    }
  ];

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    const tasks$ = (this.dataService as any)?.tasks$;
    if (tasks$ && typeof tasks$.subscribe === 'function') {
      this.sub = tasks$.subscribe((tasks: Task[]) => {
        if (!tasks) return;
        this.prepareAllCharts(tasks);
      });
    } else {
      // fallback to sample data so component works standalone
      this.prepareAllCharts(this.sampleTasks);
    }
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  private prepareAllCharts(tasks: Task[]) {
    // Normalize tasks into statusArray and latestStatus
    const normalized: Task[] = tasks.map(t => {
      let statusArray: StatusHistory[] = [];
      if (Array.isArray(t.status)) {
        statusArray = t.status as StatusHistory[];
      } else if (typeof t.status === 'string') {
        statusArray = [{ value: t.status, createdAt: t.createdAt || new Date().toISOString() }];
      }
      const latestStatus = statusArray.length ? statusArray[statusArray.length - 1].value : 'Unknown';
      return { ...t, statusArray, latestStatus };
    });

    // KPI numbers
    this.totalTasks = normalized.length;
    this.toDoTasks = normalized.filter(t => t.latestStatus === 'To Do').length;
    this.analyseTasks = normalized.filter(t => t.latestStatus === 'Analyse').length;
    this.developmentTasks = normalized.filter(t => t.latestStatus === 'Development').length;
    this.qaTasks = normalized.filter(t => t.latestStatus === 'QA').length;
    this.completedTasks = normalized.filter(t => t.latestStatus === 'Done').length;

    // Latest status counts in canonical order
    const latestCounts = STATUS_CATEGORIES.map(cat => normalized.filter(t => t.latestStatus === cat).length);

    // status pie/donut/radial
    this.statusPieOptions.series = latestCounts;
    this.statusPieOptions.labels = STATUS_CATEGORIES.slice();
    this.statusDonutOptions.series = latestCounts;
    this.statusDonutOptions.labels = STATUS_CATEGORIES.slice();
    this.statusRadialOptions.series = latestCounts.map(v => (this.totalTasks ? Math.round((v / this.totalTasks) * 100) : 0));
    this.statusRadialOptions.labels = STATUS_CATEGORIES.slice();
    this.statusRadialOptions.plotOptions = {
      radialBar: {
        dataLabels: {
          name: { fontSize: '12px' },
          value: { fontSize: '16px' },
          total: { show: true, label: 'Total', formatter: () => `${this.totalTasks}` }
        }
      }
    } as any;

    // Aggregate by date using status.createdAt events
    const aggrByDate: Record<string, Record<string, number>> = {};
    normalized.forEach(t => {
      (t.statusArray || []).forEach(s => {
        if (!s || !s.createdAt) return;
        const d = new Date(s.createdAt).toLocaleDateString();
        aggrByDate[d] = aggrByDate[d] || {};
        aggrByDate[d][s.value] = (aggrByDate[d][s.value] || 0) + 1;
      });
      if (t.createdAt) {
        const cd = new Date(t.createdAt).toLocaleDateString();
        aggrByDate[cd] = aggrByDate[cd] || {};
      }
    });

    const dateKeys = Object.keys(aggrByDate).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    // stacked area series
    this.statusAreaStackOptions.series = STATUS_CATEGORIES.map(status => ({
      name: status,
      data: dateKeys.map(d => aggrByDate[d][status] || 0)
    }));
    this.statusAreaStackOptions.xaxis = { categories: dateKeys };

    // aggregated line series
    const totalPerDay = dateKeys.map(d => Object.values(aggrByDate[d]).reduce((acc, v) => acc + v, 0));
    this.statusLineAggregateOptions.series = [{ name: 'Events', data: totalPerDay }];
    this.statusLineAggregateOptions.xaxis = { categories: dateKeys };

    // per-task timeline: one series per task with points {x: epochMs, y: statusIndex}
    this.statusLinePerTaskOptions.series = normalized
      .filter(t => Array.isArray(t.statusArray) && t.statusArray!.length)
      .map(t => {
        const points = (t.statusArray || []).map(s => ({ x: new Date(s.createdAt).getTime(), y: STATUS_CATEGORIES.indexOf(s.value) + 1 }))
          .sort((a: any, b: any) => a.x - b.x);
        return { name: t.name || t._id || 'Task', data: points };
      }) as ApexAxisChartSeries;

    // status bar
    this.statusBarOptions.series = [{ name: 'Tasks', data: latestCounts }];
    this.statusBarOptions.xaxis = { categories: STATUS_CATEGORIES.slice() };

    // stacked bar per assignee
    const assignees = Array.from(new Set(normalized.map(t => t.assignedTo || 'Unassigned')));
    this.statusStackedBarOptions.series = STATUS_CATEGORIES.map(status => ({
      name: status,
      data: assignees.map(a => normalized.filter(t => (t.assignedTo || 'Unassigned') === a && t.latestStatus === status).length)
    })) as ApexAxisChartSeries;
    this.statusStackedBarOptions.xaxis = { categories: assignees };

    // radar
    this.statusRadarOptions.series = [{ name: 'Tasks', data: latestCounts }];

    // types charts
    const typeCounts: Record<string, number> = {};
    normalized.forEach(t => {
      const ty = t.type || 'Unknown';
      typeCounts[ty] = (typeCounts[ty] || 0) + 1;
    });
    const typeLabels = Object.keys(typeCounts);
    const typeValues = Object.values(typeCounts);

    this.typePieOptions.series = typeValues;
    this.typePieOptions.labels = typeLabels;
    this.typeDonutOptions.series = typeValues;
    this.typeDonutOptions.labels = typeLabels;

    this.typeBarOptions.series = [{ name: 'Tasks', data: typeValues }];
    this.typeBarOptions.xaxis = { categories: typeLabels };

    this.typePolarOptions.series = typeValues;
    this.typePolarOptions.labels = typeLabels;

    const totTypes = typeValues.reduce((a, b) => a + b, 0);
    this.typeRadialOptions.series = typeValues.map(v => (totTypes ? Math.round((v / totTypes) * 100) : 0));
    this.typeRadialOptions.labels = typeLabels;
    this.typeRadialOptions.plotOptions = {
      radialBar: {
        dataLabels: {
          name: { fontSize: '12px' },
          value: { fontSize: '16px' },
          total: { show: true, label: 'Total', formatter: () => `${this.totalTasks}` }
        }
      }
    } as any;
  }

  // helper to map numeric y-value -> status label for y-axis
  private statusIndexToLabel(index: number): string {
    if (!index || index < 1 || index > STATUS_CATEGORIES.length) return '';
    return STATUS_CATEGORIES[index - 1];
  }
}
