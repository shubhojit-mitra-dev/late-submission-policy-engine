FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /workspace

COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .
COPY shared/common-lib/pom.xml shared/common-lib/pom.xml
COPY services/policy-service/pom.xml services/policy-service/pom.xml
COPY services/assignment-service/pom.xml services/assignment-service/pom.xml
COPY services/submission-service/pom.xml services/submission-service/pom.xml
COPY services/api-gateway/pom.xml services/api-gateway/pom.xml

COPY shared/common-lib/src shared/common-lib/src
COPY services/api-gateway/src services/api-gateway/src

RUN chmod +x mvnw && ./mvnw clean package -pl services/api-gateway -am -DskipTests

FROM eclipse-temurin:21-jre-alpine AS runtime
WORKDIR /app

COPY --from=builder /workspace/services/api-gateway/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
