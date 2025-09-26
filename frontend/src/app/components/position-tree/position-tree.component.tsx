import { Component, inject, type OnInit, signal, Output, EventEmitter } from "@angular/core"
import { CommonModule } from "@angular/common"
import { MatTreeModule, MatTreeNestedDataSource } from "@angular/material/tree"
import { MatIconModule } from "@angular/material/icon"
import { MatButtonModule } from "@angular/material/button"
import { MatCardModule } from "@angular/material/card"
import { NestedTreeControl } from "@angular/cdk/tree"

import type { Position } from "../../models/position.model"
import { PositionService } from "../../services/position.service"

@Component({
  selector: "app-position-tree",
  standalone: true,
  imports: [CommonModule, MatTreeModule, MatIconModule, MatButtonModule, MatCardModule],
  template: `
    <mat-card class="h-full flex flex-col">
      <mat-card-header>
        <mat-card-title>Organization Hierarchy</mat-card-title>
      </mat-card-header>
      <mat-card-content class="flex-1 overflow-hidden">
        @if (dataSource.data.length === 0) {
          <div class="flex flex-col items-center justify-center p-10 text-gray-500">
            <mat-icon class="text-5xl w-12 h-12 mb-4 text-gray-300">business</mat-icon>
            <p>No positions created yet</p>
          </div>
        } @else {
          <mat-tree [dataSource]="dataSource" [treeControl]="treeControl" class="flex-1 overflow-auto custom-scrollbar">
            <mat-tree-node *matTreeNodeDef="let node" matTreeNodeToggle>
              <li class="flex items-center min-h-12 w-full pl-2">
                <button mat-icon-button disabled></button>
                <div class="flex items-center justify-between flex-1 p-3 mx-0 my-1 rounded-lg cursor-pointer transition-all duration-200 border-2 border-transparent min-h-11 hover:bg-gray-800"
                     [class.bg-blue-50]="selectedPosition()?.id === node.id"
                     [class.border-blue-500]="selectedPosition()?.id === node.id"
                     (click)="selectPosition(node)">
                  <div class="flex flex-col flex-1 min-w-0">
                    <span class="font-medium text-sm text-gray-800 truncate">{{ node.name }}</span>
                    <span class="text-xs text-gray-600 mt-1 truncate">{{ node.description }}</span>
                  </div>
                  <div class="flex gap-1 opacity-0 transition-opacity duration-200 flex-shrink-0 group-hover:opacity-100"
                       [class.opacity-100]="selectedPosition()?.id === node.id">
                    <button mat-icon-button (click)="editPosition(node); $event.stopPropagation()" 
                            matTooltip="Edit Position" class="text-gray-600 hover:text-blue-600">
                      <mat-icon>edit</mat-icon>
                    </button>
                    <button mat-icon-button color="warn" (click)="onDeletePosition(node); $event.stopPropagation()"
                            matTooltip="Delete Position" class="text-gray-600 hover:text-red-600">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </div>
                </div>
              </li>
            </mat-tree-node>

            <mat-nested-tree-node *matTreeNodeDef="let node; when: hasChild">
              <li>
                <div class="flex items-center min-h-12 pl-2">
                  <button mat-icon-button matTreeNodeToggle
                          [attr.aria-label]="'Toggle ' + node.name"
                          class="text-gray-600">
                    <mat-icon class="mat-icon-rtl-mirror">
                      {{ treeControl.isExpanded(node) ? 'expand_more' : 'chevron_right' }}
                    </mat-icon>
                  </button>
                  <div class="flex items-center justify-between flex-1 p-3 mx-0 my-1 rounded-lg cursor-pointer transition-all duration-200 border-2 border-transparent min-h-11 hover:bg-gray-200 group"
                       [class.bg-blue-50]="selectedPosition()?.id === node.id"
                       [class.border-blue-500]="selectedPosition()?.id === node.id"
                       (click)="selectPosition(node)">
                    <div class="flex flex-col flex-1 min-w-0">
                      <span class="font-medium text-sm text-gray-800 truncate">{{ node.name }}</span>
                      <span class="text-xs text-gray-600 mt-1 truncate">{{ node.description }}</span>
                    </div>
                    <div class="flex gap-1 opacity-0 transition-opacity duration-200 flex-shrink-0 group-hover:opacity-100"
                         [class.opacity-100]="selectedPosition()?.id === node.id">
                      <button mat-icon-button (click)="editPosition(node); $event.stopPropagation()"
                              matTooltip="Edit Position" class="text-gray-600 hover:text-blue-600">
                        <mat-icon>edit</mat-icon>
                      </button>
                      <button mat-icon-button color="warn" (click)="onDeletePosition(node); $event.stopPropagation()"
                              matTooltip="Delete Position" class="text-gray-600 hover:text-red-600">
                        <mat-icon>delete</mat-icon>
                      </button>
                    </div>
                  </div>
                </div>
                <ul [class.hidden]="!treeControl.isExpanded(node)" class="pl-10 border-l border-dashed border-gray-300 ml-5">
                  <ng-container matTreeNodeOutlet></ng-container>
                </ul>
              </li>
            </mat-nested-tree-node>

            <mat-nested-tree-node *matTreeNodeDef="let node; when: hasNoChild">
              <li>
                <div class="flex items-center min-h-12 pl-2">
                  
                  <div class="flex items-center justify-between flex-1 p-3 mx-0 my-1 rounded-lg cursor-pointer transition-all duration-200 border-2 border-transparent min-h-11 hover:bg-gray-200 group"
                       [class.bg-blue-50]="selectedPosition()?.id === node.id"
                       [class.border-blue-500]="selectedPosition()?.id === node.id"
                       (click)="selectPosition(node)">
                    <div class="flex ml-10 flex-col flex-1 min-w-0">
                      <span class="font-medium text-sm text-gray-800 truncate">{{ node.name }}</span>
                      <span class="text-xs text-gray-600 mt-1 truncate">{{ node.description }}</span>
                    </div>
                    <div class="flex gap-1 opacity-0 transition-opacity duration-200 flex-shrink-0 group-hover:opacity-100"
                         [class.opacity-100]="selectedPosition()?.id === node.id">
                      <button mat-icon-button (click)="editPosition(node); $event.stopPropagation()"
                              matTooltip="Edit Position" class="text-gray-600 hover:text-blue-600">
                        <mat-icon>edit</mat-icon>
                      </button>
                      <button mat-icon-button color="warn" (click)="onDeletePosition(node); $event.stopPropagation()"
                              matTooltip="Delete Position" class="text-gray-600 hover:text-red-600">
                        <mat-icon>delete</mat-icon>
                      </button>
                    </div>
                  </div>
                </div>
                
              </li>
            </mat-nested-tree-node>

          </mat-tree>
        }
      </mat-card-content>
    </mat-card>
  `,
  styles: [
    `
    ul, li {
      margin-top: 0;
      margin-bottom: 0;
      list-style-type: none;
      padding-left: 0;
    }
    `,
  ],
})
export class PositionTreeComponent implements OnInit {
  private positionService = inject(PositionService)

  treeControl = new NestedTreeControl<Position>((node) => node.children)
  dataSource = new MatTreeNestedDataSource<Position>()
  selectedPosition = signal<Position | null>(null)

  @Output() deleteRequested = new EventEmitter<Position>()

  ngOnInit(): void {
    this.positionService.positions$.subscribe((positions) => {
      console.log("[v0] Tree received positions:", positions.length)
      this.dataSource.data = positions

      if (positions.length > 0) {
        setTimeout(() => {
          this.treeControl.expandAll()
          console.log("[v0] Tree expanded all nodes")
        }, 100)
      }
    })

    this.positionService.selectedPosition$.subscribe((position) => {
      this.selectedPosition.set(position)
    })

    this.positionService.refreshPositions()
  }

  hasChild = (_: number, node: Position) => !!node.children && node.children.length > 0

  hasNoChild = (_: number, node: Position) => node.children && node.children.length == 0

  selectPosition(position: Position): void {
    this.positionService.selectPosition(position)
  }

  editPosition(position: Position): void {
    this.positionService.setEditMode(true)
    this.positionService.selectPosition(position)
  }

  onDeletePosition(position: Position): void {
    this.deleteRequested.emit(position)
  }
}
