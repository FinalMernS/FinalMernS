import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/User';
import { Author } from '../models/Author';
import { Book } from '../models/Book';
import { Order } from '../models/Order';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/bookstore';

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Author.deleteMany({});
    await Book.deleteMany({});
    await Order.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create users
    const admin = await User.create({
      email: 'admin@bookstore.com',
      password: 'admin123',
      name: 'Admin User',
      role: 'ADMIN',
    });

    const user = await User.create({
      email: 'user@bookstore.com',
      password: 'user123',
      name: 'Regular User',
      role: 'USER',
    });

    console.log('👤 Created users');

    // Create authors
    const author1 = await Author.create({
      name: 'J.K. Rowling',
      bio: 'British author, best known for the Harry Potter series',
      birthDate: new Date('1965-07-31'),
      nationality: 'British',
    });

    const author2 = await Author.create({
      name: 'George R.R. Martin',
      bio: 'American novelist and short story writer, best known for A Song of Ice and Fire',
      birthDate: new Date('1948-09-20'),
      nationality: 'American',
    });

    const author3 = await Author.create({
      name: 'Stephen King',
      bio: 'American author of horror, supernatural fiction, suspense, and fantasy novels',
      birthDate: new Date('1947-09-21'),
      nationality: 'American',
    });

    const author4 = await Author.create({
      name: 'Agatha Christie',
      bio: 'English writer known for her detective novels',
      birthDate: new Date('1890-09-15'),
      nationality: 'British',
    });

    console.log('✍️  Created authors');

    // Create books
    const book1 = await Book.create({
      title: 'Harry Potter and the Philosopher\'s Stone',
      description: 'The first book in the Harry Potter series, following the adventures of a young wizard.',
      isbn: '9780747532699',
      price: 19.99,
      stock: 50,
      publishedDate: new Date('1997-06-26'),
      authorId: author1._id,
    });

    const book2 = await Book.create({
      title: 'A Game of Thrones',
      description: 'The first book in A Song of Ice and Fire series, set in the fictional Seven Kingdoms of Westeros.',
      isbn: '9780553103540',
      price: 24.99,
      stock: 30,
      publishedDate: new Date('1996-08-01'),
      authorId: author2._id,
    });

    const book3 = await Book.create({
      title: 'The Shining',
      description: 'A horror novel about a writer who becomes the winter caretaker of an isolated hotel.',
      isbn: '9780307743657',
      price: 16.99,
      stock: 40,
      publishedDate: new Date('1977-01-28'),
      authorId: author3._id,
    });

    const book4 = await Book.create({
      title: 'Murder on the Orient Express',
      description: 'A detective novel featuring Hercule Poirot, who must solve a murder on a train.',
      isbn: '9780062693662',
      price: 14.99,
      stock: 35,
      publishedDate: new Date('1934-01-01'),
      authorId: author4._id,
    });

    const book5 = await Book.create({
      title: 'Harry Potter and the Chamber of Secrets',
      description: 'The second book in the Harry Potter series.',
      isbn: '9780747538493',
      price: 19.99,
      stock: 45,
      publishedDate: new Date('1998-07-02'),
      authorId: author1._id,
    });

    console.log('📚 Created books');

    // Create orders
    await Order.create({
      userId: user._id,
      items: [
        { bookId: book1._id, quantity: 2, price: book1.price },
        { bookId: book3._id, quantity: 1, price: book3.price },
      ],
      totalAmount: book1.price * 2 + book3.price,
      status: 'PENDING',
      shippingAddress: {
        street: '123 Main St',
        city: 'New York',
        zipCode: '10001',
        country: 'USA',
      },
    });

    await Order.create({
      userId: user._id,
      items: [
        { bookId: book2._id, quantity: 1, price: book2.price },
      ],
      totalAmount: book2.price,
      status: 'SHIPPED',
      shippingAddress: {
        street: '123 Main St',
        city: 'New York',
        zipCode: '10001',
        country: 'USA',
      },
    });

    console.log('🛒 Created orders');

    console.log('\n✅ Seeding completed successfully!');
    console.log('\nTest credentials:');
    console.log('Admin: admin@bookstore.com / admin123');
    console.log('User: user@bookstore.com / user123');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seed();


