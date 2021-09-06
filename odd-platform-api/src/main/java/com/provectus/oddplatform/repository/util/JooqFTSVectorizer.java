package com.provectus.oddplatform.repository.util;

import com.provectus.oddplatform.dto.DataEntityDetailsDto;
import com.provectus.oddplatform.dto.DataEntityDimensionsDto;
import com.provectus.oddplatform.dto.MetadataDto;
import com.provectus.oddplatform.dto.OwnershipDto;
import com.provectus.oddplatform.model.tables.pojos.DataEntityPojo;
import com.provectus.oddplatform.model.tables.pojos.DataSourcePojo;
import com.provectus.oddplatform.model.tables.pojos.DatasetFieldPojo;
import com.provectus.oddplatform.model.tables.pojos.MetadataFieldPojo;
import com.provectus.oddplatform.model.tables.pojos.MetadataFieldValuePojo;
import com.provectus.oddplatform.model.tables.pojos.NamespacePojo;
import com.provectus.oddplatform.model.tables.pojos.OwnerPojo;
import com.provectus.oddplatform.model.tables.pojos.RolePojo;
import com.provectus.oddplatform.model.tables.pojos.TagPojo;
import com.provectus.oddplatform.utils.Pair;
import java.util.Collection;
import java.util.List;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Stream;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections4.CollectionUtils;
import org.jooq.Field;
import org.jooq.impl.DSL;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
@Slf4j
public class JooqFTSVectorizer {

    public Field<Object> toTsVector(final DataEntityDimensionsDto dto) {
        return reduceVectorStream(dataEntityDimensionFTSConfigStream(dto));
    }

    public Field<Object> toTsVector(final DataEntityDetailsDto dto) {
        final Stream<String> vectorStream = Stream.concat(
                dataEntityDimensionFTSConfigStream(dto),
                Stream.of(
                        buildVector(FTSConfig.MF_CONFIG, dto.getMetadata(), MetadataDto::getMetadataField),
                        buildVector(FTSConfig.MFV_CONFIG, dto.getMetadata(), MetadataDto::getMetadataFieldValue)
                )
        );

        return reduceVectorStream(vectorStream);
    }

    private Stream<String> dataEntityDimensionFTSConfigStream(final DataEntityDimensionsDto dto) {
        return Stream.of(
                buildVector(FTSConfig.DATA_ENTITY_CONFIG, dto.getDataEntity()),
                buildVector(FTSConfig.DATA_SOURCE_CONFIG, dto.getDataSource()),
                buildVector(FTSConfig.NAMESPACE_CONFIG, dto.getNamespace()),
                buildVector(FTSConfig.OWNER_CONFIG, dto.getOwnership(), OwnershipDto::getOwner),
                buildVector(FTSConfig.ROLE_CONFIG, dto.getOwnership(), OwnershipDto::getRole),
                buildVector(FTSConfig.TAG_CONFIG, dto.getTags())
        );
    }

    private Field<Object> reduceVectorStream(final Stream<String> vectorStream) {
        final String vector = concatVectors(vectorStream);

        return StringUtils.hasLength(vector) ? DSL.field(vector) : DSL.field("");
    }

    private <P> String buildVector(final FTSConfig<P> config, final P pojo) {
        if (pojo == null) {
            return null;
        }

        return concatVectors(config.stream().map(c -> applyConfigEntry(pojo, c)));
    }

    private <P> String buildVector(final FTSConfig<P> config,
                                   final Collection<P> pojos) {
        return concatVectors(CollectionUtils.emptyIfNull(pojos).stream().map(p -> buildVector(config, p)));
    }

    private <P, T> String buildVector(final FTSConfig<P> config,
                                      final Collection<T> wrappers,
                                      final Function<T, P> mappingFunc) {
        return concatVectors(CollectionUtils.emptyIfNull(wrappers)
                .stream()
                .map(mappingFunc)
                .map(p -> buildVector(config, p)));
    }

    private String concatVectors(final Stream<String> vectors) {
        return vectors
                .filter(Objects::nonNull)
                .reduce((tsv1, tsv2) -> String.format("%s || %s", tsv1, tsv2)).orElse(null);
    }

    private <P> String applyConfigEntry(final P pojo, final Pair<Function<P, String>, Character> c) {
        final String payload = c.getLeft().apply(pojo);
        if (!StringUtils.hasLength(payload)) {
            return null;
        }

        return String.format("setweight(to_tsvector('%s'), '%s')", payload.replace("'", "''"), c.getRight());
    }

    @Data
    @RequiredArgsConstructor
    private static final class FTSConfig<P> {
        public static final FTSConfig<DataEntityPojo> DATA_ENTITY_CONFIG = FTSConfig.of(
                Pair.of(DataEntityPojo::getInternalName, 'A'),
                Pair.of(DataEntityPojo::getExternalName, 'A'),
                Pair.of(DataEntityPojo::getExternalDescription, 'B'),
                Pair.of(DataEntityPojo::getInternalDescription, 'B'),
                Pair.of(DataEntityPojo::getOddrn, 'D')
        );

        public static final FTSConfig<DataSourcePojo> DATA_SOURCE_CONFIG = FTSConfig.of(
                Pair.of(DataSourcePojo::getName, 'B'),
                Pair.of(DataSourcePojo::getOddrn, 'D')
        );

        public static final FTSConfig<OwnerPojo> OWNER_CONFIG = FTSConfig.of(
                Pair.of(OwnerPojo::getName, 'B')
        );

        public static final FTSConfig<NamespacePojo> NAMESPACE_CONFIG = FTSConfig.of(
                Pair.of(NamespacePojo::getName, 'B')
        );

        public static final FTSConfig<TagPojo> TAG_CONFIG = FTSConfig.of(
                Pair.of(TagPojo::getName, 'B')
        );

        public static final FTSConfig<MetadataFieldPojo> MF_CONFIG = FTSConfig.of(
                Pair.of(MetadataFieldPojo::getName, 'C')
        );

        public static final FTSConfig<MetadataFieldValuePojo> MFV_CONFIG = FTSConfig.of(
                Pair.of(MetadataFieldValuePojo::getValue, 'D')
        );

        public static final FTSConfig<RolePojo> ROLE_CONFIG = FTSConfig.of(
                Pair.of(RolePojo::getName, 'D')
        );

        public static final FTSConfig<DatasetFieldPojo> FIELD_CONFIG = FTSConfig.of(
                Pair.of(DatasetFieldPojo::getName, 'C'),
                Pair.of(DatasetFieldPojo::getOddrn, 'D')
        );

        final List<Pair<Function<P, String>, Character>> config;

        public static <P> FTSConfig<P> of(final List<Pair<Function<P, String>, Character>> config) {
            return new FTSConfig<>(config);
        }

        @SafeVarargs
        public static <P> FTSConfig<P> of(final Pair<Function<P, String>, Character>... config) {
            return of(List.of(config));
        }

        public Stream<Pair<Function<P, String>, Character>> stream() {
            return config.stream();
        }
    }
}
