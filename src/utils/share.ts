import { Platform, View } from 'react-native';
import type { RefObject } from 'react';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';

export type ShareResult =
  | { shared: true }
  | { shared: false; reason: 'not-ready' | 'unavailable' | 'opened-fallback' | 'cancelled' };

interface ShareViewOptions {
  dialogTitle?: string;
  fileName?: string;
}

/**
 * Captures the given view ref as a PNG and opens the platform share sheet.
 * Degrades gracefully where native/browser image sharing isn't available.
 */
export async function shareViewAsImage(
  ref: RefObject<View | null>,
  options: ShareViewOptions = {},
): Promise<ShareResult> {
  if (!ref.current) {
    return { shared: false, reason: 'not-ready' };
  }

  const uri = await captureRef(ref, {
    format: 'png',
    quality: 1,
    result: Platform.OS === 'web' ? 'data-uri' : 'tmpfile',
  });

  if (Platform.OS === 'web') {
    return shareOnWeb(uri, options);
  }

  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    return { shared: false, reason: 'unavailable' };
  }
  await Sharing.shareAsync(uri, { dialogTitle: options.dialogTitle, mimeType: 'image/png' });
  return { shared: true };
}

async function shareOnWeb(dataUri: string, options: ShareViewOptions): Promise<ShareResult> {
  type WebShareNavigator = Navigator & {
    canShare?: (data: { files: File[] }) => boolean;
    share?: (data: { files?: File[]; title?: string }) => Promise<void>;
  };
  const nav = typeof navigator !== 'undefined' ? (navigator as WebShareNavigator) : undefined;

  try {
    if (nav?.canShare && nav.share) {
      const response = await fetch(dataUri);
      const blob = await response.blob();
      const file = new File([blob], options.fileName ?? 'piggymy-progress.png', { type: 'image/png' });
      if (nav.canShare({ files: [file] })) {
        await nav.share({ files: [file], title: options.dialogTitle });
        return { shared: true };
      }
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return { shared: false, reason: 'cancelled' };
    }
    // Fall through to the tab fallback below.
  }

  // No File-sharing support (most desktop browsers) — open the image in a
  // new tab so the user can save or share it manually.
  if (typeof window !== 'undefined') {
    window.open(dataUri, '_blank');
  }
  return { shared: false, reason: 'opened-fallback' };
}
