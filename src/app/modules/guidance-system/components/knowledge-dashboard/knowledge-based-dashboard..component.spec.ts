// @ts-nocheck
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KnowledgeBasedDashboardComponent } from './knowledge-based-dashboard.component';

describe('DashboardComponent', () => {
  let component: KnowledgeBasedDashboardComponent;
  let fixture: ComponentFixture<KnowledgeBasedDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KnowledgeBasedDashboardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KnowledgeBasedDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
