import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useOrderStore } from "utils/orderStore";
import { formatCurrency } from "utils/constants";
import { APP_BASE_PATH } from "app";

export default function OrderPrint() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");
  const { getOrder } = useOrderStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      getOrder(orderId)
        .then((data) => {
          setOrder(data);
          // Auto print when loaded
          setTimeout(() => {
            window.print();
          }, 500);
        })
        .catch((error) => {
          console.error("Error fetching order:", error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [orderId, getOrder]);

  // Format address safely for display
  const formatShippingAddress = (order: Order) => {
    if (!order.shippingInfo) return 'N/A';
    
    const city = order.shippingInfo.city || 'N/A';
    const state = order.shippingInfo.state || 'N/A';
    const zipCode = order.shippingInfo.zipCode || 'N/A';
    
    return `${city}, ${state} ${zipCode}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Order Not Found</h1>
          <p>We couldn't find the order you're looking for.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto print:max-w-full print:mx-0 print:p-4">
      {/* Print Header */}
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">Order Receipt</h1>
          <p className="text-gray-600 mb-1">Ahadu Market</p>
          <p className="text-gray-600 mb-1">Order #{order.id}</p>
          <p className="text-gray-600">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
        </div>
        <div className="print:hidden">
          <button 
            onClick={() => window.print()} 
            className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90"
          >
            Print
          </button>
        </div>
      </div>

      {/* Customer Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="border rounded p-4">
          <h2 className="font-bold text-lg mb-2">Customer Information</h2>
          <p>{order.shippingInfo?.fullName || 'N/A'}</p>
          <p>{order.shippingInfo?.email || 'N/A'}</p>
          <p>{order.shippingInfo?.phone || 'N/A'}</p>
        </div>
        <div className="border rounded p-4">
          <h2 className="font-bold text-lg mb-2">Shipping Address</h2>
          <p>{order.shippingInfo?.address || 'N/A'}</p>
          <p>{formatShippingAddress(order)}</p>
          <p>{order.shippingInfo?.country || 'N/A'}</p>
        </div>
      </div>

      {/* Order Summary */}
      <div className="mb-8">
        <h2 className="font-bold text-lg mb-4">Order Summary</h2>
        <div className="border rounded overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3">Product</th>
                <th className="p-3">Price</th>
                <th className="p-3">Quantity</th>
                <th className="p-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, index) => (
                <tr key={index} className="border-t">
                  <td className="p-3">{item.name}</td>
                  <td className="p-3">{formatCurrency(item.price)}</td>
                  <td className="p-3">{item.quantity}</td>
                  <td className="p-3 text-right">{formatCurrency(item.price * item.quantity)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr className="border-t">
                <td colSpan={3} className="p-3 font-medium">Subtotal</td>
                <td className="p-3 text-right">{formatCurrency(order.subtotal)}</td>
              </tr>
              <tr className="border-t">
                <td colSpan={3} className="p-3 font-medium">Shipping</td>
                <td className="p-3 text-right">{formatCurrency(order.shipping)}</td>
              </tr>
              <tr className="border-t">
                <td colSpan={3} className="p-3 font-medium">Tax</td>
                <td className="p-3 text-right">{formatCurrency(order.tax)}</td>
              </tr>
              <tr className="border-t">
                <td colSpan={3} className="p-3 font-bold">Total</td>
                <td className="p-3 text-right font-bold">{formatCurrency(order.total)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Payment Info */}
      <div className="mb-8">
        <h2 className="font-bold text-lg mb-2">Payment Information</h2>
        <p><span className="font-medium">Payment Method:</span> {order.paymentMethod || 'N/A'}</p>
        <p><span className="font-medium">Status:</span> {order.status}</p>
      </div>

      {/* Footer */}
      <div className="text-center text-gray-500 text-sm mt-12">
        <p>Thank you for shopping with Ahadu Market!</p>
        <p className="mt-1">For questions about your order, please contact customer service at info@ahadumarket.store</p>
        <p className="mt-4">© {new Date().getFullYear()} Ahadu Market. All rights reserved.</p>
      </div>

      {/* Print return button */}
      <div className="mt-8 text-center print:hidden">
        <a 
          href={`${APP_BASE_PATH}/order?id=${order.id}`}
          className="text-primary hover:underline"
        >
          Return to Order Details
        </a>
      </div>
    </div>
  );
}
