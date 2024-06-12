import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment.prod';
import { AuthDTO } from '../models/auth.dto';

export interface AuthToken {
  user_id: string;
  access_token: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl: string;

  constructor(private http: HttpClient, private router: Router) {
    //this.apiUrl = 'http://localhost:8000/api';

    this.apiUrl = environment.apiUrl;
  }

  login(auth: AuthDTO): Observable<AuthToken> {
    return this.http.post<AuthToken>(`${this.apiUrl}/login`, auth).pipe(
      tap((response: AuthToken) => {
        this.setToken(response.access_token);
      })
    );
  }

  logout(): void {
    this.http
      .post(`${this.apiUrl}/logout`, {}, { headers: this.getAuthHeaders() })
      .subscribe(() => {
        this.clearToken();
        this.router.navigate(['/login']);
      });
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  setToken(token: string): void {
    localStorage.setItem('access_token', token);
  }

  clearToken(): void {
    localStorage.removeItem('access_token');
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }
}
