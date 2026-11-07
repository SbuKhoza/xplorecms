import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { storage } from '../firebase/Config'

/** Upload a File to Firebase Storage under `folder/`, resolving to its download URL. */
export function uploadFile(file, folder, onProgress) {
  const safe = file.name.replace(/[^\w.-]+/g, '_')
  const task = uploadBytesResumable(ref(storage, `${folder}/${Date.now()}_${safe}`), file)
  return new Promise((resolve, reject) => {
    task.on(
      'state_changed',
      (s) => onProgress?.(Math.round((s.bytesTransferred / s.totalBytes) * 100)),
      reject,
      async () => resolve(await getDownloadURL(task.snapshot.ref)),
    )
  })
}
