'use client';

import { useQuery, gql } from '@apollo/client';
import { useAuthStore } from '@/lib/store/auth-store';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

const GET_MY_ORDERS = gql`
  query GetMyOrders {
    myOrders {
      id
      totalAmount
      status
      createdAt
      items {
        bookId
        quantity
        price
      }
    }
  }
`;

export default function MyOrdersPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { data, loading, error } = useQuery(GET_MY_ORDERS, {
    skip: !isAuthenticated(),
  });

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error) return <div className="text-red-500">Error: {error.message}</div>;

  const orders = data?.myOrders || [];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6">My Orders</h1>
        
        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600 mb-4">You haven't placed any orders yet.</p>
            <Link
              href="/"
              className="px-6 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
            >
              Browse Books
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order: any) => (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="block bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600">
                      Order #{order.id.slice(-8)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-500">
                      {order.items.length} item(s)
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary-600">
                      ${order.totalAmount.toFixed(2)}
                    </p>
                    <span className={`inline-block px-3 py-1 rounded text-sm ${
                      order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                      order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


