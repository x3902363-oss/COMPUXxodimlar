// ============================================================
// COMPUX UZ — Electron Main Process (100% PULSIZ, API kerak emas)
// Bu faylni o'zingizning mavjud Electron loyihangizdagi main.js
// bilan BIRLASHTIRING (ipcMain.handle qismini ko'chiring).
// ============================================================
const { app, BrowserWindow, ipcMain, shell } = require('electron');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// ---- KOMPYUTER BUYRUQLARI (renderer'dagi kalit-so'z tizimi shu yerni chaqiradi) ----
ipcMain.handle('kompyuter-buyrugi', async (event, nomi, input) => {
  switch (nomi) {
    case 'dastur_ochish':
      return new Promise(res => exec(`start ${input.nomi}`, err => res(err ? `Ocha olmadim: ${input.nomi}` : `${input.nomi} ochildi.`)));

    case 'papka_ochish':
      shell.openPath(input.yol);
      return `${input.yol} ochildi.`;

    case 'ovoz_balandligi': {
      const daraja = Math.max(0, Math.min(100, input.daraja));
      const cmd = `powershell -c "$obj = New-Object -ComObject WScript.Shell; for($i=0;$i -lt 50;$i++){$obj.SendKeys([char]174)}; for($i=0;$i -lt [math]::Round(${daraja}/2);$i++){$obj.SendKeys([char]175)}"`;
      return new Promise(res => exec(cmd, err => res(err ? 'Ovozni o\'zgartira olmadim.' : `Ovoz balandligi ${daraja}% ga o'rnatildi.`)));
    }

    case 'ekran_rasmi_olish': {
      const savePath = path.join(app.getPath('pictures'), `compux-screenshot-${Date.now()}.png`);
      const cmd = `powershell -c "Add-Type -AssemblyName System.Windows.Forms,System.Drawing; $b=[System.Windows.Forms.Screen]::PrimaryScreen.Bounds; $bmp=New-Object System.Drawing.Bitmap $b.Width,$b.Height; $g=[System.Drawing.Graphics]::FromImage($bmp); $g.CopyFromScreen($b.Location,[System.Drawing.Point]::Empty,$b.Size); $bmp.Save('${savePath.replace(/\\/g, '\\\\')}')"`;
      return new Promise(res => exec(cmd, err => res(err ? 'Skrinshot olinmadi.' : `Skrinshot saqlandi: ${savePath}`)));
    }

    case 'fayl_qidirish': {
      const papkalar = [app.getPath('desktop'), app.getPath('documents'), app.getPath('downloads')];
      let topilgan = [];
      papkalar.forEach(p => {
        try {
          fs.readdirSync(p).forEach(f => { if (f.toLowerCase().includes(input.nomi.toLowerCase())) topilgan.push(path.join(p, f)); });
        } catch (e) {}
      });
      return topilgan.length ? `Topildi: ${topilgan.join(', ')}` : `"${input.nomi}" nomli fayl topilmadi.`;
    }

    case 'tizimni_ochirish':
      exec('shutdown /s /t 5');
      return "Kompyuter 5 soniyadan keyin o'chadi.";

    case 'qayta_yuklash':
      exec('shutdown /r /t 5');
      return "Kompyuter 5 soniyadan keyin qayta yuklanadi.";

    default:
      return 'Noma\'lum buyruq.';
  }
});

// ---- Standart Electron oyna kodi (o'zingizdagi bilan almashtiring) ----
function createWindow() {
  const win = new BrowserWindow({
    width: 1200, height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  win.loadFile('COMPUX_UZ.html');
}
app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
