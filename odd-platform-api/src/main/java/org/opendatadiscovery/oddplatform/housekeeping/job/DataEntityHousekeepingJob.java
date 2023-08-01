package org.opendatadiscovery.oddplatform.housekeeping.job;

import java.sql.Connection;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections4.CollectionUtils;
import org.jooq.DSLContext;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.dto.DataEntityClassDto;
import org.opendatadiscovery.oddplatform.dto.DataEntityStatusDto;
import org.opendatadiscovery.oddplatform.housekeeping.config.HousekeepingTTLProperties;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetFieldPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.FilePojo;
import org.opendatadiscovery.oddplatform.service.attachment.FileUploadService;
import org.opendatadiscovery.oddplatform.service.ingestion.util.DateTimeUtil;
import org.springframework.stereotype.Component;

import static org.jooq.impl.DSL.field;
import static org.opendatadiscovery.oddplatform.model.Tables.ACTIVITY;
import static org.opendatadiscovery.oddplatform.model.Tables.ALERT;
import static org.opendatadiscovery.oddplatform.model.Tables.ALERT_CHUNK;
import static org.opendatadiscovery.oddplatform.model.Tables.ALERT_HALT_CONFIG;
import static org.opendatadiscovery.oddplatform.model.Tables.DATASET_FIELD;
import static org.opendatadiscovery.oddplatform.model.Tables.DATASET_FIELD_DESCRIPTION_UNHANDLED_TERM;
import static org.opendatadiscovery.oddplatform.model.Tables.DATASET_FIELD_METADATA_VALUE;
import static org.opendatadiscovery.oddplatform.model.Tables.DATASET_FIELD_TO_TERM;
import static org.opendatadiscovery.oddplatform.model.Tables.DATASET_STRUCTURE;
import static org.opendatadiscovery.oddplatform.model.Tables.DATASET_VERSION;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_ENTITY;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_ENTITY_DESCRIPTION_UNHANDLED_TERM;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_ENTITY_FILLED;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_ENTITY_TASK_LAST_RUN;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_ENTITY_TASK_RUN;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_ENTITY_TO_TERM;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_QUALITY_TEST_RELATIONS;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_QUALITY_TEST_SEVERITY;
import static org.opendatadiscovery.oddplatform.model.Tables.ENUM_VALUE;
import static org.opendatadiscovery.oddplatform.model.Tables.FILE;
import static org.opendatadiscovery.oddplatform.model.Tables.GROUP_ENTITY_RELATIONS;
import static org.opendatadiscovery.oddplatform.model.Tables.GROUP_PARENT_GROUP_RELATIONS;
import static org.opendatadiscovery.oddplatform.model.Tables.LABEL_TO_DATASET_FIELD;
import static org.opendatadiscovery.oddplatform.model.Tables.LINEAGE;
import static org.opendatadiscovery.oddplatform.model.Tables.LINK;
import static org.opendatadiscovery.oddplatform.model.Tables.MESSAGE;
import static org.opendatadiscovery.oddplatform.model.Tables.MESSAGE_PROVIDER_EVENT;
import static org.opendatadiscovery.oddplatform.model.Tables.METADATA_FIELD_VALUE;
import static org.opendatadiscovery.oddplatform.model.Tables.METRIC_ENTITY;
import static org.opendatadiscovery.oddplatform.model.Tables.METRIC_LABEL_VALUE;
import static org.opendatadiscovery.oddplatform.model.Tables.METRIC_POINT;
import static org.opendatadiscovery.oddplatform.model.Tables.METRIC_SERIES;
import static org.opendatadiscovery.oddplatform.model.Tables.OWNERSHIP;
import static org.opendatadiscovery.oddplatform.model.Tables.SEARCH_ENTRYPOINT;
import static org.opendatadiscovery.oddplatform.model.Tables.TAG_TO_DATA_ENTITY;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataEntityHousekeepingJob implements HousekeepingJob {
    private final HousekeepingTTLProperties properties;
    private final FileUploadService fileUploadService;

    @Override
    public void doHousekeeping(final Connection connection) {
        DSL.using(connection).transaction(ctx -> {
            final DSLContext dslContext = ctx.dsl();
            final LocalDateTime deleteTime = DateTimeUtil.generateNow().minusDays(properties.getDataEntityDeleteDays());

            final List<DataEntityPojo> dataEntitiesToDelete = dslContext.selectFrom(DATA_ENTITY)
                .where(DATA_ENTITY.STATUS.eq(DataEntityStatusDto.DELETED.getId())
                    .and(DATA_ENTITY.STATUS_UPDATED_AT.lessOrEqual(deleteTime)))
                .fetch(r -> r.into(DataEntityPojo.class));

            deleteDataEntities(dslContext, dataEntitiesToDelete);
        });
    }

    private void deleteDataEntities(final DSLContext dslContext,
                                    final List<DataEntityPojo> dataEntitiesToDelete) {
        if (CollectionUtils.isEmpty(dataEntitiesToDelete)) {
            log.debug("There are no data entities to delete");
            return;
        }

        final List<Long> dataEntityIds = dataEntitiesToDelete.stream()
            .map(DataEntityPojo::getId)
            .toList();

        final List<String> dataEntityOddrns = dataEntitiesToDelete.stream()
            .map(DataEntityPojo::getOddrn)
            .toList();

        deleteTagRelations(dslContext, dataEntityIds);
        deleteSearchVectors(dslContext, dataEntityIds);
        deleteOwnerships(dslContext, dataEntityIds);
        deleteMetadata(dslContext, dataEntityIds);
        deleteMessages(dslContext, dataEntityIds);
        deleteMetrics(dslContext, dataEntityOddrns);
        deleteLinks(dslContext, dataEntityIds);
        deleteLineage(dslContext, dataEntityOddrns);
        deleteGroupEntityRelations(dslContext, dataEntityOddrns);
        deleteGroupParentGroupRelations(dslContext, dataEntityOddrns);
        deleteTermRelations(dslContext, dataEntityIds);
        deleteDataEntityFilledInfo(dslContext, dataEntityIds);
        deleteDataEntityDescriptionUnhandledTerms(dslContext, dataEntityIds);
        deleteAlerts(dslContext, dataEntityIds, dataEntityOddrns);
        deleteActivity(dslContext, dataEntityIds);
        deleteTaskRuns(dslContext, dataEntityOddrns);
        deleteQTSeverity(dslContext, dataEntityIds);
        deleteQTRelations(dslContext, dataEntityOddrns);
        deleteFiles(dslContext, dataEntityIds);

        final List<DataEntityPojo> datasets = dataEntitiesToDelete.stream()
            .filter(this::isDataset)
            .toList();
        deleteDatasetsInformation(dslContext, datasets);

        dslContext.deleteFrom(DATA_ENTITY)
            .where(DATA_ENTITY.ID.in(dataEntityIds))
            .execute();
    }

    private void deleteFiles(final DSLContext dslContext,
                             final List<Long> dataEntityIds) {
        final List<FilePojo> deletedFiles = dslContext.deleteFrom(FILE)
            .where(FILE.DATA_ENTITY_ID.in(dataEntityIds))
            .returning()
            .fetch(r -> r.into(FilePojo.class));

        //here we get files, which were not deleted by user, so we need to delete them from storage
        final List<FilePojo> filePojos = deletedFiles.stream()
            .filter(file -> file.getDeletedAt() == null)
            .toList();
        fileUploadService.deleteFiles(filePojos).block();
    }

    private void deleteQTRelations(final DSLContext dslContext,
                                   final List<String> dataEntityOddrns) {
        dslContext.deleteFrom(DATA_QUALITY_TEST_RELATIONS)
            .where(DATA_QUALITY_TEST_RELATIONS.DATASET_ODDRN.in(dataEntityOddrns)
                .or(DATA_QUALITY_TEST_RELATIONS.DATA_QUALITY_TEST_ODDRN.in(dataEntityOddrns)))
            .execute();
    }

    private void deleteQTSeverity(final DSLContext dslContext,
                                  final List<Long> dataEntityIds) {
        dslContext.deleteFrom(DATA_QUALITY_TEST_SEVERITY)
            .where(DATA_QUALITY_TEST_SEVERITY.DATASET_ID.in(dataEntityIds)
                .or(DATA_QUALITY_TEST_SEVERITY.DATA_QUALITY_TEST_ID.in(dataEntityIds)))
            .execute();
    }

    private void deleteTaskRuns(final DSLContext dslContext,
                                final List<String> dataEntityOddrns) {
        dslContext.deleteFrom(DATA_ENTITY_TASK_LAST_RUN)
            .where(DATA_ENTITY_TASK_LAST_RUN.TASK_ODDRN.in(dataEntityOddrns))
            .execute();

        dslContext.deleteFrom(DATA_ENTITY_TASK_RUN)
            .where(DATA_ENTITY_TASK_RUN.TASK_ODDRN.in(dataEntityOddrns))
            .execute();
    }

    private void deleteDatasetsInformation(final DSLContext dslContext,
                                           final List<DataEntityPojo> datasets) {
        final List<String> datasetOddrns = datasets.stream()
            .map(DataEntityPojo::getOddrn)
            .toList();

        final List<DatasetFieldPojo> datasetFields = dslContext.select(DATASET_FIELD.fields())
            .from(DATASET_FIELD)
            .join(DATASET_STRUCTURE).on(DATASET_STRUCTURE.DATASET_FIELD_ID.eq(DATASET_FIELD.ID))
            .join(DATASET_VERSION).on(DATASET_VERSION.ID.eq(DATASET_STRUCTURE.DATASET_VERSION_ID))
            .where(DATASET_VERSION.DATASET_ODDRN.in(datasetOddrns))
            .fetch(r -> r.into(DatasetFieldPojo.class));

        final List<Long> datasetFieldIds = datasetFields.stream()
            .map(DatasetFieldPojo::getId)
            .toList();

        final List<String> datasetFieldOddrns = datasetFields.stream()
            .map(DatasetFieldPojo::getOddrn)
            .toList();

        deleteMetrics(dslContext, datasetFieldOddrns);

        dslContext.deleteFrom(DATASET_FIELD_DESCRIPTION_UNHANDLED_TERM)
            .where(DATASET_FIELD_DESCRIPTION_UNHANDLED_TERM.DATASET_FIELD_ID.in(datasetFieldIds))
            .execute();

        dslContext.deleteFrom(ENUM_VALUE)
            .where(ENUM_VALUE.DATASET_FIELD_ID.in(datasetFieldIds))
            .execute();

        dslContext.deleteFrom(LABEL_TO_DATASET_FIELD)
            .where(LABEL_TO_DATASET_FIELD.DATASET_FIELD_ID.in(datasetFieldIds))
            .execute();

        dslContext.deleteFrom(DATASET_FIELD_TO_TERM)
            .where(DATASET_FIELD_TO_TERM.DATASET_FIELD_ID.in(datasetFieldIds))
            .execute();

        dslContext.deleteFrom(DATASET_FIELD_METADATA_VALUE)
            .where(DATASET_FIELD_METADATA_VALUE.DATASET_FIELD_ID.in(datasetFieldIds))
            .execute();

        dslContext.deleteFrom(DATASET_STRUCTURE)
            .where(DATASET_STRUCTURE.DATASET_FIELD_ID.in(datasetFieldIds))
            .execute();

        dslContext.deleteFrom(DATASET_VERSION)
            .where(DATASET_VERSION.DATASET_ODDRN.in(datasetOddrns))
            .execute();

        dslContext.deleteFrom(DATASET_FIELD)
            .where(DATASET_FIELD.ID.in(datasetFieldIds))
            .execute();
    }

    private void deleteActivity(final DSLContext dslContext, final List<Long> dataEntityIds) {
        dslContext.deleteFrom(ACTIVITY)
            .where(ACTIVITY.DATA_ENTITY_ID.in(dataEntityIds))
            .execute();
    }

    private void deleteAlerts(final DSLContext dslContext,
                              final List<Long> dataEntityIds,
                              final List<String> dataEntityOddrns) {
        dslContext.deleteFrom(ALERT_HALT_CONFIG)
            .where(ALERT_HALT_CONFIG.DATA_ENTITY_ID.in(dataEntityIds))
            .execute();

        final List<Long> alertIds = dslContext.selectFrom(ALERT)
            .where(ALERT.DATA_ENTITY_ODDRN.in(dataEntityOddrns))
            .fetch(ALERT.ID);

        dslContext.deleteFrom(ALERT_CHUNK)
            .where(ALERT_CHUNK.ALERT_ID.in(alertIds))
            .execute();

        dslContext.deleteFrom(ALERT)
            .where(ALERT.ID.in(alertIds))
            .execute();
    }

    private void deleteTagRelations(final DSLContext dslContext,
                                    final List<Long> dataEntityIds) {
        dslContext.deleteFrom(TAG_TO_DATA_ENTITY)
            .where(TAG_TO_DATA_ENTITY.DATA_ENTITY_ID.in(dataEntityIds))
            .execute();
    }

    private void deleteSearchVectors(final DSLContext dslContext,
                                     final List<Long> dataEntityIds) {
        dslContext.deleteFrom(SEARCH_ENTRYPOINT)
            .where(SEARCH_ENTRYPOINT.DATA_ENTITY_ID.in(dataEntityIds))
            .execute();
    }

    private void deleteOwnerships(final DSLContext dslContext,
                                  final List<Long> dataEntityIds) {
        dslContext.deleteFrom(OWNERSHIP)
            .where(OWNERSHIP.DATA_ENTITY_ID.in(dataEntityIds))
            .execute();
    }

    private void deleteMetadata(final DSLContext dslContext,
                                final List<Long> dataEntityIds) {
        dslContext.deleteFrom(METADATA_FIELD_VALUE)
            .where(METADATA_FIELD_VALUE.DATA_ENTITY_ID.in(dataEntityIds))
            .execute();
    }

    private void deleteMessages(final DSLContext dslContext,
                                final List<Long> dataEntityIds) {
        final List<UUID> messageUUIDs = dslContext.select(MESSAGE.UUID)
            .from(MESSAGE)
            .where(MESSAGE.DATA_ENTITY_ID.in(dataEntityIds))
            .fetch(MESSAGE.UUID);

        dslContext.deleteFrom(MESSAGE_PROVIDER_EVENT)
            .where(MESSAGE_PROVIDER_EVENT.PARENT_MESSAGE_UUID.in(messageUUIDs))
            .execute();

        dslContext.deleteFrom(MESSAGE)
            .where(MESSAGE.UUID.in(messageUUIDs))
            .execute();
    }

    private void deleteMetrics(final DSLContext dslContext,
                               final List<String> oddrns) {
        final List<Integer> metricEntityIds = dslContext.select(METRIC_ENTITY.ID)
            .from(METRIC_ENTITY)
            .where(METRIC_ENTITY.ENTITY_ODDRN.in(oddrns))
            .fetch(METRIC_ENTITY.ID);

        final List<Integer> metricSeriesIds = dslContext.select(METRIC_SERIES.ID)
            .from(METRIC_SERIES)
            .where(METRIC_SERIES.METRIC_ENTITY_ID.in(metricEntityIds))
            .fetch(METRIC_SERIES.ID);

        final var metricLabelValueIds =
            DSL.selectDistinct(field("unnest(?)", Integer.TYPE, METRIC_POINT.LABEL_VALUES_IDS))
                .from(METRIC_POINT)
                .where(METRIC_POINT.SERIES_ID.in(metricSeriesIds));

        dslContext.deleteFrom(METRIC_LABEL_VALUE)
            .where(METRIC_LABEL_VALUE.ID.in(metricLabelValueIds))
            .execute();

        dslContext.deleteFrom(METRIC_POINT)
            .where(METRIC_POINT.SERIES_ID.in(metricSeriesIds))
            .execute();

        dslContext.deleteFrom(METRIC_SERIES)
            .where(METRIC_SERIES.ID.in(metricSeriesIds))
            .execute();

        dslContext.deleteFrom(METRIC_ENTITY)
            .where(METRIC_ENTITY.ENTITY_ODDRN.in(oddrns))
            .execute();
    }

    private void deleteLinks(final DSLContext dslContext,
                             final List<Long> dataEntityIds) {
        dslContext.deleteFrom(LINK)
            .where(LINK.DATA_ENTITY_ID.in(dataEntityIds))
            .execute();
    }

    private void deleteLineage(final DSLContext dslContext,
                               final List<String> dataEntityOddrns) {
        dslContext.deleteFrom(LINEAGE)
            .where(LINEAGE.CHILD_ODDRN.in(dataEntityOddrns).or(LINEAGE.PARENT_ODDRN.in(dataEntityOddrns)))
            .execute();
    }

    private void deleteGroupEntityRelations(final DSLContext dslContext,
                                            final List<String> dataEntityOddrns) {
        dslContext.deleteFrom(GROUP_ENTITY_RELATIONS)
            .where(GROUP_ENTITY_RELATIONS.DATA_ENTITY_ODDRN.in(dataEntityOddrns)
                .or(GROUP_ENTITY_RELATIONS.GROUP_ODDRN.in(dataEntityOddrns)))
            .execute();
    }

    private void deleteGroupParentGroupRelations(final DSLContext dslContext,
                                                 final List<String> dataEntityOddrns) {
        dslContext.deleteFrom(GROUP_PARENT_GROUP_RELATIONS)
            .where(GROUP_PARENT_GROUP_RELATIONS.PARENT_GROUP_ODDRN.in(dataEntityOddrns)
                .or(GROUP_PARENT_GROUP_RELATIONS.GROUP_ODDRN.in(dataEntityOddrns)))
            .execute();
    }

    private void deleteTermRelations(final DSLContext dslContext, final List<Long> dataEntityIds) {
        dslContext.deleteFrom(DATA_ENTITY_TO_TERM)
            .where(DATA_ENTITY_TO_TERM.DATA_ENTITY_ID.in(dataEntityIds))
            .execute();
    }

    private void deleteDataEntityFilledInfo(final DSLContext dslContext,
                                            final List<Long> dataEntityIds) {
        dslContext.deleteFrom(DATA_ENTITY_FILLED)
            .where(DATA_ENTITY_FILLED.DATA_ENTITY_ID.in(dataEntityIds))
            .execute();
    }

    private void deleteDataEntityDescriptionUnhandledTerms(final DSLContext dslContext,
                                                           final List<Long> dataEntityIds) {
        dslContext.deleteFrom(DATA_ENTITY_DESCRIPTION_UNHANDLED_TERM)
            .where(DATA_ENTITY_DESCRIPTION_UNHANDLED_TERM.DATA_ENTITY_ID.in(dataEntityIds))
            .execute();
    }

    private boolean isDataset(final DataEntityPojo pojo) {
        return Arrays.stream(pojo.getEntityClassIds())
            .anyMatch(classId -> DataEntityClassDto.DATA_SET.getId() == classId);
    }
}
