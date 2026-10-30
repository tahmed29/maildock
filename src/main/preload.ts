import {contextBridge, ipcRenderer} from 'electron';
import type { MaildockApi } from '../shared/contracts.js';

const api: MaildockApi = {
  getAppVersion: () => ipcRenderer.invoke("app:get-version"),
  listBuckets: () => ipcRenderer.invoke("buckets:list"),
  createBucket: (name) => ipcRenderer.invoke("buckets:create", name),
  removeBucket: (bucketId) =>
    ipcRenderer.invoke("buckets:remove", bucketId),
  renameBucket: (bucketId, name) =>
    ipcRenderer.invoke("buckets:rename", bucketId, name),
};

contextBridge.exposeInMainWorld("maildock", api);
