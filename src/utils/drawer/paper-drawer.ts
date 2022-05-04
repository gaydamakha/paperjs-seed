import { DashProps, Drawer } from "./drawer";
import { pointToPaperPoint } from "../../plan/paper-plan";
import * as paper from "paper";
import { Point } from "../../plan/point";

interface ItemsArray {
  [key: string]: paper.Item;
}

export class PaperDrawer implements Drawer {
  private items: ItemsArray = {};
  public drawLine(
    id: string,
    start: Point,
    end: Point,
    color: string,
    dashProps: DashProps | null = null
  ): void {
    this.erase(id);
    const item = new paper.Path([
      pointToPaperPoint(start),
      pointToPaperPoint(end),
    ]);
    item.strokeWidth = 0.75;
    item.strokeColor = new paper.Color(color);
    if (dashProps !== null) {
      item.dashArray = [dashProps.dashLength, dashProps.gapLength];
    }
    this.items[id] = item;
  }

  public erase(id: string): void {
    this.items[id]?.remove();
  }
}
