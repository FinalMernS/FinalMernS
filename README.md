# BookStore - MERN Stack Project

## Описание проекта

BookStore — это полнофункциональное веб-приложение для управления книжным магазином, построенное на стеке MERN (MongoDB, Express.js, React/Next.js, Node.js) с использованием TypeScript, GraphQL и Docker.

### Цели проекта

- Демонстрация навыков работы с современным стеком технологий
- Реализация полноценного full-stack приложения с реалтайм функциональностью
- Применение best practices в разработке (типизация, тестирование, контейнеризация)

### Домен
- Приложение предназначено для управления книжным магазином:

- **Пользователи** могут просматривать каталог книг, добавлять книги в корзину, оформлять заказы

- **Администраторы** могут управлять книгами, авторами, заказами
- Реалтайм обновления для отслеживания изменений в каталоге и заказах

### Роли пользователей

1. **Гость** — просмотр каталога книг
2. **Пользователь** — просмотр, добавление в корзину, оформление заказов
3. **Администратор** — полный доступ к управлению контентом и заказами

## Технологический стек

### Backend
- Node.js + Express.js
- TypeScript
- GraphQL (Apollo Server)
- MongoDB + Mongoose
- JWT для аутентификации
- Jest для тестирования

### Frontend
- Next.js 14 (App Router)
- TypeScript
- TailwindCSS
- Zustand для управления состоянием
- Apollo Client для работы с GraphQL
- React Hook Form + Zod для валидации форм

### DevOps
- Docker & Docker Compose
- Healthchecks для всех сервисов

## Схема данных

### Модели

1. **User** (Пользователь)
   - email (String, unique, required)
   - password (String, hashed, required)
   - name (String, required)
   - role (Enum: USER, ADMIN, required)
   - avatar (String, optional)
   - createdAt, updatedAt

2. **Author** (Автор)
   - name (String, required)
   - bio (String, optional)
   - birthDate (Date, optional)
   - nationality (String, optional)
   - photo (String, optional)
   - isDeleted (Boolean, default: false)
   - createdAt, updatedAt

3. **Book** (Книга)
   - title (String, required)
   - description (String, required)
   - isbn (String, unique, required)
   - price (Number, required)
   - stock (Number, default: 0)
   - coverImage (String, optional)
   - publishedDate (Date, optional)
   - authorId (ObjectId, ref: Author, required)
   - isDeleted (Boolean, default: false)
   - createdAt, updatedAt

4. **Order** (Заказ)
   - userId (ObjectId, ref: User, required)
   - items (Array of OrderItem)
   - totalAmount (Number, required)
   - status (Enum: PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED)
   - shippingAddress (Object, required)
   - createdAt, updatedAt

### Связи

- Book → Author (Many-to-One): каждая книга имеет одного автора
- Order → User (Many-to-One): каждый заказ принадлежит одному пользователю
- Order → Book (Many-to-Many через OrderItem): заказ содержит несколько книг


### Предварительные требования

- Docker и Docker Compose установлены
- Git

### Запуск проекта

1. 
```bash
docker-compose up
```

Проект будет доступен:
- Frontend: http://localhost:3000
- GraphQL API: http://localhost:4000/graphql
- GraphQL Playground: http://localhost:4000/graphql
- MongoDB Express: http://localhost:8081
- Pr: https://www.canva.com/design/DAG4YET_SVo/ivLd05T2rmsb_uqbayh5_A/edit?utm_content=DAG4YET_SVo&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton

### Локальная разработка (без Docker)

#### Backend
```bash
cd server
npm install
npm run dev
```

#### Frontend
```bash
cd client
npm install
npm run dev
```

## Как проверить реалтайм функциональность

### Подписка на обновления книг

1. Откройте приложение в двух вкладках браузера
2. В первой вкладке войдите как администратор
3. Во второй вкладке откройте каталог книг
4. В первой вкладке создайте новую книгу или обновите существующую
5. Во второй вкладке изменения должны появиться автоматически без перезагрузки страницы

### Подписка на обновления заказов

1. Войдите как пользователь
2. Откройте страницу "Мои заказы"
3. В другой вкладке (или через API) обновите статус заказа
4. На странице заказов статус должен обновиться автоматически


### Тестовые пользователи

**Администратор:**
- Email: admin@bookstore.com
- Password: admin123

**Обычный пользователь:**
- Email: user@bookstore.com
- Password: user123


## Команда/Роли

### Nurdaulet
- Backend

### Beibit
- Frontend


## Тестирование

Запуск тестов:
```bash
cd server
npm test

mutation {
     createBook(input: {
       title: "Test Book"
       description: "Test description"
       isbn: "1234567890123"
       price: 19.99
       stock: 10
       authorId: "AUTHOR_ID"
     }) {
       id
       title
     }
   }
```

 