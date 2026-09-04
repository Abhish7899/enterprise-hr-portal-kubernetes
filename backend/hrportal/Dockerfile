# Stage 1: Build the Spring Boot application
FROM eclipse-temurin:17-jdk AS builder

WORKDIR /app

# Copy Maven wrapper and dependency files first
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

RUN chmod +x mvnw

# Download dependencies
RUN ./mvnw dependency:go-offline -DskipTests

# Copy source code
COPY src src

# Build the application
RUN ./mvnw clean package -DskipTests

# Stage 2: Run the application
FROM eclipse-temurin:17-jre

WORKDIR /app

# Create a non-root user
RUN useradd --system --create-home appuser

# Copy only the built JAR
COPY --from=builder /app/target/*.jar app.jar

# Run as non-root user
USER appuser

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
