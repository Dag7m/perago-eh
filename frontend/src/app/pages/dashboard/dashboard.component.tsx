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
    <div class="dashboard-container">
      <mat-toolbar color="primary" class="app-toolbar">
        <span class="app-title">
          <mat-icon>business</mat-icon>
          Employee Hierarchy Manager
        </span>
        <span class="spacer"></span>
        <button mat-raised-button color="accent" (click)="createNewPosition()">
          <mat-icon>add</mat-icon>
          New Position
        </button>
      </mat-toolbar>

      <div class="main-content">
        <mat-tab-group class="content-tabs" (selectedTabChange)="onTabChange($event)">
          <mat-tab label="Hierarchy View">
            <div class="tab-content">
              <div class="content-grid">
                <div class="tree-section">
                  <app-position-tree (deleteRequested)="deletePosition($event)"></app-position-tree>
                </div>
                
                <div class="details-section">
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
            <div class="tab-content">
              <div class="list-layout">
                <div class="list-section">
                  <app-position-list></app-position-list>
                </div>
                <div class="form-section">
                  <app-position-form></app-position-form>
                </div>
              </div>
            </div>
          </mat-tab>
        </mat-tab-group>
      </div>
    </div>
  `,
  styles: [
    `
    .dashboard-container {
      height: 100vh;
      display: flex;
      flex-direction: column;
      background-color: #f5f5f5;
    }

    .app-toolbar {
      position: sticky;
      top: 0;
      z-index: 1000;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .app-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 20px;
      font-weight: 500;
    }

    .spacer {
      flex: 1;
    }

    .main-content {
      flex: 1;
      overflow: hidden;
    }

    .content-tabs {
      height: 100%;
    }

    .tab-content {
      height: calc(100vh - 112px);
      padding: 24px;
    }

    .content-grid {
      display: grid;
      grid-template-columns: 1fr 400px;
      gap: 24px;
      height: 100%;
      max-width: 1400px;
      margin: 0 auto;
    }

    .tree-section, .details-section {
      min-height: 0;
    }

    .list-layout {
      display: grid;
      grid-template-columns: 1fr 400px;
      gap: 24px;
      height: 100%;
      max-width: 1400px;
      margin: 0 auto;
    }

    .list-section, .form-section {
      min-height: 0;
    }

    @media (max-width: 1024px) {
      .content-grid, .list-layout {
        grid-template-columns: 1fr;
        grid-template-rows: 1fr auto;
      }
      
      .details-section, .form-section {
        order: -1;
      }
    }

    @media (max-width: 768px) {
      .tab-content {
        padding: 16px;
      }
      
      .app-title {
        font-size: 18px;
      }
      
      .app-title mat-icon {
        display: none;
      }
    }
    `,
  ],
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
    // Reset selection when switching tabs
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
