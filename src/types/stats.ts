export interface Stats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  activePromos: number;
  bestSellingProducts: {
    productId: string;
    name: string;
    sold: number;
  }[];
  lastUpdated: string;
}
