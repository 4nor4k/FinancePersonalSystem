export default function TrendTriangle({ up = true, size = 6 }) {
  const color = up ? '#7fd88f' : '#e2716f'
  return (
    <span
      style={{
        width: 0,
        height: 0,
        borderLeft: `${size - 2}px solid transparent`,
        borderRight: `${size - 2}px solid transparent`,
        [up ? 'borderBottom' : 'borderTop']: `${size}px solid ${color}`,
        display: 'inline-block',
      }}
    />
  )
}
