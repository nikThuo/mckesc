import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

//routing
import { AdminRoutingModule } from './admin-routing.module';

//material imports
import { 
  MatFormFieldModule, 
  MatInputModule,
  MatNativeDateModule,
  MatDatepickerModule
} from '@angular/material';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatRadioModule } from '@angular/material/radio';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatBadgeModule } from '@angular/material/badge';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { FileUploadModule } from 'ng2-file-upload';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTabsModule } from '@angular/material/tabs';

import { TimeAgoPipe } from 'time-ago-pipe';

// components
import {
  DashboardComponent,
  UpdateViewsDialog,
  EditUpdateDialog,
} from './dashboard/dashboard.component';
import { 
  HuddleComponent,
  HuddleDetailDialog,
} from './huddle/huddle.component';
import { ClarifyComponent } from './clarify/clarify.component';
import { ScrollToBottomDirective } from './clarify/scroll-to-bottom';

@NgModule({
  imports: [
    CommonModule,
    AdminRoutingModule,
	  MatFormFieldModule, 
	  MatInputModule,
	  MatNativeDateModule,
	  MatDatepickerModule,
		MatButtonModule,
  	FormsModule,
  	ReactiveFormsModule,
		MatTableModule,
		MatPaginatorModule,
		MatIconModule,
		MatChipsModule,
		MatToolbarModule,
    MatCardModule,
    MatRadioModule,
    MatExpansionModule,
    MatDialogModule,
    MatMenuModule,
    MatSelectModule,
    MatBadgeModule,
    MatAutocompleteModule,
    FileUploadModule,
    MatListModule,
    MatDividerModule,
    MatCheckboxModule,
    MatTabsModule,
  ],
  declarations: [
  	DashboardComponent,
    HuddleComponent,
    HuddleDetailDialog,
    UpdateViewsDialog,
    EditUpdateDialog,
    ClarifyComponent,
    ScrollToBottomDirective,
    TimeAgoPipe,
  ],
  entryComponents:[
    HuddleDetailDialog,
    UpdateViewsDialog,
    EditUpdateDialog,
  ]
})
export class AdminModule { }
