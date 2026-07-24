import {
  File as FileGeneric,
  FileArchive,
  FileSpreadsheet,
  FileText,
  Folder,
  Image as ImageIcon,
  type LucideIcon,
} from 'lucide-react-native';

import { colors } from '@/constants/theme';
import type { FileKind } from '@/lib/types';

export function fileIcon(kind: FileKind): { Icon: LucideIcon; color: string; tint: string } {
  switch (kind) {
    case 'folder':
      return { Icon: Folder, color: colors.sky, tint: 'rgba(56,189,248,0.16)' };
    case 'pdf':
      return { Icon: FileText, color: colors.error, tint: 'rgba(240,68,56,0.16)' };
    case 'image':
      return { Icon: ImageIcon, color: colors.success, tint: 'rgba(22,199,132,0.16)' };
    case 'sheet':
      return { Icon: FileSpreadsheet, color: colors.success, tint: 'rgba(22,199,132,0.16)' };
    case 'doc':
      return { Icon: FileText, color: colors.brand, tint: 'rgba(45,107,255,0.16)' };
    case 'zip':
      return { Icon: FileArchive, color: colors.warning, tint: 'rgba(245,165,36,0.16)' };
    default:
      return { Icon: FileGeneric, color: colors.muted, tint: 'rgba(164,176,196,0.16)' };
  }
}
