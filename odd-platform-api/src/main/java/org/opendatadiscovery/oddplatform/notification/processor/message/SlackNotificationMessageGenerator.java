package org.opendatadiscovery.oddplatform.notification.processor.message;

import com.slack.api.model.block.LayoutBlock;
import com.slack.api.model.block.SectionBlock;
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
import static org.opendatadiscovery.oddplatform.notification.dto.AlertNotificationMessage.AlertedDataEntity;
import static org.opendatadiscovery.oddplatform.notification.processor.message.EmojiUtils.exclamationEmoji;
import static org.opendatadiscovery.oddplatform.notification.processor.message.EmojiUtils.linkEmoji;
import static org.opendatadiscovery.oddplatform.notification.processor.message.EmojiUtils.userEmoji;
import static org.opendatadiscovery.oddplatform.notification.processor.message.MarkdownUtils.bold;
import static org.opendatadiscovery.oddplatform.notification.processor.message.MarkdownUtils.buildLink;
import static org.opendatadiscovery.oddplatform.notification.processor.message.MarkdownUtils.italic;

@RequiredArgsConstructor
public class SlackNotificationMessageGenerator {
    private final static DateTimeFormatter MESSAGE_DATETIME_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private final URL platformBaseUrl;

    public List<LayoutBlock> generate(final AlertNotificationMessage message) {
        final AlertedDataEntity dataEntity = message.getDataEntity();
        final String eventAt = message.getEventAt().format(MESSAGE_DATETIME_FORMAT);

        final SectionBlock header = section(c -> c.text(markdownText(
            buildLink(bold(dataEntity.name()), buildDataEntityUrl(dataEntity.id())) + "\n" + italic(eventAt))));

        final SectionBlock alertBody = section(c -> c.text(markdownText(
            exclamationEmoji(bold(message.getAlertType().getDescription()) + "\n" + message.getAlertDescription()))));

        final SectionBlock owners = section(c -> c.text(markdownText(
            userEmoji(extractOwners(dataEntity)))));

        final ArrayList<LayoutBlock> blocks = new ArrayList<>(List.of(header, alertBody, owners));

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