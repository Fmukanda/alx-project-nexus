# Hangazo E-commerce Platform

## Overview
This document outlines the architecture, data models, and RESTful API specifications for the Hangazo Platform, a scalable e-commerce backend built for Small and Medium Enterprise (SME) business that deals with Ready-to-Wear, Custom Wear, Soft-Furnishing, and Bridal Wear products.

## Application Architecture Design
The application employs a Decoupled Monolith Architecture.
It uses Django as the backend framework to provide a robust and scalable RESTful API, while the frontend is developed separately using Next.js.
### Backend (Django)
 - Handles business logic, authentication, database interactions, and API endpoints.
 - Exposes REST APIs using Django REST Framework (DRF) for communication with frontend clients.
 - Can be easily modularized into microservices if needed in the future.
### Frontend (Next.js)
 - Consumes the Django API for rendering data-rich UI components.
 - Provides a modern, reactive user experience for web and mobile users.
 - Can be hosted independently (e.g., on Vercel or Netlify), communicating with the Django API through HTTPS.
### Integration Layer
 - Communication between frontend and backend is done through JSON-based REST APIs.
 - Authentication uses JWT (JSON Web Tokens) or Session-based tokens depending on deployment configuration.

### System Architecture

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
┌───────────────────▼─────────────────────────────┐
│              Django REST Framework              │
│  ┌──────────────────────────────────────────┐   │
│  │        Authentication Layer              │   │
│  │     (JWT, Permissions, Sessions)         │   │
│  └──────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────┐   │
│  │              API Endpoints               │   │
│  │  - Products   - Categories               │   │
│  │  - Orders     - Users                    │   │
│  │  - Cart       - Inventory                │   │
│  └──────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────┐   │
│  │          Business Logic Layer            │   │
│  │  - Validation                            │   │
│  │  - Price Calculation                     │   │
│  │  - Inventory Management                  │   │
│  │  - Notifications & Analytics             │   │
│  └──────────────────────────────────────────┘   │
└───────────────────┬─────────────────────────────┘
                    │
┌───────────────────▼──────────────┐
│         PostgreSQL Database      │
│  - User Data                     │
│  - Product Catalog               │
│  - Orders, Payments, Inventory   │
└──────────────────────────────────┘
```

```text
hangazo_ecommerce/
├── hangazo_ecommerce/          # Project configuration (main package)
│   ├── settings/
│   │   ├── __init__.py
│   │   ├── base.py
│   │   ├── development.py
│   │   └── production.py
│   ├── __init__.py
│   ├── urls.py
│   ├── wsgi.py
│   └── celery.py
├── users/                      # Authentication & user management
│   ├── migrations/
│   ├── __init__.py
│   ├── admin.py
│   ├── apps.py
│   ├── models.py
│   ├── serializers.py
│   ├── urls.py
│   ├── views.py
│   └── services.py
├── products/                   # Product catalog & categories
│   ├── migrations/
│   ├── __init__.py
│   ├── admin.py
│   ├── apps.py
│   ├── models.py
│   ├── serializers.py
│   ├── urls.py
│   ├── views.py
│   ├── services.py
│   └── filters.py
├── orders/                     # Orders, cart, payments
│   ├── migrations/
│   ├── __init__.py
│   ├── admin.py
│   ├── apps.py
│   ├── models.py
│   ├── serializers.py
│   ├── urls.py
│   ├── views.py
│   └── services.py
├── inventory/                  # Inventory management
│   ├── migrations/
│   ├── __init__.py
│   ├── admin.py
│   ├── apps.py
│   ├── models.py
│   ├── serializers.py
│   ├── urls.py
│   ├── views.py
│   └── tasks.py
├── analytics/                  # Business analytics
│   ├── migrations/
│   ├── __init__.py
│   ├── admin.py
│   ├── apps.py
│   ├── models.py
│   ├── serializers.py
│   ├── urls.py
│   └── views.py
├── core/                       # Shared utilities
│   ├── __init__.py
│   ├── permissions.py
│   ├── pagination.py
│   ├── utils.py
│   └── exceptions.py
├── static/
├── media/
├── templates/
├── manage.py
├── requirements.txt
├── docker-compose.yml
└── Dockerfile
```

GET /api/products/categories/ - List all categories

GET /api/products/categories/{slug}/ - Get category details

GET /api/products/products/ - List all products

GET /api/products/products/{slug}/ - Get product details

GET /api/products/products/featured/ - Get featured products

GET /api/products/products/on_sale/ - Get products on sale

GET /api/products/reviews/ - List all reviews


Cart Endpoints:
GET /api/orders/cart/ - Get user's cart

POST /api/orders/cart/add_item/ - Add item to cart

PUT /api/orders/cart/update_item/ - Update cart item quantity

DELETE /api/orders/cart/remove_item/ - Remove item from cart

DELETE /api/orders/cart/clear/ - Clear entire cart

Order Endpoints:
GET /api/orders/orders/ - List user's orders

GET /api/orders/orders/{id}/ - Get order details

POST /api/orders/orders/create_from_cart/ - Create order from cart


POST /api/payments/payments/stripe_create_intent/ - Create Stripe payment intent

POST /api/payments/payments/mpesa_initiate/ - Initiate M-Pesa payment

POST /api/payments/payments/paypal_create_order/ - Create PayPal order

POST /api/payments/payments/paypal_capture/ - Capture PayPal payment

POST /api/payments/mpesa-callback/callback/ - M-Pesa webhook

Wishlist:
GET /api/products/wishlist/ - Get user wishlist

POST /api/products/wishlist/ - Add to wishlist

DELETE /api/products/wishlist/{id}/ - Remove from wishlist

DELETE /api/products/wishlist/remove_product/ - Remove by product ID
