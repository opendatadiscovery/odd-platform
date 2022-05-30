package org.opendatadiscovery.plugin

import org.jooq.meta.jaxb.Generate

class JooqGenerateExtension {
    String migrationSrcDir
    String basePackageName
    String includeMatches = ".*"
    String inputSchema = "public"
    String excludes = ""
    String databaseGeneratorName = "org.jooq.meta.postgres.PostgresDatabase"
    String imageName
    String testContainerClass = "org.testcontainers.containers.PostgreSQLContainer"

    Generate generate = new Generate()
}
