import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgentUsersComponent } from './agent-users.component';

describe('AgentUsersComponent', () => {
  let component: AgentUsersComponent;
  let fixture: ComponentFixture<AgentUsersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgentUsersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgentUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
