package org.opendatadiscovery.internal.plugin

import org.gradle.api.Plugin
import org.gradle.api.Project

class JooqGeneratePlugin implements Plugin<Project> {
    @Override
    void apply(final Project project) {
        project.extensions.create(Constants.EXTENSION_NAME, JooqGenerateExtension.class)
        project.tasks.create(Constants.TASK_NAME, JooqGenerateTask.class)
        project.configurations.create(Constants.CONFIGURATION_NAME)
    }
}