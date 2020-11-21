import Entity from 'core/Entity';
import { resetCanvas } from 'utils/canvas';
import { deg2rad } from 'utils/math';

const TRIANGLE_ANGLE = (2 * Math.PI) / 3;

export default class CanvasShape extends Entity {
  static config = {
    name: 'CanvasText',
    description: 'Canvas text.',
    type: 'entity',
    defaultProperties: {
      shape: 'Circle',
      width: 100,
      height: 100,
      color: '#FFFFFF',
      strokeColor: '#FFFFFF',
      strokeWidth: 0,
      fill: true,
    },
  };

  constructor(properties, canvas) {
    const {
      config: { name, defaultProperties },
    } = CanvasShape;

    super(name, { ...defaultProperties, ...properties });

    const { width, height, strokeWidth } = this.properties;

    this.canvas = canvas || document.createElement('canvas');
    this.canvas.width = width + strokeWidth;
    this.canvas.height = height + strokeWidth;

    this.context = this.canvas.getContext('2d');
  }

  render() {
    const { canvas, context } = this;
    const { shape, color, strokeColor, width, height, fill, strokeWidth } = this.properties;
    const w = width + strokeWidth * 2;
    const h = height + strokeWidth * 2;
    const x = w / 2;
    const y = h / 2;
    const r = w > 0 ? w / 2 : 1;

    // Reset canvas
    resetCanvas(canvas, w, h);

    // Draw
    context.fillStyle = color;
    context.strokeStyle = strokeColor;
    context.lineWidth = strokeWidth;

    if (shape === 'Circle') {
      context.beginPath();
      context.arc(x, y, r, 0, 2 * Math.PI);
    } else if (shape === 'Triangle') {
      const points = [];

      for (let i = 0; i < 3; i++) {
        points.push({
          x: x + r * Math.cos(i * TRIANGLE_ANGLE - deg2rad(210)),
          y: y + r * Math.sin(i * TRIANGLE_ANGLE - deg2rad(210)),
        });
      }

      context.beginPath();
      context.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        context.lineTo(points[i].x, points[i].y);
      }
      context.closePath();
    } else {
      context.beginPath();
      context.moveTo(0, 0);
      context.lineTo(w, 0);
      context.lineTo(w, h);
      context.lineTo(0, h);
      context.closePath();
    }

    if (fill) {
      context.fill();
    }

    if (strokeWidth > 0) {
      context.save();
      context.clip();
      context.stroke();
      context.restore();
    }
  }
}
