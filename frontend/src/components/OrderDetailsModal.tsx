import React from 'react';
import { X, ShoppingBag, Store, Calendar, CreditCard } from 'lucide-react';
import { OrderDetail } from '../types';
import { formatCurrency } from '../utils/formatters';

interface OrderDetailsModalProps {
  order: OrderDetail | null;
  onClose: () => void;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ order, onClose }) => {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-xl w-full max-w-lg shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="h-4 w-4 text-blue-600" />
            <h4 className="font-bold text-slate-900 text-sm">
              Bill #{order.bill_no} — Order Audit Details
            </h4>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-2 p-3 rounded-lg bg-slate-50 border border-slate-200/80">
            <div className="flex items-center space-x-1.5 text-slate-600">
              <Store className="h-3.5 w-3.5 text-slate-400" />
              <span>Outlet: <strong className="text-slate-900">{order.outlet}</strong></span>
            </div>
            <div className="flex items-center space-x-1.5 text-slate-600">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              <span>{order.order_datetime}</span>
            </div>
            <div className="flex items-center space-x-1.5 text-slate-600">
              <ShoppingBag className="h-3.5 w-3.5 text-slate-400" />
              <span>Fulfillment: <strong className="text-slate-900">{order.order_type}</strong></span>
            </div>
            <div className="flex items-center space-x-1.5 text-slate-600">
              <CreditCard className="h-3.5 w-3.5 text-slate-400" />
              <span>Payment: <strong className="text-slate-900">{order.settlement}</strong></span>
            </div>
          </div>

          {/* Line items table */}
          <div>
            <h5 className="font-semibold text-slate-700 uppercase tracking-wider text-[11px] mb-2">
              Itemized Line Items ({order.items?.length || order.line_items_count})
            </h5>

            <div className="divide-y divide-slate-100 rounded-lg border border-slate-200 overflow-hidden">
              {order.items && order.items.length > 0 ? (
                order.items.map((itm, i) => (
                  <div key={i} className="p-2.5 flex items-center justify-between hover:bg-slate-50">
                    <div>
                      <div className="font-medium text-slate-900">{itm.item}</div>
                      <div className="text-[11px] text-slate-500">
                        {itm.category} • ₹{itm.unit_price} × {itm.quantity}
                      </div>
                    </div>
                    <div className="font-mono font-semibold text-slate-900 text-right">
                      {formatCurrency(itm.line_revenue)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-slate-400">Loading line items...</div>
              )}
            </div>
          </div>

          {/* Total */}
          <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-sm">
            <span className="font-semibold text-slate-600">Total Order Revenue:</span>
            <span className="font-mono font-bold text-blue-600 text-base">
              {formatCurrency(order.order_revenue)}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 px-5 py-3 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium shadow-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
