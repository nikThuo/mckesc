import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HuddleComponent } from './huddle.component';

describe('HuddleComponent', () => {
  let component: HuddleComponent;
  let fixture: ComponentFixture<HuddleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HuddleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HuddleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
