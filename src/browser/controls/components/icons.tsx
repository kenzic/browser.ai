import React from 'react';
import {
  X,
  RotateCw,
  ChevronRight,
  ChevronLeft,
  Plus,
  Loader,
} from 'lucide-react';

interface IconProps {
  // eslint-disable-next-line react/require-default-props
  className?: string;
}

export const IconLoading: React.FC<IconProps> = ({ className }) => (
  <Loader className={className} />
);

export const IconClose: React.FC<IconProps> = ({ className }) => (
  <X className={className} />
);

export const IconPlus: React.FC<IconProps> = ({ className }) => (
  <Plus className={className} />
);

export const IconReload: React.FC<IconProps> = ({ className }) => (
  <RotateCw className={className} />
);

export const IconLeft: React.FC<IconProps> = ({ className }) => (
  <ChevronLeft className={className} />
);

export const IconRight: React.FC<IconProps> = ({ className }) => (
  <ChevronRight className={className} />
);
