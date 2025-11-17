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

## 📦 API Endpoints
### 1. Authentication (JWT)
  |        Endpoint                  |  Method |    Description                    |
  |:-------------------------------- | :-------|:----------------------------------|
  |/api/auth/register/               | POST    | Create new user                   |
  |/api/auth/login/                  | POST    | Authenticate user & get JWT token |
  |/api/auth/password-reset/         | POST    | Request password reset            |
  |/api/auth/password-reset/confirm/ | POST    | Reset password with token         |
  
 ### 2. Products & Categories
  |        Endpoint                  |  Method |    Description                    |
  |:-------------------------------- | :-------|:----------------------------------|
  |/api/products/                    | GET     | List all products                 |
  |/api/products/?category=<slug>    | GET     | Filter by category                |
  |/api/products/<id>/               | GET     | Product details                   |
  |/api/products/categories/         | GET     | List categories                   | 
  |/api/products/categories/         | POST    | Create category (admin only)      | 

### 3. Reviews
  |        Endpoint                  |  Method |    Description                    |
  |:-------------------------------- | :-------|:----------------------------------|
  |/api/products/<id>/reviews/       | GET     | List reviews for product          |
  |/api/products/<id>/reviews/       | POST    | Create review (authenticated)     |

### 4. Wishlist
  |        Endpoint                  |  Method |    Description                    |
  |:-------------------------------- | :-------|:----------------------------------|
  |/api/products/wishlist/           | GET     | Get user wishlist                 |
  |/api/products/wishlist/           | POST    | Add product to wishlist           |
  |/api/products/wishlist/<product_id>/ | DELETE   | Remove product from wishlist  |
 
 ### 5. Cart
  |        Endpoint                  |  Method |    Description                    |
  |:-------------------------------- | :-------|:----------------------------------|
  |/api/cart/                        | GET     | Get cart items                    |
  |/api/cart/                        | POST    | Add item to cart                  |
  |/api/cart/<id>/                   | PATCH   | Update cart item                  |
  |/api/cart/<id>/                   | DELETE  | Remove item from cart             | 
  
 ### 6. Checkout & Orders
  |        Endpoint                  |  Method |    Description                    |
  |:-------------------------------- | :-------|:----------------------------------|
  |/api/orders/checkout/             | POST    | Create order from cart & initiate Mpesa payment          |
  |/api/orders/                      | GET     | List user orders     |
  |/api/orders/<id>/                 | GET    | Get order details     |

  ### 7. Payments
  |        Endpoint                  |  Method |    Description                    |
  |:-------------------------------- | :-------|:----------------------------------|
  |/api/payments/mpesa/             | POST    | Initiate Mpesa payment          |
  |/api/payments/status/<order_id>/ | GET     | Check payment status    |

   ### 8. Shipments
  |        Endpoint                  |  Method |    Description                    |
  |:-------------------------------- | :-------|:----------------------------------|
  |/api/shipments/             | GET     | List shipments          |
  |/api/shipments/<id>/ | GET     | Shipment details    |

### 🔧 Backend API Endpoints
 - **apps/users/** → _authentication (JWT, reset)_
 - **apps/products/** → _models: Product, Category, Review_
 - **apps/wishlist/** → _user wishlist logic_
 - **apps/cart/** → _cart CRUD + server-side inventory check_
 - **apps/orders/** → _checkout & order creation_
 - **apps/payments/** → _Mpesa integration_
 - **apps/shipments/** → _shipment tracking_
 - **apps/notifications/** → _WebSockets for real-time updates_

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

### Admin Dashboard (Real-Time)
 - **WebSocket:** /ws/admin/dashboard/
 - **Receives real-time updates on orders, payments, shipments**

## 📝 License
This project is licensed under MIT License.

## 🙏 Acknowledgments
 - Django & Django REST Framework
 - Next.js & React ecosystem
 - Tailwind CSS 
