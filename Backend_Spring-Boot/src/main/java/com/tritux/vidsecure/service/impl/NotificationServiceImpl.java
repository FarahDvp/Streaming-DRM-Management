package com.tritux.vidsecure.service.impl;
import com.tritux.vidsecure.service.NotificationService;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
@Service
public class NotificationServiceImpl implements NotificationService {
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    @Override
    @RabbitListener(queues = "notificationQueue")
    public void receiveMessage(String message) {
        try {
            messagingTemplate.convertAndSend("/topic/notifications", message);
            System.out.println("Received message: " + message);
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de l'envoi de la notification");
        }
    }

    @Override
    @RabbitListener(queues = "paymentNotificationQueue")
    public void receivePaymentMessage(String message) {
        try {
            messagingTemplate.convertAndSend("/topic/payment_notifications", message);
            System.out.println("Received message: " + message);
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de l'envoi de la notification");
        }
    }

}
