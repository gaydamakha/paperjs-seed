import { Point } from "../../plan/point";

export interface DashProps {
  dashLength: number;
  gapLength: number;
}

export interface LineProps {
  start: Point;
  end: Point;
  color: string;
  lineWidth?: number;
  dashProps?: DashProps;
}

export interface Drawer {
  drawLine(id: string, props: LineProps): void;
  erase(id: string): void;
}
