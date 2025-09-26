import { Component, inject } from "@angular/core"
import { CommonModule } from "@angular/common"
import { MatCardModule } from "@angular/material/card"
import { MatButtonModule } from "@angular/material/button"
import { MatIconModule } from "@angular/material/icon"
import { MatChipsModule } from "@angular/material/chips"

import { PositionService } from "../../services/position.service"

@Component({
  selector: "app-position-details",
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule],
  template: `
    <mat-card class="h-full flex flex-col">
      <mat-card-header>
        <mat-card-title>Position Details</mat-card-title>
      </mat-card-header>
      <mat-card-content class="flex-1">
        <div *ngIf="selectedPosition$ | async as position">
          <div class="flex flex-col gap-5 mb-6">
            <div class="flex items-start gap-3">
              <mat-icon class="text-gray-600 mt-1">business_center</mat-icon>
              <div class="flex flex-col gap-1 flex-1">
                <label class="text-xs font-medium text-gray-600 uppercase tracking-wide">Position Name</label>
                <span class="text-sm text-gray-800">{{ position.name }}</span>
              </div>
            </div>
            
            <div class="flex items-start gap-3">
              <mat-icon class="text-gray-600 mt-1">description</mat-icon>
              <div class="flex flex-col gap-1 flex-1">
                <label class="text-xs font-medium text-gray-600 uppercase tracking-wide">Description</label>
                <span class="text-sm text-gray-800">{{ position.description || 'No description provided' }}</span>
              </div>
            </div>
            
            <div class="flex items-start gap-3">
              <mat-icon class="text-gray-600 mt-1">account_tree</mat-icon>
              <div class="flex flex-col gap-1 flex-1">
                <label class="text-xs font-medium text-gray-600 uppercase tracking-wide">Hierarchy Level</label>
                <mat-chip-set>
                  <mat-chip [ngClass]="getLevelClass(position.level || 0)" class="text-white">
                    {{ getLevelLabel(position.level || 0) }}
                  </mat-chip>
                </mat-chip-set>
              </div>
            </div>
            
            <div class="flex items-start gap-3" *ngIf="position.parentName">
              <mat-icon class="text-gray-600 mt-1">supervisor_account</mat-icon>
              <div class="flex flex-col gap-1 flex-1">
                <label class="text-xs font-medium text-gray-600 uppercase tracking-wide">Reports To</label>
                <span class="text-sm text-gray-800">{{ position.parentName }}</span>
              </div>
            </div>
            
            <div class="flex items-start gap-3" *ngIf="position.children && position.children.length > 0">
              <mat-icon class="text-gray-600 mt-1">group</mat-icon>
              <div class="flex flex-col gap-1 flex-1">
                <label class="text-xs font-medium text-gray-600 uppercase tracking-wide">Direct Reports</label>
                <span class="text-sm text-gray-800">{{ position.children.length }} position(s)</span>
              </div>
            </div>
          </div>
          
          <div class="flex gap-3 mt-auto pt-4 border-t border-gray-200">
            <button mat-raised-button color="primary" (click)="editPosition()" class="flex items-center gap-2">
              <mat-icon>edit</mat-icon>
              Edit Position
            </button>
          </div>
        </div>
        <div *ngIf="!(selectedPosition$ | async)" class="flex flex-col items-center justify-center p-10 text-gray-500 text-center">
          <mat-icon class="text-5xl w-12 h-12 mb-4 text-gray-300">info</mat-icon>
          <p>Select a position from the tree to view details</p>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [
    `
    .bg-red-500 {
      background-color: #ef4444 !important;
    }
    .bg-orange-500 {
      background-color: #f97316 !important;
    }
    .bg-blue-500 {
      background-color: #3b82f6 !important;
    }
    .bg-green-500 {
      background-color: #22c55e !important;
    }
    .bg-purple-500 {
      background-color: #a855f7 !important;
    }
    `,
  ],
})
export class PositionDetailsComponent {
  private positionService = inject(PositionService)

  selectedPosition$ = this.positionService.selectedPosition$

  getLevelLabel(level: number): string {
    switch (level) {
      case 0:
        return "CEO Level"
      case 1:
        return "Executive Level"
      case 2:
        return "Director Level"
      case 3:
        return "Manager Level"
      default:
        return `Level ${level}`
    }
  }

  getLevelClass(level: number): string {
    if (level === 0) return "bg-red-500"
    if (level === 1) return "bg-orange-500"
    if (level === 2) return "bg-blue-500"
    if (level === 3) return "bg-green-500"
    return "bg-purple-500"
  }

  editPosition(): void {
    this.positionService.setEditMode(true)
  }
}
