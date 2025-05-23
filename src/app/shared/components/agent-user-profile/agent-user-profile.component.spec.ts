import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgentUserProfileComponent } from './agent-user-profile.component';

describe('AgentUserProfileComponent', () => {
  let component: AgentUserProfileComponent;
  let fixture: ComponentFixture<AgentUserProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgentUserProfileComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgentUserProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
