# ==============================================================
# Shopmart Multi-Stage Production Dockerfile
# Builds Angular 21 Frontend + Spring Boot Java 21 Backend
# Produces a secure, single deployable container image
# ==============================================================

# --------------------------------------------------------------
# Stage 1: Build Angular Frontend
# --------------------------------------------------------------
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

# Install dependencies
COPY frontend/package*.json ./
RUN npm install

# Copy frontend source code and compile production bundle
COPY frontend/ ./
RUN npm run build

# --------------------------------------------------------------
# Stage 2: Build Spring Boot Backend & Bundle Frontend
# --------------------------------------------------------------
FROM maven:3.9.9-eclipse-temurin-21-alpine AS backend-builder
WORKDIR /app/backend

# Cache Maven dependencies
COPY backend/pom.xml ./
RUN mvn dependency:go-offline -B

# Copy backend source code
COPY backend/src ./src

# Copy compiled Angular assets into Spring Boot's static resources directory
COPY --from=frontend-builder /app/frontend/dist/frontend/browser/ ./src/main/resources/static/

# Build Spring Boot executable JAR (skipping unit tests for fast Docker builds)
RUN mvn clean package -DskipTests

# --------------------------------------------------------------
# Stage 3: Lightweight Production JRE Runtime
# --------------------------------------------------------------
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Run as non-root user for security
RUN addgroup -S shopmart && adduser -S shopmart -G shopmart

# Copy packaged JAR from backend builder stage
COPY --from=backend-builder /app/backend/target/*.jar app.jar
RUN chown shopmart:shopmart app.jar

USER shopmart

# Expose HTTP port (serves both Angular SPA & REST API)
EXPOSE 8080

# Default Database connection environment variables (overridable at runtime)
ENV SPRING_DATASOURCE_URL="jdbc:mysql://localhost:3306/shopmart_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC" \
    SPRING_DATASOURCE_USERNAME="root" \
    SPRING_DATASOURCE_PASSWORD="Root"

# Start the application
ENTRYPOINT ["java", "-jar", "app.jar"]

