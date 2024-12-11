package com.tritux.vidsecure.service;

public interface NotificationService {
    void receiveMessage(String message);
    void receivePaymentMessage(String message);
}
