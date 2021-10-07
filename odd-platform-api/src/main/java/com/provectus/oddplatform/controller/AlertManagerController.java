package com.provectus.oddplatform.controller;

import com.provectus.oddplatform.dto.ExternalAlert;
import com.provectus.oddplatform.service.AlertService;
import java.util.List;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

@RestController
@RequiredArgsConstructor
public class AlertManagerController {
    private final AlertService alertService;

    // TODO: define OpenAPI spec based on alert provider contract
    @RequestMapping("ingestion/alert/alertmanager")
    public Mono<ResponseEntity<Void>> alertManagerWebhook(@RequestBody final Mono<AlertManagerRequest> request) {
        return request
            .flatMap(req -> alertService.handleExternalAlerts(req.getAlerts()))
            .subscribeOn(Schedulers.boundedElastic())
            .map(o -> ResponseEntity.noContent().build());
    }

    @Data
    @NoArgsConstructor
    public static class AlertManagerRequest {
        private List<ExternalAlert> alerts;
    }
}
