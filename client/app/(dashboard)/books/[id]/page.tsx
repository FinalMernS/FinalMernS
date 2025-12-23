'use client';

import { useQuery, gql } from '@apollo/client';
import { useParams } from 'next/navigation';
import { useCartStore } from '@/lib/store/cart-store';

const GET_BOOK = gql`
  query GetBook($id: ID!) {
    book(id: $id) {
      id
      title
      description
      price
      stock
      coverImage
      isbn
      publishedDate
      author {
        id
        name
        bio
      }
    }
  }
`;

export default function BookDetailPage() {
  const params = useParams();
  const bookId = params.id as string;
  const { data, loading, error } = useQuery(GET_BOOK, {
    variables: { id: bookId },
  });
  const addItem = useCartStore((state) => state.addItem);

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error) return <div className="text-red-500">Error: {error.message}</div>;

  const book = data?.book;
  if (!book) return <div>Book not found</div>;

  const handleAddToCart = () => {
    addItem({
      bookId: book.id,
      title: book.title,
      price: book.price,
      coverImage: book.coverImage,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="md:flex">
            {book.coverImage && (
              <div className="md:w-1/3">
                <img
                  src={book.coverImage}
                  alt={book.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="md:w-2/3 p-8">
              <h1 className="text-4xl font-bold mb-4">{book.title}</h1>
              <p className="text-xl text-gray-600 mb-4">
                by {book.author?.name || 'Unknown Author'}
              </p>
              
              <div className="mb-6">
                <p className="text-gray-700 whitespace-pre-line">{book.description}</p>
              </div>

              <div className="border-t pt-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-3xl font-bold text-primary-600">
                    ${book.price.toFixed(2)}
                  </span>
                  <span className="text-gray-600">
                    {book.stock > 0 ? `${book.stock} in stock` : 'Out of stock'}
                  </span>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <p><strong>ISBN:</strong> {book.isbn}</p>
                  {book.publishedDate && (
                    <p><strong>Published:</strong> {new Date(book.publishedDate).getFullYear()}</p>
                  )}
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={book.stock === 0}
                  className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-lg font-semibold"
                >
                  {book.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


