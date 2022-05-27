// Drag and Drop Interface
export interface Draggable{
  // Handle Drag Start
  dragStarteHandler(event: DragEvent): void;
  // Handle Drag end
  dragEndHandler(event: DragEvent): void;
}

export interface DragTarget{
  // Signal browser that the thing we are dragging over is a valid drag target
  dragOverHandler(event: DragEvent):void;
  // To react to drop
  dropHandler(event: DragEvent):void;
  // For visual feedback
  dragLeaveHandler(event: DragEvent):void;
}
