import { SnowflakeIcon, BuildingIcon, ArchiveBoxIcon, MapPinIcon } from './index';

export function getSpaceTypeIcon(type: string, className?: string): React.ReactElement {
  const icons: Record<string, React.ReactElement> = {
    fridge: <SnowflakeIcon className={className} />,
    cellar: <BuildingIcon className={className} />,
    rack: <ArchiveBoxIcon className={className} />,
  };
  return icons[type] || <MapPinIcon className={className} />;
}
