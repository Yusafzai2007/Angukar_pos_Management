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
  itemId: string[];
  stockOutCategoryId: StockOutCategory;
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
  
  // Format toggle
  showFullNumbers: boolean = false;
  
  // Period selection - will be set to current year after data loads
  selectedPeriod: string = '';
  availableYears: number[] = [];
  
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

  tableheader: string[] = [
    'Date',
    'Invoice No',
    'Category',
    'Total Sale ($)',
    'Quantity',
    'Profit',
    'Status'
  ];

  constructor(private http: HttpClient, private service: ServiceData) {}

  ngOnInit(): void {
    this.getProducts();
  }

  ngAfterViewInit(): void {
    this.fetchStockOutData();
  }

  // Toggle between compact and full number formats
  toggleFormat(): void {
    this.showFullNumbers = !this.showFullNumbers;
    // Update charts with new format
    if (this.displayData.length > 0) {
      this.createCharts();
    }
  }

  // Format numbers with K/M/B suffixes or full numbers based on toggle
  formatNumber(value: number, type: 'currency' | 'number' = 'number'): string {
    if (value === null || value === undefined || isNaN(value)) {
      return type === 'currency' ? '$0' : '0';
    }

    // Return full numbers if toggle is on
    if (this.showFullNumbers) {
      if (type === 'currency') {
        return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      }
      return value.toLocaleString('en-US');
    }

    // Compact format with K/M/B
    const absValue = Math.abs(value);
    const sign = value < 0 ? '-' : '';

    if (absValue >= 1e9) {
      return `${sign}${type === 'currency' ? '$' : ''}${(value / 1e9).toFixed(2)}B`;
    }
    if (absValue >= 1e7) {
      return `${sign}${type === 'currency' ? '$' : ''}${(value / 1e7).toFixed(2)}Cr`;
    }
    if (absValue >= 1e6) {
      return `${sign}${type === 'currency' ? '$' : ''}${(value / 1e6).toFixed(2)}M`;
    }
    if (absValue >= 1e5) {
      return `${sign}${type === 'currency' ? '$' : ''}${(value / 1e5).toFixed(2)}L`;
    }
    if (absValue >= 1e3) {
      return `${sign}${type === 'currency' ? '$' : ''}${(value / 1e3).toFixed(1)}K`;
    }

    if (type === 'currency') {
      return `${sign}$${value.toFixed(2)}`;
    }
    return `${sign}${value.toFixed(0)}`;
  }

  fetchStockOutData(): void {
    this.isLoading = true;
    this.error = null;
    
    const apiUrl = 'http://localhost:4000/api/v1/pos/dashboard_stockOut'; 
    
    console.log('Fetching data from:', apiUrl);
    
    this.http.get<chartStockOutResponse>(apiUrl).subscribe({
      next: (response) => {
        console.log('Full API Response:', response);
        
        if (response && response.success && response.message && response.message.length > 0) {
          this.stockOutData = response.message;
          console.log('Stock Out Data received:', this.stockOutData);
          console.log('First item sample:', this.stockOutData[0]);
          
          this.extractAvailableYears();
          
          // Set default to current year after years are extracted
          this.setDefaultToCurrentYear();
          
          this.updateDisplayData();
          
          // Force change detection by creating a new reference
          this.displayData = [...this.displayData];
          
          console.log('Final Display Data:', this.displayData);
          console.log('Display Data length:', this.displayData.length);
          console.log('Selected Period:', this.selectedPeriod);
          
          setTimeout(() => {
            this.createCharts();
          }, 200);
        } else {
          console.log('No data in response or invalid response structure');
          this.error = 'No data available';
          this.stockOutData = [];
          this.displayData = [];
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching stock-out data:', err);
        this.error = 'Failed to fetch stock-out data. Please try again.';
        this.isLoading = false;
        this.stockOutData = [];
        this.displayData = [];
      }
    });
  }

  // New method to set default to current year
  setDefaultToCurrentYear(): void {
    const currentYear = new Date().getFullYear();
    console.log('Current year:', currentYear);
    console.log('Available years:', this.availableYears);
    
    // Check if current year exists in available years
    if (this.availableYears.includes(currentYear)) {
      this.selectedPeriod = currentYear.toString();
      console.log('Setting default to current year:', currentYear);
    } else if (this.availableYears.length > 0) {
      // If current year not available, set to the most recent year
      this.selectedPeriod = this.availableYears[0].toString();
      console.log('Current year not available, setting to most recent:', this.availableYears[0]);
    } else {
      // If no years available, set to 'all'
      this.selectedPeriod = 'all';
      console.log('No years available, setting to "all"');
    }
  }

  getProducts(): void {
    this.loading = true;
    this.errordata = null;

    this.service.products().subscribe({
      next: (res: StockApiResponse) => {
        console.log('Products received:', res);
        if (res && res.data) {
          this.productsList = res.data;
          this.filteredProducts = [...this.productsList];
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading products:', err);
        this.errordata = 'Failed to load products';
        this.loading = false;
      },
    });
  }

  extractAvailableYears(): void {
    const years = new Set<number>();
    this.stockOutData.forEach(item => {
      if (item.stockOutDate) {
        const year = new Date(item.stockOutDate).getFullYear();
        years.add(year);
      }
    });
    this.availableYears = Array.from(years).sort((a, b) => b - a); // Sort descending (newest first)
    console.log('Available years (sorted):', this.availableYears);
  }

  onPeriodChange(event: any): void {
    this.selectedPeriod = event.target.value;
    console.log('Period changed to:', this.selectedPeriod);
    this.updateDisplayData();
    
    // Force change detection
    this.displayData = [...this.displayData];
    
    setTimeout(() => {
      this.createCharts();
    }, 100);
  }

  updateDisplayData(): void {
    console.log('Updating display data. Selected period:', this.selectedPeriod);
    console.log('StockOutData length:', this.stockOutData.length);
    
    if (!this.stockOutData || this.stockOutData.length === 0) {
      console.log('No stockOutData available');
      this.displayData = [];
      return;
    }

    if (this.selectedPeriod === 'all') {
      // For All Time, show all data
      this.displayData = [...this.stockOutData];
      console.log('Showing all data. Count:', this.displayData.length);
    } else {
      // Filter by selected year
      const year = parseInt(this.selectedPeriod);
      console.log('Filtering for year:', year);
      
      this.displayData = this.stockOutData.filter(item => {
        if (!item.stockOutDate) {
          console.log('Item missing stockOutDate:', item);
          return false;
        }
        const itemYear = new Date(item.stockOutDate).getFullYear();
        return itemYear === year;
      });
      
      console.log(`Filtered data for ${year}:`, this.displayData.length, 'items');
    }
    
    // Log first few items for debugging
    if (this.displayData.length > 0) {
      console.log('First display item:', this.displayData[0]);
      console.log('Sample date:', this.displayData[0].stockOutDate);
      console.log('Sample Total_sale:', this.displayData[0].Total_sale);
    } else {
      console.log('No items to display after filtering');
    }
  }

  getTotalQuantity(quantities: number[]): number {
    if (!quantities || !Array.isArray(quantities)) return 0;
    return quantities.reduce((sum, qty) => sum + (qty || 0), 0);
  }

  calculateProfit(item: chartStockOut): number {
    if (!item || !item.Total_sale) return 0;
    const totalQty = this.getTotalQuantity(item.quantity);
    if (totalQty > 100) return item.Total_sale * 0.30;
    if (totalQty > 50) return item.Total_sale * 0.25;
    return item.Total_sale * 0.20;
  }

  createCharts(): void {
    if (!this.displayData || this.displayData.length === 0) {
      console.log('No data to create charts');
      return;
    }
    
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
    
    if (!ctx) {
      console.log('Bar chart canvas not found');
      return;
    }

    if (this.barChart) {
      this.barChart.destroy();
    }

    // Group data by year
    const yearData = new Map<number, { sales: number; quantity: number; profit: number }>();
    
    this.displayData.forEach(item => {
      if (!item.stockOutDate) return;
      
      const year = new Date(item.stockOutDate).getFullYear();
      const current = yearData.get(year) || { sales: 0, quantity: 0, profit: 0 };
      
      yearData.set(year, {
        sales: current.sales + (item.Total_sale || 0),
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
                    return `${label}: ${this.formatNumber(context.parsed.y, 'currency')}`;
                  }
                  return `${label}: ${this.formatNumber(context.parsed.y, 'number')}`;
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
            ticks: { 
              callback: (value) => {
                return this.formatNumber(value as number, 'currency');
              }
            }
          },
          y1: {
            type: 'linear',
            position: 'right',
            title: { display: true, text: 'Quantity' },
            grid: { drawOnChartArea: false },
            ticks: { 
              callback: (value) => {
                return this.formatNumber(value as number, 'number');
              }
            }
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
      if (!item.stockOutDate) return;
      const month = new Date(item.stockOutDate).getMonth();
      monthlyData[month].sales += item.Total_sale || 0;
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
                    return `${label}: ${this.formatNumber(context.parsed.y, 'currency')}`;
                  }
                  return `${label}: ${this.formatNumber(context.parsed.y, 'number')}`;
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
            ticks: { 
              callback: (value) => {
                return this.formatNumber(value as number, 'currency');
              }
            }
          },
          y1: {
            type: 'linear',
            position: 'right',
            title: { display: true, text: 'Quantity' },
            grid: { drawOnChartArea: false },
            ticks: { 
              callback: (value) => {
                return this.formatNumber(value as number, 'number');
              }
            }
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
      if (!item.stockOutDate) return;
      
      const year = new Date(item.stockOutDate).getFullYear().toString();
      const current = yearMap.get(year) || { sales: 0, quantity: 0, profit: 0 };
      
      yearMap.set(year, {
        sales: current.sales + (item.Total_sale || 0),
        quantity: current.quantity + this.getTotalQuantity(item.quantity),
        profit: current.profit + this.calculateProfit(item)
      });
    });

    const years = Array.from(yearMap.keys()).sort();
    const salesData = years.map(y => yearMap.get(y)!.sales);

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
                
                return `${year}: ${this.formatNumber(saleValue, 'currency')} (${percentage}%)`;
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
    
    this.displayData.forEach(item => {
      if (!item.stockOutDate) return;
      const month = new Date(item.stockOutDate).getMonth();
      monthlySales[month] += item.Total_sale || 0;
    });

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const activeMonths: string[] = [];
    const activeSales: number[] = [];
    const activeColors: string[] = [];

    months.forEach((month, index) => {
      if (monthlySales[index] > 0) {
        activeMonths.push(month);
        activeSales.push(monthlySales[index]);
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
                
                return `${month}: ${this.formatNumber(saleValue, 'currency')} (${percentage}%)`;
              }
            }
          }
        }
      }
    });
  }

  refreshData(): void {
    this.fetchStockOutData();
    this.getProducts();
  }

  // Summary statistics
  get totalSales(): number {
    if (!this.displayData || this.displayData.length === 0) return 0;
    return this.displayData.reduce((sum, item) => sum + (item.Total_sale || 0), 0);
  }

  get totalQuantity(): number {
    if (!this.displayData || this.displayData.length === 0) return 0;
    return this.displayData.reduce((sum, item) => 
      sum + this.getTotalQuantity(item.quantity), 0
    );
  }

  get averageSale(): number {
    if (!this.displayData || this.displayData.length === 0) return 0;
    return this.totalSales / this.displayData.length;
  }

  get totalProfit(): number {
    if (!this.displayData || this.displayData.length === 0) return 0;
    return this.displayData.reduce((sum, item) => 
      sum + this.calculateProfit(item), 0
    );
  }

  getActiveProductsCount(): number {
    if (!this.productsList) return 0;
    return this.productsList.filter((product) => product.product?.isActive).length;
  }

  getTotalStockCount(): number {
    if (!this.productsList) return 0;
    return this.productsList.reduce((total, product) => total + (product.totalRemainingStock || 0), 0);
  }
}