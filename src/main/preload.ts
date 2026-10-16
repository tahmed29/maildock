import {contextBridge, ipcRenderer} from 'electron';
import type { StoredBucket } from './database/bucketRepository.js';

contextBridge.exposeInMainWorld('maildock', {
    getAppVersion: (): Promise<string> => 
        ipcRenderer.invoke('app:get-version'),

    listBuckets: (): Promise<StoredBucket[]> => 
        ipcRenderer.invoke('buckets:list'),
    
    createBucket: (name: string): Promise<StoredBucket> => 
        ipcRenderer.invoke('buckets:create', name),
});
