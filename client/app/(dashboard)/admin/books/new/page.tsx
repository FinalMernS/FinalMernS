'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, gql } from '@apollo/client';
import { useAuthStore } from '@/lib/store/auth-store';

const GET_AUTHORS = gql`
  query GetAuthors {
    authors {
      id
      name
    }
  }
`;

const CREATE_BOOK = gql`
  mutation CreateBook($input: CreateBookInput!) {
    createBook(input: $input) {
      id
      title
    }
  }
`;

export default function NewBookPage() {
  const router = useRouter();
  const { isAuthenticated, isAdmin } = useAuthStore();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    isbn: '',
    price: '',
    stock: '',
    coverImage: '',
    publishedDate: '',
    authorId: '',
  });
  const [error, setError] = useState('');

  const { data: authorsData } = useQuery(GET_AUTHORS, {
    skip: !isAuthenticated() || !isAdmin(),
  });

  const [createBook, { loading }] = useMutation(CREATE_BOOK, {
    onCompleted: () => {
      router.push('/admin/books');
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

    createBook({
      variables: {
        input: {
          title: formData.title,
          description: formData.description,
          isbn: formData.isbn,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock),
          coverImage: formData.coverImage || undefined,
          publishedDate: formData.publishedDate || undefined,
          authorId: formData.authorId,
        },
      },
    });
  };

  const authors = authorsData?.authors || [];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6">Add New Book</h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              required
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Author *
            </label>
            <select
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              value={formData.authorId}
              onChange={(e) => setFormData({ ...formData, authorId: e.target.value })}
            >
              <option value="">Select an author</option>
              {authors.map((author: any) => (
                <option key={author.id} value={author.id}>
                  {author.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ISBN *
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                value={formData.isbn}
                onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price *
              </label>
              <input
                type="number"
                step="0.01"
                required
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock *
              </label>
              <input
                type="number"
                required
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Published Date
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                value={formData.publishedDate}
                onChange={(e) => setFormData({ ...formData, publishedDate: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cover Image URL
            </label>
            <input
              type="url"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              value={formData.coverImage}
              onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
            />
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 disabled:bg-gray-400"
            >
              {loading ? 'Creating...' : 'Create Book'}
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

