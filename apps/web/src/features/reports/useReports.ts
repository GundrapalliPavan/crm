import { useQuery } from '@tanstack/react-query';
import type {
  BillingReportQuery,
  InventoryReportQuery,
  LeadsReportQuery,
  OutstandingReportQuery,
  PurchaseReportQuery,
  SalesReportQuery,
  TeamPerformanceReportQuery,
} from '@crm/types';
import { reportsApi } from './api';

export function useDashboard() {
  return useQuery({ queryKey: ['dashboard'], queryFn: reportsApi.getDashboard });
}

export function useLeadsReport(query: LeadsReportQuery) {
  return useQuery({ queryKey: ['reports', 'leads', query], queryFn: () => reportsApi.getLeadsReport(query) });
}

export function useSalesReport(query: SalesReportQuery) {
  return useQuery({ queryKey: ['reports', 'sales', query], queryFn: () => reportsApi.getSalesReport(query) });
}

export function useInventoryReport(query: InventoryReportQuery) {
  return useQuery({ queryKey: ['reports', 'inventory', query], queryFn: () => reportsApi.getInventoryReport(query) });
}

export function usePurchaseReport(query: PurchaseReportQuery) {
  return useQuery({ queryKey: ['reports', 'purchases', query], queryFn: () => reportsApi.getPurchaseReport(query) });
}

export function useBillingReport(query: BillingReportQuery) {
  return useQuery({ queryKey: ['reports', 'billing', query], queryFn: () => reportsApi.getBillingReport(query) });
}

export function useOutstandingReport(query: OutstandingReportQuery) {
  return useQuery({ queryKey: ['reports', 'outstanding', query], queryFn: () => reportsApi.getOutstandingReport(query) });
}

export function useTeamPerformanceReport(query: TeamPerformanceReportQuery) {
  return useQuery({
    queryKey: ['reports', 'team-performance', query],
    queryFn: () => reportsApi.getTeamPerformanceReport(query),
  });
}
