import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { StockApiResponse, StockItem } from '../../Typescript/add_product/add_product';
import { dashboardStockOutItem, dashboardStockOutResponse } from '../../Typescript/dashboard/dashboard';
import { ServiceData } from '../../create_account/api_service/service-data';
import { Router } from '@angular/router';
import { Dashboardservice } from '../dashboard_service/dashboard';
import { Chartjs } from "../chartjs/chartjs";

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, Chartjs],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  filteredProducts: StockItem[] = [];
  productsList: StockItem[] = [];
  stockOutItems: dashboardStockOutItem[] = [];
  
  loading: boolean = false;
  error: string | null = null;
  
  // Sales filter properties
  selectedMonth: string = 'all';
  filteredSales: dashboardStockOutItem[] = [];

  constructor(
    private service: ServiceData,
    private dashboardService: Dashboardservice,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.getProducts();
    this.getStockOutData();
  }

  // Fetch products
  getProducts(): void {
    this.loading = true;
    this.error = null;

    this.service.products().subscribe({
      next: (res: StockApiResponse) => {
        this.productsList = res.data;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Failed to load products';
        this.loading = false;
      },
    });
  }

  // Fetch stock out data
  getStockOutData(): void {
    this.dashboardService.getDashboardItems().subscribe({
      next: (res: dashboardStockOutResponse) => {
        this.stockOutItems = res.message;
        this.filteredSales = res.message; // Initialize filtered sales
      },
      error: (err) => {
        console.error('Failed to load stock out data:', err);
      }
    });
  }

  // Get total stock count
  getTotalStockCount(): number {
    return this.productsList.reduce((total, product) => total + product.totalRemainingStock, 0);
  }

  // Get total stock out quantity
  getTotalStockOutQuantity(): number {
    return this.stockOutItems.reduce((total, item) => {
      return total + this.getTotalQuantity(item.quantity);
    }, 0);
  }

  // Get total quantity from quantity array
  getTotalQuantity(quantities: number[]): number {
    return quantities.reduce((total, qty) => total + qty, 0);
  }

  // Get total sale (filtered or all)
  getTotalSale(items: dashboardStockOutItem[]): number {
    return items.reduce((total, item) => total + item.Total_sale, 0);
  }

  // Get filtered total sale based on selected month
  getFilteredTotalSale(): number {
    return this.getTotalSale(this.filteredSales);
  }

  // Filter sales by month
  filterSalesByMonth(monthValue: string): void {
    this.selectedMonth = monthValue;
    
    if (monthValue === 'all') {
      this.filteredSales = this.stockOutItems;
      return;
    }

    const month = parseInt(monthValue);
    this.filteredSales = this.stockOutItems.filter(item => {
      const itemDate = new Date(item.stockOutDate);
      return itemDate.getMonth() === month;
    });
  }

  // Get month name from month number
  getMonthName(month: number): string {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month];
  }

  // Calculate monthly growth (mock calculation - implement actual logic based on your needs)
  getMonthlyGrowth(): number {
    if (this.selectedMonth === 'all') return 0;
    
    const currentMonth = parseInt(this.selectedMonth);
    const currentMonthSales = this.getTotalSale(
      this.stockOutItems.filter(item => new Date(item.stockOutDate).getMonth() === currentMonth)
    );
    
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const previousMonthSales = this.getTotalSale(
      this.stockOutItems.filter(item => new Date(item.stockOutDate).getMonth() === previousMonth)
    );

    if (previousMonthSales === 0) return 100;
    return Math.round(((currentMonthSales - previousMonthSales) / previousMonthSales) * 100);
  }

  // Parse integer helper for template
  parseInt(value: string): number {
    return parseInt(value);
  }





  yearsName:string[]=[
    'All Time',
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'

  ]
}