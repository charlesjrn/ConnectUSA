import { Award } from "lucide-react";

type DonorTier = 'bronze' | 'silver' | 'gold' | null;

interface DonorBadgeProps {
  tier: DonorTier;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const tierConfig = {
  bronze: {
    label: 'Bronze Donor',
    colors: 'bg-gradient-to-br from-amber-600 to-amber-800 text-white',
    iconColor: 'text-amber-100',
    borderColor: 'border-amber-600',
  },
  silver: {
    label: 'Silver Donor',
    colors: 'bg-gradient-to-br from-gray-400 to-gray-600 text-white',
    iconColor: 'text-gray-100',
    borderColor: 'border-gray-400',
  },
  gold: {
    label: 'Gold Donor',
    colors: 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white',
    iconColor: 'text-yellow-100',
    borderColor: 'border-yellow-400',
  },
};

const sizeConfig = {
  sm: {
    container: 'px-2 py-0.5 text-xs gap-1',
    icon: 'h-3 w-3',
  },
  md: {
    container: 'px-2.5 py-1 text-sm gap-1.5',
    icon: 'h-4 w-4',
  },
  lg: {
    container: 'px-3 py-1.5 text-base gap-2',
    icon: 'h-5 w-5',
  },
};

export function DonorBadge({ tier, showLabel = true, size = 'sm' }: DonorBadgeProps) {
  if (!tier) return null;

  const config = tierConfig[tier];
  const sizes = sizeConfig[size];

  return (
    <div
      className={`inline-flex items-center rounded-full font-semibold border-2 ${config.colors} ${config.borderColor} ${sizes.container}`}
      title={`${config.label} - Thank you for your generous support!`}
    >
      <Award className={`${sizes.icon} ${config.iconColor}`} />
      {showLabel && <span>{tier.charAt(0).toUpperCase() + tier.slice(1)}</span>}
    </div>
  );
}
