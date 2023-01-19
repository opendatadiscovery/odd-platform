package org.opendatadiscovery.oddplatform.service.search;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityHighlight;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntitySearchHighlight;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetStructureHighlight;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSourceHighlight;
import org.opendatadiscovery.oddplatform.api.contract.model.Label;
import org.opendatadiscovery.oddplatform.api.contract.model.MetadataFieldValue;
import org.opendatadiscovery.oddplatform.api.contract.model.NamespaceHighlight;
import org.opendatadiscovery.oddplatform.api.contract.model.OwnershipHighlight;
import org.opendatadiscovery.oddplatform.api.contract.model.Tag;
import org.opendatadiscovery.oddplatform.dto.DataEntityDetailsDto;
import org.opendatadiscovery.oddplatform.dto.DatasetFieldDto;
import org.opendatadiscovery.oddplatform.dto.DatasetStructureDto;
import org.opendatadiscovery.oddplatform.dto.LabelDto;
import org.opendatadiscovery.oddplatform.dto.OwnershipDto;
import org.opendatadiscovery.oddplatform.dto.TagDto;
import org.opendatadiscovery.oddplatform.dto.metadata.MetadataDto;
import org.opendatadiscovery.oddplatform.dto.metadata.MetadataOrigin;
import org.opendatadiscovery.oddplatform.mapper.LabelMapper;
import org.opendatadiscovery.oddplatform.mapper.MetadataFieldValueMapper;
import org.opendatadiscovery.oddplatform.mapper.TagMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataSourcePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;

@Component
@RequiredArgsConstructor
public class DataEntityHighlightConverter {
    private static final String HIGHLIGHT_TAG = "<b>";
    private static final String HIGHLIGHT_TAG_END = "</b>";

    private static final String DELIMITER = Character.toString((char) 31);
    private static final String RECORD_DELIMITER = Character.toString((char) 30);
    private static final String GROUP_DELIMITER = Character.toString((char) 29);
    private static final String ENTITY_FIELD_DELIMITER = Character.toString((char) 28);

    private final TagMapper tagMapper;
    private final MetadataFieldValueMapper metadataMapper;
    private final LabelMapper labelMapper;

    public String convert(final DataEntityDetailsDto detailsDto,
                          final DatasetStructureDto structureDto) {
        final String dataEntityFields = dataEntityDetailsFields(detailsDto.getDataEntity());
        final String dataSourceFields = dataSourceFields(detailsDto.getDataSource());
        final String namespaceFields = namespaceFields(detailsDto.getNamespace());
        final String tagFields = tagFields(detailsDto.getTags());
        final String ownershipFields = ownershipFields(detailsDto.getOwnership());
        final String internalMetadataFields = internalMetadataFields(detailsDto.getMetadata());
        final String externalMetadataFields = externalMetadataFields(detailsDto.getMetadata());
        final String dataSetStructure = dataSetStructure(structureDto);
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

    private String dataEntityDetailsFields(final DataEntityPojo pojo) {
        return String.join(RECORD_DELIMITER,
            searchableString(pojo.getExternalName()),
            searchableString(pojo.getInternalName()),
            searchableString(pojo.getExternalDescription()),
            searchableString(pojo.getInternalDescription())
        );
    }

    private String dataSourceFields(final DataSourcePojo pojo) {
        if (pojo == null) {
            return "";
        }
        return String.join(RECORD_DELIMITER,
            searchableString(pojo.getName()),
            searchableString(pojo.getOddrn())
        );
    }

    private String namespaceFields(final NamespacePojo pojo) {
        if (pojo == null) {
            return "";
        }
        return searchableString(pojo.getName());
    }

    private String tagFields(final Collection<TagDto> tags) {
        if (CollectionUtils.isEmpty(tags)) {
            return "";
        }
        return tags.stream()
            .map(t -> searchableString(t.tagPojo().getName()))
            .collect(Collectors.joining(DELIMITER));
    }

    private String ownershipFields(final List<OwnershipDto> ownership) {
        if (CollectionUtils.isEmpty(ownership)) {
            return "";
        }
        return ownership.stream()
            .map(o -> {
                final String ownerName = searchableString(o.getOwner().getName());
                final String ownerTitle = searchableString(o.getTitle().getName());
                return String.join(RECORD_DELIMITER, ownerName, ownerTitle);
            })
            .collect(Collectors.joining(GROUP_DELIMITER));
    }

    private String internalMetadataFields(final Collection<MetadataDto> metadata) {
        return metadataFields(metadata, MetadataOrigin.INTERNAL);
    }

    private String externalMetadataFields(final Collection<MetadataDto> metadata) {
        return metadataFields(metadata, MetadataOrigin.EXTERNAL);
    }

    private String metadataFields(final Collection<MetadataDto> metadata,
                                  final MetadataOrigin origin) {
        if (CollectionUtils.isEmpty(metadata)) {
            return "";
        }
        return metadata.stream()
            .filter(m -> m.metadataField().getOrigin().equalsIgnoreCase(origin.name()))
            .map(m -> {
                final String key = searchableString(m.metadataField().getName());
                final String value = searchableString(m.metadataFieldValue().getValue());
                return String.join(RECORD_DELIMITER, key, value);
            })
            .collect(Collectors.joining(GROUP_DELIMITER));
    }

    private String dataSetStructure(final DatasetStructureDto structureDto) {
        if (CollectionUtils.isEmpty(structureDto.getDatasetFields())) {
            return "";
        }
        return structureDto.getDatasetFields().stream()
            .map(f -> {
                final String name = searchableString(f.getDatasetFieldPojo().getName());
                final String internalDescription = searchableString(f.getDatasetFieldPojo().getInternalDescription());
                final String externalDescription = searchableString(f.getDatasetFieldPojo().getExternalDescription());
                final String labels = mapDatasetFieldLabels(f.getLabels());
                return String.join(RECORD_DELIMITER, name, internalDescription, externalDescription, labels);
            })
            .collect(Collectors.joining(GROUP_DELIMITER));
    }

    private String mapDatasetFieldLabels(final List<LabelDto> labels) {
        if (CollectionUtils.isEmpty(labels)) {
            return "";
        }
        return labels.stream()
            .map(l -> searchableString(l.pojo().getName()))
            .collect(Collectors.joining(DELIMITER));
    }

    private DataEntityHighlight parseDataEntitySearch(final String dataEntityHighlight) {
        if (!isHighlighted(dataEntityHighlight)) {
            return null;
        }
        final DataEntityHighlight highlight = new DataEntityHighlight();
        final String[] fields = dataEntityHighlight.split(RECORD_DELIMITER, -1);
        final String highlightedExternalName = fields[0];
        if (isHighlighted(highlightedExternalName)) {
            highlight.setExternalName(highlightedExternalName);
        }
        final String highlightedInternalName = fields[1];
        if (isHighlighted(highlightedInternalName)) {
            highlight.setInternalName(highlightedInternalName);
        }
        final String highlightedExternalDescription = fields[2];
        if (isHighlighted(highlightedExternalDescription)) {
            highlight.setExternalDescription(highlightedExternalDescription);
        }
        final String highlightedInternalDescription = fields[3];
        if (isHighlighted(highlightedInternalDescription)) {
            highlight.setInternalDescription(highlightedInternalDescription);
        }
        return highlight;
    }

    private DataSourceHighlight parseDataSourceSearch(final String dataSourceHighlight) {
        if (!isHighlighted(dataSourceHighlight)) {
            return null;
        }
        final DataSourceHighlight highlight = new DataSourceHighlight();
        final String[] fields = dataSourceHighlight.split(RECORD_DELIMITER, -1);
        final String highlightedName = fields[0];
        if (isHighlighted(highlightedName)) {
            highlight.setName(highlightedName);
        }
        final String highlightedOddrn = fields[1];
        if (isHighlighted(highlightedOddrn)) {
            highlight.setOddrn(highlightedOddrn);
        }
        return highlight;
    }

    private NamespaceHighlight parseNamespaceSearch(final String namespaceHighlight) {
        if (!isHighlighted(namespaceHighlight)) {
            return null;
        }
        final NamespaceHighlight highlight = new NamespaceHighlight();
        highlight.setName(namespaceHighlight);
        return highlight;
    }

    private List<Tag> parseTagSearch(final String tagHighlight,
                                     final Collection<TagDto> originalTags) {
        if (!isHighlighted(tagHighlight)) {
            return null;
        }
        final List<Tag> tags = new ArrayList<>();
        final String[] rawTags = tagHighlight.split(DELIMITER);
        for (final String rawTag : rawTags) {
            if (isHighlighted(rawTag)) {
                final String name = rawTag.replace(HIGHLIGHT_TAG, "").replace(HIGHLIGHT_TAG_END, "");
                final TagDto tagDto = originalTags.stream()
                    .filter(t -> t.tagPojo().getName().equals(name))
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("Tag not found"));
                tags.add(tagMapper.mapToHighlightedTag(tagDto, rawTag));
            }
        }
        return tags;
    }

    private List<OwnershipHighlight> parseOwnershipSearch(final String ownershipHighlight) {
        if (!isHighlighted(ownershipHighlight)) {
            return null;
        }
        final String[] ownerships = ownershipHighlight.split(GROUP_DELIMITER);
        final List<OwnershipHighlight> ownershipHighlights = new ArrayList<>();
        for (final String ownership : ownerships) {
            final String[] fields = ownership.split(RECORD_DELIMITER);
            final String highlightedOwnerName = fields[0];
            final String highlightedOwnerTitle = fields[1];
            if (isHighlighted(highlightedOwnerName) || isHighlighted(highlightedOwnerTitle)) {
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
        if (!isHighlighted(metadataHighlight)) {
            return Collections.emptyList();
        }
        final List<MetadataFieldValue> result = new ArrayList<>();
        final String[] metadataArray = metadataHighlight.split(GROUP_DELIMITER);
        for (final String metadata : metadataArray) {
            final String[] fields = metadata.split(RECORD_DELIMITER);
            final String highlightedName = fields[0];
            final String highlightedValue = fields[1];
            if (isHighlighted(highlightedName) || isHighlighted(highlightedValue)) {
                final String originalName = highlightedName.replace(HIGHLIGHT_TAG, "").replace(HIGHLIGHT_TAG_END, "");
                final MetadataDto metadataDto = originalMetadata.stream()
                    .filter(m -> m.metadataField().getName().equals(originalName)
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
        if (!isHighlighted(dataSetStructureHighlight)) {
            return null;
        }
        final String[] dataSetStructures = dataSetStructureHighlight.split(GROUP_DELIMITER);
        final List<DataSetStructureHighlight> dataSetStructureHighlights = new ArrayList<>();
        for (final String dataSetStructure : dataSetStructures) {
            final String[] fields = dataSetStructure.split(RECORD_DELIMITER, -1);
            final String highlightedName = fields[0];
            final String highlightedIntDescription = fields[1];
            final String highlightedExtDescription = fields[2];
            final String highlightedLabels = fields[3];
            if (isHighlighted(highlightedName) || isHighlighted(highlightedIntDescription)
                || isHighlighted(highlightedExtDescription) || isHighlighted(highlightedLabels)) {
                final DataSetStructureHighlight dataSetStructureHighlightDto = new DataSetStructureHighlight();
                dataSetStructureHighlightDto.setName(highlightedName);
                if (isHighlighted(highlightedIntDescription)) {
                    dataSetStructureHighlightDto.setInternalDescription(highlightedIntDescription);
                }
                if (isHighlighted(highlightedExtDescription)) {
                    dataSetStructureHighlightDto.setExternalDescription(highlightedExtDescription);
                }
                if (isHighlighted(highlightedLabels)) {
                    final String datasetFieldName =
                        highlightedName.replace(HIGHLIGHT_TAG, "").replace(HIGHLIGHT_TAG_END, "");
                    final DatasetFieldDto dataSetFieldDto = structureDto.getDatasetFields().stream()
                        .filter(f -> f.getDatasetFieldPojo().getName().equals(datasetFieldName))
                        .findFirst()
                        .orElseThrow(() -> new IllegalArgumentException("Dataset field not found"));
                    final List<Label> labels = parseLabels(highlightedLabels, dataSetFieldDto);
                    dataSetStructureHighlightDto.setLabels(labels);
                }
                dataSetStructureHighlights.add(dataSetStructureHighlightDto);
            }
        }
        return dataSetStructureHighlights;
    }

    private List<Label> parseLabels(final String highlightedLabels,
                                    final DatasetFieldDto dataSetFieldDto) {
        final List<Label> labels = new ArrayList<>();
        final String[] rawLabels = highlightedLabels.split(DELIMITER);
        for (final String rawLabel : rawLabels) {
            if (isHighlighted(rawLabel)) {
                final String name = rawLabel.replace(HIGHLIGHT_TAG, "").replace(HIGHLIGHT_TAG_END, "");
                final LabelDto labelDto = dataSetFieldDto.getLabels().stream()
                    .filter(l -> l.pojo().getName().equals(name))
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("Label not found"));
                labels.add(labelMapper.mapToHighlightedLabel(labelDto, rawLabel));
            }
        }
        return labels;
    }

    private boolean isHighlighted(final String field) {
        return StringUtils.isNotEmpty(field) && field.contains(HIGHLIGHT_TAG) && field.contains(HIGHLIGHT_TAG_END);
    }

    private String searchableString(final String value) {
        return StringUtils.defaultIfEmpty(value, "")
            .replace("'", "''");
    }
}
