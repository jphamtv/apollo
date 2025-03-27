import LogoSvg from '../../../assets/logo_apollo.svg?react';

export default function Logo({ height = '80px', className = '' }) {
  const aspectRatio = 155 / 58;
  const heightValue = parseFloat(height);
  const widthValue = heightValue * aspectRatio;
  return (
    <LogoSvg
      height={height}
      width={`${widthValue}px`}
      className={className}
      aria-label="App Logo"
    />
  );
}
