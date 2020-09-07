import * as moment from 'moment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import 'rxjs/add/operator/do';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/shareReplay';

@Injectable()
export class AuthService {

  baseUri: string = 'http://localhost:4000/auth';
  headers = new HttpHeaders().set('Content-Type', 'application/json');

  constructor(private http: HttpClient) {

  }

  login(user: {username: string, password: string}) {
    let url = `${this.baseUri}/login`;
    return this.http.post(url, user)
      .do(res => this.setSession(res))
      .shareReplay();
  }

  private setSession(authResult) {
    const expiresAt = moment().add(authResult.expiresIn, 'second');

    sessionStorage.setItem('userId', authResult.userId);
    sessionStorage.setItem('access_token', authResult.accessToken);
    sessionStorage.setItem('refresh_token', authResult.refreshToken);
    sessionStorage.setItem('expires_at', JSON.stringify(expiresAt.valueOf()));
    sessionStorage.setItem('userRole', authResult.userRole);
  }

  logout() {
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
    sessionStorage.removeItem('expires_at');
    sessionStorage.removeItem('userRole');

  }

  adminRole() {
    const admin = sessionStorage.getItem('userRole');
    if (admin.toUpperCase() === 'ADMIN') {
      return true;
    } else {
      return false;
    }
  }

  public isLoggedIn() {
    return moment().isBefore(this.getExpiration());
  }

  isLoggedOut() {
    return !this.isLoggedIn();
  }

  getExpiration() {
    const expiration = sessionStorage.getItem('expires_at');
    const expiresAt = JSON.parse(expiration);
    return moment(expiresAt);
  }

  // Error handling
  errorMgmt(error: HttpErrorResponse) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      // Get client-side error
      errorMessage = error.error.message;
    } else {
      // Get server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.log(errorMessage);
    return throwError(errorMessage);
  }
}
