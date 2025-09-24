import { Component, inject, signal, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { MatCardModule } from "@angular/material/card"
import { MatButtonModule } from "@angular/material/button"
import { MatIconModule } from "@angular/material/icon"
import { MatChipsModule } from "@angular/material/chips"

import type { Position } from "../../models/position.model"
import { PositionService } from "../../services/position.service"

@Component({
  selector: "app-position-details",
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule],
  template: `
    <mat-card class="details-card">
      <mat-card-header>
        <mat-card-title>Position Details</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        @if (selectedPosition()) {
          <div class="position-details">
            <div class="detail-section">
              <h3 class="section-title">
                <mat-icon>badge</mat-icon>
                Position Information
              </h3>
              <div class="detail-item">
                <label>Name:</label>
                <span class="value">{{ selectedPosition()!.name }}</span>
              </div>
              <div class="detail-item">
                <label>Description:</label>
                <span class="value">{{ selectedPosition()!.description || 'No description provided' }}</span>
              </div>
              @if (selectedPosition()!.parentName) {
                <div class="detail-item">
                  <label>Reports to:</label>
                  <mat-chip class="parent-chip">{{ selectedPosition()!.parentName }}</mat-chip>
                </div>
              } @else {
                <div class="detail-item">
                  <label>Level:</label>
                  <mat-chip class="root-chip">Root Position</mat-chip>
                </div>
              }
            </div>

            @if (childrenCount() > 0) {
              <div class="detail-section">
                <h3 class="section-title">
                  <mat-icon>group</mat-icon>
                  Team Structure
                </h3>
                <div class="detail-item">
                  <label>Direct Reports:</label>
                  <span class="value">{{ childrenCount() }} position(s)</span>
                </div>
                <div class="children-list">
                  @for (child of selectedPosition()!.children; track child.id) {
                    <mat-chip class="child-chip">{{ child.name }}</mat-chip>
                  }
                </div>
              </div>
            }

            <div class="actions-section">
              <button mat-raised-button color="primary" (click)="editPosition()">
                <mat-icon>edit</mat-icon>
                Edit Position
              </button>
            </div>
          </div>
        } @else {
          <div class="empty-state">
            <mat-icon>info</mat-icon>
            <p>Select a position from the hierarchy to view details</p>
          </div>
        }
      </mat-card-content>
    </mat-card>
  `,
  styles: [
    `
    .details-card {
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .position-details {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .detail-section {
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 16px;
    }

    .section-title {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0 0 16px 0;
      font-size: 16px;
      font-weight: 500;
      color: #333;
    }

    .section-title mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      color: #2196f3;
    }

    .detail-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
      margin-bottom: 12px;
    }

    .detail-item:last-child {
      margin-bottom: 0;
    }

    .detail-item label {
      font-weight: 500;
      font-size: 14px;
      color: #666;
    }

    .detail-item .value {
      font-size: 16px;
      color: #333;
      line-height: 1.4;
    }

    .children-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 8px;
    }

    .parent-chip {
      background-color: #e3f2fd;
      color: #1976d2;
    }

    .root-chip {
      background-color: #f3e5f5;
      color: #7b1fa2;
    }

    .child-chip {
      background-color: #e8f5e8;
      color: #388e3c;
    }

    .actions-section {
      display: flex;
      gap: 12px;
      padding-top: 16px;
      border-top: 1px solid #e0e0e0;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px;
      color: #666;
      text-align: center;
    }

    .empty-state mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
      color: #ccc;
    }
  `,
  ],
})
export class PositionDetailsComponent implements OnInit {
  private positionService = inject(PositionService)

  selectedPosition = signal<Position | null>(null)
  childrenCount = signal(0)

  ngOnInit(): void {
    this.positionService.selectedPosition$.subscribe((position) => {
      this.selectedPosition.set(position)
      this.childrenCount.set(position?.children?.length || 0)
    })
  }

  editPosition(): void {
    if (this.selectedPosition()) {
      this.positionService.setEditMode(true)
    }
  }
}
