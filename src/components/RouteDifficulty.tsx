const isLightColor = (color: string) => {
  const hex = color.substring(1);
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128;
}

interface RouteDifficultyProps {
  difficulty_color?: string;
  color: string;
  difficulty: string;
}

export function RouteDifficulty({ difficulty_color, color, difficulty }: RouteDifficultyProps) {
  const bgColorStyle = { backgroundColor: color };
  const textColorStyle = {
    color: isLightColor(color) ? '#1F2937' : '#FFFFFF', // Substituindo 'text-neutral-800' por seu valor hex e 'text-white' por #FFFFFF
    fontSize: '0.875rem', // text-sm
    fontWeight: '500', // font-medium
  };

  return (
    <div
      style={{
        width: '3rem', // w-12
        height: '2.5rem', // h-10
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        borderRadius: '9999px', // rounded-full
        ...textColorStyle,
      }}
    >
      <ClimbingHoldSvg fillColor={bgColorStyle.backgroundColor} />
      <span style={{ ...textColorStyle, position: 'absolute' }}>{difficulty.substring(0, 3)}</span>
      {difficulty_color &&
        <svg
          style={{ position: 'absolute', bottom: 0, right: '-0.5rem' }} // -right-2
          fill={difficulty_color}
          height="20"
          stroke="#323232"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24" width="20"
          xmlns="http://www.w3.org/2000/svg">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>}
    </div>
  )
}

function darkenHexColor(hex: string, percentage: number): string {
	hex = hex.startsWith('#') ? hex.substring(1) : hex;

	const r = parseInt(hex.substring(0, 2), 16);
	const g = parseInt(hex.substring(2, 4), 16);
	const b = parseInt(hex.substring(4, 6), 16);

	const newR = Math.floor(r * (1 - percentage)).toString(16).padStart(2, '0');
	const newG = Math.floor(g * (1 - percentage)).toString(16).padStart(2, '0');
	const newB = Math.floor(b * (1 - percentage)).toString(16).padStart(2, '0');

	return `#${newR}${newG}${newB}`;
}

const ClimbingHoldSvg = ({ fillColor }: { fillColor: string }) => (
	<svg width="183" height="140" viewBox="0 0 183 140" fill={darkenHexColor(fillColor, 0.4)} xmlns="http://www.w3.org/2000/svg">
		<path 
			d="M169.468 2L16.1849 7.20548C16.1849 7.20548 -4.62077 14.363 4.16312 52.1027C6.16628 60.7092 12.7686 59.0056 14.6825 69.0205C15.8137 74.9394 14.5851 78.2526 16.1849 83.9862C19.089 94.3942 30.2112 93.7465 33.7176 99.6027C49.5094 125.977 67.6066 138.336 93.3273 137.993C114.878 137.706 129.895 128.233 143.921 109.363C153.073 97.0495 163.958 95.0479 171.973 74.8767C193.655 20.3087 169.468 2 169.468 2Z" 
			fill={fillColor} 
			stroke={darkenHexColor(fillColor, 0.6)} 
			strokeWidth="3" 
			strokeLinecap="round" 
			strokeLinejoin="round"
		/>
		<path 
			d="M21.6592 18.5C21.6592 18.5 55.1592 26.9912 89.6592 25.5C125.659 23.944 159.159 11.5 159.159 11.5" 
			stroke={darkenHexColor(fillColor, 0.6)} 
			strokeWidth="3" 
			strokeLinecap="round" 
			strokeLinejoin="round"
		/>
	</svg>
);