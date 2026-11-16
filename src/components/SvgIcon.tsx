// Renders one of our own SVG files inline, so CSS can style its strokes (e.g. thicken on hover).
export function SvgIcon({ svg, width, height }: { svg: string; width: number; height: number }) {
  return <span className="svg-icon" style={{ width, height }} dangerouslySetInnerHTML={{ __html: svg }} />
}
