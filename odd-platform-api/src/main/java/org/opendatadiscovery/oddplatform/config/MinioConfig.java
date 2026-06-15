package org.opendatadiscovery.oddplatform.config;

import io.minio.MinioAsyncClient;
import org.apache.commons.lang3.StringUtils;
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
    // Optional: AWS S3 region for request signing (e.g. eu-central-1). When blank, the MinIO SDK
    // defaults to us-east-1 — so AWS S3 buckets outside us-east-1 require this to be set. MinIO and
    // most S3-compatible backends ignore the region header, so it can be left blank for them (#1741).
    @Value("${attachment.remote.region:}")
    private String region;

    @Bean
    public MinioAsyncClient minioClient() {
        final MinioAsyncClient.Builder builder = MinioAsyncClient.builder()
            .endpoint(url)
            .credentials(accessKey, secretKey);
        if (StringUtils.isNotBlank(region)) {
            builder.region(region);
        }
        return builder.build();
    }
}
