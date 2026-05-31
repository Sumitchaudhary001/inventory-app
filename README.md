Inventory & Order Management System

A production-ready full-stack web application for managing inventory, customers, and orders. Built with React, FastAPI, PostgreSQL, and Docker.

---

Live Demo

Frontend: https://inventory-app-psi-orpin.vercel.app
Backend API: https://inventory-backend-um42.onrender.com
API Documentation: https://inventory-backend-um42.onrender.com/docs

Demo Credentials
Email: admin@inventory.com
Password: admin123

---

Tech Stack

Frontend: React.js 
Backend: Python, FastAPI
Database: PostgreSQL
Containerization: Docker, Docker Compose
Frontend Deployment: Vercel
Backend Deployment: Render

---

Features

- Product management with add, edit, delete and search
- Customer database with search and validation
- Order management with status tracking
- Invoice view with itemized bill for each order
- Dashboard with real-time stats and revenue
- Order status workflow — Pending, Confirmed, Shipped, Delivered
- Export orders as CSV
- Dark mode and light mode toggle
- Fully responsive — works on mobile and desktop
- Login and signup screen

---

Getting Started

Requirements
- Docker
- Docker Compose

Run Locally

    git clone https://github.com/Sumitchaudhary001/inventory-app.git
    cd inventory-app
    docker-compose up --build

---

API Endpoints

Products
- GET    /products         Get all products
- POST   /products         Create a product
- GET    /products/{id}    Get product by ID
- PUT    /products/{id}    Update a product
- DELETE /products/{id}    Delete a product

Customers
- GET    /customers         Get all customers
- POST   /customers         Create a customer
- GET    /customers/{id}    Get customer by ID
- DELETE /customers/{id}    Delete a customer

Orders
- GET    /orders            Get all orders
- POST   /orders            Create an order
- GET    /orders/{id}       Get order by ID
- PUT    /orders/{id}/status  Update order status
- DELETE /orders/{id}       Cancel an order

Dashboard
- GET    /dashboard         Get summary statistics

---

Project Structure

    inventory-app/
    ├── backend/
    │   ├── main.py
    │   ├── models.py
    │   ├── database.py
    │   ├── requirements.txt
    │   └── Dockerfile
    ├── frontend/
    │   ├── src/
    │   │   ├── pages/
    │   │   ├── App.js
    │   │   └── api.js
    │   └── Dockerfile
    ├── screenshots/
    │   ├── web/
    │   └── mobile/
    └── docker-compose.yml
