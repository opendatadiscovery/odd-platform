package org.opendatadiscovery.oddplatform.service.search;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityHighlight;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntitySearchHighlight;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetStructureHighlight;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSourceHighlight;
import org.opendatadiscovery.oddplatform.api.contract.model.MetadataFieldValue;
import org.opendatadiscovery.oddplatform.api.contract.model.NamespaceHighlight;
import org.opendatadiscovery.oddplatform.api.contract.model.OwnershipHighlight;
import org.opendatadiscovery.oddplatform.api.contract.model.Tag;
import org.opendatadiscovery.oddplatform.dto.DataEntityDetailsDto;
import org.opendatadiscovery.oddplatform.dto.DatasetFieldDto;
import org.opendatadiscovery.oddplatform.dto.DatasetStructureDto;
import org.opendatadiscovery.oddplatform.dto.OwnershipDto;
import org.opendatadiscovery.oddplatform.dto.TagDto;
import org.opendatadiscovery.oddplatform.dto.metadata.MetadataDto;
import org.opendatadiscovery.oddplatform.dto.metadata.MetadataOrigin;
import org.opendatadiscovery.oddplatform.mapper.MetadataFieldValueMapper;
import org.opendatadiscovery.oddplatform.mapper.TagMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataSourcePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;

import static org.opendatadiscovery.oddplatform.service.search.SearchHighlightDocument.DELIMITER;
import static org.opendatadiscovery.oddplatform.service.search.SearchHighlightDocument.ENTITY_FIELD_DELIMITER;
import static org.opendatadiscovery.oddplatform.service.search.SearchHighlightDocument.GROUP_DELIMITER;
import static org.opendatadiscovery.oddplatform.service.search.SearchHighlightDocument.RECORD_DELIMITER;
import static org.opendatadiscovery.oddplatform.service.search.SearchHighlightDocument.UNBOUNDED;
import static org.opendatadiscovery.oddplatform.service.search.SearchHighlightDocument.field;
import static org.opendatadiscovery.oddplatform.service.search.SearchHighlightDocument.isMarked;
import static org.opendatadiscovery.oddplatform.service.search.SearchHighlightDocument.stripMarks;

/**
 * Flattens a data entity's searchable fields into the one delimited document {@code ts_headline} highlights, and
 * parses the highlighted document back per field. The wire shape — the separators, the match marks, the per-field
 * normalisation — is defined ONCE in {@link SearchHighlightDocument} and shared with the Term and Query Example
 * converters (ST-12 / #1846).
 *
 * <p>Two callers with two contracts: the legacy session endpoint calls {@link #convert(DataEntityDetailsDto,
 * DatasetStructureDto)} (no field bound, its output byte-identical to what it always was — ADR D9); the polymorphic
 * {@code /api/search/assets/…/highlights} calls {@link #convert(DataEntityDetailsDto, DatasetStructureDto, int)}
 * with {@link SearchHighlightDocument#POLYMORPHIC_FIELD_CAP}.
 */
@Component
@RequiredArgsConstructor
public class DataEntityHighlightConverter {
    private final TagMapper tagMapper;
    private final MetadataFieldValueMapper metadataMapper;

    /** The legacy session path: no field bound (ADR D9 — that endpoint's output does not change). */
    public String convert(final DataEntityDetailsDto detailsDto,
                          final DatasetStructureDto structureDto) {
        return convert(detailsDto, structureDto, UNBOUNDED);
    }

    public String convert(final DataEntityDetailsDto detailsDto,
                          final DatasetStructureDto structureDto,
                          final int fieldCap) {
        final String dataEntityFields = dataEntityDetailsFields(detailsDto.getDataEntity(), fieldCap);
        final String dataSourceFields = dataSourceFields(detailsDto.getDataSource(), fieldCap);
        final String namespaceFields = namespaceFields(detailsDto.getNamespace(), fieldCap);
        final String tagFields = tagFields(detailsDto.getTags(), fieldCap);
        final String ownershipFields = ownershipFields(detailsDto.getOwnership(), fieldCap);
        final String internalMetadataFields = internalMetadataFields(detailsDto.getMetadata(), fieldCap);
        final String externalMetadataFields = externalMetadataFields(detailsDto.getMetadata(), fieldCap);
        final String dataSetStructure = dataSetStructure(structureDto, fieldCap);
        return Stream.of(dataEntityFields, dataSourceFields, namespaceFields, tagFields, ownershipFields,
                internalMetadataFields, externalMetadataFields, dataSetStructure)
            .collect(Collectors.joining(ENTITY_FIELD_DELIMITER, "", ENTITY_FIELD_DELIMITER));
    }

    public DataEntitySearchHighlight parseHighlightedString(final String highlightedString,
                                                            final DataEntityDetailsDto detailsDto,
                                                            final DatasetStructureDto structureDto) {
        final String[] fields = highlightedString.split(ENTITY_FIELD_DELIMITER, -1);
        final DataEntitySearchHighlight highlight = new DataEntitySearchHighlight();
        final DataEntityHighlight dataEntityHighlight = parseDataEntitySearch(fields[0]);
        highlight.setDataEntity(dataEntityHighlight);
        final DataSourceHighlight dataSourceHighlight = parseDataSourceSearch(fields[1]);
        highlight.setDataSource(dataSourceHighlight);
        final NamespaceHighlight namespaceHighlight = parseNamespaceSearch(fields[2]);
        highlight.setNamespace(namespaceHighlight);
        final List<Tag> tagHighlight = parseTagSearch(fields[3], detailsDto.getTags());
        highlight.setTags(tagHighlight);
        final List<OwnershipHighlight> ownershipHighlight = parseOwnershipSearch(fields[4]);
        highlight.setOwners(ownershipHighlight);
        final List<MetadataFieldValue> internalMetadataHighlight =
            parseMetadata(fields[5], MetadataOrigin.INTERNAL, detailsDto.getMetadata());
        final List<MetadataFieldValue> externalMetadataHighlight =
            parseMetadata(fields[6], MetadataOrigin.EXTERNAL, detailsDto.getMetadata());
        highlight.setMetadata(Stream.of(internalMetadataHighlight, externalMetadataHighlight)
            .flatMap(Collection::stream)
            .collect(Collectors.toList()));
        final List<DataSetStructureHighlight> dataSetStructureHighlight =
            parseDataSetStructureSearch(fields[7], structureDto);
        highlight.setDatasetStructure(dataSetStructureHighlight);
        return highlight;
    }

    private String dataEntityDetailsFields(final DataEntityPojo pojo, final int cap) {
        return String.join(RECORD_DELIMITER,
            field(pojo.getExternalName(), cap),
            field(pojo.getInternalName(), cap),
            field(pojo.getExternalDescription(), cap),
            field(pojo.getInternalDescription(), cap)
        );
    }

    private String dataSourceFields(final DataSourcePojo pojo, final int cap) {
        if (pojo == null) {
            return "";
        }
        return String.join(RECORD_DELIMITER,
            field(pojo.getName(), cap),
            field(pojo.getOddrn(), cap)
        );
    }

    private String namespaceFields(final NamespacePojo pojo, final int cap) {
        if (pojo == null) {
            return "";
        }
        return field(pojo.getName(), cap);
    }

    private String tagFields(final Collection<TagDto> tags, final int cap) {
        if (CollectionUtils.isEmpty(tags)) {
            return "";
        }
        return tags.stream()
            .map(t -> field(t.tagPojo().getName(), cap))
            .collect(Collectors.joining(DELIMITER));
    }

    private String ownershipFields(final List<OwnershipDto> ownership, final int cap) {
        if (CollectionUtils.isEmpty(ownership)) {
            return "";
        }
        return ownership.stream()
            .map(o -> {
                final String ownerName = field(o.getOwner().getName(), cap);
                final String ownerTitle = field(o.getTitle().getName(), cap);
                return String.join(RECORD_DELIMITER, ownerName, ownerTitle);
            })
            .collect(Collectors.joining(GROUP_DELIMITER));
    }

    private String internalMetadataFields(final Collection<MetadataDto> metadata, final int cap) {
        return metadataFields(metadata, MetadataOrigin.INTERNAL, cap);
    }

    private String externalMetadataFields(final Collection<MetadataDto> metadata, final int cap) {
        return metadataFields(metadata, MetadataOrigin.EXTERNAL, cap);
    }

    private String metadataFields(final Collection<MetadataDto> metadata,
                                  final MetadataOrigin origin,
                                  final int cap) {
        if (CollectionUtils.isEmpty(metadata)) {
            return "";
        }
        return metadata.stream()
            .filter(m -> m.metadataField().getOrigin().equalsIgnoreCase(origin.name()))
            .map(m -> {
                final String key = field(m.metadataField().getName(), cap);
                final String value = field(m.metadataFieldValue().getValue(), cap);
                return String.join(RECORD_DELIMITER, key, value);
            })
            .collect(Collectors.joining(GROUP_DELIMITER));
    }

    private String dataSetStructure(final DatasetStructureDto structureDto, final int cap) {
        if (CollectionUtils.isEmpty(structureDto.getDatasetFields())) {
            return "";
        }
        return structureDto.getDatasetFields().stream()
            .map(f -> {
                final String name = field(f.getDatasetFieldPojo().getName(), cap);
                final String internalDescription = field(f.getDatasetFieldPojo().getInternalDescription(), cap);
                final String externalDescription = field(f.getDatasetFieldPojo().getExternalDescription(), cap);
                final String tags = mapDatasetFieldTags(f.getTags(), cap);
                return String.join(RECORD_DELIMITER, name, internalDescription, externalDescription, tags);
            })
            .collect(Collectors.joining(GROUP_DELIMITER));
    }

    private String mapDatasetFieldTags(final List<TagDto> tags, final int cap) {
        if (CollectionUtils.isEmpty(tags)) {
            return "";
        }
        return tags.stream()
            .map(l -> field(l.tagPojo().getName(), cap))
            .collect(Collectors.joining(DELIMITER));
    }

    private DataEntityHighlight parseDataEntitySearch(final String dataEntityHighlight) {
        if (!isMarked(dataEntityHighlight)) {
            return null;
        }
        final DataEntityHighlight highlight = new DataEntityHighlight();
        final String[] fields = dataEntityHighlight.split(RECORD_DELIMITER, -1);
        final String highlightedExternalName = fields[0];
        if (isMarked(highlightedExternalName)) {
            highlight.setExternalName(highlightedExternalName);
        }
        final String highlightedInternalName = fields[1];
        if (isMarked(highlightedInternalName)) {
            highlight.setInternalName(highlightedInternalName);
        }
        final String highlightedExternalDescription = fields[2];
        if (isMarked(highlightedExternalDescription)) {
            highlight.setExternalDescription(highlightedExternalDescription);
        }
        final String highlightedInternalDescription = fields[3];
        if (isMarked(highlightedInternalDescription)) {
            highlight.setInternalDescription(highlightedInternalDescription);
        }
        return highlight;
    }

    private DataSourceHighlight parseDataSourceSearch(final String dataSourceHighlight) {
        if (!isMarked(dataSourceHighlight)) {
            return null;
        }
        final DataSourceHighlight highlight = new DataSourceHighlight();
        final String[] fields = dataSourceHighlight.split(RECORD_DELIMITER, -1);
        final String highlightedName = fields[0];
        if (isMarked(highlightedName)) {
            highlight.setName(highlightedName);
        }
        final String highlightedOddrn = fields[1];
        if (isMarked(highlightedOddrn)) {
            highlight.setOddrn(highlightedOddrn);
        }
        return highlight;
    }

    private NamespaceHighlight parseNamespaceSearch(final String namespaceHighlight) {
        if (!isMarked(namespaceHighlight)) {
            return null;
        }
        final NamespaceHighlight highlight = new NamespaceHighlight();
        highlight.setName(namespaceHighlight);
        return highlight;
    }

    private List<Tag> parseTagSearch(final String tagHighlight,
                                     final Collection<TagDto> originalTags) {
        if (!isMarked(tagHighlight)) {
            return null;
        }
        final List<Tag> tags = new ArrayList<>();
        final String[] rawTags = tagHighlight.split(DELIMITER);
        for (final String rawTag : rawTags) {
            if (isMarked(rawTag)) {
                // Normalised-to-normalised: the parsed name went through field(), so compare against the
                // original name normalised the same way (a name carrying a stripped code point still resolves).
                final String name = stripMarks(rawTag);
                final TagDto tagDto = originalTags.stream()
                    .filter(t -> field(t.tagPojo().getName(), UNBOUNDED).equals(name))
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("Tag not found"));
                tags.add(tagMapper.mapToHighlightedTag(tagDto, rawTag));
            }
        }
        return tags;
    }

    private List<OwnershipHighlight> parseOwnershipSearch(final String ownershipHighlight) {
        if (!isMarked(ownershipHighlight)) {
            return null;
        }
        final String[] ownerships = ownershipHighlight.split(GROUP_DELIMITER);
        final List<OwnershipHighlight> ownershipHighlights = new ArrayList<>();
        for (final String ownership : ownerships) {
            final String[] fields = ownership.split(RECORD_DELIMITER);
            final String highlightedOwnerName = fields[0];
            final String highlightedOwnerTitle = fields[1];
            if (isMarked(highlightedOwnerName) || isMarked(highlightedOwnerTitle)) {
                final OwnershipHighlight ownershipHighlightDto = new OwnershipHighlight();
                ownershipHighlightDto.setOwner(highlightedOwnerName);
                ownershipHighlightDto.setTitle(highlightedOwnerTitle);
                ownershipHighlights.add(ownershipHighlightDto);
            }
        }
        return ownershipHighlights;
    }

    private List<MetadataFieldValue> parseMetadata(final String metadataHighlight,
                                                   final MetadataOrigin origin,
                                                   final Collection<MetadataDto> originalMetadata) {
        if (!isMarked(metadataHighlight)) {
            return Collections.emptyList();
        }
        final List<MetadataFieldValue> result = new ArrayList<>();
        final String[] metadataArray = metadataHighlight.split(GROUP_DELIMITER);
        for (final String metadata : metadataArray) {
            final String[] fields = metadata.split(RECORD_DELIMITER);
            final String highlightedName = fields[0];
            final String highlightedValue = fields[1];
            if (isMarked(highlightedName) || isMarked(highlightedValue)) {
                final String originalName = stripMarks(highlightedName);
                final MetadataDto metadataDto = originalMetadata.stream()
                    .filter(m -> field(m.metadataField().getName(), UNBOUNDED).equals(originalName)
                        && m.metadataField().getOrigin().equals(origin.name()))
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("Metadata not found"));
                result.add(metadataMapper.mapHighlightedDto(metadataDto, highlightedName, highlightedValue));
            }
        }
        return result;
    }

    private List<DataSetStructureHighlight> parseDataSetStructureSearch(final String dataSetStructureHighlight,
                                                                        final DatasetStructureDto structureDto) {
        if (!isMarked(dataSetStructureHighlight)) {
            return null;
        }
        final String[] dataSetStructures = dataSetStructureHighlight.split(GROUP_DELIMITER);
        final List<DataSetStructureHighlight> dataSetStructureHighlights = new ArrayList<>();
        for (final String dataSetStructure : dataSetStructures) {
            final String[] fields = dataSetStructure.split(RECORD_DELIMITER, -1);
            final String highlightedName = fields[0];
            final String highlightedIntDescription = fields[1];
            final String highlightedExtDescription = fields[2];
            final String highlightedTags = fields[3];
            if (isMarked(highlightedName) || isMarked(highlightedIntDescription)
                || isMarked(highlightedExtDescription) || isMarked(highlightedTags)) {
                final DataSetStructureHighlight dataSetStructureHighlightDto = new DataSetStructureHighlight();
                dataSetStructureHighlightDto.setName(highlightedName);
                if (isMarked(highlightedIntDescription)) {
                    dataSetStructureHighlightDto.setInternalDescription(highlightedIntDescription);
                }
                if (isMarked(highlightedExtDescription)) {
                    dataSetStructureHighlightDto.setExternalDescription(highlightedExtDescription);
                }
                if (isMarked(highlightedTags)) {
                    final String datasetFieldName = stripMarks(highlightedName);
                    final DatasetFieldDto dataSetFieldDto = structureDto.getDatasetFields().stream()
                        .filter(f -> field(f.getDatasetFieldPojo().getName(), UNBOUNDED).equals(datasetFieldName))
                        .findFirst()
                        .orElseThrow(() -> new IllegalArgumentException("Dataset field not found"));
                    final List<Tag> tags = parseTags(highlightedTags, dataSetFieldDto);
                    dataSetStructureHighlightDto.setTags(tags);
                }
                dataSetStructureHighlights.add(dataSetStructureHighlightDto);
            }
        }
        return dataSetStructureHighlights;
    }

    private List<Tag> parseTags(final String highlightedTags,
                                    final DatasetFieldDto dataSetFieldDto) {
        final List<Tag> tags = new ArrayList<>();
        final String[] rawTags = highlightedTags.split(DELIMITER);
        for (final String rawTag : rawTags) {
            if (isMarked(rawTag)) {
                final String name = stripMarks(rawTag);
                final TagDto tagDto = dataSetFieldDto.getTags().stream()
                    .filter(l -> field(l.tagPojo().getName(), UNBOUNDED).equals(name))
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("Tag not found"));
                tags.add(tagMapper.mapToHighlightedTag(tagDto, rawTag));
            }
        }
        return tags;
    }
}
