import {contextBridge, ipcRenderer} from 'electron';
import type { StoredBucket } from './database/bucketRepository.js';

contextBridge.exposeInMainWorld('maildock', {
    getAppVersion: (): Promise<string> => 
        ipcRenderer.invoke('app:get-version'),

    listBuckets: (): Promise<StoredBucket[]> => 
        ipcRenderer.invoke('buckets:list'),
    
    createBucket: (name: string): Promise<StoredBucket> => 
        ipcRenderer.invoke('buckets:create', name),

    removeBucket: (bucketId: string): Promise<void> => 
        ipcRenderer.invoke('buckets:remove', bucketId),

    renameBucket: (bucketId: string, name: string): Promise<StoredBucket> =>
        ipcRenderer.invoke('buckets:rename', bucketId, name),
});
