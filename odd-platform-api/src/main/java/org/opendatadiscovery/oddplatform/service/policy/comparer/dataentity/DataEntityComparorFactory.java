package org.opendatadiscovery.oddplatform.service.policy.comparer.dataentity;

import java.util.function.Function;
import org.opendatadiscovery.oddplatform.dto.policy.DataEntityPolicyResolverContext;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataSourcePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;
import org.opendatadiscovery.oddplatform.service.policy.comparer.Comparer;

public final class DataEntityComparorFactory {
    private DataEntityComparorFactory() {
    }

    public static Comparer<DataEntityPolicyResolverContext> dataEntity(
        final Function<DataEntityPojo, String> fieldExtractor) {
        return new DataEntityFieldComparer(fieldExtractor);
    }

    public static Comparer<DataEntityPolicyResolverContext> dataEntityType() {
        return new DataEntityTypeFieldComparer();
    }

    public static Comparer<DataEntityPolicyResolverContext> dataEntityClass() {
        return new DataEntityClassFieldComparer();
    }

    public static Comparer<DataEntityPolicyResolverContext> dataEntityOwner() {
        return new DataEntityOwnerFieldComparer();
    }

    public static Comparer<DataEntityPolicyResolverContext> dataEntityDataSource(
        final Function<DataSourcePojo, String> fieldExtractor) {
        return new DataEntityDataSourceFieldComparer(fieldExtractor);
    }

    public static Comparer<DataEntityPolicyResolverContext> dataEntityNamespace(
        final Function<NamespacePojo, String> fieldExtractor) {
        return new DataEntityNamespaceFieldComparer(fieldExtractor);
    }

    public static Comparer<DataEntityPolicyResolverContext> dataEntityTag() {
        return new DataEntityTagFieldComparer();
    }

    public static Comparer<DataEntityPolicyResolverContext> dataEntityOwnerTitle() {
        return new DataEntityOwnerTitleFieldComparer();
    }

    /**
     * Builds a subtype comparer that reads the 'subtype' column from the data entity.
     * Note: Uses raw JOOQ field access because the subtype column may be added via Flyway
     * before JOOQ code generation has been re-run.
     */
    public static Comparer<DataEntityPolicyResolverContext> dataEntitySubtype() {
        return new DataEntitySubtypeFieldComparer();
    }
}
