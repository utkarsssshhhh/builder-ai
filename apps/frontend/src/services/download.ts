import JSZip from 'jszip';
import type { GeneratedFile } from '@builder/common';

/**
 * Bundles all generated files into a ZIP and triggers a browser download.
 */
export async function downloadFilesAsZip(
  files: GeneratedFile[],
  projectName: string = 'my-app'
): Promise<void> {
  if (files.length === 0) return;

  const zip = new JSZip();

  for (const file of files) {
    zip.file(file.path, file.content);
  }

  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${projectName}.zip`;
  document.body.appendChild(anchor);
  anchor.click();

  // Cleanup
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
