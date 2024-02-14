package org.opendatadiscovery.oddplatform.controller;

import org.opendatadiscovery.oddplatform.api.contract.api.AppInfoApi;
import org.opendatadiscovery.oddplatform.api.contract.model.AppInfo;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.info.BuildProperties;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@RestController
public class AppInfoController implements AppInfoApi {
    private final BuildProperties buildProperties;
    private final String authType;

    public AppInfoController(final BuildProperties buildProperties,
                             @Value("${auth.type}") final String authType) {
        this.buildProperties = buildProperties;
        this.authType = authType;
    }

    @Override
    public Mono<ResponseEntity<AppInfo>> getAppInfo(final ServerWebExchange exchange) {
        return Mono.just(new AppInfo()
                .projectVersion(buildProperties.getVersion())
                .authType(authType))
            .map(ResponseEntity::ok);
    }
}
