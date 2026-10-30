# Shopmart 🛍️

A modern, full-stack e-commerce web application built with **Spring Boot 4 / Java 21** and **Angular 21 (Standalone)**, featuring Cloudinary media integration, MySQL database persistence, and a multi-stage production **Docker** build.

---

## 🚀 Features

- **Product Catalog & Details**: Browse products, category pill filtering, real-time search, stock level indicators (*"Hurry! Only X left!"*), and product preview.
- **Cart & Order Flow**: Live reactive cart state with Signals, quantity adjustments, and auto-calculated totals.
- **Checkout & Payment**: Saved delivery addresses or inline creation, credit card format validation, and atomic order placement.
- **Orders & Tracking**: Complete order history, order receipt view (`/order/:id`), and inventory restocking on cancellation.
- **Admin Dashboard**: Operations launcher for managing products, Cloudinary image upload, customer order status updates, and user inspection.
- **Role-Based Security**: Route guards (`authGuard`, `adminGuard`) protecting customer actions and administrative routes.

---

## 🛠️ Tech Stack

- **Backend**: Spring Boot 4.1, Java 21, Spring Data JPA, Hibernate, Maven
- **Frontend**: Angular 21, TypeScript, Signals, RxJS
- **Database**: MySQL 8.0 (compatible with Aiven, TiDB Cloud, AWS RDS)
- **Media**: Cloudinary (Cloud image uploads)
- **Containerization**: Multi-stage Docker, Docker Compose

---

## 💻 Local Development Setup

### 1. Database
Ensure a local MySQL instance is running on port `3306` with database `shopmart_db`:
```sql
CREATE DATABASE shopmart_db;
```

### 2. Run Backend
```bash
cd backend
./mvnw spring-boot:run
```
Backend runs at `http://localhost:8080`.

### 3. Run Frontend
```bash
cd frontend
npm install
npm start
```
Frontend runs at `http://localhost:4200`.

---

## 🐳 Docker Deployment

### 1-Click with Docker Compose
To spin up MySQL and the full-stack application together:
```bash
docker compose up --build
```
Access the application at `http://localhost:8080`.

### Standalone Docker Image
```bash
docker build -t shopmart:latest .
docker run -d -p 8080:8080 shopmart:latest
```

---

## 🌐 Production Cloud Deployment (e.g. Render)

1. Push this repository to GitHub.
2. Create a new **Web Service** on [Render](https://render.com) using the **Docker** runtime.
3. Add the following Environment Variables in the Render dashboard:
   - `SPRING_DATASOURCE_URL`: `jdbc:mysql://<host>:<port>/<dbname>?useSSL=true&requireSSL=true`
   - `SPRING_DATASOURCE_USERNAME`: `<db_user>`
   - `SPRING_DATASOURCE_PASSWORD`: `<db_password>`
