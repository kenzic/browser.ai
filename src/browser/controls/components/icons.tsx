import React from "react";
import {
  X,
  RotateCw,
  ChevronRight,
  ChevronLeft,
  Plus,
  Loader,
} from "lucide-react";

interface IconProps {
  className?: string;
}

export const IconLoading: React.FC<IconProps> = (props) => (
  <Loader {...props} />
);

export const IconClose: React.FC<IconProps> = (props) => <X {...props} />;

export const IconPlus: React.FC<IconProps> = (props) => <Plus {...props} />;

export const IconReload: React.FC<IconProps> = (props) => (
  <RotateCw {...props} />
);

export const IconLeft: React.FC<IconProps> = (props) => (
  <ChevronLeft {...props} />
);

export const IconRight: React.FC<IconProps> = (props) => (
  <ChevronRight {...props} />
);
