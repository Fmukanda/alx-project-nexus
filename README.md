# 🛒 Full-Stack Ecommerce Platform

## Overview
A modern, full-featured ecommerce platform built with **Django backend** and **Next.js frontend**. This system supports JWT authentication, product categories, reviews, wishlist, cart, checkout with Mpesa payment integration, order history, and real-time admin dashboards.

## 🚀 Features
### Core Features
 - JWT authentication: Register, Login, Password Reset
 - Product catalog with categories
 - Product reviews and ratings
 - Wishlist (add/remove products)
 - Cart CRUD with server-side inventory validation
 - Checkout and Mpesa payment integration
 - Order history for users
 - Admin dashboard with KPIs, revenue, shipment tracking
 - Real-time notifications via WebSockets (Django Channels)

## 🛠️ Technology Stack
### Backend
 - Django 5+
 - Django REST Framework
 - PostgreSQL
 - Redis (cache & Celery broker)
 - Celery for background tasks
 - JWT Authentication
 - Mpesa payment integration
 - Channels for real-time WebSockets
### Frontend
 - Next.js 14+ with TypeScript
 - Tailwind CSS for styling
 - React Query for data fetching
 
## 📁 Project Folder Structure
```text
backend/
├── config/               # Django project configuration
├── apps/
│   ├── users/            # Authentication & user management
│   ├── products/         # Products, categories, reviews
│   ├── cart/             # Cart CRUD logic
│   ├── orders/           # Orders & checkout
│   ├── payments/         # Mpesa payment processing
│   ├── wishlist/         # User wishlist
│   ├── shipments/        # Shipment tracking
│   └── notifications/    # Real-time WebSocket notifications
├── requirements/         # Python dependencies
└── manage.py

```text
frontend/
├── app/                  # Next.js App Router
├── components/
│   ├── ui/               # Shared UI components
│   ├── layout/           # Layout components
│   ├── products/         # Product cards, filters, reviews
│   ├── cart/             # Cart components
│   └── wishlist/         # Wishlist components
├── hooks/                # React hooks
├── lib/                  # Utilities & API functions
├── store/                # Zustand state management
├── types/                # TypeScript types
└── public/               # Static assets
```

## 🏗️ System Architecture

```text
     ┌──────────────────────────────────────┐
     │            Frontend Layer            │
     │  ┌────────────────────────────────┐  │
     │  │       Next.js Application      │  │
     │  │  - Server-side Rendering (SSR) │  │
     │  │  - Client-side React Components│  │
     │  │  - API Consumption via Fetch   │  │
     │  │  - Auth Context (JWT Tokens)   │  │
     │  └────────────────────────────────┘  │
     └───────────────────┬──────────────────┘
                         │
                         │ REST API (JSON)
                         │ JWT Authentication
┌────────────────────────▼────────────────────────┐
│              Django REST Framework              │
│  ┌──────────────────────────────────────────┐   │
│  │        Authentication Layer              │   │
│  │     (JWT, Permissions, Sessions)         │   │
│  └──────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────┐   │
│  │              API Endpoints               │   │
│  │  - Products   - Payments                 │   │
│  │  - Orders     - Users                    │   │
│  │  - Cart       - Inventory                │   │
│  └──────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────┐   │
│  │          Business Logic Layer            │   │
│  │  - Validation                            │   │                  
│  │  - Shipment Management                   │   │
│  │  - Notifications & Analytics             │   │
│  └──────────────────────────────────────────┘   │
└─────────────────────┬───────────────────────────┘
                      │
     ┌────────────────▼─────────────────┐
     │         PostgreSQL Database      │
     │  - User Data                     │
     │  - Product Catalog               │
     │  - Orders, Payments, Inventory   │
     └──────────────────────────────────┘
```
## 🗃️ Database Schema
![image alt](Image/ERD_Image.png)

## ⚙️ Setup Instructions
### Prerequisites
 - Python 3.9+
 - Node.js 18+
 - PostgreSQL 13+
 - Redis 6+

### Backend Setup
1. **Clone the repository**
   ```
   git clone <repository-url>
   cd backend
   ```

2. **Create virtual environment**
   ```
   python -m venv venv
   source venv/bin/activate   # Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```
   pip install -r requirements/development.txt
   ```

4. **Configure environment variables**
   ```
   cp .env.example .env
   # Update DB, Redis, JWT secret, Mpesa keys
   ```

5. **Setup database**
   ```
   python manage.py migrate
   python manage.py createsuperuser
   python manage.py collectstatic
   ```

6. **Load example seed data (optional)**
   ```
   python manage.py loaddata seed_data.json
   ```

7. **Run development server**
   ```
   python manage.py runserver
   ```
   
### Frontend Setup
1. **Navigate to frontend**
   ```
   cd ../frontend
   ```

2. **Install dependencies**
   ```
   npm install
   ```

3. **Configure environment variables**
   ```
   cp .env.example .env.local
   # Set NEXT_PUBLIC_API_URL=http://localhost:8000/api
   ```

4. **Configure environment variables**
   ```
   npm run dev
   ```

### 🐳 Docker Setup
   ```
   docker-compose up -d
   ```
 **Docker Commands**
 - Start services: docker-compose up -d
 - Run backend migrations: docker-compose exec backend python manage.py migrate
 - Create superuser: docker-compose exec backend python manage.py createsuperuser

## 📦 Backend API Endpoints
### 📌 1. Authentication & Users (/api/auth/)
#### 🔐 User Endpoints
  | Method | Endpoint                | Description              |
  | ------ | ----------------------- | ------------------------ |
  | GET    | `/api/auth/users/`      | List all users           |
  | POST   | `/api/auth/users/`      | Create/register new user |
  | GET    | `/api/auth/users/{id}/` | Retrieve a user          |
  | PUT    | `/api/auth/users/{id}/` | Update a user            |
  | PATCH  | `/api/auth/users/{id}/` | Partial update           |
  | DELETE | `/api/auth/users/{id}/` | Delete a user            |
#### 🔑 Authentication Endpoints
  | Method | Endpoint                   | Description                   |
  | ------ | -------------------------- | ----------------------------- |
  | POST   | `/api/auth/auth/`          | Login (custom authentication) |
  | GET    | `/api/auth/auth/`          | Get logged-in user profile    |
  | POST   | `/api/auth/token/refresh/` | Refresh expired JWT token     |

  
 ### 🛒 2. Products Module (/api/products/)
 #### 📂 Categories
  | Method | Endpoint                         | Description          |
  | ------ | -------------------------------- | -------------------- |
  | GET    | `/api/products/categories/`      | List categories      |
  | POST   | `/api/products/categories/`      | Create category      |
  | GET    | `/api/products/categories/{id}/` | View single category |
  | PUT    | `/api/products/categories/{id}/` | Update category      |
  | PATCH  | `/api/products/categories/{id}/` | Partial update       |
  | DELETE | `/api/products/categories/{id}/` | Delete category      |
 #### 🧳 Products
  | Method | Endpoint              | Description      |
  | ------ | --------------------- | ---------------- |
  | GET    | `/api/products/`      | List products    |
  | POST   | `/api/products/`      | Create a product |
  | GET    | `/api/products/{id}/` | Product details  |
  | PUT    | `/api/products/{id}/` | Update product   |
  | PATCH  | `/api/products/{id}/` | Partial update   |
  | DELETE | `/api/products/{id}/` | Delete product   |


### 🧾 3. Orders Module (/api/orders/)
  | Method | Endpoint            | Description     |
  | ------ | ------------------- | --------------- |
  | GET    | `/api/orders/`      | List orders     |
  | POST   | `/api/orders/`      | Create an order |
  | GET    | `/api/orders/{id}/` | Retrieve order  |
  | PUT    | `/api/orders/{id}/` | Update order    |
  | PATCH  | `/api/orders/{id}/` | Partial update  |
  | DELETE | `/api/orders/{id}/` | Delete order    |


### ⭐ 4. Reviews Module (/api/reviews/)
  | Method | Endpoint             | Description     |
  | ------ | -------------------- | --------------- |
  | GET    | `/api/reviews/`      | List reviews    |
  | POST   | `/api/reviews/`      | Create review   |
  | GET    | `/api/reviews/{id}/` | Retrieve review |
  | PUT    | `/api/reviews/{id}/` | Update review   |
  | PATCH  | `/api/reviews/{id}/` | Partial update  |
  | DELETE | `/api/reviews/{id}/` | Delete review   |

 
 ### 📊 5. Analytics Module (/api/analytics/)
  | Method | Endpoint                               | Description                  |
  | ------ | -------------------------------------- | ---------------------------- |
  | GET    | `/api/analytics/dashboard/stats/`      | Dashboard summary statistics |
  | GET    | `/api/analytics/sales/overview/`       | Sales overview               |
  | GET    | `/api/analytics/products/performance/` | Product performance metrics  |
  | GET    | `/api/analytics/customer/behavior/`    | Customer behavior insights   |
  | GET    | `/api/analytics/engagement/metrics/`   | Engagement metrics           |
 
  
 ### 💳 6. Payments Module (/api/payments/)
 #### 🧾 Payment Methods
  | Method | Endpoint                              | Description             |
  | ------ | ------------------------------------- | ----------------------- |
  | GET    | `/api/payments/payment-methods/`      | List payment methods    |
  | POST   | `/api/payments/payment-methods/`      | Create payment method   |
  | GET    | `/api/payments/payment-methods/{id}/` | Retrieve payment method |
  | PUT    | `/api/payments/payment-methods/{id}/` | Update                  |
  | PATCH  | `/api/payments/payment-methods/{id}/` | Partial update          |
  | DELETE | `/api/payments/payment-methods/{id}/` | Delete                  |
#### 💰 Payments
  | Method | Endpoint                       | Description        |
  | ------ | ------------------------------ | ------------------ |
  | GET    | `/api/payments/payments/`      | List payments      |
  | POST   | `/api/payments/payments/`      | Create new payment |
  | GET    | `/api/payments/payments/{id}/` | Retrieve payment   |
  | PUT    | `/api/payments/payments/{id}/` | Update payment     |
  | PATCH  | `/api/payments/payments/{id}/` | Partial update     |
  | DELETE | `/api/payments/payments/{id}/` | Delete payment     |
#### 💸 Refunds
  | Method | Endpoint                      | Description     |
  | ------ | ----------------------------- | --------------- |
  | GET    | `/api/payments/refunds/`      | List refunds    |
  | POST   | `/api/payments/refunds/`      | Create refund   |
  | GET    | `/api/payments/refunds/{id}/` | Retrieve refund |
  | PUT    | `/api/payments/refunds/{id}/` | Update refund   |
  | PATCH  | `/api/payments/refunds/{id}/` | Partial update  |
  | DELETE | `/api/payments/refunds/{id}/` | Delete refund   |
#### 🪝 Webhooks
  | Method | Endpoint                 | Description                      |
  | ------ | ------------------------ | -------------------------------- |
  | POST   | `/api/payments/webhook/` | Handle external payment webhooks |


  ### 📱 7. M-Pesa Integration
  | Method | Endpoint                                                    | Description                           |
  | ------ | ----------------------------------------------------------- | ------------------------------------- |
  | POST   | `/api/payments/mpesa/initiate/`                             | Initiate M-Pesa STK Push              |
  | POST   | `/api/payments/mpesa/callback/`                             | Safaricom STK callback URL            |
  | GET    | `/api/payments/mpesa/transactions/{transaction_id}/status/` | Check M-Pesa transaction status       |
  | GET    | `/api/payments/mpesa/payment-methods/`                      | List supported M-Pesa payment methods |


   ### 🧩 8. Admin
  | Method | Endpoint  | Description            |
  | ------ | --------- | ---------------------- |
  | GET    | `/admin/` | Django admin interface |


### 🔧 Frontend API Endpoints
 - **components/products/** → _ProductCard, ReviewForm_
 - **components/wishlist/** → _WishlistButton, WishlistPage_
 - **components/cart/** → _CartPage, CartItem_
 - **components/admin/** → _AdminDashboard (charts & real-time)_
 - **app/pages/** → _pages routing: login, register, password reset, checkout, orders_

### 📊 Frontend Components
 - **ProductCard** → _Displays product info + wishlist button_
 - **CategoryFilter** → _Sidebar dropdown for filtering_
 - **ProductReview / ReviewForm** → _Display & submit reviews_
 - **WishlistButton** → _Icon to add/remove product_
 - **WishlistPage** → _Lists all wishlist products_
 - **CartPage** → _Add/remove/update items_
 - **CheckoutPage** → _Review cart and pay via Mpesa_
 - **OrderHistoryPage** → _View past orders_
 - **AdminDashboard** → _KPIs, revenue charts, real-time order/payment updates_

### 📈 Admin Dashboard (Real-Time)
 - **WebSocket:** /ws/admin/dashboard/
 - **Receives real-time updates on orders, payments, shipments**

## 📝 License
This project is licensed under MIT License.

## 🙏 Acknowledgments
 - Django & Django REST Framework
 - Next.js & React ecosystem
 - Tailwind CSS 
