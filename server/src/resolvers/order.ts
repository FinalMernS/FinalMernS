import { Order } from '../models/Order';
import { Book } from '../models/Book';
import { AppError, ErrorCode, requireAuth, requireAdmin } from '../utils/errors';
import { Context } from '../utils/context';
import { pubsub } from '../utils/pubsub';

export const orderResolvers = {
  Query: {
    orders: async (_: unknown, __: unknown, context: Context) => {
      requireAdmin(context);
      return Order.find().populate('userId').sort({ createdAt: -1 });
    },
    order: async (_: unknown, { id }: { id: string }, context: Context) => {
      const user = requireAuth(context);
      const order = await Order.findById(id).populate('userId');
      if (!order) {
        throw new AppError('Order not found', ErrorCode.NOT_FOUND);
      }
      if (user.role !== 'ADMIN' && order.userId.toString() !== user.userId) {
        throw new AppError('Access denied', ErrorCode.FORBIDDEN);
      }
      return order;
    },
    myOrders: async (_: unknown, __: unknown, context: Context) => {
      const user = requireAuth(context);
      return Order.find({ userId: user.userId }).populate('userId').sort({ createdAt: -1 });
    },
  },
  Mutation: {
    createOrder: async (_: unknown, { input }: { input: any }, context: Context) => {
      const user = requireAuth(context);

      if (!input.items || input.items.length === 0) {
        throw new AppError('Order must have at least one item', ErrorCode.VALIDATION_ERROR);
      }

      let totalAmount = 0;
      const orderItems = [];

      for (const item of input.items) {
        const book = await Book.findOne({ _id: item.bookId, isDeleted: false });
        if (!book) {
          throw new AppError(`Book with ID ${item.bookId} not found`, ErrorCode.NOT_FOUND);
        }
        if (book.stock < item.quantity) {
          throw new AppError(`Insufficient stock for book ${book.title}`, ErrorCode.VALIDATION_ERROR);
        }

        const itemPrice = book.price * item.quantity;
        totalAmount += itemPrice;

        orderItems.push({
          bookId: book._id,
          quantity: item.quantity,
          price: book.price,
        });

        book.stock -= item.quantity;
        await book.save();
      }

      const order = await Order.create({
        userId: user.userId,
        items: orderItems,
        totalAmount,
        status: 'PENDING',
        shippingAddress: input.shippingAddress,
      });

      const populatedOrder = await Order.findById(order._id).populate('userId');
      pubsub.publish('ORDER_UPDATED', { orderUpdated: populatedOrder });
      return populatedOrder;
    },
    updateOrderStatus: async (_: unknown, { input }: { input: { orderId: string; status: string } }, context: Context) => {
      requireAdmin(context);

      const order = await Order.findById(input.orderId);
      if (!order) {
        throw new AppError('Order not found', ErrorCode.NOT_FOUND);
      }

      order.status = input.status as any;
      await order.save();

      const populatedOrder = await Order.findById(order._id).populate('userId');
      pubsub.publish('ORDER_UPDATED', { orderUpdated: populatedOrder });
      return populatedOrder;
    },
    cancelOrder: async (_: unknown, { id }: { id: string }, context: Context) => {
      const user = requireAuth(context);

      const order = await Order.findById(id);
      if (!order) {
        throw new AppError('Order not found', ErrorCode.NOT_FOUND);
      }

      if (user.role !== 'ADMIN' && order.userId.toString() !== user.userId) {
        throw new AppError('Access denied', ErrorCode.FORBIDDEN);
      }

      if (order.status === 'CANCELLED') {
        throw new AppError('Order is already cancelled', ErrorCode.VALIDATION_ERROR);
      }

      if (order.status === 'DELIVERED') {
        throw new AppError('Cannot cancel delivered order', ErrorCode.VALIDATION_ERROR);
      }

      for (const item of order.items) {
        const book = await Book.findById(item.bookId);
        if (book) {
          book.stock += item.quantity;
          await book.save();
        }
      }

      order.status = 'CANCELLED';
      await order.save();

      const populatedOrder = await Order.findById(order._id).populate('userId');
      pubsub.publish('ORDER_UPDATED', { orderUpdated: populatedOrder });
      return populatedOrder;
    },
  },
  Subscription: {
    orderUpdated: {
      subscribe: () => pubsub.asyncIterator(['ORDER_UPDATED']),
    },
  },
  Order: {
    user: (order: any) => {
      return order.userId;
    },
  },
  OrderItem: {
    book: async (item: any) => {
      return Book.findById(item.bookId);
    },
  },
};

