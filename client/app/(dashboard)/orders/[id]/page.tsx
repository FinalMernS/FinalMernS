'use client';

import { useQuery, gql } from '@apollo/client';
import { useParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const GET_ORDER = gql`
  query GetOrder($id: ID!) {
    order(id: $id) {
      id
      totalAmount
      status
      createdAt
      items {
        bookId
        book {
          id
          title
          price
          coverImage
        }
        quantity
        price
      }
      shippingAddress {
        street
        city
        zipCode
        country
      }
    }
  }
`;

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const { data, loading, error } = useQuery(GET_ORDER, {
    variables: { id: orderId },
    skip: !isAuthenticated(),
  });

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error) return <div className="text-red-500">Error: {error.message}</div>;

  const order = data?.order;
  if (!order) return <div>Order not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold mb-6">Order #{order.id.slice(-8)}</h1>
          
          <div className="mb-6">
            <p className="text-lg">
              <strong>Status:</strong>{' '}
              <span className={`px-3 py-1 rounded ${
                order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {order.status}
              </span>
            </p>
            <p className="text-gray-600 mt-2">
              Placed on {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Items</h2>
            <div className="space-y-4">
              {order.items.map((item: any, index: number) => (
                <div key={index} className="flex items-center justify-between border-b pb-4">
                  <div className="flex items-center space-x-4">
                    {item.book?.coverImage && (
                      <img
                        src={item.book.coverImage}
                        alt={item.book.title}
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}
                    <div>
                      <p className="font-semibold">{item.book?.title || 'Unknown Book'}</p>
                      <p className="text-gray-600">Quantity: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
            <p>{order.shippingAddress.street}</p>
            <p>{order.shippingAddress.city}, {order.shippingAddress.zipCode}</p>
            <p>{order.shippingAddress.country}</p>
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center">
              <span className="text-xl font-semibold">Total</span>
              <span className="text-2xl font-bold text-primary-600">
                ${order.totalAmount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


