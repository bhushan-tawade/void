import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Stage,
  Layer,
  Rect,
  Circle,
  Text,
  Line,
  Arrow,
  Group,
  Transformer,
  Ellipse,
  Star,
  RegularPolygon,
} from "react-konva";

// --- Types & Helpers --------------------------------------------------------
const TOOLS = {
  SELECT: "select",
  RECT_SELECT: "rect_select",
  RECT: "rect",
  CIRCLE: "circle",
  ELLIPSE: "ellipse",
  ARROW: "arrow",
  TEXT: "text",
  PEN: "pen",
  ERASER: "eraser",
  HAND: "hand",
  TRIANGLE: "triangle",
  STAR: "star",
  HEXAGON: "hexagon",
  DIAMOND: "diamond",
};

const COLOR_PALETTE = [
  "#000000",
  "#374151",
  "#6b7280",
  "#9ca3af",
  "#d1d5db",
  "#f3f4f6",
  "#ffffff",
  "#dc2626",
  "#ea580c",
  "#d97706",
  "#ca8a04",
  "#65a30d",
  "#16a34a",
  "#059669",
  "#0891b2",
  "#0284c7",
  "#2563eb",
  "#4f46e5",
  "#7c3aed",
  "#a21caf",
  "#be185d",
  "#fef2f2",
  "#fef3c7",
  "#ecfdf5",
  "#f0f9ff",
  "#f3e8ff",
];

function uid(prefix = "el") {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

function downloadURI(uri, name) {
  const link = document.createElement("a");
  link.download = name;
  link.href = uri;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function isPointInRect(point, rect) {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  );
}

// --- Color Palette Component -----------------------------------------------
function ColorPalette({ selectedColor, onColorSelect, type = "fill" }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-8 h-6 border-2 border-gray-300 rounded"
        style={{ backgroundColor: selectedColor }}
        title={`${type} Color`}
      />
      {isOpen && (
        <div className="absolute top-8 left-0 z-50 bg-white border rounded-lg shadow-lg p-2 grid grid-cols-7 gap-1">
          {COLOR_PALETTE.map((color) => (
            <button
              key={color}
              onClick={() => {
                onColorSelect(color);
                setIsOpen(false);
              }}
              className="w-6 h-6 border border-gray-300 rounded hover:scale-110 transition-transform"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// --- Toolbar Component ------------------------------------------------------
function Toolbar({
  tool,
  setTool,
  undo,
  redo,
  canUndo,
  canRedo,
  onDelete,
  onExportPNG,
  onExportJSON,
  onImportJSON,
  zoom,
  setZoom,
  fillColor,
  setFillColor,
  strokeColor,
  setStrokeColor,
  strokeWidth,
  setStrokeWidth,
  selectedElements,
  onCopy,
  onPaste,
  onDuplicate,
  onGroup,
  onUngroup,
}) {
  const fileInputRef = useRef(null);

  const toolButtons = [
    { key: TOOLS.SELECT, label: "Select", icon: "↖️" },
    { key: TOOLS.RECT_SELECT, label: "Rect Select", icon: "⬜" },
    { key: TOOLS.HAND, label: "Hand", icon: "✋" },
    { key: TOOLS.PEN, label: "Pen", icon: "✏️" },
    { key: TOOLS.RECT, label: "Rectangle", icon: "▭" },
    { key: TOOLS.CIRCLE, label: "Circle", icon: "○" },
    { key: TOOLS.ELLIPSE, label: "Ellipse", icon: "⬭" },
    { key: TOOLS.TRIANGLE, label: "Triangle", icon: "△" },
    { key: TOOLS.DIAMOND, label: "Diamond", icon: "◇" },
    { key: TOOLS.STAR, label: "Star", icon: "★" },
    { key: TOOLS.HEXAGON, label: "Hexagon", icon: "⬡" },
    { key: TOOLS.ARROW, label: "Arrow", icon: "→" },
    { key: TOOLS.TEXT, label: "Text", icon: "T" },
    { key: TOOLS.ERASER, label: "Eraser", icon: "🗑️" },
  ];

  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 bg-white/90 backdrop-blur border rounded-2xl shadow-lg p-2">
      <div className="flex items-center gap-2 text-sm mb-2">
        {toolButtons.map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => setTool(key)}
            className={`px-2 py-1 rounded-lg border transition-colors ${
              tool === key
                ? "bg-blue-500 text-white border-blue-500"
                : "bg-white hover:bg-gray-100 border-gray-300"
            }`}
            title={label}
          >
            <span className="text-xs">{icon}</span>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 text-sm">
        <div className="flex items-center gap-1">
          <span className="text-xs">Fill:</span>
          <ColorPalette
            selectedColor={fillColor}
            onColorSelect={setFillColor}
            type="fill"
          />
        </div>

        <div className="flex items-center gap-1">
          <span className="text-xs">Stroke:</span>
          <ColorPalette
            selectedColor={strokeColor}
            onColorSelect={setStrokeColor}
            type="stroke"
          />
        </div>

        <div className="flex items-center gap-1">
          <span className="text-xs">Width:</span>
          <input
            type="range"
            min="1"
            max="10"
            value={strokeWidth}
            onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
            className="w-16"
          />
          <span className="text-xs w-6">{strokeWidth}</span>
        </div>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <button
          onClick={undo}
          disabled={!canUndo}
          className="px-2 py-1 rounded-lg border disabled:opacity-40 text-xs"
        >
          ↶
        </button>
        <button
          onClick={redo}
          disabled={!canRedo}
          className="px-2 py-1 rounded-lg border disabled:opacity-40 text-xs"
        >
          ↷
        </button>

        {selectedElements.length > 0 && (
          <>
            <button
              onClick={onDelete}
              className="px-2 py-1 rounded-lg border text-xs"
            >
              Delete
            </button>
            <button
              onClick={onCopy}
              className="px-2 py-1 rounded-lg border text-xs"
            >
              Copy
            </button>
            <button
              onClick={onDuplicate}
              className="px-2 py-1 rounded-lg border text-xs"
            >
              Duplicate
            </button>
            {selectedElements.length > 1 && (
              <button
                onClick={onGroup}
                className="px-2 py-1 rounded-lg border text-xs"
              >
                Group
              </button>
            )}
          </>
        )}
        <button
          onClick={onPaste}
          className="px-2 py-1 rounded-lg border text-xs"
        >
          Paste
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <div className="flex items-center gap-1">
          <span className="text-xs">Zoom:</span>
          <input
            type="range"
            min="0.25"
            max="3"
            step="0.05"
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            className="w-16"
          />
          <span className="text-xs min-w-[3ch]">{Math.round(zoom * 100)}%</span>
        </div>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <button
          onClick={onExportPNG}
          className="px-2 py-1 rounded-lg border text-xs"
        >
          PNG
        </button>
        <button
          onClick={onExportJSON}
          className="px-2 py-1 rounded-lg border text-xs"
        >
          JSON
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-2 py-1 rounded-lg border text-xs"
        >
          Import
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={onImportJSON}
        />
      </div>
    </div>
  );
}

// --- Shape Components -------------------------------------------------------
const Shape = ({ shape, isSelected, onSelect, onChange }) => {
  const shapeRef = useRef();
  const trRef = useRef();

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  const common = {
    draggable: true,
    onClick: onSelect,
    onTap: onSelect,
    onDragEnd: (e) => onChange({ x: e.target.x(), y: e.target.y() }),
    onTransformEnd: () => {
      const node = shapeRef.current;
      if (!node) return;

      const scaleX = node.scaleX();
      const scaleY = node.scaleY();
      node.scaleX(1);
      node.scaleY(1);

      const newAttrs = {
        x: node.x(),
        y: node.y(),
        rotation: node.rotation(),
      };

      if (shape.type === "rect") {
        newAttrs.width = Math.max(5, node.width() * scaleX);
        newAttrs.height = Math.max(5, node.height() * scaleY);
      } else if (shape.type === "circle") {
        newAttrs.radius = Math.max(5, node.radius() * ((scaleX + scaleY) / 2));
      } else if (shape.type === "text") {
        newAttrs.fontSize = Math.max(8, node.fontSize() * scaleX);
      } else if (shape.type === "ellipse") {
        newAttrs.radiusX = Math.max(5, node.radiusX() * scaleX);
        newAttrs.radiusY = Math.max(5, node.radiusY() * scaleY);
      } else if (shape.type === "star") {
        newAttrs.outerRadius = Math.max(
          5,
          node.outerRadius() * ((scaleX + scaleY) / 2)
        );
        newAttrs.innerRadius = Math.max(
          5,
          node.innerRadius() * ((scaleX + scaleY) / 2)
        );
      } else if (shape.type === "triangle" || shape.type === "hexagon") {
        newAttrs.radius = Math.max(5, node.radius() * ((scaleX + scaleY) / 2));
      } else if (shape.type === "diamond") {
        newAttrs.width = Math.max(5, node.width() * scaleX);
        newAttrs.height = Math.max(5, node.height() * scaleY);
      }

      onChange(newAttrs);
    },
  };

  switch (shape.type) {
    case "rect":
      return (
        <Group>
          <Rect
            id={shape.id}
            ref={shapeRef}
            x={shape.x}
            y={shape.y}
            width={shape.width}
            height={shape.height}
            fill={shape.fill}
            stroke={shape.stroke}
            strokeWidth={shape.strokeWidth}
            cornerRadius={4}
            {...common}
          />
          {isSelected && <Transformer ref={trRef} rotateEnabled={true} />}
        </Group>
      );

    case "circle":
      return (
        <Group>
          <Circle
            id={shape.id}
            ref={shapeRef}
            x={shape.x}
            y={shape.y}
            radius={shape.radius}
            fill={shape.fill}
            stroke={shape.stroke}
            strokeWidth={shape.strokeWidth}
            {...common}
          />
          {isSelected && (
            <Transformer
              ref={trRef}
              rotateEnabled={true}
              enabledAnchors={[
                "top-left",
                "top-right",
                "bottom-left",
                "bottom-right",
              ]}
            />
          )}
        </Group>
      );

    case "ellipse":
      return (
        <Group>
          <Ellipse
            id={shape.id}
            ref={shapeRef}
            x={shape.x}
            y={shape.y}
            radiusX={shape.radiusX || shape.width / 2}
            radiusY={shape.radiusY || shape.height / 2}
            fill={shape.fill}
            stroke={shape.stroke}
            strokeWidth={shape.strokeWidth}
            {...common}
          />
          {isSelected && <Transformer ref={trRef} rotateEnabled={true} />}
        </Group>
      );

    case "triangle":
      return (
        <Group>
          <RegularPolygon
            id={shape.id}
            ref={shapeRef}
            x={shape.x}
            y={shape.y}
            sides={3}
            radius={shape.radius}
            fill={shape.fill}
            stroke={shape.stroke}
            strokeWidth={shape.strokeWidth}
            {...common}
          />
          {isSelected && <Transformer ref={trRef} rotateEnabled={true} />}
        </Group>
      );

    case "diamond":
      return (
        <Group>
          <RegularPolygon
            id={shape.id}
            ref={shapeRef}
            x={shape.x}
            y={shape.y}
            sides={4}
            radius={shape.radius}
            fill={shape.fill}
            stroke={shape.stroke}
            strokeWidth={shape.strokeWidth}
            {...common}
          />
          {isSelected && <Transformer ref={trRef} rotateEnabled={true} />}
        </Group>
      );

    case "star":
      return (
        <Group>
          <Star
            id={shape.id}
            ref={shapeRef}
            x={shape.x}
            y={shape.y}
            numPoints={shape.numPoints || 5}
            innerRadius={shape.innerRadius}
            outerRadius={shape.outerRadius}
            fill={shape.fill}
            stroke={shape.stroke}
            strokeWidth={shape.strokeWidth}
            {...common}
          />
          {isSelected && <Transformer ref={trRef} rotateEnabled={true} />}
        </Group>
      );

    case "hexagon":
      return (
        <Group>
          <RegularPolygon
            id={shape.id}
            ref={shapeRef}
            x={shape.x}
            y={shape.y}
            sides={6}
            radius={shape.radius}
            fill={shape.fill}
            stroke={shape.stroke}
            strokeWidth={shape.strokeWidth}
            {...common}
          />
          {isSelected && <Transformer ref={trRef} rotateEnabled={true} />}
        </Group>
      );

    case "arrow":
      return (
        <Group>
          <Arrow
            id={shape.id}
            ref={shapeRef}
            points={shape.points}
            stroke={shape.stroke}
            strokeWidth={shape.strokeWidth}
            pointerLength={12}
            pointerWidth={12}
            {...common}
          />
          {isSelected && (
            <Transformer
              ref={trRef}
              rotateEnabled={false}
              enabledAnchors={[]}
            />
          )}
        </Group>
      );

    case "text":
      return (
        <Group>
          <Text
            id={shape.id}
            ref={shapeRef}
            x={shape.x}
            y={shape.y}
            text={shape.text}
            fontSize={shape.fontSize}
            fill={shape.fill}
            {...common}
            onDblClick={() => {
              const newText = prompt("Edit text", shape.text);
              if (newText !== null) onChange({ text: newText });
            }}
          />
          {isSelected && (
            <Transformer
              ref={trRef}
              rotateEnabled={false}
              enabledAnchors={["middle-left", "middle-right"]}
            />
          )}
        </Group>
      );

    case "pen":
      return (
        <Line
          id={shape.id}
          points={shape.points}
          stroke={shape.stroke}
          strokeWidth={shape.strokeWidth}
          lineCap="round"
          lineJoin="round"
          tension={0.3}
        />
      );

    default:
      return null;
  }
};

// --- Selection Rectangle Component ------------------------------------------
const SelectionRect = ({ rect }) => {
  if (!rect || rect.width < 1 || rect.height < 1) return null;
  return (
    <Group>
      <Rect
        x={rect.x}
        y={rect.y}
        width={rect.width}
        height={rect.height}
        stroke="#2563eb"
        strokeWidth={1.5}
        dash={[8, 4]}
        fill="rgba(37, 99, 235, 0.08)"
        listening={false}
      />
      {/* Corner indicators */}
      <Circle
        x={rect.x}
        y={rect.y}
        radius={3}
        fill="#2563eb"
        listening={false}
      />
      <Circle
        x={rect.x + rect.width}
        y={rect.y}
        radius={3}
        fill="#2563eb"
        listening={false}
      />
      <Circle
        x={rect.x}
        y={rect.y + rect.height}
        radius={3}
        fill="#2563eb"
        listening={false}
      />
      <Circle
        x={rect.x + rect.width}
        y={rect.y + rect.height}
        radius={3}
        fill="#2563eb"
        listening={false}
      />
    </Group>
  );
};

// --- Main Whiteboard --------------------------------------------------------
export default function VoidCanvasWhiteboard() {
  const stageRef = useRef();
  const layerRef = useRef();

  const [tool, setTool] = useState(TOOLS.SELECT);
  const [elements, setElements] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [history, setHistory] = useState([]);
  const [future, setFuture] = useState([]);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [selectionRect, setSelectionRect] = useState(null);
  const [clipboard, setClipboard] = useState([]);

  // Style states
  const [fillColor, setFillColor] = useState("#dbeafe");
  const [strokeColor, setStrokeColor] = useState("#1e293b");
  const [strokeWidth, setStrokeWidth] = useState(2);

  const spacePressed = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });

  const selectedElements = elements.filter((el) => selectedIds.includes(el.id));

  // --- History helpers
  const pushHistory = (next) => {
    setHistory((h) => [...h, elements]);
    setFuture([]);
    setElements(next);
  };

  const undo = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setFuture((f) => [elements, ...f]);
    setElements(prev);
    setHistory((h) => h.slice(0, -1));
    setSelectedIds([]);
  };

  const redo = () => {
    if (future.length === 0) return;
    const [next, ...rest] = future;
    setHistory((h) => [...h, elements]);
    setElements(next);
    setFuture(rest);
    setSelectedIds([]);
  };

  const canUndo = history.length > 0;
  const canRedo = future.length > 0;

  // --- Keyboard shortcuts
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.code === "Space" && !spacePressed.current) {
        spacePressed.current = true;
        setTool(TOOLS.HAND);
        e.preventDefault();
      }
      if (
        (e.ctrlKey || e.metaKey) &&
        e.key.toLowerCase() === "z" &&
        !e.shiftKey
      ) {
        e.preventDefault();
        undo();
      }
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key.toLowerCase() === "y" ||
          (e.key.toLowerCase() === "z" && e.shiftKey))
      ) {
        e.preventDefault();
        redo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "c") {
        e.preventDefault();
        onCopy();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "v") {
        e.preventDefault();
        onPaste();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "d") {
        e.preventDefault();
        onDuplicate();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "a") {
        e.preventDefault();
        setSelectedIds(elements.map((el) => el.id));
      }
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        onDelete();
      }
      if (e.key === "Escape") {
        setSelectedIds([]);
        setSelectionRect(null);
      }
    };

    const onKeyUp = (e) => {
      if (e.code === "Space") {
        spacePressed.current = false;
        setTool(TOOLS.SELECT);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [elements, selectedIds]);

  // --- Pointer handlers
  const stagePosToWorld = (pos) => {
    const stage = stageRef.current;
    const pointer = pos ?? stage.getPointerPosition();
    if (!pointer) return { x: 0, y: 0 };
    const x = (pointer.x - offset.x) / zoom;
    const y = (pointer.y - offset.y) / zoom;
    return { x, y };
  };

  const handleMouseDown = (e) => {
    const clickedOnEmpty = e.target === e.target.getStage();
    const pointer = stagePosToWorld();
    startPos.current = pointer;

    if (tool === TOOLS.SELECT) {
      if (clickedOnEmpty) {
        setSelectedIds([]);
      }
      return;
    }

    if (tool === TOOLS.RECT_SELECT) {
      if (clickedOnEmpty) {
        setIsDrawing(true);
        setSelectionRect({ x: pointer.x, y: pointer.y, width: 0, height: 0 });
      }
      return;
    }

    if (tool === TOOLS.HAND) {
      setIsDrawing(true);
      return;
    }

    setIsDrawing(true);
    const id = uid("shape");

    const baseProps = {
      id,
      x: pointer.x,
      y: pointer.y,
      fill: fillColor,
      stroke: strokeColor,
      strokeWidth: strokeWidth,
    };

    let newElement;

    switch (tool) {
      case TOOLS.RECT:
        newElement = { ...baseProps, type: "rect", width: 1, height: 1 };
        break;
      case TOOLS.CIRCLE:
        newElement = { ...baseProps, type: "circle", radius: 1 };
        break;
      case TOOLS.ELLIPSE:
        newElement = { ...baseProps, type: "ellipse", radiusX: 1, radiusY: 1 };
        break;
      case TOOLS.TRIANGLE:
        newElement = { ...baseProps, type: "triangle", radius: 1 };
        break;
      case TOOLS.DIAMOND:
        newElement = { ...baseProps, type: "diamond", radius: 1 };
        break;
      case TOOLS.STAR:
        newElement = {
          ...baseProps,
          type: "star",
          outerRadius: 1,
          innerRadius: 0.5,
          numPoints: 5,
        };
        break;
      case TOOLS.HEXAGON:
        newElement = { ...baseProps, type: "hexagon", radius: 1 };
        break;
      case TOOLS.ARROW:
        newElement = {
          ...baseProps,
          type: "arrow",
          points: [pointer.x, pointer.y, pointer.x, pointer.y],
        };
        break;
      case TOOLS.TEXT:
        newElement = {
          ...baseProps,
          type: "text",
          text: "Text",
          fontSize: 18,
          fill: strokeColor,
        };
        break;
      case TOOLS.PEN:
        newElement = {
          ...baseProps,
          type: "pen",
          points: [pointer.x, pointer.y],
          stroke: strokeColor,
        };
        break;
      case TOOLS.ERASER:
        newElement = {
          ...baseProps,
          type: "pen",
          points: [pointer.x, pointer.y],
          stroke: "#ffffff",
          strokeWidth: 14,
        };
        break;
      default:
        return;
    }

    pushHistory([...elements, newElement]);
    setSelectedIds([id]);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return;

    const pointer = stagePosToWorld();

    if (tool === TOOLS.HAND) {
      const dx = e.evt.movementX;
      const dy = e.evt.movementY;
      setOffset((o) => ({ x: o.x + dx, y: o.y + dy }));
      return;
    }

    if (tool === TOOLS.RECT_SELECT && selectionRect) {
      const width = pointer.x - startPos.current.x;
      const height = pointer.y - startPos.current.y;
      setSelectionRect({
        x: width >= 0 ? startPos.current.x : pointer.x,
        y: height >= 0 ? startPos.current.y : pointer.y,
        width: Math.abs(width),
        height: Math.abs(height),
      });
      return;
    }

    // Update last element
    setElements((els) => {
      const next = [...els];
      const idx = next.length - 1;
      const el = { ...next[idx] };
      if (!el) return els;

      const dx = pointer.x - el.x;
      const dy = pointer.y - el.y;

      switch (el.type) {
        case "rect":
          el.width = Math.max(1, Math.abs(dx));
          el.height = Math.max(1, Math.abs(dy));
          if (dx < 0) el.x = pointer.x;
          if (dy < 0) el.y = pointer.y;
          break;
        case "circle":
          el.radius = Math.max(1, Math.hypot(dx, dy));
          break;
        case "ellipse":
          el.radiusX = Math.max(1, Math.abs(dx));
          el.radiusY = Math.max(1, Math.abs(dy));
          break;
        case "triangle":
        case "hexagon":
        case "diamond":
          el.radius = Math.max(1, Math.hypot(dx, dy));
          break;
        case "star":
          const radius = Math.max(1, Math.hypot(dx, dy));
          el.outerRadius = radius;
          el.innerRadius = radius * 0.5;
          break;
        case "arrow":
          el.points = [el.points[0], el.points[1], pointer.x, pointer.y];
          break;
        case "pen":
          el.points = [...el.points, pointer.x, pointer.y];
          break;
      }

      next[idx] = el;
      return next;
    });
  };

  const handleMouseUp = () => {
    if (tool === TOOLS.RECT_SELECT && selectionRect) {
      const stage = stageRef.current;
      const layer = layerRef.current;

      // ✅ Normalize selection rect (always positive width/height)
      const normRect = {
        x: Math.min(selectionRect.x, selectionRect.x + selectionRect.width),
        y: Math.min(selectionRect.y, selectionRect.y + selectionRect.height),
        width: Math.abs(selectionRect.width),
        height: Math.abs(selectionRect.height),
      };

      const selectedInRect = elements.filter((el) => {
        const node = layer.findOne(`#${el.id}`);
        if (!node) return false;

        const box = node.getClientRect({ relativeTo: stage });

        // ✅ containment check
        return (
          box.x >= normRect.x &&
          box.y >= normRect.y &&
          box.x + box.width <= normRect.x + normRect.width &&
          box.y + box.height <= normRect.y + normRect.height
        );
      });

      setSelectedIds(selectedInRect.map((el) => el.id));
      setSelectionRect(null);
    }

    if (
      tool === TOOLS.RECT ||
      tool === TOOLS.CIRCLE ||
      tool === TOOLS.TRIANGLE ||
      tool === TOOLS.ARROW ||
      tool === TOOLS.ELLIPSE ||
      tool === TOOLS.STAR ||
      tool === TOOLS.DIAMOND ||
      tool === TOOLS.HEXAGON ||
      tool === TOOLS.TEXT
    ) {
      setTool(TOOLS.SELECT);
    }
    setIsDrawing(false);
  };

  // Zoom with wheel
  const handleWheel = (e) => {
    e.evt.preventDefault();
    const scaleBy = 1.1;
    const stage = stageRef.current;
    const oldScale = zoom;
    const mousePoint = stage.getPointerPosition();
    if (!mousePoint) return;

    const worldPos = stagePosToWorld(mousePoint);

    const direction = e.evt.deltaY > 0 ? -1 : 1;
    const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;
    const newZoom = Math.min(3, Math.max(0.25, newScale));

    const newPos = {
      x: mousePoint.x - worldPos.x * newZoom,
      y: mousePoint.y - worldPos.y * newZoom,
    };

    setZoom(newZoom);
    setOffset(newPos);
  };

  const onSelectShape = (id) => {
    setSelectedIds([id]);
  };

  const updateShape = (id, attrs) => {
    setElements((els) =>
      els.map((s) => (s.id === id ? { ...s, ...attrs } : s))
    );
  };

  const onDelete = () => {
    if (selectedIds.length === 0) return;
    pushHistory(elements.filter((s) => !selectedIds.includes(s.id)));
    setSelectedIds([]);
  };

  const onCopy = () => {
    if (selectedIds.length === 0) return;
    const selectedElements = elements.filter((el) =>
      selectedIds.includes(el.id)
    );
    setClipboard(selectedElements);
  };

  const onPaste = () => {
    if (clipboard.length === 0) return;

    const newElements = clipboard.map((el) => ({
      ...el,
      id: uid("shape"),
      x: el.x + 20,
      y: el.y + 20,
    }));

    pushHistory([...elements, ...newElements]);
    setSelectedIds(newElements.map((el) => el.id));
  };

  const onDuplicate = () => {
    if (selectedIds.length === 0) return;

    const selectedElements = elements.filter((el) =>
      selectedIds.includes(el.id)
    );
    const newElements = selectedElements.map((el) => ({
      ...el,
      id: uid("shape"),
      x: el.x + 20,
      y: el.y + 20,
    }));

    pushHistory([...elements, ...newElements]);
    setSelectedIds(newElements.map((el) => el.id));
  };

  const onGroup = () => {
    // Simple grouping implementation - could be enhanced
    if (selectedIds.length < 2) return;
    console.log("Grouping selected elements:", selectedIds);
  };

  const onUngroup = () => {
    // Simple ungrouping implementation - could be enhanced
    console.log("Ungrouping selected elements:", selectedIds);
  };

  // Export PNG
  const onExportPNG = () => {
    const stage = stageRef.current;
    if (!stage) return;

    // Temporarily hide selection
    const tempSelectedIds = selectedIds;
    setSelectedIds([]);

    setTimeout(() => {
      const uri = stage.toDataURL({
        pixelRatio: 2,
        quality: 1,
        mimeType: "image/png",
      });
      downloadURI(uri, `whiteboard-${Date.now()}.png`);
      setSelectedIds(tempSelectedIds);
    }, 100);
  };

  // Export JSON
  const onExportJSON = () => {
    const data = JSON.stringify(
      {
        elements,
        metadata: {
          version: "1.0",
          created: new Date().toISOString(),
          zoom,
          offset,
        },
      },
      null,
      2
    );
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    downloadURI(url, `whiteboard-${Date.now()}.json`);
    URL.revokeObjectURL(url);
  };

  // Import JSON
  const onImportJSON = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        if (Array.isArray(parsed.elements)) {
          pushHistory(parsed.elements);
          if (parsed.metadata?.zoom) setZoom(parsed.metadata.zoom);
          if (parsed.metadata?.offset) setOffset(parsed.metadata.offset);
        } else if (Array.isArray(parsed)) {
          // Legacy format support
          pushHistory(parsed);
        }
      } catch (err) {
        console.error("Import error:", err);
        alert("Invalid JSON file");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // Handle stage click for deselection
  const handleStageClick = (e) => {
    // Check if clicked on empty area
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty && tool === TOOLS.SELECT) {
      setSelectedIds([]);
    }
  };

  // Multi-transformer for multiple selection
  const MultiTransformer = () => {
    const transformerRef = useRef();
    const selectedShapes = selectedIds
      .map((id) => stageRef.current?.findOne(`#${id}`))
      .filter(Boolean);

    useEffect(() => {
      if (transformerRef.current && selectedShapes.length > 1) {
        transformerRef.current.nodes(selectedShapes);
        transformerRef.current.getLayer()?.batchDraw();
      }
    }, [selectedShapes]);

    if (selectedIds.length <= 1) return null;

    return <Transformer ref={transformerRef} rotateEnabled={true} />;
  };

  // Stage props
  const stageProps = {
    width: window.innerWidth,
    height: window.innerHeight,
    scaleX: zoom,
    scaleY: zoom,
    x: offset.x,
    y: offset.y,
    onMouseDown: handleMouseDown,
    onMouseMove: handleMouseMove,
    onMouseUp: handleMouseUp,
    onWheel: handleWheel,
    onClick: handleStageClick,
    style: { background: "#ffffff" },
  };
  const grid = useMemo(() => {
    const size = 32;
    const lines = [];
    for (let i = -20000; i <= 20000; i += size) {
      lines.push(
        <Line
          key={`v${i}`}
          points={[i, -20000, i, 20000]}
          stroke="#f0f0f0"
          strokeWidth={1}
          listening={false} // makes sure grid is not selectable
        />
      );
      lines.push(
        <Line
          key={`h${i}`}
          points={[-20000, i, 20000, i]}
          stroke="#f0f0f0"
          strokeWidth={1}
          listening={false}
        />
      );
    }
    return lines;
  }, []);

  return (
    <div className="w-screen h-screen bg-gray-50 text-gray-900 overflow-hidden">
      <Toolbar
        tool={tool}
        setTool={setTool}
        undo={undo}
        redo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
        onDelete={onDelete}
        onExportPNG={onExportPNG}
        onExportJSON={onExportJSON}
        onImportJSON={onImportJSON}
        zoom={zoom}
        setZoom={setZoom}
        fillColor={fillColor}
        setFillColor={setFillColor}
        strokeColor={strokeColor}
        setStrokeColor={setStrokeColor}
        strokeWidth={strokeWidth}
        setStrokeWidth={setStrokeWidth}
        selectedElements={selectedElements}
        onCopy={onCopy}
        onPaste={onPaste}
        onDuplicate={onDuplicate}
        onGroup={onGroup}
        onUngroup={onUngroup}
      />

      <Stage ref={stageRef} {...stageProps}>
        <Layer>{grid}</Layer>
        <Layer ref={layerRef} listening={true}>
          {/* Render all elements */}
          {elements.map((s) => (
            <Shape
              key={s.id}
              shape={s}
              isSelected={
                selectedIds.includes(s.id) && selectedIds.length === 1
              }
              onSelect={() => onSelectShape(s.id)}
              onChange={(attrs) => updateShape(s.id, attrs)}
            />
          ))}

          {/* Multi-selection transformer */}
          <MultiTransformer />

          {/* Selection rectangle */}
          <SelectionRect rect={selectionRect} />
        </Layer>
      </Stage>

      {/* Status bar */}
      <div className="fixed bottom-3 left-3 text-xs text-gray-600 bg-white/80 backdrop-blur border rounded-lg px-3 py-2">
        <div className="flex items-center gap-4">
          <span>Tool: {tool}</span>
          <span>Zoom: {Math.round(zoom * 100)}%</span>
          <span>Elements: {elements.length}</span>
          {selectedIds.length > 0 && (
            <span>Selected: {selectedIds.length}</span>
          )}
        </div>
      </div>

      {/* Tips */}
      <div className="fixed bottom-3 right-3 text-xs text-gray-600 bg-white/80 backdrop-blur border rounded-lg px-3 py-2 max-w-xs">
        <div className="space-y-1">
          <div>
            <kbd className="px-1 bg-gray-200 rounded text-xs">Space</kbd> + drag
            to pan
          </div>
          <div>
            <kbd className="px-1 bg-gray-200 rounded text-xs">Mouse wheel</kbd>{" "}
            to zoom
          </div>
          <div>
            <kbd className="px-1 bg-gray-200 rounded text-xs">Double-click</kbd>{" "}
            text to edit
          </div>
          <div>
            <kbd className="px-1 bg-gray-200 rounded text-xs">Ctrl+Z/Y</kbd>{" "}
            undo/redo
          </div>
          <div>
            <kbd className="px-1 bg-gray-200 rounded text-xs">Ctrl+C/V/D</kbd>{" "}
            copy/paste/duplicate
          </div>
          <div>
            <kbd className="px-1 bg-gray-200 rounded text-xs">Del</kbd> to
            delete selected
          </div>
          <div>
            <kbd className="px-1 bg-gray-200 rounded text-xs">Ctrl+A</kbd>{" "}
            select all
          </div>
          <div>
            <kbd className="px-1 bg-gray-200 rounded text-xs">Esc</kbd> deselect
          </div>
        </div>
      </div>
    </div>
  );
}
