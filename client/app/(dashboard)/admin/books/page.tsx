'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, gql } from '@apollo/client';
import { useAuthStore } from '@/lib/store/auth-store';
import Link from 'next/link';

const GET_BOOKS = gql`
  query GetBooks {
    books {
      id
      title
      price
      stock
      isbn
      author {
        id
        name
      }
      isDeleted
    }
  }
`;

const DELETE_BOOK = gql`
  mutation DeleteBook($id: ID!) {
    deleteBook(id: $id)
  }
`;

export default function AdminBooksPage() {
  const router = useRouter();
  const { isAuthenticated, isAdmin } = useAuthStore();
  const [deleteBook] = useMutation(DELETE_BOOK, {
    refetchQueries: [{ query: GET_BOOKS }],
  });

  const { data, loading, error } = useQuery(GET_BOOKS, {
    skip: !isAuthenticated() || !isAdmin(),
  });

  useEffect(() => {
    if (!isAuthenticated() || !isAdmin()) {
      router.push('/');
    }
  }, [isAuthenticated, isAdmin, router]);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this book?')) {
      try {
        await deleteBook({ variables: { id } });
        alert('Book deleted successfully');
      } catch (err: any) {
        alert('Error: ' + err.message);
      }
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error) return <div className="text-red-500">Error: {error.message}</div>;

  const books = data?.books || [];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Manage Books</h1>
          <Link
            href="/admin/books/new"
            className="px-6 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
          >
            Add New Book
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Author
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ISBN
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {books.map((book: any) => (
                <tr key={book.id} className={book.isDeleted ? 'opacity-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{book.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{book.author?.name || 'Unknown'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{book.isbn}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">${book.price.toFixed(2)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{book.stock}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link
                      href={`/admin/books/${book.id}/edit`}
                      className="text-primary-600 hover:text-primary-900 mr-4"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(book.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {books.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600 mb-4">No books found.</p>
            <Link
              href="/admin/books/new"
              className="px-6 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
            >
              Add First Book
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

