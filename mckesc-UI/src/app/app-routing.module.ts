import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  { 
    path: '', 
    redirectTo: 'auth', 
    pathMatch: 'full' 
  },
  { 
    path: 'auth', 
    loadChildren: './modules/auth/auth.module#AuthModule' 
  },
  // {
  //   path: '**',
  //   redirectTo: ''
  // },
  { 
    path: 'nav', 
    loadChildren: './modules/navigation/navigation.module#NavigationModule' 
  },
  { 
    path: 'home', 
    loadChildren: './modules/admin/admin.module#AdminModule' 
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
