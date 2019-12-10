import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClarifyComponent } from './clarify.component';

describe('ClarifyComponent', () => {
  let component: ClarifyComponent;
  let fixture: ComponentFixture<ClarifyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClarifyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClarifyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
