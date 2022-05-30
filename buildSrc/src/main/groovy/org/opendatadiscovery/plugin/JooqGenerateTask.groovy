package org.opendatadiscovery.plugin

import org.flywaydb.core.Flyway
import org.gradle.api.DefaultTask
import org.gradle.api.artifacts.Configuration
import org.gradle.api.file.ConfigurableFileCollection
import org.gradle.api.tasks.TaskAction
import org.jooq.codegen.GenerationTool
import org.jooq.codegen.JavaGenerator
import org.jooq.meta.jaxb.*
import org.testcontainers.containers.JdbcDatabaseContainer
import org.testcontainers.containers.output.OutputFrame

import static java.util.stream.Collectors.toList
import static org.testcontainers.images.PullPolicy.alwaysPull

class JooqGenerateTask extends DefaultTask {
    private static final String LINE_BREAK_REGEX = "((\\r?\\n)|(\\r))";
    private static final String LINE_BREAK_AT_END_REGEX = LINE_BREAK_REGEX + '$';
    private static final String FILESYSTEM_PREFIX = "filesystem:";

    @TaskAction
    def execute() {
        final def extension = project.extensions.getByType(JooqGenerateExtension.class)
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

        def migrationSources = project.objects.fileCollection()
            .from(extension.migrationSrcDir)

        try {
            migrate(migrationSources, testContainerInstance)
            generateJooqClasses(testContainerInstance, extension)
        } finally {
            // TODO: use auto-closeable if possible
            testContainerInstance.stop()
        }
    }

    private void migrate(final ConfigurableFileCollection migrationSrc,
                         final JdbcDatabaseContainer container) {
        final String[] locations = migrationSrc.asList()
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
            .withStrategy(new Strategy().withName(JooqGenerationStrategy.class.name))
            .withDatabase(new Database()
                .withName(extension.databaseGeneratorName)
                .withIncludes(extension.includeMatches)
                .withInputSchema(extension.inputSchema)
                .withExcludes(extension.excludes))
            .withTarget(new Target()
                .withPackageName(extension.basePackageName)
                .withDirectory(outputDir())
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

    private String outputDir() {
        return project.objects
            .directoryProperty()
            .convention(project.layout.buildDirectory.dir("generated-jooq/src/main/java"))
            .asFile
            .get()
            .toString()
    }

    // cannot be private
    void log(final OutputFrame outputFrame) {
        final String utf8String = outputFrame.getUtf8String().replaceAll(LINE_BREAK_AT_END_REGEX, "")

        switch (outputFrame.getType()) {
            case OutputFrame.OutputType.STDOUT: println(utf8String); break
            case OutputFrame.OutputType.STDERR: println(utf8String); break
            default: break
        }
    }
}
