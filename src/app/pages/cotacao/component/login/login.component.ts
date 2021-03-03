import {Component, EventEmitter, OnInit, Output} from '@angular/core';

@Component(
  {
    selector: 'app-login',
    templateUrl: 'login.component.html',
    styleUrls: ['login.component.css']
  }
)
export class LoginComponent implements OnInit{

  public gapiSetup: boolean = false; // marks if the gapi library has been loaded
  // @ts-ignore
  public authInstance: gapi.auth2.GoogleAuth;
  // @ts-ignore
  public error: string;
  // @ts-ignore
  public user: gapi.auth2.GoogleUser;
  @Output() public auth: EventEmitter<boolean> = new EventEmitter();

  async ngOnInit() {
    if (await this.checkIfUserAuthenticated()) {
      this.user = this.authInstance.currentUser.get();
      this.emitterAuth(true);
    }
  }

  async initGoogleAuth(): Promise<void> {
    const pload = new Promise((resolve) => {
      gapi.load('auth2', resolve);
    });

    return pload.then(async () => {
      await gapi.auth2
        .init({ client_id: '648417020131-ffjn0okoheik99moekrnk0p66o73vjjf.apps.googleusercontent.com' })
        .then(auth => {
          this.gapiSetup = true;
          this.authInstance = auth;
        });
    });
  }

  async authenticate(): Promise<gapi.auth2.GoogleUser> {
    if (!this.gapiSetup) {
      await this.initGoogleAuth();
    }

    return new Promise(async () => {
      await this.authInstance.signIn().then(
        user => {
          this.user = user;
          this.emitterAuth(true);
        },
        error => {
          this.error = error;
          this.emitterAuth(false);
        });
    });
  }

  async checkIfUserAuthenticated(): Promise<boolean> {
    if (!this.gapiSetup) {
      await this.initGoogleAuth();
    }

    return this.authInstance.isSignedIn.get();
  }

  emitterAuth(value: boolean){
    this.auth.emit(value);
  }
}
