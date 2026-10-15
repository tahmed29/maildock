import {contextBridge, ipcRenderer} from 'electron';

contextBridge.exposeInMainWorld('maildock', {
    getAppVersion: (): Promise<string> => 
        ipcRenderer.invoke('app:get-version'),
});
