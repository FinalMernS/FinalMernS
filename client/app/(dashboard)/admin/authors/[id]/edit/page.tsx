'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation, gql } from '@apollo/client';
import { useAuthStore } from '@/lib/store/auth-store';

const GET_AUTHOR = gql`
  query GetAuthor($id: ID!) {
    author(id: $id) {
      id
      name
      bio
      birthDate
      nationality
      photo
    }
  }
`;

const UPDATE_AUTHOR = gql`
  mutation UpdateAuthor($id: ID!, $input: UpdateAuthorInput!) {
    updateAuthor(id: $id, input: $input) {
      id
      name
    }
  }
`;

export default function EditAuthorPage() {
  const router = useRouter();
  const params = useParams();
  const authorId = params.id as string;
  const { isAuthenticated, isAdmin } = useAuthStore();
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    birthDate: '',
    nationality: '',
    photo: '',
  });
  const [error, setError] = useState('');

  const { data, loading: authorLoading } = useQuery(GET_AUTHOR, {
    variables: { id: authorId },
    skip: !isAuthenticated() || !isAdmin(),
    onCompleted: (data) => {
      const author = data.author;
      setFormData({
        name: author.name,
        bio: author.bio || '',
        birthDate: author.birthDate ? author.birthDate.split('T')[0] : '',
        nationality: author.nationality || '',
        photo: author.photo || '',
      });
    },
  });

  const [updateAuthor, { loading }] = useMutation(UPDATE_AUTHOR, {
    onCompleted: () => {
      router.push('/admin/authors');
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  useEffect(() => {
    if (!isAuthenticated() || !isAdmin()) {
      router.push('/');
    }
  }, [isAuthenticated, isAdmin, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const input: any = {};
    if (formData.name) input.name = formData.name;
    if (formData.bio !== undefined) input.bio = formData.bio;
    if (formData.birthDate) input.birthDate = formData.birthDate;
    if (formData.nationality !== undefined) input.nationality = formData.nationality;
    if (formData.photo !== undefined) input.photo = formData.photo;

    updateAuthor({
      variables: {
        id: authorId,
        input,
      },
    });
  };

  if (authorLoading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6">Edit Author</h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bio
            </label>
            <textarea
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Birth Date
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                value={formData.birthDate}
                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nationality
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                value={formData.nationality}
                onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Photo URL
            </label>
            <input
              type="url"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              value={formData.photo}
              onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
            />
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 disabled:bg-gray-400"
            >
              {loading ? 'Updating...' : 'Update Author'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

