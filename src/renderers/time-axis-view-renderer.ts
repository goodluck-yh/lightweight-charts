import { ITimeAxisViewRenderer, TimeAxisViewRendererOptions } from './itime-axis-view-renderer';

export interface TimeAxisViewRendererData {
	width: number;
	text: string;
	coordinate: number;
	color: string;
	background: string;
	visible: boolean;
}

const optimizationReplacementRe = /[1-9]/g;

export class TimeAxisViewRenderer implements ITimeAxisViewRenderer {
	private _data: TimeAxisViewRendererData | null;

	public constructor() {
		this._data = null;
	}

	public setData(data: TimeAxisViewRendererData): void {
		this._data = data;
	}

	public draw(ctx: CanvasRenderingContext2D, rendererOptions: TimeAxisViewRendererOptions, devicePixelRation: number): void {
		if (this._data === null || this._data.visible === false || this._data.text.length === 0) {
			return;
		}

		ctx.font = rendererOptions.font;

		const textWidth = Math.round(rendererOptions.widthCache.measureText(ctx, this._data.text, optimizationReplacementRe));
		if (textWidth <= 0) {
			return;
		}

		ctx.save();

		const horzMargin = rendererOptions.paddingHorizontal;
		const labelWidth = textWidth + 2 * horzMargin;
		const labelWidthHalf = labelWidth / 2;
		const timeScaleWidth = this._data.width;
		let coordinate = this._data.coordinate;
		let x1 = Math.floor(coordinate - labelWidthHalf) + 0.5;

		if (x1 < 0) {
			coordinate = coordinate + Math.abs(0 - x1);
			x1 = Math.floor(coordinate - labelWidthHalf) + 0.5;
		} else if (x1 + labelWidth > timeScaleWidth) {
			coordinate = coordinate - Math.abs(timeScaleWidth - (x1 + labelWidth));
			x1 = Math.floor(coordinate - labelWidthHalf) + 0.5;
		}

		const x2 = x1 + labelWidth;

		const y1 = 0;
		const y2 = (
			y1 +
			rendererOptions.borderSize +
			rendererOptions.paddingTop +
			rendererOptions.fontSize +
			rendererOptions.paddingBottom
		);

		ctx.fillStyle = this._data.background;

		const x1scaled = Math.round(x1 * devicePixelRation);
		const y1scaled = Math.round(y1 * devicePixelRation);
		const x2scaled = Math.round(x2 * devicePixelRation);
		const y2scaled = Math.round(y2 * devicePixelRation);
		ctx.fillRect(x1scaled, y1scaled, x2scaled - x1scaled, y2scaled - y1scaled);

		const tickX = Math.round(this._data.coordinate * devicePixelRation);
		const tickTop = y1scaled;
		const tickBottom = Math.round((tickTop + rendererOptions.borderSize + rendererOptions.tickLength) * devicePixelRation);

		ctx.fillStyle = this._data.color;
		ctx.fillRect(tickX, tickTop, 1, tickBottom - tickTop);

		const yText = y2 - rendererOptions.baselineOffset - rendererOptions.paddingBottom;
		ctx.textAlign = 'left';
		ctx.fillStyle = this._data.color;

		ctx.setTransform(devicePixelRation, 0, 0, devicePixelRation, 0, 0);
		ctx.fillText(this._data.text, x1 + horzMargin, yText);

		ctx.restore();
	}
}
