import { Injectable, inject } from "@angular/core"
import { HttpClient } from "@angular/common/http"
import { type Observable, BehaviorSubject, tap, map } from "rxjs"
import type { Position, CreatePositionDto } from "../models/position.model"

@Injectable({
  providedIn: "root",
})
export class PositionService {
  private http = inject(HttpClient)
  private apiUrl = "http://localhost:5063/api/positions" // Update with your API URL

  private positionsSubject = new BehaviorSubject<Position[]>([])
  public positions$ = this.positionsSubject.asObservable()

  private selectedPositionSubject = new BehaviorSubject<Position | null>(null)
  public selectedPosition$ = this.selectedPositionSubject.asObservable()

  private editModeSubject = new BehaviorSubject<boolean>(false)
  public editMode$ = this.editModeSubject.asObservable()

  private deleteRequestSubject = new BehaviorSubject<Position | null>(null)
  public deleteRequest$ = this.deleteRequestSubject.asObservable()

  private calculateLevels(positions: Position[], level = 0): Position[] {
    return positions.map((position) => ({
      ...position,
      level,
      children: position.children ? this.calculateLevels(position.children, level + 1) : [],
    }))
  }

  getAllPositions(): Observable<Position[]> {
    return this.http.get<Position[]>(this.apiUrl).pipe(
      map((positions) => this.calculateLevels(positions)),
      tap((positions) => this.positionsSubject.next(positions)),
    )
  }

  getHierarchy(): Observable<Position[]> {
    return this.http.get<Position[]>(`${this.apiUrl}/hierarchy`).pipe(
      map((positions) => this.calculateLevels(positions)),
      tap((positions) => this.positionsSubject.next(positions)),
    )
  }

  getPosition(id: string): Observable<Position> {
    return this.http.get<Position>(`${this.apiUrl}/${id}`)
  }

  createPosition(position: CreatePositionDto): Observable<Position> {
    return this.http.post<Position>(this.apiUrl, position).pipe(tap(() => this.refreshPositions()))
  }

  updatePosition(id: string, position: CreatePositionDto): Observable<Position> {
    return this.http.put<Position>(`${this.apiUrl}/${id}`, position).pipe(tap(() => this.refreshPositions()))
  }

  deletePosition(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(tap(() => this.refreshPositions()))
  }

  cascadeDelete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/cascade`).pipe(tap(() => this.refreshPositions()))
  }

  reassignAndDelete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/reassign`).pipe(tap(() => this.refreshPositions()))
  }

  selectPosition(position: Position | null): void {
    this.selectedPositionSubject.next(position)
    if (!position) {
      this.editModeSubject.next(false)
    }
  }

  setEditMode(editing: boolean): void {
    this.editModeSubject.next(editing)
  }

  requestDelete(position: Position): void {
    this.deleteRequestSubject.next(position)
  }

  refreshPositions(): void {
    this.getHierarchy().subscribe({
      next: (positions) => {
        console.log("[v0] Positions refreshed:", positions.length)
      },
      error: (error) => {
        console.error("[v0] Error refreshing positions:", error)
      },
    })
  }

  
}
