package org.opendatadiscovery.internal.plugin

import org.flywaydb.core.Flyway
import org.gradle.api.DefaultTask
import org.gradle.api.artifacts.Configuration
import org.gradle.api.tasks.InputFiles
import org.gradle.api.tasks.Internal
import org.gradle.api.tasks.OutputDirectory
import org.gradle.api.tasks.TaskAction
import org.jooq.codegen.GenerationTool
import org.jooq.codegen.JavaGenerator
import org.jooq.meta.jaxb.*
import org.testcontainers.containers.JdbcDatabaseContainer
import org.testcontainers.containers.output.OutputFrame

import static java.util.stream.Collectors.toList
import static org.testcontainers.images.PullPolicy.alwaysPull

class JooqGenerateTask extends DefaultTask {
    private static final String LINE_BREAK_REGEX = "((\\r?\\n)|(\\r))"
    private static final String LINE_BREAK_AT_END_REGEX = LINE_BREAK_REGEX + '$'
    private static final String FILESYSTEM_PREFIX = "filesystem:"

    @Internal
    final JooqGenerateExtension extension = project.extensions.getByType(JooqGenerateExtension.class)

    @OutputDirectory
    final def outputDirectory = project.objects.directoryProperty()
        .convention(project.layout.buildDirectory.dir("generated-jooq/src/main/java"))

    @InputFiles
    def inputDirectory = project.objects.fileCollection().from("src/main/resources/db/migration")

    @TaskAction
    def execute() {
        final def configuration = project.configurations.getByName(Constants.CONFIGURATION_NAME)

        final def testContainerClass = Class.forName(
            extension.testContainerClass,
            true,
            buildJdbcArtifactsAwareClassLoader(configuration)
        )

        final JdbcDatabaseContainer testContainerInstance = extension.imageName != null ?
            testContainerClass.newInstance(extension.imageName) as JdbcDatabaseContainer :
            testContainerClass.getDeclaredConstructor().newInstance() as JdbcDatabaseContainer

        testContainerInstance.withLogConsumer(this.&log)
            .withImagePullPolicy(alwaysPull())
            .start()

        try {
            migrate(testContainerInstance)
            generateJooqClasses(testContainerInstance, extension)
        } finally {
            testContainerInstance.stop()
        }
    }

    private void migrate(final JdbcDatabaseContainer container) {
        final String[] locations = inputDirectory.asList()
            .stream()
            .map({ FILESYSTEM_PREFIX + it.absolutePath })
            .collect(toList())
            .toArray(new String[0])

        Flyway.configure()
            .dataSource(container.getJdbcUrl(), container.getUsername(), container.getPassword())
            .locations(locations)
            .load()
            .migrate()
    }

    private void generateJooqClasses(final JdbcDatabaseContainer container,
                                     final JooqGenerateExtension extension) {
        new GenerationTool()
            .run(new org.jooq.meta.jaxb.Configuration()
                .withLogging(Logging.DEBUG)
                .withJdbc(new Jdbc()
                    .withDriver(container.getDriverClassName())
                    .withUrl(container.getJdbcUrl())
                    .withUser(container.getUsername())
                    .withPassword(container.getPassword())
                ).withGenerator(prepareGeneratorConfig(extension)))
    }

    private Generator prepareGeneratorConfig(final JooqGenerateExtension extension) {
        return new Generator()
            .withName(JavaGenerator.class.name)
            .withStrategy(new Strategy().withName(JooqGeneratorStrategy.class.name))
            .withDatabase(new Database()
                .withName(extension.databaseGeneratorName)
                .withIncludes(extension.includeMatches)
                .withInputSchema(extension.inputSchema)
                .withExcludes(extension.excludes))
            .withTarget(new Target()
                .withPackageName(extension.basePackageName)
                .withDirectory(this.outputDirectory.asFile.get().toString())
                .withClean(true))
            .withGenerate(extension.generate)
    }

    private ClassLoader buildJdbcArtifactsAwareClassLoader(final Configuration configuration) {
        final URL[] resolvedArtifactUrls = configuration
            .resolvedConfiguration
            .resolvedArtifacts
            .stream()
            .map { it.file.toURI().toURL() }
            .collect(toList())
            .toArray(new URL[0])

        return new URLClassLoader(resolvedArtifactUrls, getClass().getClassLoader())
    }

    // cannot be private
    @SuppressWarnings('GrMethodMayBeStatic')
    void log(final OutputFrame outputFrame) {
        final String utf8String = outputFrame.getUtf8String().replaceAll(LINE_BREAK_AT_END_REGEX, "")

        switch (outputFrame.getType()) {
            case OutputFrame.OutputType.STDOUT: println(utf8String); break
            case OutputFrame.OutputType.STDERR: println(utf8String); break
            default: break
        }
    }
}
