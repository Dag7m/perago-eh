import { Component, inject, signal, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { MatCardModule } from "@angular/material/card"
import { MatButtonModule } from "@angular/material/button"
import { MatIconModule } from "@angular/material/icon"
import { MatTableModule } from "@angular/material/table"
import { MatInputModule } from "@angular/material/input"
import { MatFormFieldModule } from "@angular/material/form-field"
import { FormControl, ReactiveFormsModule } from "@angular/forms"

import type { Position } from "../../models/position.model"
import { PositionService } from "../../services/position.service"

@Component({
  selector: "app-position-list",
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatInputModule,
    MatFormFieldModule,
    ReactiveFormsModule,
  ],
  template: `
    <mat-card class="list-card">
      <mat-card-header>
        <mat-card-title>All Positions</mat-card-title>
        <div class="header-actions">
          <mat-form-field appearance="outline" class="search-field">
            <mat-label>Search positions</mat-label>
            <input matInput [formControl]="searchControl" placeholder="Search by name or description">
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>
        </div>
      </mat-card-header>
      <mat-card-content>
        @if (filteredPositions().length === 0) {
          <div class="empty-state">
            <mat-icon>list</mat-icon>
            <p>No positions found</p>
          </div>
        } @else {
          <div class="positions-table">
            <table mat-table [dataSource]="filteredPositions()" class="full-width-table">
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef>Position Name</th>
                <td mat-cell *matCellDef="let position">
                  <div class="position-name">
                    <strong>{{ position.name }}</strong>
                    @if (position.parentName) {
                      <span class="parent-info">Reports to: {{ position.parentName }}</span>
                    } @else {
                      <span class="root-info">Root Position</span>
                    }
                  </div>
                </td>
              </ng-container>

              <ng-container matColumnDef="description">
                <th mat-header-cell *matHeaderCellDef>Description</th>
                <td mat-cell *matCellDef="let position">
                  <span class="description">{{ position.description || 'No description' }}</span>
                </td>
              </ng-container>

              <ng-container matColumnDef="children">
                <th mat-header-cell *matHeaderCellDef>Team Size</th>
                <td mat-cell *matCellDef="let position">
                  <span class="team-size">{{ getChildrenCount(position) }} direct reports</span>
                </td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let position">
                  <div class="action-buttons">
                    <button mat-icon-button (click)="viewPosition(position)" matTooltip="View Details">
                      <mat-icon>visibility</mat-icon>
                    </button>
                    <button mat-icon-button (click)="editPosition(position)" matTooltip="Edit Position">
                      <mat-icon>edit</mat-icon>
                    </button>
                    <button mat-icon-button color="warn" (click)="deletePosition(position)" matTooltip="Delete Position">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </div>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;" 
                  [class.selected-row]="selectedPosition()?.id === row.id"
                  (click)="viewPosition(row)"></tr>
            </table>
          </div>
        }
      </mat-card-content>
    </mat-card>
  `,
  styles: [
    `
    .list-card {
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .header-actions {
      margin-left: auto;
    }

    .search-field {
      width: 300px;
    }

    .positions-table {
      flex: 1;
      overflow: auto;
    }

    .full-width-table {
      width: 100%;
    }

    .position-name {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .parent-info {
      font-size: 12px;
      color: #666;
    }

    .root-info {
      font-size: 12px;
      color: #7b1fa2;
      font-weight: 500;
    }

    .description {
      color: #666;
      font-size: 14px;
    }

    .team-size {
      color: #333;
      font-size: 14px;
    }

    .action-buttons {
      display: flex;
      gap: 4px;
    }

    .selected-row {
      background-color: #e3f2fd;
    }

    .mat-mdc-row:hover {
      background-color: #f5f5f5;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px;
      color: #666;
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
export class PositionListComponent implements OnInit {
  private positionService = inject(PositionService)

  displayedColumns: string[] = ["name", "description", "children", "actions"]
  allPositions = signal<Position[]>([])
  filteredPositions = signal<Position[]>([])
  selectedPosition = signal<Position | null>(null)
  searchControl = new FormControl("")

  ngOnInit(): void {
    this.positionService.getAllPositions().subscribe((positions) => {
      this.allPositions.set(positions)
      this.filteredPositions.set(positions)
    })

    this.positionService.selectedPosition$.subscribe((position) => {
      this.selectedPosition.set(position)
    })

    this.searchControl.valueChanges.subscribe((searchTerm) => {
      this.filterPositions(searchTerm || "")
    })
  }

  private filterPositions(searchTerm: string): void {
    const filtered = this.allPositions().filter(
      (position) =>
        position.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        position.description.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    this.filteredPositions.set(filtered)
  }

  getChildrenCount(position: Position): number {
    return position.children?.length || 0
  }

  viewPosition(position: Position): void {
    this.positionService.selectPosition(position)
  }

  editPosition(position: Position): void {
    this.positionService.setEditMode(true)
    this.positionService.selectPosition(position)
  }

  deletePosition(position: Position): void {
    // This will be handled by the parent component
    this.positionService.requestDelete(position)
  }
}
