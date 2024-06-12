import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthDTO } from '../../models/auth.dto';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  animations: [
    trigger('fadeIn', [
      state(
        'void',
        style({
          opacity: 0.2,
        })
      ),
      transition('void <=> *', animate(500)),
    ]),
  ],
})
export class LoginComponent implements OnInit {
  username: FormControl;
  password: FormControl;
  loginForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.username = new FormControl('', [Validators.required]);
    this.password = new FormControl('', [
      Validators.required,
      Validators.minLength(8),
      Validators.maxLength(16),
    ]);

    this.loginForm = this.formBuilder.group({
      username: this.username,
      password: this.password,
    });
  }

  ngOnInit(): void {}

  login(): void {
    if (this.loginForm.valid) {
      const credentials: AuthDTO = {
        username: this.username.value,
        password: this.password.value,
        user_id: '',
        access_token: '',
      };

      this.authService.login(credentials).subscribe(
        (response) => {
          console.log('Login correcte', response);
          localStorage.setItem('access_token', response.access_token);
          this.router.navigate(['/observations']);
        },
        (error) => {
          console.error('Login ha fallat', error);
        }
      );
    }
  }

  getUsernameErrorMessage(): string | undefined {
    if (this.username.hasError('required')) {
      return "L'usuari és obligatori";
    }
    return undefined;
  }

  getPasswordErrorMessage(): string | undefined {
    switch (true) {
      case this.password.hasError('required'):
        return 'La contrasenya és obligatòria';
      default:
        return undefined;
    }
  }
}
