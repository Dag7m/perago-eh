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
    <mat-card class="h-full flex flex-col">
      <mat-card-header class="flex items-center justify-between">
        <mat-card-title>All Positions</mat-card-title>
        <div class="ml-auto">
          <mat-form-field appearance="outline" class="w-80">
            <mat-label>Search positions</mat-label>
            <input matInput [formControl]="searchControl" class="focus:outline-none focus:ring-0" placeholder="Search by name or description">
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>
        </div>
      </mat-card-header>
      <mat-card-content class="flex-1 overflow-hidden">
        @if (filteredPositions().length === 0) {
          <div class="flex flex-col items-center justify-center p-10 text-gray-500">
            <mat-icon class="text-5xl w-12 h-12 mb-4 text-gray-300">list</mat-icon>
            <p>No positions found</p>
          </div>
        } @else {
          <div class="flex-1 overflow-auto custom-scrollbar">
            <table mat-table [dataSource]="filteredPositions()" class="w-full">
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef>Position Name</th>
                <td mat-cell *matCellDef="let position">
                  <div class="flex flex-col gap-1">
                    <strong>{{ position.name }}</strong>
                    @if (position.parentName) {
                      <span class="text-xs text-gray-600">Reports to: {{ position.parentName }}</span>
                    } @else {
                      <span class="text-xs text-purple-600 font-medium">Root Position</span>
                    }
                  </div>
                </td>
              </ng-container>

              <ng-container matColumnDef="description">
                <th mat-header-cell *matHeaderCellDef>Description</th>
                <td mat-cell *matCellDef="let position">
                  <span class="text-gray-600 text-sm">{{ position.description || 'No description' }}</span>
                </td>
              </ng-container>

              <ng-container matColumnDef="children">
                <th mat-header-cell *matHeaderCellDef>Team Size</th>
                <td mat-cell *matCellDef="let position">
                  <span class="text-gray-800 text-sm">{{ getChildrenCount(position) }} direct reports</span>
                </td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let position">
                  <div class="flex gap-1">
                    <button mat-icon-button (click)="viewPosition(position)" matTooltip="View Details" 
                            class="text-gray-600 hover:text-blue-600">
                      <mat-icon>visibility</mat-icon>
                    </button>
                    <button mat-icon-button (click)="editPosition(position)" matTooltip="Edit Position"
                            class="text-gray-600 hover:text-green-600">
                      <mat-icon>edit</mat-icon>
                    </button>
                    <button mat-icon-button color="warn" (click)="deletePosition(position)" matTooltip="Delete Position"
                            class="text-gray-600 hover:text-red-600">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </div>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;" 
                  [class.bg-blue-50]="selectedPosition()?.id === row.id"
                  class="hover:bg-gray-200 cursor-pointer"
                  (click)="viewPosition(row)"></tr>
            </table>
          </div>
        }
      </mat-card-content>
    </mat-card>
  `,
  styles: [],
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
    return this.allPositions().filter((p) => p.parentId === position.id).length
  }

  viewPosition(position: Position): void {
    this.positionService.setEditMode(false)
    this.positionService.selectPosition(position)
  }

  editPosition(position: Position): void {
    this.positionService.setEditMode(true)
    this.positionService.selectPosition(position)
  }

  deletePosition(position: Position): void {
    this.positionService.requestDelete(position)
  }
}
