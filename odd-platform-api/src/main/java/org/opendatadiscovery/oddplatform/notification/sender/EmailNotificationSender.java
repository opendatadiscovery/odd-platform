package org.opendatadiscovery.oddplatform.notification.sender;

import java.net.http.HttpClient;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityAlertConfig;
import org.opendatadiscovery.oddplatform.notification.dto.AlertNotificationMessage;
import org.opendatadiscovery.oddplatform.notification.exception.NotificationSenderException;
import org.opendatadiscovery.oddplatform.service.AlertHaltConfigService;
import org.opendatadiscovery.oddplatform.utils.JSONSerDeUtils;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

@Service
@ConditionalOnProperty(name = "notifications.receivers.email.sender")
public class EmailNotificationSender extends AbstractNotificationSender<AlertNotificationMessage> {
    private final JavaMailSender emailSender;
    private final AlertHaltConfigService alertHaltConfigService;

    public EmailNotificationSender(final HttpClient httpClient,
                                   final JavaMailSender mailSender,
                                   final AlertHaltConfigService alertHaltConfigService) {
        super(httpClient);
        this.emailSender = mailSender;
        this.alertHaltConfigService = alertHaltConfigService;
    }

    @Override
    public void send(final AlertNotificationMessage message) throws InterruptedException, NotificationSenderException {
        final DataEntityAlertConfig alertConfig =
                alertHaltConfigService.getAlertHaltConfig(message.getDataEntity().id()).block();

        if (alertConfig == null || CollectionUtils.isEmpty(alertConfig.getNotificationsEmails())) {
            return;
        }

        final SimpleMailMessage simpleMailMessage = new SimpleMailMessage();

        simpleMailMessage.setSubject(message.getAlertType().getDescription());
        simpleMailMessage.setText(JSONSerDeUtils.serializeJson(message));

        alertConfig.getNotificationsEmails().forEach(notificationsEmail -> {
            simpleMailMessage.setTo(notificationsEmail);
            emailSender.send(simpleMailMessage);
        });
    }

    @Override
    public String receiverId() {
        return "email";
    }
}
