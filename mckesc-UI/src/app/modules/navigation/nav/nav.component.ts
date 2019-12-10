import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {

  sideNavOpened = true;

  menu: any[];
  
  constructor(
    public router: Router,
  ) { }

  ngOnInit() {
    if (sessionStorage.getItem('user_type') != '2'){
      this.menu = [
        {
          path: '/home/updates',
          icon: 'home',
          name: 'Updates'
        },
        {
          path: '/home/huddle',
          icon: 'explore',
          name: 'Huddles'
        },
        {
          path: '/home/clarification',
          icon: 'send',
          name: 'Clarifications'
        },
        {
          path: '/auth/users',
          icon: 'people',
          name: 'Users'
        },
      ];
    }else{
      this.menu = [
        {
          path: '/home/updates',
          icon: 'home',
          name: 'Updates'
        },
        {
          path: '/home/huddle',
          icon: 'explore',
          name: 'Huddles'
        },
        {
          path: '/home/clarification',
          icon: 'home',
          name: 'Clarifications'
        },
      ];
    }
  }

  logout(){
    // location.reload();
    this.router.navigate(['/auth/login']);
  }

  isActive(item) {
    return this.router.url == item.path;
  }

  toggleSideNav() {
    this.sideNavOpened = !this.sideNavOpened;
  }
}
