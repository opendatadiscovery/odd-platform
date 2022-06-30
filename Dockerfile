FROM openjdk:17.0.1

WORKDIR /app

COPY ./odd-platform-api/build/libs/odd-platform-api-0.0.1-SNAPSHOT.jar ./

ENTRYPOINT ["java", "-jar", "odd-platform-api-0.0.1-SNAPSHOT.jar"]
