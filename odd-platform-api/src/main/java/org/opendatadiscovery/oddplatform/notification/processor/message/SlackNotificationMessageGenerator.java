package org.opendatadiscovery.oddplatform.notification.processor.message;

import com.slack.api.model.block.LayoutBlock;
import java.net.URL;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.notification.dto.AlertNotificationMessage;

import static com.slack.api.model.block.Blocks.divider;
import static com.slack.api.model.block.Blocks.section;
import static com.slack.api.model.block.composition.BlockCompositions.markdownText;
import static java.util.stream.Collectors.joining;
import static org.opendatadiscovery.oddplatform.notification.dto.AlertNotificationMessage.AlertEventType;
import static org.opendatadiscovery.oddplatform.notification.dto.AlertNotificationMessage.AlertedDataEntity;
import static org.opendatadiscovery.oddplatform.notification.processor.message.MarkdownUtils.bold;
import static org.opendatadiscovery.oddplatform.notification.processor.message.MarkdownUtils.buildLink;
import static org.opendatadiscovery.oddplatform.notification.processor.message.MarkdownUtils.italic;
import static org.opendatadiscovery.oddplatform.notification.processor.message.SlackEmojiUtils.exclamationEmoji;
import static org.opendatadiscovery.oddplatform.notification.processor.message.SlackEmojiUtils.linkEmoji;
import static org.opendatadiscovery.oddplatform.notification.processor.message.SlackEmojiUtils.resolvedEmoji;
import static org.opendatadiscovery.oddplatform.notification.processor.message.SlackEmojiUtils.userEmoji;

@RequiredArgsConstructor
public class SlackNotificationMessageGenerator {
    private static final DateTimeFormatter MESSAGE_DATETIME_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private final URL platformBaseUrl;

    public List<LayoutBlock> generate(final AlertNotificationMessage message) {
        final AlertedDataEntity dataEntity = message.getDataEntity();
        final String eventAt = message.getEventAt().format(MESSAGE_DATETIME_FORMAT);

        final List<LayoutBlock> blocks = new ArrayList<>();

        blocks.add(section(c -> c.text(markdownText(
            buildLink(bold(dataEntity.name()), buildDataEntityUrl(dataEntity.id())) + "\n" + italic(eventAt)))));

        if (AlertEventType.RESOLVED.equals(message.getEventType())) {
            blocks.add(section(c -> c.text(markdownText(bold("This alert has been resolved")))));
            blocks.add(section(c -> c.text(markdownText(resolvedEmoji(constructAlertBody(message))))));
        } else {
            blocks.add(section(c -> c.text(markdownText(exclamationEmoji(constructAlertBody(message))))));
        }

        blocks.add(section(c -> c.text(markdownText(userEmoji(extractOwners(dataEntity))))));

        if (!message.getDownstream().isEmpty()) {
            final String downstreamMarkdownText =
                message.getDownstream().stream().map(this::generateMarkdownTextForDataEntity).collect(joining("\n"));

            blocks.addAll(List.of(
                divider(),
                section(c -> c.text(markdownText(linkEmoji(bold("Affected data entities:"))))),
                section(c -> c.text(markdownText(downstreamMarkdownText)))
            ));
        }

        return blocks;
    }

    private String constructAlertBody(final AlertNotificationMessage message) {
        return bold(message.getAlertType().getDescription()) + "\n" + message.getAlertDescription();
    }

    private String extractOwners(final AlertedDataEntity dataEntity) {
        return dataEntity.owners()
            .stream()
            .map(owner -> String.format("@%s (%s)", owner.ownerName(), owner.roleName()))
            .collect(joining(", "));
    }

    private String generateMarkdownTextForDataEntity(final AlertedDataEntity dataEntity) {
        final String text = buildLink(dataEntity.name(), buildDataEntityUrl(dataEntity.id()));

        return dataEntity.owners().isEmpty()
            ? text
            : String.format("%s: %s", text, extractOwners(dataEntity));
    }

    private String buildDataEntityUrl(final long id) {
        return String.format("%s/dataentities/%d/overview", platformBaseUrl, id);
    }
}