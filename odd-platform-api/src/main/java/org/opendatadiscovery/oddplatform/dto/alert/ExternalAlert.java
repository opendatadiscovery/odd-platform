package org.opendatadiscovery.oddplatform.dto.alert;

import java.net.URI;
import java.time.LocalDateTime;
import java.util.Map;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class ExternalAlert {
    private Map<String, String> labels;
    private URI generatorURL;
    private LocalDateTime startsAt;
}