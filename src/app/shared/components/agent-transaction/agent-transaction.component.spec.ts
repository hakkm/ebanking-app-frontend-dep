import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgentTransactionComponent } from './agent-transaction.component';

describe('AgentTransactionComponent', () => {
  let component: AgentTransactionComponent;
  let fixture: ComponentFixture<AgentTransactionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgentTransactionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgentTransactionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
