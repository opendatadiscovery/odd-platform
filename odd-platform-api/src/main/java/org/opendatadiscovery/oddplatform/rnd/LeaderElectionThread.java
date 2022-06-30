package org.opendatadiscovery.oddplatform.rnd;

import java.nio.ByteBuffer;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.Properties;
import java.util.concurrent.TimeUnit;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.postgresql.PGConnection;
import org.postgresql.PGProperty;
import org.postgresql.replication.PGReplicationStream;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.jdbc.CannotGetJdbcConnectionException;

@RequiredArgsConstructor
@Slf4j
public class LeaderElectionThread extends Thread {
    private static final Integer PG_ADVISORY_LOCK_ID = 123;

    private static final String SLACK_WEBHOOK_URL =
        "https://hooks.slack.com/services/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";

    private final DataSourceProperties dataSourceProperties;
    private final WebhookSender webhookSender;

    @Override
    public void run() {
        while (true) {
            final String url = dataSourceProperties.getUrl();

            final Properties props = new Properties();
            PGProperty.USER.set(props, dataSourceProperties.getUsername());
            PGProperty.PASSWORD.set(props, dataSourceProperties.getPassword());
            // TODO: figure out this property.
            //  From what version there are tsvectors and custom aggregate?
            PGProperty.ASSUME_MIN_SERVER_VERSION.set(props, "13.2");
            PGProperty.REPLICATION.set(props, "database");
            PGProperty.PREFER_QUERY_MODE.set(props, "simple");

            final Connection connection;

            try {
                connection = DriverManager.getConnection(url, props);
            } catch (SQLException ex) {
                throw new CannotGetJdbcConnectionException("Failed to obtain JDBC Connection", ex);
            } catch (IllegalStateException ex) {
                throw new CannotGetJdbcConnectionException("Failed to obtain JDBC Connection: " + ex.getMessage());
            }

            try {
                connection.createStatement()
                    .execute("SELECT pg_advisory_lock(%d)".formatted(PG_ADVISORY_LOCK_ID));

                log.info("Acquired a lock, I'm the leader!");

                final PGConnection replConnection = connection.unwrap(PGConnection.class);

                replConnection.getReplicationAPI()
                    .createReplicationSlot()
                    .logical()
                    .withSlotName("demo_logical_slot")
                    .withOutputPlugin("test_decoding")
                    .make();

                final PGReplicationStream stream = replConnection.getReplicationAPI()
                    .replicationStream()
                    .logical()
                    .withSlotName("demo_logical_slot")
                    .withSlotOption("include-xids", false)
                    .withSlotOption("skip-empty-xacts", true)
                    .start();

                // do work
                while (true) {
                    final ByteBuffer msg = stream.readPending();

                    if (msg == null) {
                        TimeUnit.MILLISECONDS.sleep(10L);
                        continue;
                    }

                    final int offset = msg.arrayOffset();
                    final byte[] source = msg.array();
                    final int length = source.length - offset;
                    System.out.println(new String(source, offset, length));

                    stream.setAppliedLSN(stream.getLastReceiveLSN());
                    stream.setFlushedLSN(stream.getLastReceiveLSN());
                }
            } catch (final SQLException e) {
                log.error("Error while trying to acquire advisory lock", e);
            } catch (final Exception e) {
                log.error("Smth went wrong", e);
            } finally {
                try {
                    connection.close();
                } catch (final SQLException e) {
                    log.error("Error while trying to close JDBC Connection", e);
                }
            }

            log.info("I've released the lock, sleeping for 10 seconds to try acquiring it again");
            try {
                Thread.sleep(10000);
            } catch (final InterruptedException e) {
                log.error("Error while sleeping", e);
                throw new RuntimeException(e);
            }
        }
    }
}
