'use client';

import { useQuery, gql } from '@apollo/client';
import Link from 'next/link';
import { useCartStore } from '@/lib/store/cart-store';

const GET_BOOKS = gql`
  query GetBooks($limit: Int, $offset: Int, $search: String) {
    books(limit: $limit, offset: $offset, search: $search) {
      id
      title
      description
      price
      stock
      coverImage
      author {
        id
        name
      }
    }
  }
`;

export function BooksList() {
  const { data, loading, error } = useQuery(GET_BOOKS, {
    variables: { limit: 20, offset: 0 },
  });
  const addItem = useCartStore((state) => state.addItem);

  if (loading) return <div className="text-center py-8 text-gray-700 text-lg font-medium">Загрузка книг...</div>;
  if (error) return <div className="text-center py-8 text-red-600 bg-red-50 border border-red-200 rounded-lg p-4 font-semibold">Ошибка: {error.message}</div>;

  const handleAddToCart = (book: any) => {
    addItem({
      bookId: book.id,
      title: book.title,
      price: book.price,
      coverImage: book.coverImage,
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {data?.books?.map((book: any) => (
        <div
          key={book.id}
          className="bg-white rounded-lg shadow-lg border-2 border-gray-200 overflow-hidden hover:shadow-xl hover:border-primary-400 transition-all"
        >
          {book.coverImage && (
            <img
              src={book.coverImage}
              alt={book.title}
              className="w-full h-64 object-cover"
            />
          )}
          {!book.coverImage && (
            <div className="w-full h-64 bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
              <span className="text-white text-4xl font-bold">📚</span>
            </div>
          )}
          <div className="p-5">
            <Link href={`/books/${book.id}`}>
              <h3 className="text-xl font-bold mb-2 text-gray-900 hover:text-primary-600 cursor-pointer transition-colors">
                {book.title}
              </h3>
            </Link>
            <p className="text-gray-700 text-sm mb-2 font-medium">
              Автор: <span className="text-primary-700">{book.author?.name || 'Неизвестен'}</span>
            </p>
            <p className="text-gray-600 text-sm mb-4 line-clamp-3">
              {book.description}
            </p>
            <div className="flex items-center justify-between pt-3 border-t border-gray-200">
              <span className="text-3xl font-bold text-primary-600">
                ${book.price.toFixed(2)}
              </span>
              <button
                onClick={() => handleAddToCart(book)}
                disabled={book.stock === 0}
                className="px-6 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 active:bg-primary-800 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all"
              >
                {book.stock > 0 ? 'В корзину' : 'Нет в наличии'}
              </button>
            </div>
            <p className="text-xs text-gray-600 mt-3 font-medium">
              В наличии: <span className="text-primary-700 font-bold">{book.stock}</span>
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}


