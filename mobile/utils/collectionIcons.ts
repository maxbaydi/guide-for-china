import { COLLECTION_ICONS } from '../components/ui/IconPicker';

export const DEFAULT_COLLECTION_ICON = COLLECTION_ICONS[0];

export const getCollectionIcon = (icon?: string | null): string => {
  return icon || DEFAULT_COLLECTION_ICON;
};

