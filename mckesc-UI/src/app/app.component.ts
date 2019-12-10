import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Idle, DEFAULT_INTERRUPTSOURCES } from '@ng-idle/core';
import { Keepalive } from '@ng-idle/keepalive';
import { AvatarModule } from 'ng2-avatar';
import { VersionCheckService } from './services/version-check/version-check.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'PK UI';

 	idleState = 'Not started.';
  timedOut = false;
  loggedin: boolean = true;
  shownav: boolean = false;
  admin: boolean = false;
  agent: boolean = false;

  user_names: any;
  project_name: any;

  constructor(
  	private idle: Idle, 
    public router: Router,
    public _versionCheckService: VersionCheckService,
  	private keepalive: Keepalive
  ) {
    // sets an idle timeout of 5 seconds, for testing purposes.
    idle.setIdle(5);
    // sets a timeout period of 3600 seconds (1 hour). after 10 seconds of inactivity, the user will be considered timed out.
    idle.setTimeout(3600*5);
    // sets the default interrupts, in this case, things like clicks, scrolls, touches to the document
    idle.setInterrupts(DEFAULT_INTERRUPTSOURCES);
    idle.onIdleEnd.subscribe(() => this.idleState = 'No longer idle.');
    idle.onTimeout.subscribe(() => {
      this.idleState = 'Timed out!';
      this.timedOut = true;
      this.router.navigate(['/auth/login']);
    });
    idle.onIdleStart.subscribe(() => this.idleState = 'You\'ve gone idle!');
    idle.onTimeoutWarning.subscribe((countdown) => this.idleState = 'You will time out in ' + countdown + ' seconds!');
    // sets the ping interval to 15 seconds
    keepalive.interval(15);

    this.reset();

    Notification.requestPermission(function(status) {
      console.log('Notification permission status:', status);
    });
  }

  ngOnInit(){
    this._versionCheckService.initVersionCheck();
  }

  reset() {
    this.idle.watch();
    this.idleState = 'Started.';
    this.timedOut = false;
  }

  checkLogin(){
    this.user_names = sessionStorage.getItem("users_names");
    if(sessionStorage.getItem("user_id") == null){
      this.loggedin = false;
      this.router.navigate(['/auth/login']);
    }else{
      this.loggedin = true;
    }
  }

  hideSidenav(){
    this.loggedin = false;
  }
  unhideSidenav(){
    this.loggedin = true;
  }
}

