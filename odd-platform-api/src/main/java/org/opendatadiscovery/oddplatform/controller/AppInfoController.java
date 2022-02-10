package org.opendatadiscovery.oddplatform.controller;

import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.api.AppInfoApi;
import org.opendatadiscovery.oddplatform.api.contract.model.AppInfo;
import org.springframework.boot.info.BuildProperties;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@RestController
@RequiredArgsConstructor
public class AppInfoController implements AppInfoApi {
    private final BuildProperties buildProperties;

    @Override
    public Mono<ResponseEntity<AppInfo>> getAppInfo(final ServerWebExchange exchange) {
        return Mono.just(new AppInfo().projectVersion(buildProperties.getVersion()))
            .map(ResponseEntity::ok);
    }
}
