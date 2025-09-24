import { Component, inject } from "@angular/core"
import { CommonModule } from "@angular/common"
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog"
import { MatButtonModule } from "@angular/material/button"
import { MatIconModule } from "@angular/material/icon"
import { MatRadioModule } from "@angular/material/radio"
import { FormControl, ReactiveFormsModule } from "@angular/forms"

import type { DeleteOptions } from "../../models/position.model"

@Component({
  selector: "app-confirm-dialog",
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule, MatRadioModule, ReactiveFormsModule],
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <mat-icon class="warning-icon">warning</mat-icon>
        <h2 mat-dialog-title>Confirm Delete</h2>
      </div>
      
      <mat-dialog-content class="dialog-content">
        <p class="position-info">
          You are about to delete: <strong>{{ data.positionName }}</strong>
        </p>
        
        @if (data.hasChildren) {
          <div class="delete-options">
            <p class="options-label">This position has child positions. Choose how to proceed:</p>
            
            <mat-radio-group [formControl]="deleteTypeControl" class="radio-group">
              <mat-radio-button value="cascade" class="radio-option">
                <div class="option-content">
                  <div class="option-title">
                    <mat-icon>delete_sweep</mat-icon>
                    Cascade Delete
                  </div>
                  <div class="option-description">
                    Delete this position and all its child positions permanently
                  </div>
                </div>
              </mat-radio-button>
              
              <mat-radio-button value="reassign" class="radio-option">
                <div class="option-content">
                  <div class="option-title">
                    <mat-icon>swap_horiz</mat-icon>
                    Reassign and Delete
                  </div>
                  <div class="option-description">
                    Move child positions to this position's parent, then delete this position
                  </div>
                </div>
              </mat-radio-button>
            </mat-radio-group>
          </div>
        } @else {
          <div class="simple-delete">
            <div class="option-content">
              <div class="option-title">
                <mat-icon>delete</mat-icon>
                Simple Delete
              </div>
              <div class="option-description">
                This position has no children and will be deleted permanently
              </div>
            </div>
          </div>
        }
        
        <div class="warning-message">
          <mat-icon>info</mat-icon>
          <span>This action cannot be undone</span>
        </div>
      </mat-dialog-content>
      
      <mat-dialog-actions class="dialog-actions">
        <button mat-button (click)="onCancel()">Cancel</button>
        <button mat-raised-button color="warn" 
                [disabled]="data.hasChildren && !deleteTypeControl.value"
                (click)="onConfirm()">
          Delete Position
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [
    `
    .dialog-container {
      min-width: 400px;
      max-width: 600px;
    }

    .dialog-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
    }

    .warning-icon {
      color: #ff9800;
      font-size: 32px;
      width: 32px;
      height: 32px;
    }

    .dialog-content {
      padding: 0 24px;
    }

    .position-info {
      font-size: 16px;
      margin-bottom: 24px;
      color: #333;
    }

    .delete-options {
      margin-bottom: 24px;
    }

    .options-label {
      font-weight: 500;
      margin-bottom: 16px;
      color: #555;
    }

    .radio-group {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .radio-option {
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 16px;
      transition: all 0.2s ease;
    }

    .radio-option:hover {
      border-color: #2196f3;
      background-color: #f8f9fa;
    }

    .radio-option.mat-radio-checked {
      border-color: #2196f3;
      background-color: #e3f2fd;
    }

    .option-content {
      margin-left: 32px;
    }

    .option-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 500;
      color: #333;
      margin-bottom: 4px;
    }

    .option-title mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .option-description {
      font-size: 14px;
      color: #666;
      line-height: 1.4;
    }

    .simple-delete {
      padding: 16px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      background-color: #f8f9fa;
      margin-bottom: 24px;
    }

    .warning-message {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px;
      background-color: #fff3cd;
      border: 1px solid #ffeaa7;
      border-radius: 4px;
      color: #856404;
      font-size: 14px;
    }

    .warning-message mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .dialog-actions {
      padding: 16px 24px;
      gap: 12px;
    }
  `,
  ],
})
export class ConfirmDialogComponent {
  private dialogRef = inject(MatDialogRef<ConfirmDialogComponent>)
  public data = inject<DeleteOptions>(MAT_DIALOG_DATA)

  deleteTypeControl = new FormControl(this.data.hasChildren ? null : "simple")

  onCancel(): void {
    this.dialogRef.close(null)
  }

  onConfirm(): void {
    const deleteType = this.deleteTypeControl.value || "simple"
    this.dialogRef.close({
      ...this.data,
      type: deleteType,
    })
  }
}
