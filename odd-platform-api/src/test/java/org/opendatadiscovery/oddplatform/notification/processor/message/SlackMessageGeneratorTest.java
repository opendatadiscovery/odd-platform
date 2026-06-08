package org.opendatadiscovery.oddplatform.notification.processor.message;

import com.slack.api.model.Attachment;
import com.slack.api.model.block.LayoutBlock;
import java.net.URI;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.DataEntityMessageContext;
import org.opendatadiscovery.oddplatform.dto.DataEntityTypeDto;
import org.opendatadiscovery.oddplatform.dto.OwnershipPair;
import org.opendatadiscovery.oddplatform.dto.alert.AlertTypeEnum;
import org.opendatadiscovery.oddplatform.model.tables.pojos.AlertChunkPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MessagePojo;
import org.opendatadiscovery.oddplatform.notification.dto.AlertNotificationMessage;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Pure-logic unit test for Slack message rendering — validates F-009 (WAL-driven Notification Delivery, the
 * alert→Slack render path) and F-038 (Data Collaboration / Slack Discussions, the data-entity message path):
 * generateAlertMessage renders a created alert and a resolved alert (the latter adding a "Resolved by"
 * section + downstream blocks), and generateMessage wraps a data-entity discussion into a single coloured
 * attachment. Exercised against the real generator (only dependency is the platform base URL — no DB, no
 * mocks). No prior SlackMessageGenerator unit test.
 *
 * @validates F-009
 * @validates F-038
 */
class SlackMessageGeneratorTest {

    private SlackMessageGenerator generator;

    @BeforeEach
    void setUp() throws Exception {
        generator = new SlackMessageGenerator(URI.create("http://localhost:8080").toURL());
    }

    private static AlertNotificationMessage.AlertedDataEntity alertedEntity() {
        return new AlertNotificationMessage.AlertedDataEntity(1L, "orders", "postgres", "analytics",
            DataEntityTypeDto.TABLE, Set.of(new OwnershipPair("alice", "Owner")));
    }

    private static AlertChunkPojo chunk() {
        return new AlertChunkPojo()
            .setCreatedAt(LocalDateTime.of(2026, 1, 1, 0, 0))
            .setDescription("schema changed");
    }

    @Test
    void generateAlertMessage_createdAlert_buildsHeaderDividerAndContext() {
        final AlertNotificationMessage message = AlertNotificationMessage.builder()
            .alertChunks(List.of(chunk()))
            .alertType(AlertTypeEnum.FAILED_JOB)
            .eventType(AlertNotificationMessage.AlertEventType.CREATED)
            .eventAt(LocalDateTime.of(2026, 1, 1, 0, 0))
            .dataEntity(alertedEntity())
            .downstream(List.of())
            .build();

        final List<LayoutBlock> blocks = generator.generateAlertMessage(message);

        // header + divider + the link/description section, plus the data-source & owner context sections.
        assertThat(blocks).isNotEmpty().hasSizeGreaterThanOrEqualTo(3);
    }

    @Test
    void generateAlertMessage_resolvedAlert_addsResolvedByAndDownstream() {
        final AlertNotificationMessage message = AlertNotificationMessage.builder()
            .alertChunks(List.of(chunk()))
            .alertType(AlertTypeEnum.FAILED_JOB)
            .eventType(AlertNotificationMessage.AlertEventType.RESOLVED)
            .eventAt(LocalDateTime.of(2026, 1, 1, 0, 0))
            .updatedBy("alice")
            .dataEntity(alertedEntity())
            .downstream(List.of(alertedEntity()))
            .build();

        final List<LayoutBlock> blocks = generator.generateAlertMessage(message);

        // resolved path also renders the "Resolved by @alice" section beyond the base header/divider/section.
        assertThat(blocks).isNotEmpty().hasSizeGreaterThanOrEqualTo(4);
    }

    @Test
    void generateMessage_dataEntityDiscussion_buildsOneColouredAttachment() {
        final DataEntityMessageContext context = DataEntityMessageContext.builder()
            .message(new MessagePojo().setText("Please review this dataset"))
            .dataEntity(DataEntityMessageContext.DataEntity.builder()
                .dataEntityId(1L)
                .dataEntityOddrn("//postgres/orders")
                .dataEntityName("orders")
                .dataSourceName("postgres")
                .namespaceName("analytics")
                .type(DataEntityTypeDto.TABLE)
                .owners(Set.of(new OwnershipPair("alice", "Owner")))
                .tags(Set.of("pii"))
                .build())
            .degNames(List.of("orders_group"))
            .build();

        final List<Attachment> attachments = generator.generateMessage(context);

        assertThat(attachments).hasSize(1);
        assertThat(attachments.get(0).getColor()).isEqualTo("#0080f0");
        assertThat(attachments.get(0).getBlocks()).isNotEmpty();
    }
}
