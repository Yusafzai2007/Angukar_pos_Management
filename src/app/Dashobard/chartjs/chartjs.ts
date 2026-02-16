import { Component, AfterViewInit, OnInit } from '@angular/core';
import { Chart } from 'chart.js/auto';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StockApiResponse, StockItem } from '../../Typescript/add_product/add_product';
import { ServiceData } from '../../create_account/api_service/service-data';

export interface chartStockOutResponse {
  data: string;
  message: chartStockOut[];
  statuscode: number;
  success: boolean;
}

export interface chartStockOut {
  _id: string;
  itemId: string[]; // Agar itemId bhi populate hoga to isko update karna padega
  stockOutCategoryId: StockOutCategory; // Ab ye object hai
  Total_sale: number;
  quantity: number[];
  stockOutDate: string;
  invoiceNo: string;
  isActive: boolean;
  date: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  id: string;
}

export interface StockOutCategory {
  _id: string;
  stockoutCategoryName: string;
  isActive: boolean;
  id: string;
}


@Component({
  selector: 'app-chartjs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chartjs.html',
  styleUrls: ['./chartjs.css'],
})
export class Chartjs implements AfterViewInit, OnInit {
  stockOutData: chartStockOut[] = [];
  displayData: chartStockOut[] = [];
  barChart: Chart | undefined;
  pieChart: Chart | undefined;
  isLoading: boolean = false;
  error: string | null = null;
  
  // Period selection
  selectedPeriod: string = new Date().getFullYear().toString();
  availableYears: number[] = [];
  
  // Comparison years for All Time view
  selectedYears: string[] = ['', '', ''];

  // Products data
  productsList: StockItem[] = [];
  filteredProducts: StockItem[] = [];
  loading: boolean = false;
  errordata: string | null = null;

  // Enhanced color palettes
  private barColors = {
    sales: 'rgba(59, 130, 246, 0.8)',
    quantity: 'rgba(139, 92, 246, 0.8)',
    profit: 'rgba(34, 197, 94, 0.8)'
  };

  // Month colors for pie chart
  private monthColors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD',
    '#D4A5A5', '#9B59B6', '#3498DB', '#E67E22', '#2ECC71',
    '#F1C40F', '#E74C3C'
  ];

  // Year colors for all time view
  private yearColors = [
    '#4285F4', '#EA4335', '#FBBC05', '#34A853', '#FF6D00',
    '#46BDC6', '#7B1FA2', '#C2185B', '#1E88E5', '#FFB300'
  ];

  constructor(private http: HttpClient, private service: ServiceData) {}

  ngOnInit(): void {
    this.getProducts();
  }

  ngAfterViewInit(): void {
    this.fetchStockOutData();
  }

  fetchStockOutData(): void {
    this.isLoading = true;
    this.error = null;
    
    const apiUrl = 'http://localhost:4000/api/v1/pos/dashboard_stockOut'; 
    
    this.http.get<chartStockOutResponse>(apiUrl).subscribe({
      next: (response) => {
        if (response.success && response.message.length > 0) {
          this.stockOutData = response.message;
          this.extractAvailableYears();
          this.updateDisplayData();
          setTimeout(() => {
            this.createCharts();
          }, 100);
        } else {
          this.error = 'No data available';
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to fetch stock-out data';
        this.isLoading = false;
        console.error('Error fetching stock-out data:', err);
      }
    });
  }

  getProducts(): void {
    this.loading = true;
    this.errordata = null;

    this.service.products().subscribe({
      next: (res: StockApiResponse) => {
        this.productsList = res.data;
        this.filteredProducts = [...this.productsList];
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.errordata = 'Failed to load products';
        this.loading = false;
      },
    });
  }

  extractAvailableYears(): void {
    const years = new Set<number>();
    this.stockOutData.forEach(item => {
      const year = new Date(item.stockOutDate).getFullYear();
      years.add(year);
    });
    this.availableYears = Array.from(years).sort((a, b) => b - a);
    
    // Set default year if current year not available
    if (!this.availableYears.includes(parseInt(this.selectedPeriod)) && this.availableYears.length > 0) {
      this.selectedPeriod = this.availableYears[0].toString();
    }
  }

  onPeriodChange(event: any): void {
    this.selectedPeriod = event.target.value;
    this.updateDisplayData();
    this.createCharts();
  }

  onComparisonYearsChange(): void {
    this.updateDisplayData();
    this.createCharts();
  }

  updateDisplayData(): void {
    if (this.selectedPeriod === 'all') {
      // For All Time, show all data
      this.displayData = [...this.stockOutData];
    } else {
      // Filter by selected year
      const year = parseInt(this.selectedPeriod);
      this.displayData = this.stockOutData.filter(item => {
        const itemYear = new Date(item.stockOutDate).getFullYear();
        return itemYear === year;
      });
    }
  }

  getTotalQuantity(quantities: number[]): number {
    return quantities.reduce((sum, qty) => sum + qty, 0);
  }

  calculateProfit(item: chartStockOut): number {
    const totalQty = this.getTotalQuantity(item.quantity);
    if (totalQty > 100) return item.Total_sale * 0.30;
    if (totalQty > 50) return item.Total_sale * 0.25;
    return item.Total_sale * 0.20;
  }

  createCharts(): void {
    if (this.selectedPeriod === 'all') {
      this.createAllTimeBarChart();
      this.createAllTimePieChart();
    } else {
      this.createMonthlyBarChart();
      this.createMonthlyPieChart();
    }
  }

  createAllTimeBarChart(): void {
    const ctx = document.getElementById('barChart') as HTMLCanvasElement;
    
    if (!ctx) return;

    if (this.barChart) {
      this.barChart.destroy();
    }

    // Group data by year
    const yearData = new Map<number, { sales: number; quantity: number; profit: number }>();
    
    this.displayData.forEach(item => {
      const year = new Date(item.stockOutDate).getFullYear();
      const current = yearData.get(year) || { sales: 0, quantity: 0, profit: 0 };
      
      yearData.set(year, {
        sales: current.sales + item.Total_sale,
        quantity: current.quantity + this.getTotalQuantity(item.quantity),
        profit: current.profit + this.calculateProfit(item)
      });
    });

    const years = Array.from(yearData.keys()).sort();
    const salesData = years.map(y => yearData.get(y)!.sales);
    const quantityData = years.map(y => yearData.get(y)!.quantity);
    const profitData = years.map(y => yearData.get(y)!.profit);

    this.barChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: years.map(y => y.toString()),
        datasets: [
          {
            label: 'Total Sale ($)',
            data: salesData,
            borderWidth: 1,
            backgroundColor: this.barColors.sales,
            borderColor: this.barColors.sales.replace('0.8', '1'),
            borderRadius: 4,
            yAxisID: 'y'
          },
          {
            label: 'Quantity',
            data: quantityData,
            borderWidth: 1,
            backgroundColor: this.barColors.quantity,
            borderColor: this.barColors.quantity.replace('0.8', '1'),
            borderRadius: 4,
            yAxisID: 'y1'
          },
          {
            label: 'Profit ($)',
            data: profitData,
            borderWidth: 1,
            backgroundColor: this.barColors.profit,
            borderColor: this.barColors.profit.replace('0.8', '1'),
            borderRadius: 4,
            yAxisID: 'y'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { position: 'top' },
          tooltip: {
            backgroundColor: '#1f2937',
            callbacks: {
              label: (context) => {
                const label = context.dataset.label || 'Value';
                if (context.parsed.y !== null) {
                  if (label.includes('Sale') || label.includes('Profit')) {
                    return `${label}: $${context.parsed.y.toFixed(2)}`;
                  }
                  return `${label}: ${context.parsed.y.toLocaleString()} units`;
                }
                return label + ': 0';
              }
            }
          }
        },
        scales: {
          y: {
            type: 'linear',
            position: 'left',
            title: { display: true, text: 'Amount ($)' },
            ticks: { callback: (value) => '$' + value }
          },
          y1: {
            type: 'linear',
            position: 'right',
            title: { display: true, text: 'Quantity' },
            grid: { drawOnChartArea: false },
            ticks: { callback: (value) => value + ' units' }
          }
        }
      }
    });
  }

  createMonthlyBarChart(): void {
    const ctx = document.getElementById('barChart') as HTMLCanvasElement;
    
    if (!ctx) return;

    if (this.barChart) {
      this.barChart.destroy();
    }

    const monthlyData = new Array(12).fill(null).map(() => ({
      sales: 0, quantity: 0, profit: 0
    }));

    this.displayData.forEach(item => {
      const month = new Date(item.stockOutDate).getMonth();
      monthlyData[month].sales += item.Total_sale;
      monthlyData[month].quantity += this.getTotalQuantity(item.quantity);
      monthlyData[month].profit += this.calculateProfit(item);
    });

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    this.barChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: months,
        datasets: [
          {
            label: 'Total Sale ($)',
            data: monthlyData.map(d => d.sales),
            backgroundColor: this.barColors.sales,
            yAxisID: 'y'
          },
          {
            label: 'Quantity',
            data: monthlyData.map(d => d.quantity),
            backgroundColor: this.barColors.quantity,
            yAxisID: 'y1'
          },
          {
            label: 'Profit ($)',
            data: monthlyData.map(d => d.profit),
            backgroundColor: this.barColors.profit,
            yAxisID: 'y'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { position: 'top' },
          tooltip: {
            backgroundColor: '#1f2937',
            callbacks: {
              label: (context) => {
                const label = context.dataset.label || 'Value';
                if (context.parsed.y !== null) {
                  if (label.includes('Sale') || label.includes('Profit')) {
                    return `${label}: $${context.parsed.y.toFixed(2)}`;
                  }
                  return `${label}: ${context.parsed.y.toLocaleString()} units`;
                }
                return label + ': 0';
              }
            }
          }
        },
        scales: {
          y: {
            type: 'linear',
            position: 'left',
            title: { display: true, text: 'Amount ($)' },
            ticks: { callback: (value) => '$' + value }
          },
          y1: {
            type: 'linear',
            position: 'right',
            title: { display: true, text: 'Quantity' },
            grid: { drawOnChartArea: false },
            ticks: { callback: (value) => value + ' units' }
          }
        }
      }
    });
  }

  createAllTimePieChart(): void {
    const ctx = document.getElementById('pieChart') as HTMLCanvasElement;
    
    if (!ctx) return;

    if (this.pieChart) {
      this.pieChart.destroy();
    }

    // Group by year
    const yearMap = new Map<string, { sales: number; quantity: number; profit: number }>();
    
    this.displayData.forEach(item => {
      const year = new Date(item.stockOutDate).getFullYear().toString();
      const current = yearMap.get(year) || { sales: 0, quantity: 0, profit: 0 };
      
      yearMap.set(year, {
        sales: current.sales + item.Total_sale,
        quantity: current.quantity + this.getTotalQuantity(item.quantity),
        profit: current.profit + this.calculateProfit(item)
      });
    });

    const years = Array.from(yearMap.keys()).sort();
    const salesData = years.map(y => yearMap.get(y)!.sales);
    const quantityData = years.map(y => yearMap.get(y)!.quantity);
    const profitData = years.map(y => yearMap.get(y)!.profit);

    this.pieChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: years,
        datasets: [{
          data: salesData,
          backgroundColor: this.yearColors.slice(0, years.length),
          borderWidth: 2,
          hoverOffset: 15
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'right' },
          tooltip: {
            backgroundColor: '#1f2937',
            callbacks: {
              label: (context) => {
                const year = context.label || 'Unknown';
                const saleValue = context.raw as number;
                const total = salesData.reduce((a, b) => a + b, 0);
                const percentage = total > 0 ? ((saleValue / total) * 100).toFixed(1) : '0';
                
                const index = context.dataIndex;
                const quantity = quantityData[index] || 0;
                const profit = profitData[index] || 0;
                
                return [
                  `${year}:`,
                  `  Sales: $${saleValue.toFixed(2)} (${percentage}%)`,
                  `  Quantity: ${quantity.toLocaleString()} units`,
                  `  Profit: $${profit.toFixed(2)}`
                ];
              }
            }
          }
        }
      }
    });
  }

  createMonthlyPieChart(): void {
    const ctx = document.getElementById('pieChart') as HTMLCanvasElement;
    
    if (!ctx) return;

    if (this.pieChart) {
      this.pieChart.destroy();
    }

    const monthlySales = new Array(12).fill(0);
    const monthlyQuantity = new Array(12).fill(0);
    const monthlyProfit = new Array(12).fill(0);
    
    this.displayData.forEach(item => {
      const month = new Date(item.stockOutDate).getMonth();
      monthlySales[month] += item.Total_sale;
      monthlyQuantity[month] += this.getTotalQuantity(item.quantity);
      monthlyProfit[month] += this.calculateProfit(item);
    });

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const activeMonths: string[] = [];
    const activeSales: number[] = [];
    const activeQuantities: number[] = [];
    const activeProfits: number[] = [];
    const activeColors: string[] = [];

    months.forEach((month, index) => {
      if (monthlySales[index] > 0) {
        activeMonths.push(month);
        activeSales.push(monthlySales[index]);
        activeQuantities.push(monthlyQuantity[index]);
        activeProfits.push(monthlyProfit[index]);
        activeColors.push(this.monthColors[index]);
      }
    });

    this.pieChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: activeMonths,
        datasets: [{
          data: activeSales,
          backgroundColor: activeColors,
          borderWidth: 2,
          hoverOffset: 15
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'right' },
          tooltip: {
            backgroundColor: '#1f2937',
            callbacks: {
              label: (context) => {
                const month = context.label || 'Unknown';
                const saleValue = context.raw as number;
                const total = activeSales.reduce((a, b) => a + b, 0);
                const percentage = total > 0 ? ((saleValue / total) * 100).toFixed(1) : '0';
                
                const index = context.dataIndex;
                const quantity = activeQuantities[index] || 0;
                const profit = activeProfits[index] || 0;
                
                return [
                  `${month}:`,
                  `  Sales: $${saleValue.toFixed(2)} (${percentage}%)`,
                  `  Quantity: ${quantity.toLocaleString()} units`,
                  `  Profit: $${profit.toFixed(2)}`
                ];
              }
            }
          }
        }
      }
    });
  }

  refreshData(): void {
    this.fetchStockOutData();
    this.getProducts(); // Refresh products data too
  }

  // Summary statistics
  get totalSales(): number {
    return this.displayData.reduce((sum, item) => sum + item.Total_sale, 0);
  }

  get totalQuantity(): number {
    return this.displayData.reduce((sum, item) => 
      sum + this.getTotalQuantity(item.quantity), 0
    );
  }

  get averageSale(): number {
    return this.displayData.length > 0 
      ? this.totalSales / this.displayData.length 
      : 0;
  }

  get totalProfit(): number {
    return this.displayData.reduce((sum, item) => 
      sum + this.calculateProfit(item), 0
    );
  }

  // Get active products count
  getActiveProductsCount(): number {
    return this.productsList.filter((product) => product.product.isActive).length;
  }

  // Get total stock count with filter respect
  getTotalStockCount(): number {
    if (this.selectedPeriod === 'all') {
      // For All Time, show all products stock
      return this.productsList.reduce((total, product) => total + product.totalRemainingStock, 0);
    } else {
      // For specific year, filter products by date if needed
      // You can add year-based filtering logic here
      return this.productsList.reduce((total, product) => total + product.totalRemainingStock, 0);
    }
  }






tableheader:string[] = [
  'Date',
  'Invoice No',
  'Category',
  'Total Sale ($)',
  'Quantity',
  'Profit',
  'status'
]






















}