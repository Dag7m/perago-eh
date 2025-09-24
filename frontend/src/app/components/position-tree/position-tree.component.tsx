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
    <mat-card class="tree-card">
      <mat-card-header>
        <mat-card-title>Organization Hierarchy</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        @if (dataSource.data.length === 0) {
          <div class="empty-state">
            <mat-icon>business</mat-icon>
            <p>No positions created yet</p>
          </div>
        } @else {
          <mat-tree [dataSource]="dataSource" [treeControl]="treeControl" class="position-tree">
            <mat-tree-node *matTreeNodeDef="let node" matTreeNodeToggle>
              <li class="mat-tree-node">
                <button mat-icon-button disabled></button>
                <div class="node-content" 
                     [class.selected]="selectedPosition()?.id === node.id"
                     (click)="selectPosition(node)">
                  <div class="node-info">
                    <span class="node-name">{{ node.name }}</span>
                    <span class="node-description">{{ node.description }}</span>
                  </div>
                  <div class="node-actions">
                    <button mat-icon-button (click)="editPosition(node); $event.stopPropagation()" 
                            matTooltip="Edit Position">
                      <mat-icon>edit</mat-icon>
                    </button>
                    <button mat-icon-button color="warn" (click)="onDeletePosition(node); $event.stopPropagation()"
                            matTooltip="Delete Position">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </div>
                </div>
              </li>
            </mat-tree-node>

            <mat-nested-tree-node *matTreeNodeDef="let node; when: hasChild">
              <li>
                <div class="mat-tree-node">
                  <button mat-icon-button matTreeNodeToggle
                          [attr.aria-label]="'Toggle ' + node.name">
                    <mat-icon class="mat-icon-rtl-mirror">
                      {{ treeControl.isExpanded(node) ? 'expand_more' : 'chevron_right' }}
                    </mat-icon>
                  </button>
                  <div class="node-content" 
                       [class.selected]="selectedPosition()?.id === node.id"
                       (click)="selectPosition(node)">
                    <div class="node-info">
                      <span class="node-name">{{ node.name }}</span>
                      <span class="node-description">{{ node.description }}</span>
                    </div>
                    <div class="node-actions">
                      <button mat-icon-button (click)="editPosition(node); $event.stopPropagation()"
                              matTooltip="Edit Position">
                        <mat-icon>edit</mat-icon>
                      </button>
                      <button mat-icon-button color="warn" (click)="onDeletePosition(node); $event.stopPropagation()"
                              matTooltip="Delete Position">
                        <mat-icon>delete</mat-icon>
                      </button>
                    </div>
                  </div>
                </div>
                <ul [class.position-tree-invisible]="!treeControl.isExpanded(node)">
                  <ng-container matTreeNodeOutlet></ng-container>
                </ul>
              </li>
            </mat-nested-tree-node>
          </mat-tree>
        }
      </mat-card-content>
    </mat-card>
  `,
  styles: [
    `
    .tree-card {
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .position-tree {
      flex: 1;
      overflow: auto;
    }

    .position-tree-invisible {
      display: none;
    }

    .mat-tree-node {
      display: flex;
      align-items: center;
      min-height: 48px;
      padding-left: 8px;
    }

    .node-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex: 1;
      padding: 12px 16px;
      margin: 2px 0;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      border: 2px solid transparent;
      min-height: 44px;
    }

    .node-content:hover {
      background-color: #f5f5f5;
    }

    .node-content.selected {
      background-color: #e3f2fd;
      border-color: #2196f3;
    }

    .node-info {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-width: 0;
    }

    .node-name {
      font-weight: 500;
      font-size: 14px;
      color: #333;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .node-description {
      font-size: 12px;
      color: #666;
      margin-top: 2px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .node-actions {
      display: flex;
      gap: 4px;
      opacity: 0;
      transition: opacity 0.2s ease;
      flex-shrink: 0;
    }

    .node-content:hover .node-actions {
      opacity: 1;
    }

    .node-content.selected .node-actions {
      opacity: 1;
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

    ul, li {
      margin-top: 0;
      margin-bottom: 0;
      list-style-type: none;
      padding-left: 0;
    }

    mat-nested-tree-node ul {
      padding-left: 40px;
      border-left: 1px dashed #ddd;
      margin-left: 20px;
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
      this.dataSource.data = positions
      this.treeControl.expandAll()
    })

    this.positionService.selectedPosition$.subscribe((position) => {
      this.selectedPosition.set(position)
    })

    this.positionService.refreshPositions()
  }

  hasChild = (_: number, node: Position) => !!node.children && node.children.length > 0

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
