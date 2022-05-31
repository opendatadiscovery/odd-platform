package org.opendatadiscovery.internal.plugin

import org.jooq.codegen.DefaultGeneratorStrategy
import org.jooq.meta.Definition

class JooqGeneratorStrategy extends DefaultGeneratorStrategy {
    @Override
    String getJavaClassName(final Definition definition, final Mode mode) {
        def javaClassName = super.getJavaClassName(definition, mode)

        return (mode == Mode.POJO) ? javaClassName + "Pojo" : javaClassName
    }
}
