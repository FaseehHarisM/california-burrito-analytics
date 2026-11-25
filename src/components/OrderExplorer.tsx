"use client";

import React, { useState, useEffect } from "react";
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  FileText, 
  Eye, 
  X,
  ShoppingBag,
  CreditCard,
  Calendar,
  Store
} from "lucide-react";
import { OrderRecord, FilterState } from "@/types/analytics";

interface OrderExplorerProps {
  filters: FilterState;
  onExport: () => void;
  isExporting: boolean;
}

export default function OrderExplorer({
  filters,
  onExport,
  isExporting,
}: OrderExplorerProps) {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null);

  const fetchOrders = async (targetPage = 1, searchQuery = search) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", targetPage.toString());
      params.set("limit", limit.toString());
      if (searchQuery.trim()) params.set("search", searchQuery.trim());
      if (filters.startDate) params.set("startDate", filters.startDate);
      if (filters.endDate) params.set("endDate", filters.endDate);
      if (filters.outlets.length > 0) params.set("outlets", filters.outlets.join(","));
      if (filters.orderTypes.length > 0) params.set("orderTypes", filters.orderTypes.join(","));
      if (filters.settlements.length > 0) params.set("settlements", filters.settlements.join(","));

      const res = await fetch(`/api/orders?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders);
        setTotalOrders(data.totalOrders);
        setTotalPages(data.totalPages);
        setPage(data.page);
      }
    } catch (err) {
      console.error("Failed to load orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(1, search);
  }, [filters]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders(1, search);
  };

  return (
    <div className="bg-[#111827] border border-gray-800 rounded-2xl p-5 shadow-xl space-y-4">
      {/* Header & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400">
            <FileText className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide uppercase">
              POS Transaction Explorer
            </h3>
            <p className="text-xs text-gray-400">
              Line-item order audit log ({totalOrders.toLocaleString()} matching records)
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search Bill #, Outlet, Item..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-48 sm:w-64 bg-gray-900 border border-gray-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
            />
            <Search className="h-3.5 w-3.5 text-gray-500 absolute left-2.5 top-2.5" />
          </form>

          {/* Export CSV Button */}
          <button
            onClick={onExport}
            disabled={isExporting}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium border border-gray-700 transition-colors disabled:opacity-50"
          >
            <Download className="h-3.5 w-3.5 text-blue-400" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-800 bg-gray-900/40">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-900/80 text-gray-400 uppercase border-b border-gray-800 font-semibold">
            <tr>
              <th className="py-3 px-4">Bill No</th>
              <th className="py-3 px-4">Outlet</th>
              <th className="py-3 px-4">Order Timestamp</th>
              <th className="py-3 px-4">Fulfillment</th>
              <th className="py-3 px-4">Payment</th>
              <th className="py-3 px-4 text-center">Items</th>
              <th className="py-3 px-4 text-right">Bill Total (₹)</th>
              <th className="py-3 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/60">
            {loading ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-gray-500">
                  Loading transactions...
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-gray-500">
                  No orders match the current filter criteria.
                </td>
              </tr>
            ) : (
              orders.map((o) => (
                <tr
                  key={o.bill_no}
                  className="hover:bg-gray-800/40 transition-colors cursor-pointer"
                  onClick={() => setSelectedOrder(o)}
                >
                  <td className="py-2.5 px-4 font-mono font-medium text-orange-400">
                    #{o.bill_no}
                  </td>
                  <td className="py-2.5 px-4 text-white font-medium">{o.outlet}</td>
                  <td className="py-2.5 px-4 text-gray-400">{o.datetime}</td>
                  <td className="py-2.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                        o.order_type === "Dine-In"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : o.order_type === "Delivery"
                          ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      }`}
                    >
                      {o.order_type}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-gray-300">{o.settlement}</td>
                  <td className="py-2.5 px-4 text-center font-mono text-gray-300">
                    {o.total_items}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono font-bold text-white">
                    ₹{o.total_revenue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedOrder(o);
                      }}
                      className="p-1 rounded-md bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white"
                      title="View Bill Details"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between text-xs text-gray-400 pt-1">
        <div>
          Showing page <span className="text-white font-medium">{page}</span> of{" "}
          <span className="text-white font-medium">{totalPages}</span> ({totalOrders.toLocaleString()} orders)
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => fetchOrders(page - 1)}
            disabled={page <= 1 || loading}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed border border-gray-700 transition-colors"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span>Previous</span>
          </button>
          <button
            onClick={() => fetchOrders(page + 1)}
            disabled={page >= totalPages || loading}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed border border-gray-700 transition-colors"
          >
            <span>Next</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Itemized Order Modal / Drawer */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#111827] border border-gray-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="bg-gray-900/90 border-b border-gray-800 px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="h-4 w-4 text-orange-400" />
                <h4 className="font-bold text-white text-sm">
                  Order Details — Bill #{selectedOrder.bill_no}
                </h4>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              {/* Order Meta Info */}
              <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-gray-900/60 border border-gray-800">
                <div className="flex items-center space-x-1.5 text-gray-300">
                  <Store className="h-3.5 w-3.5 text-blue-400" />
                  <span>Outlet: <strong className="text-white">{selectedOrder.outlet}</strong></span>
                </div>
                <div className="flex items-center space-x-1.5 text-gray-300">
                  <Calendar className="h-3.5 w-3.5 text-amber-400" />
                  <span>{selectedOrder.datetime}</span>
                </div>
                <div className="flex items-center space-x-1.5 text-gray-300">
                  <ShoppingBag className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Type: <strong className="text-white">{selectedOrder.order_type}</strong></span>
                </div>
                <div className="flex items-center space-x-1.5 text-gray-300">
                  <CreditCard className="h-3.5 w-3.5 text-purple-400" />
                  <span>Settlement: <strong className="text-white">{selectedOrder.settlement}</strong></span>
                </div>
              </div>

              {/* Line Items List */}
              <div>
                <h5 className="font-semibold text-gray-300 uppercase tracking-wider text-[11px] mb-2">
                  Itemized Line Items ({selectedOrder.items.length})
                </h5>
                <div className="divide-y divide-gray-800 rounded-xl border border-gray-800 bg-gray-900/40">
                  {selectedOrder.items.map((itm, i) => (
                    <div key={i} className="p-2.5 flex items-center justify-between">
                      <div>
                        <div className="font-medium text-white">{itm.item}</div>
                        <div className="text-[11px] text-gray-400">
                          {itm.category} • ₹{itm.price} × {itm.quantity}
                        </div>
                      </div>
                      <div className="font-mono font-bold text-white text-right">
                        ₹{itm.revenue.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Summary */}
              <div className="pt-2 border-t border-gray-800 flex items-center justify-between text-sm">
                <span className="font-semibold text-gray-400">Total Order Amount:</span>
                <span className="font-mono font-bold text-orange-400 text-base">
                  ₹{selectedOrder.total_revenue.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="border-t border-gray-800 px-5 py-3 bg-gray-900/60 flex justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
