import { cloneElement } from "react";

import { ICONS, type IconName } from "@/icons";

type IconProps = {
  name: IconName;
};

const Icon = ({ name }: IconProps) => {
  const svg = ICONS[name];

  if (!svg) return null;

  return <>{cloneElement(svg)}</>;
};

export default Icon;
