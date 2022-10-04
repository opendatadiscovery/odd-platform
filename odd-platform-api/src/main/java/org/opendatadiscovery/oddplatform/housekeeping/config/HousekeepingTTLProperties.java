package org.opendatadiscovery.oddplatform.housekeeping.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties("housekeeping.ttl")
@Data
public class HousekeepingTTLProperties {
    private int resolvedAlertsDays;
    private int searchFacetsDays;
}