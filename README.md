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

## System Architecture

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
│  │  - Products   - Payments                 │   │
│  │  - Orders     - Users                    │   │
│  │  - Cart       - Inventory                │   │
│  └──────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────┐   │
│  │          Business Logic Layer            │   │
│  │  - Inventory Validation                  │   │                  
│  │  - Shipment Management                   │   │
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

## ⚙️ Setup Instructions
### Prerequisites
 - Python 3.9+
 - Node.js 18+
 - PostgreSQL 13+
 - Redis 6+
# Product recommendations
GET /api/products/products/product-slug/recommendations/
