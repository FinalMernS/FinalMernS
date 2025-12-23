'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, gql } from '@apollo/client';
import { useAuthStore } from '@/lib/store/auth-store';

const GET_ME = gql`
  query GetMe {
    me {
      id
      email
      name
      role
      avatar
    }
  }
`;

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { data, loading } = useQuery(GET_ME, {
    skip: !isAuthenticated(),
  });

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (loading) return <div className="text-center py-8">Loading...</div>;

  const profileUser = data?.me || user;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold mb-6">Profile</h1>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <p className="mt-1 text-lg text-gray-900">{profileUser?.name}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <p className="mt-1 text-lg text-gray-900">{profileUser?.email}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Role</label>
              <p className="mt-1 text-lg text-gray-900 capitalize">{profileUser?.role?.toLowerCase()}</p>
            </div>
          </div>

          <div className="mt-8">
            <button
              onClick={() => {
                logout();
                router.push('/');
              }}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


