package org.opendatadiscovery.oddplatform.config;

import io.minio.MinioAsyncClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConditionalOnProperty(value = "attachment.storage", havingValue = "REMOTE")
public class MinioConfig {
    @Value("${attachment.remote.url}")
    private String url;
    @Value("${attachment.remote.access-key}")
    private String accessKey;
    @Value("${attachment.remote.secret-key}")
    private String secretKey;

    @Bean
    public MinioAsyncClient minioClient() {
        return MinioAsyncClient.builder()
            .endpoint(url)
            .credentials(accessKey, secretKey)
            .build();
    }
}
