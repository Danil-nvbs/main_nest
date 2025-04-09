import { Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.REQUEST })
export class RequestService {
  private author: string;
  private spreadsheetId: string;
  private serviceToken: string;

  setAuthor(userId: string) {
    this.author = userId;
  }

  getAuthor() {
    return this.author;
  }

  setSpreadsheetId(spreadsheetId: string) {
    this.spreadsheetId = spreadsheetId;
  }

  getSpreadsheetId() {
    return this.spreadsheetId;
  }

  setServiceToken(serviceToken: string) {
    this.serviceToken = serviceToken;
  }

  getServiceToken() {
    return this.serviceToken;
  }
}