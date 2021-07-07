package com.provectus.oddplatform.repository.util;

import com.provectus.oddplatform.dto.DataEntityDetailsDto;
import com.provectus.oddplatform.dto.DataEntityDimensionsDto;
import com.provectus.oddplatform.dto.MetadataDto;
import com.provectus.oddplatform.model.tables.pojos.DataEntityPojo;
import com.provectus.oddplatform.model.tables.pojos.DataSourcePojo;
import com.provectus.oddplatform.model.tables.pojos.DatasetFieldPojo;
import com.provectus.oddplatform.model.tables.pojos.MetadataFieldPojo;
import com.provectus.oddplatform.model.tables.pojos.MetadataFieldValuePojo;
import com.provectus.oddplatform.model.tables.pojos.NamespacePojo;
import com.provectus.oddplatform.model.tables.pojos.OwnerPojo;
import com.provectus.oddplatform.model.tables.pojos.TagPojo;
import com.provectus.oddplatform.utils.Pair;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jooq.impl.DSL;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Stream;

@Component
@Slf4j
public class FTSVectorizer {
    private final static FTSConfig<DataEntityPojo> DATA_ENTITY_CONFIG = FTSConfig.of(
        Pair.of(DataEntityPojo::getInternalName, 'A'),
        Pair.of(DataEntityPojo::getExternalName, 'A'),
        Pair.of(DataEntityPojo::getExternalDescription, 'B'),
        Pair.of(DataEntityPojo::getInternalDescription, 'B'),
        Pair.of(DataEntityPojo::getOddrn, 'D')
    );

    private final static FTSConfig<DataSourcePojo> DATA_SOURCE_CONFIG = FTSConfig.of(
        Pair.of(DataSourcePojo::getName, 'B'),
        Pair.of(DataSourcePojo::getOddrn, 'D')
    );

    private final static FTSConfig<OwnerPojo> OWNER_CONFIG = FTSConfig.of(
        Pair.of(OwnerPojo::getName, 'B')
    );

    private final static FTSConfig<NamespacePojo> NAMESPACE_CONFIG = FTSConfig.of(
        Pair.of(NamespacePojo::getName, 'B')
    );

    private final static FTSConfig<TagPojo> TAG_CONFIG = FTSConfig.of(
        Pair.of(TagPojo::getName, 'B')
    );

    private final static FTSConfig<MetadataFieldPojo> MF_CONFIG = FTSConfig.of(
        Pair.of(MetadataFieldPojo::getName, 'B')
    );

    private final static FTSConfig<MetadataFieldValuePojo> MFV_CONFIG = FTSConfig.of(
        Pair.of(MetadataFieldValuePojo::getValue, 'B')
    );

    private final static FTSConfig<DatasetFieldPojo> FIELD_CONFIG = FTSConfig.of(
        Pair.of(DatasetFieldPojo::getName, 'B'),
        Pair.of(DatasetFieldPojo::getOddrn, 'D')
    );

    public Object toTsVector(final DataEntityDimensionsDto dto) {
        final Stream<String> vectorStream = Stream.concat(
            Stream.of(
                toTsVector(DATA_ENTITY_CONFIG, dto.getDataEntity()),
                toTsVector(DATA_SOURCE_CONFIG, dto.getDataSource()),
//                toTsVector(OWNER_CONFIG, dto.getOwner()),
                toTsVector(NAMESPACE_CONFIG, dto.getNamespace())
            ),
            dto.getTags() == null ? Stream.empty() : dto.getTags().stream().map(t -> toTsVector(TAG_CONFIG, t))
        );

        return vectorStream
            .filter(Objects::nonNull)
            .reduce((tsv1, tsv2) -> String.format("%s || %s", tsv1, tsv2))
            .map(DSL::field)
            .orElseGet(() -> {
                log.warn("tsvector calculated from {} appears to be empty", dto.getDataEntity().getId());
                return DSL.field("");
            });
    }

    public Object toTsVector(final DataEntityDetailsDto dto) {
        final Stream<String> vectorStream = Stream.concat(
            Stream.of(
                toTsVector(DATA_ENTITY_CONFIG, dto.getDataEntity()),
                toTsVector(DATA_SOURCE_CONFIG, dto.getDataSource()),
//                toTsVector(OWNER_CONFIG, dto.getOwner()),
                toTsVector(NAMESPACE_CONFIG, dto.getNamespace()),
                dto.getMetadata().stream()
                    .map(MetadataDto::getMetadataField)
                    .map(mf -> toTsVector(MF_CONFIG, mf))
                    .reduce((tsv1, tsv2) -> String.format("%s || %s", tsv1, tsv2))
                    .orElse(null),
                dto.getMetadata().stream()
                    .map(MetadataDto::getMetadataFieldValue)
                    .map(mvf -> toTsVector(MFV_CONFIG, mvf))
                    .reduce((tsv1, tsv2) -> String.format("%s || %s", tsv1, tsv2))
                    .orElse(null)
            ),
            dto.getTags() == null ? Stream.empty() : dto.getTags().stream().map(t -> toTsVector(TAG_CONFIG, t))
        );

        return vectorStream
            .filter(Objects::nonNull)
            .reduce((tsv1, tsv2) -> String.format("%s || %s", tsv1, tsv2))
            .map(DSL::field)
            .orElseGet(() -> {
                log.warn("tsvector calculated from {} appears to be empty", dto.getDataEntity().getId());
                return DSL.field("");
            });
    }

    private <P> String toTsVector(final FTSConfig<P> config, final P pojo) {
        if (pojo == null) {
            return null;
        }

        return config.stream()
            .map(p -> p.getLeft().apply(pojo))
            .filter(Objects::nonNull)
            .map(s -> String.format("to_tsvector('%s')", s.replace("'", "''")))
            .reduce((tsv1, tsv2) -> String.format("%s || %s", tsv1, tsv2))
            .orElse(null);
    }

    @Data
    @RequiredArgsConstructor
    private static final class FTSConfig<P> {
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
