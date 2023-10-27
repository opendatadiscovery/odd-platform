package org.opendatadiscovery.oddplatform.notification.sender;

import java.net.http.HttpClient;
import java.util.List;
import java.util.stream.Collectors;
import org.apache.commons.lang3.StringUtils;
import org.opendatadiscovery.oddplatform.dto.OwnershipPair;
import org.opendatadiscovery.oddplatform.model.tables.pojos.AlertChunkPojo;
import org.opendatadiscovery.oddplatform.notification.dto.AlertNotificationMessage;
import org.opendatadiscovery.oddplatform.notification.exception.NotificationSenderException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

public class EmailNotificationSender extends AbstractNotificationSender<AlertNotificationMessage> {
    private final JavaMailSender emailSender;
    private final List<String> notificationsEmails;

    public EmailNotificationSender(final HttpClient httpClient,
                                   final JavaMailSender mailSender,
                                   final List<String> notificationsEmails) {
        super(httpClient);
        this.emailSender = mailSender;
        this.notificationsEmails = notificationsEmails;
    }

    @Override
    public void send(final AlertNotificationMessage message) throws InterruptedException, NotificationSenderException {
        final SimpleMailMessage simpleMailMessage = new SimpleMailMessage();

        simpleMailMessage.setSubject(message.getAlertType().getDescription());
        simpleMailMessage.setText(buildMessage(message));

        notificationsEmails.forEach(notificationsEmail -> {
            simpleMailMessage.setTo(notificationsEmail);
            emailSender.send(simpleMailMessage);
        });
    }

    private String buildMessage(final AlertNotificationMessage message) {
        final List<String> chunksMessages = message.getAlertChunks()
                .stream().map(this::buildChunkMessage)
                .toList();
        final List<String> downstreamMessages = message.getDownstream().stream()
                .map(this::buildEntityMessage)
                .toList();

        return ALERT_EMAIL_MESSAGE.replace("dataEntity", buildEntityMessage(message.getDataEntity()))
                .replace("alertType", message.getAlertType().name())
                .replace("alertDescription", message.getAlertType().getDescription())
                .replace("eventAtTime", message.getEventAt().toString())
                .replace("chunks", chunksMessages.isEmpty() ? "null " : chunksMessages.toString())
                .replace("downstream", downstreamMessages.isEmpty() ? "null " : downstreamMessages.toString());
    }

    private String buildEntityMessage(final AlertNotificationMessage.AlertedDataEntity dataEntity) {
        return ALERT_EMAIL_ENTITY.replace("dataEntityID", String.valueOf(dataEntity.id()))
                .replace("dataEntityName", dataEntity.name())
                .replace("dataEntityType", dataEntity.type().resolveName())
                .replace("dataEntityOwners", dataEntity.owners().stream()
                        .map(OwnershipPair::ownerName)
                        .collect(Collectors.joining(",")))
                .replace("dataSourceName", StringUtils.isBlank(dataEntity.dataSourceName())
                        ? "" : dataEntity.dataSourceName())
                .replace("namespaceName", StringUtils.isBlank(dataEntity.namespaceName())
                        ? "" : dataEntity.namespaceName());
    }

    private String buildChunkMessage(final AlertChunkPojo chunkPojo) {
        return ALERT_EMAIL_CHUNK.replace("alertID", String.valueOf(chunkPojo.getAlertId()))
                .replace("description", chunkPojo.getDescription())
                .replace("createdChunkAt", chunkPojo.getCreatedAt().toString());
    }

    @Override
    public String receiverId() {
        return "email";
    }

    private final String ALERT_EMAIL_MESSAGE =
            "Data Entity:dataEntity"
                    + "Alert:\n"
                    + " Alert Type: alertType\n"
                    + " Alert Description: alertDescription\n"
                    + " Event at: eventAtTime\n"
                    + "Alert Chunks:\nchunks\n"
                    + "Downstream Entities:\ndownstream";

    private final String ALERT_EMAIL_ENTITY =
            "\n Data Entity Id: dataEntityID\n"
                    + " Data Entity name: dataEntityName\n"
                    + " Data Entity Type: dataEntityType\n"
                    + " Data Entity owners: dataEntityOwners\n"
                    + " Data Source Name: dataSourceName\n"
                    + " Namespace Name: namespaceName\n";
    private final String ALERT_EMAIL_CHUNK =
            "\n Chunk:"
                    + "     Alert Id: alertID\n"
                    + "     Description: description\n"
                    + "     Created At: createdChunkAt\n";
}
