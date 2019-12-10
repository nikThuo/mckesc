import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTreeModule } from '@angular/material/tree';

import { NavComponent } from './nav/nav.component';

@NgModule({
  declarations: [
  	NavComponent, 
  ],
  imports: [
    CommonModule,
		MatButtonModule, 
		MatIconModule, 
		MatToolbarModule, 
		MatMenuModule,
    MatListModule,
    MatSidenavModule,
    MatTreeModule,
    RouterModule,
  ],
  exports: [
  	NavComponent,
  ],
})
export class NavigationModule { }
