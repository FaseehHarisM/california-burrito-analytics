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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-xl w-full max-w-lg shadow-xl overflow-hidden" style={{ border: '1px solid #C8C2AA' }}>
        {/* Header */}
        <div
          className="px-5 py-3.5 flex items-center justify-between"
          style={{ backgroundColor: '#1B4332', borderBottom: '2px solid #E8231A' }}
        >
          <div className="flex items-center space-x-2">
            <ShoppingBag className="h-4 w-4" style={{ color: '#F5F0DC' }} />
            <h4 className="font-bold text-sm" style={{ color: '#F5F0DC' }}>
              Order #{order.bill_no} — Receipt Details
            </h4>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md transition-colors"
            style={{ color: 'rgba(245,240,220,0.75)' }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          {/* Metadata Grid */}
          <div
            className="grid grid-cols-2 gap-2 p-3 rounded-lg"
            style={{ backgroundColor: '#FAF8F0', border: '1px solid #E5E0D0' }}
          >
            <div className="flex items-center space-x-1.5" style={{ color: '#5C5648' }}>
              <Store className="h-3.5 w-3.5" style={{ color: '#E8231A' }} />
              <span>Store: <strong style={{ color: '#1B4332' }}>{order.outlet}</strong></span>
            </div>
            <div className="flex items-center space-x-1.5" style={{ color: '#5C5648' }}>
              <Calendar className="h-3.5 w-3.5" style={{ color: '#2D6A4F' }} />
              <span>{order.order_datetime}</span>
            </div>
            <div className="flex items-center space-x-1.5" style={{ color: '#5C5648' }}>
              <ShoppingBag className="h-3.5 w-3.5" style={{ color: '#2D6A4F' }} />
              <span>Order Type: <strong style={{ color: '#1B4332' }}>{order.order_type}</strong></span>
            </div>
            <div className="flex items-center space-x-1.5" style={{ color: '#5C5648' }}>
              <CreditCard className="h-3.5 w-3.5" style={{ color: '#E8231A' }} />
              <span>Payment: <strong style={{ color: '#1B4332' }}>{order.settlement}</strong></span>
            </div>
          </div>

          {/* Line items table */}
          <div>
            <h5 className="font-semibold uppercase tracking-wider text-[11px] mb-2" style={{ color: '#1B4332' }}>
              Ordered Items ({order.items?.length || order.line_items_count})
            </h5>

            <div className="divide-y divide-slate-100 rounded-lg overflow-hidden" style={{ border: '1px solid #E5E0D0' }}>
              {order.items && order.items.length > 0 ? (
                order.items.map((itm, i) => (
                  <div key={i} className="p-2.5 flex items-center justify-between hover:bg-cb-cream-bg/70">
                    <div>
                      <div className="font-medium" style={{ color: '#1B4332' }}>{itm.item}</div>
                      <div className="text-[11px]" style={{ color: '#7A7260' }}>
                        {itm.category} • ₹{itm.unit_price} × {itm.quantity}
                      </div>
                    </div>
                    <div className="font-mono font-semibold text-right" style={{ color: '#1B4332' }}>
                      {formatCurrency(itm.line_revenue)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center" style={{ color: '#7A7260' }}>Loading line items...</div>
              )}
            </div>
          </div>

          {/* Total */}
          <div className="pt-2 flex items-center justify-between text-sm" style={{ borderTop: '1px solid #E5E0D0' }}>
            <span className="font-semibold" style={{ color: '#5C5648' }}>Order Total:</span>
            <span className="font-mono font-bold text-base" style={{ color: '#E8231A' }}>
              {formatCurrency(order.order_revenue)}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div
          className="px-5 py-3 flex justify-end"
          style={{ backgroundColor: '#FAF8F0', borderTop: '1px solid #E5E0D0' }}
        >
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-colors"
            style={{ backgroundColor: '#1B4332', color: '#F5F0DC' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
