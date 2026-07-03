// Renderer (COMPUX_UZ.html) faqat shu xavfsiz funksiyaga ega bo'ladi.
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  kompyuterBuyrugi: (nomi, input) => ipcRenderer.invoke('kompyuter-buyrugi', nomi, input),
});
