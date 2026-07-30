import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

type AppIconProps = {
  icon: IconDefinition;
  className?: string;
  title?: string;
  spin?: boolean;
  pulse?: boolean;
  fixedWidth?: boolean;
};

export default function AppIcon({
  icon,
  className,
  title,
  spin = false,
  pulse = false,
  fixedWidth = true,
}: AppIconProps) {
  return (
    <FontAwesomeIcon
      icon={icon}
      className={className}
      title={title}
      spin={spin}
      pulse={pulse}
      fixedWidth={fixedWidth}
      aria-hidden={title ? undefined : true}
    />
  );
}