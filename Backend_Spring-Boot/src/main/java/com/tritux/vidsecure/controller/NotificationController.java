package com.tritux.vidsecure.controller;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
    @Autowired
    private RabbitTemplate rabbitTemplate;

    @PostMapping("/send")
    public void sendNotification(@RequestBody String message) {
        rabbitTemplate.convertAndSend("notificationQueue", message);
    }

    @PostMapping("/pay")
    public void sendPaymentNotification(@RequestBody String message) {
        rabbitTemplate.convertAndSend("paymentNotificationQueue", message);
    }

}
