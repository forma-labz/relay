import {
  File as FileGeneric,
  FileArchive,
  FileSpreadsheet,
  FileText,
  Folder,
  Image as ImageIcon,
  type LucideIcon,
} from 'lucide-react-native';

import type { FileKind } from '@/lib/types';

export function fileIcon(kind: FileKind): { Icon: LucideIcon; color: string; tint: string } {
  switch (kind) {
    case 'folder':
      return { Icon: Folder, color: '#38BDF8', tint: 'rgba(56,189,248,0.16)' };
    case 'pdf':
      return { Icon: FileText, color: '#EF4444', tint: 'rgba(239,68,68,0.16)' };
    case 'image':
      return { Icon: ImageIcon, color: '#22C55E', tint: 'rgba(34,197,94,0.16)' };
    case 'sheet':
      return { Icon: FileSpreadsheet, color: '#22C55E', tint: 'rgba(34,197,94,0.16)' };
    case 'doc':
      return { Icon: FileText, color: '#6366F1', tint: 'rgba(99,102,241,0.16)' };
    case 'zip':
      return { Icon: FileArchive, color: '#F59E0B', tint: 'rgba(245,158,11,0.16)' };
    default:
      return { Icon: FileGeneric, color: '#94A3B8', tint: 'rgba(148,163,184,0.16)' };
  }
}
