FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /workspace

COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .
COPY shared/common-lib/pom.xml shared/common-lib/pom.xml
COPY shared/common-lib/src shared/common-lib/src
COPY services/policy-service/pom.xml services/policy-service/pom.xml
COPY services/policy-service/src services/policy-service/src

RUN chmod +x mvnw && ./mvnw clean package -pl services/policy-service -am -DskipTests

FROM eclipse-temurin:21-jre-alpine AS runtime
WORKDIR /app

COPY --from=builder /workspace/services/policy-service/target/*.jar app.jar

EXPOSE 8081

ENTRYPOINT ["java", "-jar", "app.jar"]
