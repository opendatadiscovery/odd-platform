package com.provectus.oddplatform.controller;

import com.provectus.oddplatform.api.contract.api.IdentityApi;
import com.provectus.oddplatform.api.contract.model.AssociatedOwner;
import com.provectus.oddplatform.api.contract.model.OwnerFormData;
import com.provectus.oddplatform.dto.HowToCallThat;
import com.provectus.oddplatform.model.tables.pojos.DatasetFieldPojo;
import com.provectus.oddplatform.repository.DatasetVersionRepository;
import com.provectus.oddplatform.service.IdentityService;
import com.provectus.oddplatform.utils.Pair;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.util.Collections;
import java.util.Map;
import java.util.stream.Collectors;

import static java.util.function.Function.identity;

@RestController
@RequiredArgsConstructor
@Slf4j
public class IdentityController implements IdentityApi {
    private final IdentityService identityService;
    private final DatasetVersionRepository datasetVersionRepository;

    @Override
    public Mono<ResponseEntity<AssociatedOwner>> whoami(final ServerWebExchange exchange) {
        return identityService.whoami()
            .map(ResponseEntity::ok)
            .switchIfEmpty(Mono.just(ResponseEntity.noContent().build()));
    }

    @Override
    public Mono<ResponseEntity<AssociatedOwner>> associateOwner(final Mono<OwnerFormData> ownerFormData,
                                                                final ServerWebExchange exchange) {
        return ownerFormData
            .publishOn(Schedulers.boundedElastic())
            .flatMap(identityService::associateOwner)
            .map(ResponseEntity::ok);
    }

    @GetMapping("/api/test")
    public void asd() {
        final Map<Long, Pair<HowToCallThat, HowToCallThat>> longPairMap =
            datasetVersionRepository.howToCallThat(Collections.emptyList());

        log.info("{}", longPairMap);

        longPairMap.forEach((dsId, structure) -> {
            final HowToCallThat odin = structure.getLeft();
            final HowToCallThat dwa = structure.getRight();

            final Map<Pair<String, String>, DatasetFieldPojo> dwaDict = dwa.getDatasetFields()
                .stream()
                .collect(Collectors.toMap(df -> Pair.of(df.getOddrn(), df.getType().data()), identity()));

            odin.getDatasetFields().forEach(df -> {
                if (!dwaDict.containsKey(Pair.of(df.getOddrn(), df.getType().data()))) {
                    log.info("opa, vot etogo net v {} ds: {}", dsId, df.getName());
                }
            });
        });
    }
}
