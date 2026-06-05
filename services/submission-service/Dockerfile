FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /workspace

COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .
COPY shared/common-lib/pom.xml shared/common-lib/pom.xml
COPY shared/common-lib/src shared/common-lib/src
COPY services/submission-service/pom.xml services/submission-service/pom.xml
COPY services/submission-service/src services/submission-service/src

RUN chmod +x mvnw && ./mvnw clean package -pl services/submission-service -am -DskipTests

FROM eclipse-temurin:21-jre-alpine AS runtime
WORKDIR /app

COPY --from=builder /workspace/services/submission-service/target/*.jar app.jar

EXPOSE 8083

ENTRYPOINT ["java", "-jar", "app.jar"]
