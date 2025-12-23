'use client';

import Link from 'next/link';
import { useAuthStore } from '@/lib/store/auth-store';
import { useCartStore } from '@/lib/store/cart-store';

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const itemCount = useCartStore((state) => state.getItemCount());

  return (
    <nav className="bg-white shadow-xl border-b-2 border-primary-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="text-3xl font-bold text-primary-600 hover:text-primary-700 transition-colors">
            📚 BookStore
          </Link>
          
          <div className="flex items-center space-x-6">
            <Link href="/" className="text-gray-700 font-semibold hover:text-primary-600 transition-colors">
              Книги
            </Link>
            
            {isAuthenticated() ? (
              <>
                <Link href="/cart" className="relative text-gray-700 font-semibold hover:text-primary-600 transition-colors">
                  Корзина
                  {itemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg">
                      {itemCount}
                    </span>
                  )}
                </Link>
                <Link href="/my-orders" className="text-gray-700 font-semibold hover:text-primary-600 transition-colors">
                  Мои заказы
                </Link>
                <Link href="/profile" className="text-gray-700 font-semibold hover:text-primary-600 transition-colors">
                  Профиль
                </Link>
                {user?.role === 'ADMIN' && (
                  <Link href="/admin" className="px-3 py-1 bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-600 transition-colors">
                    Админ
                  </Link>
                )}
                <button
                  onClick={logout}
                  className="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors"
                >
                  Выход
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-gray-700 font-semibold hover:text-primary-600 transition-colors">
                  Вход
                </Link>
                <Link
                  href="/register"
                  className="px-6 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 shadow-md hover:shadow-lg transition-all"
                >
                  Регистрация
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

