import React from 'react';

const icons = import.meta.glob('../assets/images/icons/*.svg', { eager: true }) as Record<
  string,
  { default: React.FC<React.SVGProps<SVGSVGElement>> }
>;

interface IconProps {
  name: string;
  width?: number;
  height?: number;
  className?: string;
}

const SvgIcon: React.FC<IconProps> = ({ name, height = 24, width = 24, className = '' }) => {
  const IconComponent = icons[`../assets/images/icons/${name}.svg`]?.default;

  if (!IconComponent) {
    console.error(`Không tìm thấy icon: ${name}`);
    return null;
  }

  return <IconComponent width={width} height={height} className={className} />;
};

export default SvgIcon;
