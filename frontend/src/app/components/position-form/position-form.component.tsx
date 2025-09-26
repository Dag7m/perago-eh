import { Component, inject, type OnInit, signal } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormBuilder, type FormGroup, Validators, ReactiveFormsModule } from "@angular/forms"
import { MatCardModule } from "@angular/material/card"
import { MatFormFieldModule } from "@angular/material/form-field"
import { MatInputModule } from "@angular/material/input"
import { MatSelectModule } from "@angular/material/select"
import { MatButtonModule } from "@angular/material/button"
import { MatSnackBar } from "@angular/material/snack-bar"

import type { Position, CreatePositionDto } from "../../models/position.model"
import { PositionService } from "../../services/position.service"

@Component({
  selector: "app-position-form",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
  ],
  template: `
    <mat-card class="h-fit">
      <mat-card-header>
        <mat-card-title>
          {{ isEditing() ? 'Edit Position' : 'Create New Position' }}
        </mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <form [formGroup]="positionForm" (ngSubmit)="onSubmit()" class="flex flex-col gap-4 py-4">
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Position Name</mat-label>
            <input matInput class="focus:outline-none focus:ring-0" formControlName="name" placeholder="e.g., CEO, CTO, Manager">
            @if (positionForm.get('name')?.hasError('required') && positionForm.get('name')?.touched) {
              <mat-error>Position name is required</mat-error>
            }
            @if (positionForm.get('name')?.hasError('maxlength')) {
              <mat-error>Position name cannot exceed 100 characters</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Description</mat-label>
            <textarea matInput formControlName="description" 
                     placeholder="Brief description of the position"
                     rows="3"
                     class="focus:outline-none focus:ring-0"
                     ></textarea>
                     
            @if (positionForm.get('description')?.hasError('maxlength')) {
              <mat-error>Description cannot exceed 500 characters</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Parent Position</mat-label>
            <mat-select formControlName="parentId">
              <mat-option [value]="null">No Parent (Root Position)</mat-option>
              @for (position of availableParents(); track position.id) {
                <mat-option [value]="position.id">{{ position.name }}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <div class="flex gap-3 mt-4">
            <button mat-raised-button color="primary" type="submit" 
                    [disabled]="positionForm.invalid || isSubmitting()"
                    class="min-w-32">
              {{ isSubmitting() ? 'Saving...' : (isEditing() ? 'Update Position' : 'Create Position') }}
            </button>
            @if (isEditing()) {
              <button mat-button type="button" (click)="cancelEdit()" class="min-w-32">
                Cancel
              </button>
            }
          </div>
        </form>
      </mat-card-content>
    </mat-card>
  `,
  styles: [],
})
export class PositionFormComponent implements OnInit {
  private fb = inject(FormBuilder)
  private positionService = inject(PositionService)
  private snackBar = inject(MatSnackBar)

  positionForm: FormGroup
  isEditing = signal(false)
  isSubmitting = signal(false)
  availableParents = signal<Position[]>([])
  currentPosition = signal<Position | null>(null)

  constructor() {
    this.positionForm = this.fb.group({
      name: ["", [Validators.required, Validators.maxLength(100)]],
      description: ["", [Validators.maxLength(500)]],
      parentId: [null],
    })
  }

  ngOnInit(): void {
    this.positionService.positions$.subscribe((positions) => {
      this.updateAvailableParents(positions)
    })

    this.positionService.selectedPosition$.subscribe((position) => {
      if (position) {
        this.loadPositionForEdit(position)
      } else {
        this.resetForm()
      }
    })
  }

  private updateAvailableParents(positions: Position[]): void {
    const flatPositions = this.flattenPositions(positions)
    const currentId = this.currentPosition()?.id

    const available = flatPositions.filter(
      (p) => p.id !== currentId && !this.isDescendant(p.id, currentId, flatPositions),
    )

    this.availableParents.set(available)
  }

  private flattenPositions(positions: Position[]): Position[] {
    const result: Position[] = []

    const flatten = (items: Position[]) => {
      for (const item of items) {
        result.push(item)
        if (item.children) {
          flatten(item.children)
        }
      }
    }

    flatten(positions)
    return result
  }

  private isDescendant(positionId: string, ancestorId: string | undefined, allPositions: Position[]): boolean {
    if (!ancestorId) return false

    const position = allPositions.find((p) => p.id === positionId)
    if (!position || !position.parentId) return false

    if (position.parentId === ancestorId) return true

    return this.isDescendant(position.parentId, ancestorId, allPositions)
  }

  private loadPositionForEdit(position: Position): void {
    this.currentPosition.set(position)
    this.isEditing.set(true)

    this.positionForm.patchValue({
      name: position.name,
      description: position.description,
      parentId: position.parentId || null,
    })
  }

  private resetForm(): void {
    this.currentPosition.set(null)
    this.isEditing.set(false)
    this.positionForm.reset()
    this.positionForm.patchValue({ parentId: null })
  }

  onSubmit(): void {
    if (this.positionForm.valid) {
      this.isSubmitting.set(true)

      const formValue = this.positionForm.value
      const positionData: CreatePositionDto = {
        name: formValue.name,
        description: formValue.description || "",
        parentId: formValue.parentId || undefined,
      }

      const operation = this.isEditing()
        ? this.positionService.updatePosition(this.currentPosition()!.id, positionData)
        : this.positionService.createPosition(positionData)

      operation.subscribe({
        next: () => {
          const message = this.isEditing() ? "Position updated successfully" : "Position created successfully"
          this.snackBar.open(message, "Close", { duration: 3000 })
          this.resetForm()
          this.isSubmitting.set(false)
        },
        error: (error) => {
          console.error("Error saving position:", error)
          this.snackBar.open("Error saving position. Please try again.", "Close", { duration: 5000 })
          this.isSubmitting.set(false)
        },
      })
    }
  }

  cancelEdit(): void {
    this.resetForm()
    this.positionService.selectPosition(null)
  }
}
