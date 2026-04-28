# Drag and Drop Feature

## Overview

Bottles in the wine fridge grid can now be repositioned using drag-and-drop. This feature works on both desktop and mobile devices.

## User Experience

### Desktop

- **Click and drag** any bottle to move it to a different slot
- **Hover feedback**: Slots highlight when you drag a bottle over them
- **Ghost image**: A semi-transparent version of the bottle follows your cursor during drag
- **Auto-swap**: If you drop a bottle on an occupied slot, the bottles automatically swap positions

### Mobile

- **Press and hold** (250ms) to start dragging a bottle
- **Move your finger** to drag the bottle to a new position
- **Release** to drop the bottle in the target slot
- Same visual feedback and swap behavior as desktop

## Technical Implementation

### Architecture

```
page.tsx
├─ useDragAndDrop hook (manages drag state and update logic)
└─ WineFridgeGrid
   └─ DndContext (provides drag-and-drop context)
      ├─ BottleSlot (draggable & droppable)
      │  ├─ BottleCircle (visual feedback)
      │  └─ EmptySlot (visual feedback)
      └─ DragOverlay (ghost image)
```

### Key Components

1. **useDragAndDrop** (`src/hooks/useDragAndDrop.ts`)
   - Manages drag state
   - Handles bottle position updates
   - Implements swap logic using a temporary slot (9999) to avoid unique constraint violations

2. **WineFridgeGrid** (`src/components/WineFridgeGrid.tsx`)
   - Wraps grid in DndContext
   - Configures sensors for pointer and touch input
   - Renders DragOverlay for ghost image

3. **BottleSlot** (`src/components/BottleSlot.tsx`)
   - Makes bottles draggable
   - Makes slots droppable
   - Applies visual feedback (opacity, highlighting)

4. **BottleCircle & EmptySlot** (`src/components/`)
   - Receive `isOver` prop for drop zone highlighting
   - Apply transition animations

### Drag Behavior

- **Empty to Empty**: Bottle moves directly to the new slot
- **Empty to Occupied**: Bottles swap positions using a 3-step process:
  1. Move target bottle to temporary slot (9999)
  2. Move source bottle to target slot
  3. Move target bottle to source slot
- **Cancel**: Drag cancelled if dropped outside valid targets or ESC pressed

This 3-step swap prevents database unique constraint violations on `(space_id, slot_position)`.

### Visual Feedback

- **Source bottle**: 30% opacity during drag
- **Target slot (empty)**: Red border, light red background, red plus icon
- **Target slot (occupied)**: Red ring indicator
- **Ghost image**: 80% opacity, 105% scale

## Browser Compatibility

Works on all modern browsers with support for:

- Pointer Events (desktop drag)
- Touch Events (mobile drag)

## Testing

- ✅ Build passes (`npm run build`)
- ✅ All unit tests pass (`npm test`)
- ✅ Lint checks pass (`npm run lint`)
- ✅ TypeScript compilation successful

## Future Enhancements

Potential improvements:

- Undo/redo functionality
- Multi-select drag (move multiple bottles at once)
- Drag animation customization
- Accessibility improvements (keyboard navigation)
