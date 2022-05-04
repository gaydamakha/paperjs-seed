import { Point } from "../../plan/point";

export interface DashProps {
  dashLength: number;
  gapLength: number;
}

export interface Drawer {
  drawLine(
    id: string,
    start: Point,
    end: Point,
    color: string,
    dashProps: DashProps | null
  ): void;
  erase(id: string): void;
}
