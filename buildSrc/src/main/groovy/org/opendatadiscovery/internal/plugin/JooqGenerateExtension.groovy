package org.opendatadiscovery.internal.plugin

import org.jooq.meta.jaxb.Generate

class JooqGenerateExtension {
    String basePackageName
    String includeMatches = ".*"
    String inputSchema = "public"
    String excludes = ""
    String databaseGeneratorName = "org.jooq.meta.postgres.PostgresDatabase"
    String imageName = "postgres:13.7-alpine"
    String testContainerClass = "org.testcontainers.containers.PostgreSQLContainer"
    Generate generate = new Generate()

    void setGenerate(final Closure closure) {
        closure.setDelegate(generate)
        closure.call()
    }
}
