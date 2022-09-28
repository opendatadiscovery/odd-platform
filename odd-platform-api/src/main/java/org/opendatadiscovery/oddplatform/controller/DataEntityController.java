package org.opendatadiscovery.oddplatform.controller;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import javax.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.opendatadiscovery.oddplatform.api.contract.api.DataEntityApi;
import org.opendatadiscovery.oddplatform.api.contract.model.Actions;
import org.opendatadiscovery.oddplatform.api.contract.model.Activity;
import org.opendatadiscovery.oddplatform.api.contract.model.ActivityEventType;
import org.opendatadiscovery.oddplatform.api.contract.model.AlertList;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntity;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityClassAndTypeDictionary;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityDataEntityGroupFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityDetails;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityGroupFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityGroupLineageList;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityLineage;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityList;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityRef;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityTermFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityUsageInfo;
import org.opendatadiscovery.oddplatform.api.contract.model.InternalDescription;
import org.opendatadiscovery.oddplatform.api.contract.model.InternalDescriptionFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.InternalName;
import org.opendatadiscovery.oddplatform.api.contract.model.InternalNameFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.MetadataFieldValue;
import org.opendatadiscovery.oddplatform.api.contract.model.MetadataFieldValueList;
import org.opendatadiscovery.oddplatform.api.contract.model.MetadataFieldValueUpdateFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.MetadataObject;
import org.opendatadiscovery.oddplatform.api.contract.model.Ownership;
import org.opendatadiscovery.oddplatform.api.contract.model.OwnershipFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.OwnershipUpdateFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.Tag;
import org.opendatadiscovery.oddplatform.api.contract.model.TagsFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.TermRef;
import org.opendatadiscovery.oddplatform.dto.lineage.LineageStreamKind;
import org.opendatadiscovery.oddplatform.service.AlertService;
import org.opendatadiscovery.oddplatform.service.DataEntitySecurityService;
import org.opendatadiscovery.oddplatform.service.DataEntityService;
import org.opendatadiscovery.oddplatform.service.LineageService;
import org.opendatadiscovery.oddplatform.service.OwnershipService;
import org.opendatadiscovery.oddplatform.service.activity.ActivityService;
import org.opendatadiscovery.oddplatform.service.term.TermService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

@RestController
@Slf4j
public class DataEntityController
    extends AbstractReadOnlyController<DataEntity, DataEntityList, DataEntityService>
    implements DataEntityApi {

    private final OwnershipService ownershipService;
    private final AlertService alertService;
    private final TermService termService;
    private final LineageService lineageService;
    private final ActivityService activityService;
    private final DataEntitySecurityService dataEntitySecurityService;

    public DataEntityController(final DataEntityService entityService,
                                final OwnershipService ownershipService,
                                final AlertService alertService,
                                final TermService termService,
                                final LineageService lineageService,
                                final ActivityService activityService,
                                final DataEntitySecurityService dataEntitySecurityService) {
        super(entityService);
        this.ownershipService = ownershipService;
        this.alertService = alertService;
        this.termService = termService;
        this.lineageService = lineageService;
        this.activityService = activityService;
        this.dataEntitySecurityService = dataEntitySecurityService;
    }

    @Override
    public Mono<ResponseEntity<DataEntityRef>> createDataEntityGroup(final Mono<DataEntityGroupFormData> formData,
                                                                     final ServerWebExchange exchange) {
        return formData
            .flatMap(entityService::createDataEntityGroup)
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<Void>> deleteDataEntityGroup(final Long dataEntityGroupId,
                                                            final ServerWebExchange exchange) {
        return entityService.deleteDataEntityGroup(dataEntityGroupId)
            .thenReturn(ResponseEntity.noContent().build());
    }

    @Override
    public Mono<ResponseEntity<DataEntityRef>> updateDataEntityGroup(final Long dataEntityGroupId,
                                                                     final Mono<DataEntityGroupFormData> formData,
                                                                     final ServerWebExchange exchange) {
        return formData
            .flatMap(fd -> entityService.updateDataEntityGroup(dataEntityGroupId, fd))
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<DataEntityList>> getDataEntityGroupsChildren(final Long dataEntityGroupId,
                                                                            final Integer page, final Integer size,
                                                                            final ServerWebExchange exchange) {
        return entityService.getDataEntityGroupsChildren(dataEntityGroupId, page, size)
            .subscribeOn(Schedulers.boundedElastic())
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<MetadataFieldValueList>> createDataEntityMetadataFieldValue(
        final Long dataEntityId,
        @Valid final Flux<MetadataObject> metadataObject,
        final ServerWebExchange exchange
    ) {
        return metadataObject.collectList()
            .flatMap(moList -> entityService.createMetadata(dataEntityId, moList))
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<Void>> deleteDataEntityMetadataFieldValue(
        final Long dataEntityId,
        final Long metadataFieldId,
        final ServerWebExchange exchange
    ) {
        return entityService.deleteMetadata(dataEntityId, metadataFieldId)
            .map(m -> ResponseEntity.noContent().build());
    }

    @Override
    public Mono<ResponseEntity<DataEntityDetails>> getDataEntityDetails(
        final Long dataEntityId,
        final ServerWebExchange exchange
    ) {
        return entityService
            .getDetails(dataEntityId)
            .subscribeOn(Schedulers.boundedElastic())
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<TermRef>> addDataEntityTerm(final Long dataEntityId,
                                                           final Mono<DataEntityTermFormData> dataEntityTermFormData,
                                                           final ServerWebExchange exchange) {
        return dataEntityTermFormData
            .flatMap(formData -> termService.linkTermWithDataEntity(formData.getTermId(), dataEntityId))
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<Void>> deleteTermFromDataEntity(final Long dataEntityId, final Long termId,
                                                               final ServerWebExchange exchange) {
        return termService.removeTermFromDataEntity(termId, dataEntityId)
            .map(ignored -> ResponseEntity.noContent().build());
    }

    @Override
    public Mono<ResponseEntity<Ownership>> createOwnership(final Long dataEntityId,
                                                           final Mono<OwnershipFormData> ownershipFormData,
                                                           final ServerWebExchange exchange) {
        return ownershipFormData
            .flatMap(form -> ownershipService.create(dataEntityId, form))
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<Void>> deleteOwnership(final Long dataEntityId,
                                                      final Long ownershipId,
                                                      final ServerWebExchange exchange) {
        return ownershipService.delete(ownershipId)
            .map(m -> ResponseEntity.noContent().build());
    }

    @Override
    public Mono<ResponseEntity<Ownership>> updateOwnership(final Long dataEntityId,
                                                           final Long ownershipId,
                                                           final Mono<OwnershipUpdateFormData> ownershipUpdateFormData,
                                                           final ServerWebExchange exchange) {
        return ownershipUpdateFormData
            .flatMap(form -> ownershipService.update(ownershipId, form))
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<InternalDescription>> upsertDataEntityInternalDescription(
        final Long dataEntityId,
        @Valid final Mono<InternalDescriptionFormData> internalDescriptionFormData,
        final ServerWebExchange exchange
    ) {
        return internalDescriptionFormData
            .flatMap(form -> entityService.upsertDescription(dataEntityId, form))
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<MetadataFieldValue>> upsertDataEntityMetadataFieldValue(
        final Long dataEntityId,
        final Long metadataFieldId,
        @Valid final Mono<MetadataFieldValueUpdateFormData> metadataFieldValueUpdateFormData,
        final ServerWebExchange exchange
    ) {
        return metadataFieldValueUpdateFormData
            .flatMap(form -> entityService.upsertMetadataFieldValue(dataEntityId, metadataFieldId, form))
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<DataEntityClassAndTypeDictionary>> getDataEntityClasses(
        final ServerWebExchange exchange) {
        return entityService.getDataEntityClassesAndTypes()
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<InternalName>> upsertDataEntityInternalName(
        final Long dataEntityId,
        final Mono<InternalNameFormData> internalNameFormData,
        final ServerWebExchange exchange
    ) {
        return internalNameFormData
            .flatMap(name -> entityService.upsertBusinessName(dataEntityId, name))
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<Flux<Tag>>> createDataEntityTagsRelations(
        final Long dataEntityId,
        final Mono<TagsFormData> tagsFormData,
        final ServerWebExchange exchange
    ) {
        final Flux<Tag> tags = tagsFormData
            .flatMapMany(form -> entityService.upsertTags(dataEntityId, form));

        return Mono.just(ResponseEntity.ok(tags));
    }

    @Override
    public Mono<ResponseEntity<DataEntityLineage>> getDataEntityDownstreamLineage(final Long dataEntityId,
                                                                                  final Integer lineageDepth,
                                                                                  final ServerWebExchange exchange) {
        return lineageService
            .getLineage(dataEntityId, lineageDepth, LineageStreamKind.DOWNSTREAM)
            .subscribeOn(Schedulers.boundedElastic())
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<DataEntityLineage>> getDataEntityUpstreamLineage(final Long dataEntityId,
                                                                                final Integer lineageDepth,
                                                                                final ServerWebExchange exchange) {
        return lineageService
            .getLineage(dataEntityId, lineageDepth, LineageStreamKind.UPSTREAM)
            .subscribeOn(Schedulers.boundedElastic())
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<DataEntityGroupLineageList>> getDataEntityGroupsLineage(final Long dataEntityGroupId,
                                                                                       final ServerWebExchange exch) {
        return lineageService
            .getDataEntityGroupLineage(dataEntityGroupId)
            .subscribeOn(Schedulers.boundedElastic())
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<Flux<DataEntityRef>>> getMyObjects(final Integer page,
                                                                  final Integer size,
                                                                  final ServerWebExchange exchange) {
        return Mono.just(entityService
                .listAssociated(page, size)
                .subscribeOn(Schedulers.boundedElastic()))
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<Flux<DataEntityRef>>> getMyObjectsWithDownstream(final Integer page,
                                                                                final Integer size,
                                                                                final ServerWebExchange exchange) {
        return Mono.just(entityService
                .listAssociated(page, size, LineageStreamKind.DOWNSTREAM)
                .subscribeOn(Schedulers.boundedElastic()))
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<Flux<DataEntityRef>>> getMyObjectsWithUpstream(final Integer page,
                                                                              final Integer size,
                                                                              final ServerWebExchange exchange) {
        return Mono.just(entityService
                .listAssociated(page, size, LineageStreamKind.UPSTREAM)
                .subscribeOn(Schedulers.boundedElastic()))
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<Flux<DataEntityRef>>> getPopular(final Integer page,
                                                                final Integer size,
                                                                final ServerWebExchange exchange) {
        return Mono.just(entityService.listPopular(page, size)
                .subscribeOn(Schedulers.boundedElastic()))
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<AlertList>> getDataEntityAlerts(final Long dataEntityId,
                                                               final ServerWebExchange exchange) {
        return alertService.getDataEntityAlerts(dataEntityId)
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<DataEntityRef>> addDataEntityDataEntityGroup(
        final Long dataEntityId,
        final Mono<DataEntityDataEntityGroupFormData> dataEntityDataEntityGroupFormData,
        final ServerWebExchange exchange) {
        return dataEntityDataEntityGroupFormData
            .flatMap(fd -> entityService.addDataEntityToDEG(dataEntityId, fd))
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<Void>> deleteDataEntityFromDataEntityGroup(final Long dataEntityId,
                                                                          final Long dataEntityGroupId,
                                                                          final ServerWebExchange exchange) {
        return entityService.deleteDataEntityFromDEG(dataEntityId, dataEntityGroupId)
            .ignoreElements()
            .thenReturn(ResponseEntity.noContent().build());
    }

    @Override
    public Mono<ResponseEntity<Flux<Activity>>> getDataEntityActivity(final Long dataEntityId,
                                                                      final LocalDate beginDate,
                                                                      final LocalDate endDate,
                                                                      final Integer size,
                                                                      final List<Long> userIds,
                                                                      final ActivityEventType eventType,
                                                                      final Long lastEventId,
                                                                      final OffsetDateTime lastEventDateTime,
                                                                      final ServerWebExchange exchange) {
        return Mono.just(
            activityService.getDataEntityActivityList(beginDate, endDate, size, dataEntityId, userIds, eventType,
                lastEventId, lastEventDateTime)
        ).map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<DataEntityUsageInfo>> getDataEntitiesUsage(final ServerWebExchange exchange) {
        return entityService.getDataEntityUsageInfo()
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<Actions>> getDataEntityPermissions(final Long dataEntityId,
                                                                  final ServerWebExchange exchange) {
        return dataEntitySecurityService.getActionsForCurrentUser(dataEntityId)
            .map(ResponseEntity::ok);
    }
}
