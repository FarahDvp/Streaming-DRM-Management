import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as Stomp from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Router } from '@angular/router';
import { AuthServerService } from '../security/auth-server.service';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {

  private stompClient!: Stomp.Client;
  private notificationsSubject = new BehaviorSubject<any[]>(this.loadNotificationsFromLocalStorage());
  public notifications$ = this.notificationsSubject.asObservable();
  private paymentNotificationsSubject = new BehaviorSubject<any[]>(this.loadPaymentNotificationsFromLocalStorage());
  public paymentNotifications$ = this.paymentNotificationsSubject.asObservable();

  constructor(private router: Router, private loginService: AuthServerService) { }

  public connect() {
    const socket = new SockJS('http://localhost:8080/ws');
    this.stompClient = new Stomp.Client({
      webSocketFactory: () => socket,
    });
    this.stompClient.onConnect = (frame) => {
      console.log('Connected: ' + frame);

      this.stompClient.subscribe('/topic/notifications', (message) => {
        this.handleNotification(message.body);
      });

      this.stompClient.subscribe('/topic/payment_notifications', (message) => {
        this.handlePaymentNotification(message.body);
      });

      this.stompClient.subscribe('/topic/user-blocked', (message) => {
        const username = message.body;
        console.log('User blocked: ' + username);
        this.handleUserBlocked(username);
      });
    };
    this.stompClient.activate();
  }

  private handleNotification(message: any) {
    console.log('Received notification: ', message);
    const currentNotifications = this.notificationsSubject.value;
    const notification = {
      message: message,
      date: new Date().toISOString()
    };
    const updatedNotifications = [...currentNotifications, notification];
    this.notificationsSubject.next(updatedNotifications);
    this.saveNotificationsToLocalStorage(updatedNotifications);
  }

  private handlePaymentNotification(message: any) {
    console.log('Received payment notification: ', message);
    const currentNotifications = this.paymentNotificationsSubject.value;
    const notification = {
      message: message,
      date: new Date().toISOString()
    };
    const updatedNotifications = [...currentNotifications, notification];
    this.paymentNotificationsSubject.next(updatedNotifications);
    this.savePaymentNotificationsToLocalStorage(updatedNotifications);
  }


  private handleUserBlocked(username: string) {
    const loginDetails = this.loginService.getLoginDetails();
    const loggedInUsername = loginDetails.username;

    if (username === loggedInUsername) {
      this.router.navigateByUrl('/blocked-user');
    }
  }

  public disconnect() {
    if (this.stompClient) {
      this.stompClient.deactivate();
    }
    console.log('Disconnected');
  }

  private loadNotificationsFromLocalStorage(): any[] {
    const notifications = localStorage.getItem('notifications');
    return notifications ? JSON.parse(notifications) : [];
  }

  private saveNotificationsToLocalStorage(notifications: any[]) {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }

  private loadPaymentNotificationsFromLocalStorage(): any[] {
    const notifications = localStorage.getItem('payment_notifications');
    return notifications ? JSON.parse(notifications) : [];
  }

  private savePaymentNotificationsToLocalStorage(notifications: any[]) {
    localStorage.setItem('payment_notifications', JSON.stringify(notifications));
  }


}

