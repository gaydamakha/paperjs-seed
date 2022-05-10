import { Drawer, LineProps } from "./drawer";
import { pointToPaperPoint } from "../../plan/paper-plan";
import * as paper from "paper";

interface ItemsArray {
  [key: string]: paper.Item;
}

export class PaperDrawer implements Drawer {
  private items: ItemsArray = {};
  public drawLine(id: string, props: LineProps): void {
    this.erase(id);
    const item = new paper.Path([
      pointToPaperPoint(props.start),
      pointToPaperPoint(props.end),
    ]);
    item.strokeWidth = props.lineWidth ?? 1;
    item.strokeColor = new paper.Color(props.color);
    if (props.dashProps) {
      item.dashArray = [props.dashProps.dashLength, props.dashProps.gapLength];
    }
    this.items[id] = item;
  }

  public erase(id: string): void {
    this.items[id]?.remove();
  }
}
