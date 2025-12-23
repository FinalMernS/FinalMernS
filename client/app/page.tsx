import Link from 'next/link';
import { BooksList } from '@/components/BooksList';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-10 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-3 drop-shadow-sm">
            Добро пожаловать в BookStore
          </h1>
          <p className="text-xl text-gray-700 font-medium">
            Откройте для себя свою следующую любимую книгу
          </p>
        </div>
        <BooksList />
      </div>
    </main>
  );
}


