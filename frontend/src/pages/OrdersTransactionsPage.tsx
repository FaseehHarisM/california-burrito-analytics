import React, { useState, useEffect } from 'react';
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  ReceiptText, 
  ArrowUpDown, 
  Download 
} from 'lucide-react';
import { FilterState, OrderDetail, PaginatedOrdersResponse } from '../types';
import { api } from '../services/api';
import { OrderDetailsModal } from '../components/OrderDetailsModal';
import { formatCurrency, formatNumber } from '../utils/formatters';

interface OrdersTransactionsPageProps {
  filters: FilterState;
}

export const OrdersTransactionsPage: React.FC<OrdersTransactionsPageProps> = ({ filters }) => {
  const [data, setData] = useState<PaginatedOrdersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [sortBy, setSortBy] = useState('order_datetime');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null);

  const fetchOrders = async (targetPage = 1, searchQuery = search) => {
    setLoading(true);
    try {
      const res = await api.getOrders(filters, targetPage, limit, searchQuery, sortBy, sortOrder);
      setData(res);
      setPage(res.page);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(1, search);
  }, [filters, sortBy, sortOrder]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders(1, search);
  };

  const handleSortToggle = (col: string) => {
    if (sortBy === col) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(col);
      setSortOrder('DESC');
    }
  };

  const handleViewBill = async (billNo: number) => {
    try {
      const details = await api.getOrderDetails(billNo);
      setSelectedOrder(details);
    } catch (err) {
      console.error('Failed to load bill details:', err);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Card Header & Controls */}
      <div className="bi-card p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Orders & Transactions Audit Log ({data?.total_orders.toLocaleString() || 0} Bills)
            </h3>
            <p className="text-xs text-slate-500">
              Grouped by BillNo. Click any order row to inspect full itemized receipt breakdown.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search Bill # or outlet..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-52 sm:w-64 bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
              <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </form>

            <a
              href={api.getExportUrl(filters, search)}
              download
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors shadow-xs"
            >
              <Download className="h-3.5 w-3.5 text-slate-500" />
              <span className="hidden sm:inline">Export CSV</span>
            </a>
          </div>
        </div>

        {/* Master Transactions Table */}
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase border-b border-slate-200 font-semibold select-none">
              <tr>
                <th className="py-2.5 px-4 cursor-pointer" onClick={() => handleSortToggle('bill_no')}>
                  <div className="flex items-center space-x-1">
                    <span>Bill No</span>
                    <ArrowUpDown className="h-3 w-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-2.5 px-4 cursor-pointer" onClick={() => handleSortToggle('order_datetime')}>
                  <div className="flex items-center space-x-1">
                    <span>Order Date & Time</span>
                    <ArrowUpDown className="h-3 w-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-2.5 px-4 cursor-pointer" onClick={() => handleSortToggle('outlet_name')}>
                  <div className="flex items-center space-x-1">
                    <span>Outlet</span>
                    <ArrowUpDown className="h-3 w-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-2.5 px-4">Fulfillment</th>
                <th className="py-2.5 px-4">Payment Method</th>
                <th className="py-2.5 px-4 text-center">Line Items</th>
                <th className="py-2.5 px-4 text-center cursor-pointer" onClick={() => handleSortToggle('total_quantity')}>
                  <div className="flex items-center justify-center space-x-1">
                    <span>Total Qty</span>
                    <ArrowUpDown className="h-3 w-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-2.5 px-4 text-right cursor-pointer" onClick={() => handleSortToggle('total_revenue')}>
                  <div className="flex items-center justify-end space-x-1">
                    <span>Order Revenue</span>
                    <ArrowUpDown className="h-3 w-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-2.5 px-4 text-center">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">Loading order transactions...</td>
                </tr>
              ) : !data || data.orders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">No orders match your filter criteria.</td>
                </tr>
              ) : (
                data.orders.map((o) => (
                  <tr
                    key={o.bill_no}
                    onClick={() => handleViewBill(o.bill_no)}
                    className="hover:bg-slate-50/70 cursor-pointer transition-colors"
                  >
                    <td className="py-2.5 px-4 font-mono font-bold text-blue-600">#{o.bill_no}</td>
                    <td className="py-2.5 px-4 text-slate-600">{o.order_datetime}</td>
                    <td className="py-2.5 px-4 font-semibold text-slate-800">{o.outlet}</td>
                    <td className="py-2.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                        o.order_type === 'Dine-In'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : o.order_type === 'Delivery'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {o.order_type}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-slate-600">{o.settlement}</td>
                    <td className="py-2.5 px-4 text-center font-mono text-slate-600">{o.line_items_count}</td>
                    <td className="py-2.5 px-4 text-center font-mono font-medium text-slate-700">{o.total_quantity}</td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">
                      {formatCurrency(o.order_revenue)}
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewBill(o.bill_no);
                        }}
                        className="p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-slate-100"
                        title="View Line Items"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <div>
            Page <span className="font-semibold text-slate-900">{page}</span> of{' '}
            <span className="font-semibold text-slate-900">{data?.total_pages || 1}</span> ({data?.total_orders.toLocaleString() || 0} orders)
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => fetchOrders(page - 1)}
              disabled={page <= 1 || loading}
              className="flex items-center space-x-1 px-3 py-1 rounded-md border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Previous</span>
            </button>
            <button
              onClick={() => fetchOrders(page + 1)}
              disabled={!data || page >= data.total_pages || loading}
              className="flex items-center space-x-1 px-3 py-1 rounded-md border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <span>Next</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Itemized Order Details Modal */}
      <OrderDetailsModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </div>
  );
};
