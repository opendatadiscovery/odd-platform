package org.opendatadiscovery.oddplatform.service.activity;

import io.r2dbc.spi.Connection;
import io.r2dbc.spi.ConnectionFactory;
import io.r2dbc.spi.Statement;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.r2dbc.connection.ConnectionFactoryUtils;
import org.springframework.r2dbc.core.DatabaseClient;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import static java.time.format.DateTimeFormatter.ISO_LOCAL_DATE;

@Service
@Slf4j
@RequiredArgsConstructor
public class ActivityTablePartitionManagerImpl implements ActivityTablePartitionManager {
    private static final DateTimeFormatter PARTITION_PART_FORMATTER = DateTimeFormatter.BASIC_ISO_DATE;

    @Value("${odd.activity.partition-period:30}")
    private Integer partitionDaysPeriod;
    private Mono<LocalDate> lastPartitionDate = Mono.empty();
    private final DatabaseClient databaseClient;

    @Override
    public Mono<LocalDate> createPartitionIfNotExists(final LocalDate eventDate) {
        this.lastPartitionDate = lastPartitionDate
            .filter(l -> l.isAfter(eventDate))
            .switchIfEmpty(databaseClient.inConnection(conn -> createPartitionTables(conn, eventDate)).cache());

        return this.lastPartitionDate;
    }

    private Mono<LocalDate> createPartitionTables(final Connection connection, final LocalDate eventDate) {
        return getLastPartitionTableName(connection)
            .map(this::getLastPartitionDate)
            .switchIfEmpty(Mono.just(eventDate))
            .flatMap(lastPartitionDate -> {
                final List<ActivityTablePartition> newPartitions = new ArrayList<>();
                while (!lastPartitionDate.isAfter(eventDate)) {
                    newPartitions.add(
                        new ActivityTablePartition(lastPartitionDate, lastPartitionDate.plusDays(partitionDaysPeriod))
                    );
                    lastPartitionDate = lastPartitionDate.plusDays(partitionDaysPeriod);
                }

                return Flux.fromIterable(newPartitions)
                    .flatMap(partition -> createPartitionTable(connection, partition.beginDate(), partition.endDate()))
                    .doOnError(e -> log.error("Error creating partition table", e))
                    .then(getLastPartitionTableName(connection))
                    .map(this::getLastPartitionDate);
            });
    }

    private Mono<String> getLastPartitionTableName(final Connection connection) {
        final String sql = """
               SELECT table_name FROM information_schema.tables
               WHERE table_schema = 'public' AND table_name LIKE 'activity_%'
               ORDER BY table_name DESC LIMIT 1
            """;
        final Statement statement = connection.createStatement(sql);
        return Mono.from(statement.execute())
            .flatMap(result -> Mono.from(result.map((row, rowMetadata) -> row.get("table_name", String.class))));
    }

    private Mono<?> createPartitionTable(final Connection connection,
                                         final LocalDate beginDate,
                                         final LocalDate endDate) {
        final String tableName = getTableName(beginDate, endDate);
        final String sql = "CREATE TABLE IF NOT EXISTS %s PARTITION OF activity FOR VALUES FROM ('%s') TO ('%s');"
            .formatted(tableName, beginDate.format(ISO_LOCAL_DATE), endDate.format(ISO_LOCAL_DATE));
        return Mono.from(connection.createStatement(sql).execute());
    }

    private String getTableName(final LocalDate beginDate, final LocalDate endDate) {
        return "activity_" + PARTITION_PART_FORMATTER.format(beginDate)
            + "_" + PARTITION_PART_FORMATTER.format(endDate);
    }

    private LocalDate getLastPartitionDate(final String lastTableName) {
        final String[] tableNameParts = lastTableName.split("_");
        final String lastPartitionDateString = tableNameParts[tableNameParts.length - 1];
        return LocalDate.parse(lastPartitionDateString, PARTITION_PART_FORMATTER);
    }

    private record ActivityTablePartition(LocalDate beginDate, LocalDate endDate) {
    }
}
