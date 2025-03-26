import LogoSvg from '../../assets/logo_apollo_v2.svg?react';

export default function Logo({ height = '3rem', className = '' }) {
  return (
    <LogoSvg
      height={height}
      width='100%'
      className={className}
      aria-label='App Logo'
    />
  );
}
