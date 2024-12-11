package com.tritux.vidsecure.config;
import org.springframework.amqp.core.Queue;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
@Configuration
public class RabbitMQConfig {
    @Bean
    public Queue notificationQueue() {
        return new Queue("notificationQueue", false);
    }
    @Bean
    public Queue paymentNotificationQueue() {
        return new Queue("paymentNotificationQueue", false);
    }

}
