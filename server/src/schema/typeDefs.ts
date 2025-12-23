import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  type User {
    id: ID!
    email: String!
    name: String!
    role: UserRole!
    avatar: String
    createdAt: String!
    updatedAt: String!
  }

  type Author {
    id: ID!
    name: String!
    bio: String
    birthDate: String
    nationality: String
    photo: String
    isDeleted: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type Book {
    id: ID!
    title: String!
    description: String!
    isbn: String!
    price: Float!
    stock: Int!
    coverImage: String
    publishedDate: String
    author: Author!
    isDeleted: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type OrderItem {
    bookId: ID!
    book: Book
    quantity: Int!
    price: Float!
  }

  type ShippingAddress {
    street: String!
    city: String!
    zipCode: String!
    country: String!
  }

  type Order {
    id: ID!
    user: User!
    items: [OrderItem!]!
    totalAmount: Float!
    status: OrderStatus!
    shippingAddress: ShippingAddress!
    createdAt: String!
    updatedAt: String!
  }

  enum UserRole {
    USER
    ADMIN
  }

  enum OrderStatus {
    PENDING
    PROCESSING
    SHIPPED
    DELIVERED
    CANCELLED
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input RegisterInput {
    email: String!
    password: String!
    name: String!
  }

  input CreateAuthorInput {
    name: String!
    bio: String
    birthDate: String
    nationality: String
    photo: String
  }

  input UpdateAuthorInput {
    name: String
    bio: String
    birthDate: String
    nationality: String
    photo: String
  }

  input CreateBookInput {
    title: String!
    description: String!
    isbn: String!
    price: Float!
    stock: Int!
    coverImage: String
    publishedDate: String
    authorId: ID!
  }

  input UpdateBookInput {
    title: String
    description: String
    isbn: String
    price: Float
    stock: Int
    coverImage: String
    publishedDate: String
    authorId: ID
  }

  input OrderItemInput {
    bookId: ID!
    quantity: Int!
  }

  input CreateOrderInput {
    items: [OrderItemInput!]!
    shippingAddress: ShippingAddressInput!
  }

  input ShippingAddressInput {
    street: String!
    city: String!
    zipCode: String!
    country: String!
  }

  input UpdateOrderStatusInput {
    orderId: ID!
    status: OrderStatus!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Query {
    # User queries
    me: User
    users: [User!]!
    user(id: ID!): User

    # Author queries
    authors: [Author!]!
    author(id: ID!): Author

    # Book queries
    books(limit: Int, offset: Int, search: String): [Book!]!
    book(id: ID!): Book
    booksByAuthor(authorId: ID!): [Book!]!

    # Order queries
    orders: [Order!]!
    order(id: ID!): Order
    myOrders: [Order!]!
  }

  type Mutation {
    # Auth mutations
    login(input: LoginInput!): AuthPayload!
    register(input: RegisterInput!): AuthPayload!

    # Author mutations
    createAuthor(input: CreateAuthorInput!): Author!
    updateAuthor(id: ID!, input: UpdateAuthorInput!): Author!
    deleteAuthor(id: ID!): Boolean!

    # Book mutations
    createBook(input: CreateBookInput!): Book!
    updateBook(id: ID!, input: UpdateBookInput!): Book!
    deleteBook(id: ID!): Boolean!

    # Order mutations
    createOrder(input: CreateOrderInput!): Order!
    updateOrderStatus(input: UpdateOrderStatusInput!): Order!
    cancelOrder(id: ID!): Order!
  }

  type Subscription {
    bookUpdated: Book!
    orderUpdated: Order!
  }
`;

