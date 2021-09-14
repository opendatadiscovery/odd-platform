package com.provectus.oddplatform.controller;

import com.provectus.oddplatform.api.contract.api.DataEntityApi;
import com.provectus.oddplatform.api.contract.model.AlertList;
import com.provectus.oddplatform.api.contract.model.DataEntity;
import com.provectus.oddplatform.api.contract.model.DataEntityDetails;
import com.provectus.oddplatform.api.contract.model.DataEntityLineage;
import com.provectus.oddplatform.api.contract.model.DataEntityList;
import com.provectus.oddplatform.api.contract.model.DataEntityRef;
import com.provectus.oddplatform.api.contract.model.DataEntityTagsFormData;
import com.provectus.oddplatform.api.contract.model.DataEntityTypeDictionary;
import com.provectus.oddplatform.api.contract.model.InternalDescription;
import com.provectus.oddplatform.api.contract.model.InternalDescriptionFormData;
import com.provectus.oddplatform.api.contract.model.InternalName;
import com.provectus.oddplatform.api.contract.model.InternalNameFormData;
import com.provectus.oddplatform.api.contract.model.MetadataFieldValue;
import com.provectus.oddplatform.api.contract.model.MetadataFieldValueList;
import com.provectus.oddplatform.api.contract.model.MetadataFieldValueUpdateFormData;
import com.provectus.oddplatform.api.contract.model.MetadataObject;
import com.provectus.oddplatform.api.contract.model.Ownership;
import com.provectus.oddplatform.api.contract.model.OwnershipFormData;
import com.provectus.oddplatform.api.contract.model.OwnershipUpdateFormData;
import com.provectus.oddplatform.api.contract.model.Tag;
import com.provectus.oddplatform.dto.LineageStreamKind;
import com.provectus.oddplatform.service.AlertService;
import com.provectus.oddplatform.service.DataEntityService;
import com.provectus.oddplatform.service.OwnershipService;
import javax.validation.Valid;
import lombok.extern.slf4j.Slf4j;
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

    public DataEntityController(final DataEntityService entityService,
                                final OwnershipService ownershipService,
                                final AlertService alertService) {
        super(entityService);
        this.ownershipService = ownershipService;
        this.alertService = alertService;
    }

    @Override
    public Mono<ResponseEntity<MetadataFieldValueList>> createDataEntityMetadataFieldValue(
        final Long dataEntityId,
        @Valid final Flux<MetadataObject> metadataObject,
        final ServerWebExchange exchange
    ) {
        return metadataObject.collectList()
            .publishOn(Schedulers.boundedElastic())
            .flatMap(moList -> entityService.createMetadata(dataEntityId, moList))
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<Void>> deleteDataEntityMetadataFieldValue(
        final Long dataEntityId,
        final Long metadataFieldId,
        final ServerWebExchange exchange
    ) {
        return entityService
            .deleteMetadata(dataEntityId, metadataFieldId)
            .subscribeOn(Schedulers.boundedElastic())
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
    public Mono<ResponseEntity<Ownership>> createOwnership(final Long dataEntityId,
                                                           final Mono<OwnershipFormData> ownershipFormData,
                                                           final ServerWebExchange exchange) {
        return ownershipFormData
            .publishOn(Schedulers.boundedElastic())
            .flatMap(form -> ownershipService.create(dataEntityId, form))
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<Void>> deleteOwnership(final Long dataEntityId,
                                                      final Long ownershipId,
                                                      final ServerWebExchange exchange) {
        return ownershipService.delete(ownershipId)
            .subscribeOn(Schedulers.boundedElastic())
            .map(m -> ResponseEntity.noContent().build());
    }

    @Override
    public Mono<ResponseEntity<Ownership>> updateOwnership(final Long dataEntityId,
                                                           final Long ownershipId,
                                                           final Mono<OwnershipUpdateFormData> ownershipUpdateFormData,
                                                           final ServerWebExchange exchange) {
        return ownershipUpdateFormData
            .publishOn(Schedulers.boundedElastic())
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
            .publishOn(Schedulers.boundedElastic())
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
            .publishOn(Schedulers.boundedElastic())
            .flatMap(form -> entityService.upsertMetadataFieldValue(dataEntityId, metadataFieldId, form))
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<DataEntityTypeDictionary>> getDataEntityTypes(final ServerWebExchange exchange) {
        return entityService
            .getDataEntityTypes()
            .subscribeOn(Schedulers.boundedElastic())
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<InternalName>> upsertDataEntityInternalName(
        final Long dataEntityId,
        final Mono<InternalNameFormData> internalNameFormData,
        final ServerWebExchange exchange
    ) {
        return internalNameFormData
            .publishOn(Schedulers.boundedElastic())
            .flatMap(name -> entityService.upsertBusinessName(dataEntityId, name))
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<Flux<Tag>>> createDataEntityTagsRelations(
        final Long dataEntityId,
        final Mono<DataEntityTagsFormData> dataEntityTagsFormData,
        final ServerWebExchange exchange
    ) {
        final Flux<Tag> labels = dataEntityTagsFormData
            .publishOn(Schedulers.boundedElastic())
            .flatMapMany(form -> entityService.upsertTags(dataEntityId, form));

        return Mono.just(ResponseEntity.ok(labels));
    }

    @Override
    public Mono<ResponseEntity<DataEntityLineage>> getDataEntityDownstreamLineage(final Long dataEntityId,
                                                                                  final Integer lineageDepth,
                                                                                  final ServerWebExchange exchange) {
        return entityService
            .getLineage(dataEntityId, lineageDepth, LineageStreamKind.DOWNSTREAM)
            .subscribeOn(Schedulers.boundedElastic())
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<DataEntityLineage>> getDataEntityUpstreamLineage(final Long dataEntityId,
                                                                                final Integer lineageDepth,
                                                                                final ServerWebExchange exchange) {
        return entityService
            .getLineage(dataEntityId, lineageDepth, LineageStreamKind.UPSTREAM)
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
            .subscribeOn(Schedulers.boundedElastic())
            .map(ResponseEntity::ok);
    }
}
