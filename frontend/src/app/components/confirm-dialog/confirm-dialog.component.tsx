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
    <div class="min-w-96 max-w-2xl">
      <div class="flex items-center gap-3 mb-4">
        <mat-icon class="text-orange-500 text-4xl w-8 h-8">warning</mat-icon>
        <h2 mat-dialog-title class="text-xl font-semibold">Confirm Delete</h2>
      </div>
      
      <mat-dialog-content class="px-6">
        <p class="text-base mb-6 text-gray-800">
          You are about to delete: <strong>{{ data.positionName }}</strong>
        </p>
        
        @if (data.hasChildren) {
          <div class="mb-6">
            <p class="font-medium mb-4 text-gray-700">This position has child positions. Choose how to proceed:</p>
            
            <mat-radio-group [formControl]="deleteTypeControl" class="flex flex-col gap-4">
              <mat-radio-button value="cascade" class="border border-gray-200 rounded-lg p-4 transition-all duration-200 hover:border-blue-500 hover:bg-gray-50">
                <div class="ml-8">
                  <div class="flex items-center gap-2 font-medium text-gray-800 mb-1">
                    <mat-icon class="text-xl w-5 h-5">delete_sweep</mat-icon>
                    Cascade Delete
                  </div>
                  <div class="text-sm text-gray-600 leading-relaxed">
                    Delete this position and all its child positions permanently
                  </div>
                </div>
              </mat-radio-button>
              
              <mat-radio-button value="reassign" class="border border-gray-200 rounded-lg p-4 transition-all duration-200 hover:border-blue-500 hover:bg-gray-50">
                <div class="ml-8">
                  <div class="flex items-center gap-2 font-medium text-gray-800 mb-1">
                    <mat-icon class="text-xl w-5 h-5">swap_horiz</mat-icon>
                    Reassign and Delete
                  </div>
                  <div class="text-sm text-gray-600 leading-relaxed">
                    Move child positions to this position's parent, then delete this position
                  </div>
                </div>
              </mat-radio-button>
            </mat-radio-group>
          </div>
        } @else {
          <div class="p-4 border border-gray-200 rounded-lg bg-gray-50 mb-6">
            <div class="flex items-center gap-2 font-medium text-gray-800 mb-1">
              <mat-icon class="text-xl w-5 h-5">delete</mat-icon>
              Simple Delete
            </div>
            <div class="text-sm text-gray-600 leading-relaxed">
              This position has no children and will be deleted permanently
            </div>
          </div>
        }
        
        <div class="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-sm">
          <mat-icon class="text-lg w-5 h-5">info</mat-icon>
          <span>This action cannot be undone</span>
        </div>
      </mat-dialog-content>
      
      <mat-dialog-actions class="p-6 gap-3">
        <button mat-button (click)="onCancel()" class="min-w-24">Cancel</button>
        <button mat-raised-button color="warn" 
                [disabled]="data.hasChildren && !deleteTypeControl.value"
                (click)="onConfirm()" class="min-w-32">
          Delete Position
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [
    `
    .mat-radio-checked .border {
      border-color: #3b82f6 !important;
      background-color: #dbeafe !important;
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
