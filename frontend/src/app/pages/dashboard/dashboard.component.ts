import { Component, inject, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { MatToolbarModule } from "@angular/material/toolbar"
import { MatButtonModule } from "@angular/material/button"
import { MatIconModule } from "@angular/material/icon"
import { MatDialog } from "@angular/material/dialog"
import { MatSnackBar } from "@angular/material/snack-bar"
import { MatTabsModule } from "@angular/material/tabs"
import { signal } from "@angular/core"

import { PositionTreeComponent } from "../../components/position-tree/position-tree.component"
import { PositionFormComponent } from "../../components/position-form/position-form.component"
import { ConfirmDialogComponent } from "../../components/confirm-dialog/confirm-dialog.component"
import { PositionDetailsComponent } from "../../components/position-details/position-details.component"
import { PositionListComponent } from "../../components/position-list/position-list.component"
import { PositionService } from "../../services/position.service"
import type { Position, DeleteOptions } from "../../models/position.model"

@Component({
  selector: "app-dashboard",
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    PositionTreeComponent,
    PositionFormComponent,
    PositionDetailsComponent,
    PositionListComponent,
  ],
  template: `
    <div class="h-screen flex flex-col bg-gray-50">
      <mat-toolbar color="primary" class="sticky top-0 z-50 shadow-md">
        <span class="flex items-center gap-2 text-xl font-medium">
          <mat-icon>business</mat-icon>
          <span class="hidden sm:inline">Employee Hierarchy Manager</span>
          <span class="sm:hidden">Hierarchy</span>
        </span>
        <span class="flex-1"></span>
        <button mat-raised-button color="accent" (click)="createNewPosition()" class="flex items-center gap-2">
          <mat-icon>add</mat-icon>
          <span class="hidden sm:inline">New Position</span>
        </button>
      </mat-toolbar>

      <div class="flex-1 overflow-hidden">
        <mat-tab-group class="h-full">
          <mat-tab label="Hierarchy View">
            <div class="h-full p-6">
              <div class="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 h-full max-w-7xl mx-auto">
                <div class="min-h-0">
                  <app-position-tree (deleteRequested)="deletePosition($event)"></app-position-tree>
                </div>
                
                <div class="min-h-0 order-first lg:order-last">
                  @if (isEditMode()) {
                    <app-position-form></app-position-form>
                  } @else {
                    <app-position-details></app-position-details>
                  }
                </div>
              </div>
            </div>
          </mat-tab>
          
          <mat-tab label="List View">
            <div class="h-full p-6">
              <div class="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 h-full max-w-7xl mx-auto">
                <div class="min-h-0">
                  <app-position-list></app-position-list>
                </div>
                <div class="min-h-0 order-first lg:order-last">
                  <app-position-form></app-position-form>
                </div>
              </div>
            </div>
          </mat-tab>
        </mat-tab-group>
      </div>
    </div>
  `,
  styles: [],
})
export class DashboardComponent implements OnInit {
  private positionService = inject(PositionService)
  private dialog = inject(MatDialog)
  private snackBar = inject(MatSnackBar)

  isEditMode = signal(false)

  ngOnInit(): void {
    this.positionService.editMode$.subscribe((editMode) => {
      this.isEditMode.set(editMode)
    })

    this.positionService.deleteRequest$.subscribe((position) => {
      if (position) {
        this.deletePosition(position)
      }
    })
  }

  createNewPosition(): void {
    this.positionService.selectPosition(null)
    this.positionService.setEditMode(true)
  }

  onTabChange(event: any): void {
    this.positionService.selectPosition(null)
    this.positionService.setEditMode(false)
  }

  deletePosition(position: Position): void {
    const hasChildren = position.children && position.children.length > 0

    const deleteOptions: DeleteOptions = {
      type: "simple",
      positionId: position.id,
      positionName: position.name,
      hasChildren: hasChildren || false,
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: "500px",
      data: deleteOptions,
      disableClose: true,
    })

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.executeDelete(result)
      }
    })
  }

  private executeDelete(options: DeleteOptions): void {
    let deleteOperation

    switch (options.type) {
      case "cascade":
        deleteOperation = this.positionService.cascadeDelete(options.positionId)
        break
      case "reassign":
        deleteOperation = this.positionService.reassignAndDelete(options.positionId)
        break
      default:
        deleteOperation = this.positionService.deletePosition(options.positionId)
    }

    deleteOperation.subscribe({
      next: () => {
        const message = this.getDeleteSuccessMessage(options.type)
        this.snackBar.open(message, "Close", { duration: 3000 })
        this.positionService.selectPosition(null)
      },
      error: (error) => {
        console.error("Delete error:", error)
        this.snackBar.open("Error deleting position. Please try again.", "Close", { duration: 5000 })
      },
    })
  }

  private getDeleteSuccessMessage(type: string): string {
    switch (type) {
      case "cascade":
        return "Position and all children deleted successfully"
      case "reassign":
        return "Position deleted and children reassigned successfully"
      default:
        return "Position deleted successfully"
    }
  }
}
