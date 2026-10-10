/* 角色卡產生器：canvas 畫出可下載/分享的卡片圖（1080×1350） */
async function generateCardCanvas({ kicker, title, subtitle, line }, skipImage) {
  await document.fonts.ready;
  const W = 1080, H = 1350;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const x = c.getContext('2d');

  // 背景
  const bg = x.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#0b0d13');
  bg.addColorStop(1, '#07080c');
  x.fillStyle = bg;
  x.fillRect(0, 0, W, H);

  // 頂部金色光暈
  const glow = x.createRadialGradient(W/2, 180, 40, W/2, 180, 480);
  glow.addColorStop(0, 'rgba(232,213,168,.28)');
  glow.addColorStop(1, 'rgba(232,213,168,0)');
  x.fillStyle = glow;
  x.fillRect(0, 0, W, 700);

  // 金框
  x.strokeStyle = 'rgba(201,168,106,.55)';
  x.lineWidth = 3;
  x.strokeRect(44, 44, W-88, H-88);
  x.strokeStyle = 'rgba(201,168,106,.2)';
  x.lineWidth = 1;
  x.strokeRect(58, 58, W-116, H-116);

  // 光塔
  if (!skipImage) try {
    const img = await new Promise((res, rej) => {
      const i = new Image();
      i.onload = () => res(i); i.onerror = rej;
      i.src = 'assets/Tower.png';
    });
    const th = 300, tw = th * (img.width / img.height);
    x.shadowColor = 'rgba(232,213,168,.6)'; x.shadowBlur = 60;
    x.drawImage(img, (W-tw)/2, 130, tw, th);
    x.shadowBlur = 0;
  } catch(e) { /* 沒圖也照樣出卡 */ }

  x.textAlign = 'center';

  // kicker
  x.fillStyle = '#c9a86a';
  x.font = '300 30px "Noto Sans TC", sans-serif';
  x.fillText(kicker.split('').join('  '), W/2, 520);

  // 主標
  x.fillStyle = '#f0e6cd';
  x.font = '500 96px "Noto Serif TC", serif';
  x.fillText(title, W/2, 650);

  // 副標
  x.fillStyle = '#e0c894';
  x.font = '400 44px "Noto Serif TC", serif';
  x.fillText(subtitle, W/2, 730);

  // 分隔線
  x.strokeStyle = 'rgba(201,168,106,.5)';
  x.lineWidth = 1.5;
  x.beginPath(); x.moveTo(W/2-90, 790); x.lineTo(W/2+90, 790); x.stroke();

  // 一句話（自動換行）
  x.fillStyle = '#b9b6ad';
  x.font = '300 38px "Noto Sans TC", sans-serif';
  const maxW = W - 260, lh = 64;
  let y = 880, cur = '';
  for (const ch of line) {
    if (x.measureText(cur + ch).width > maxW) { x.fillText(cur, W/2, y); y += lh; cur = ch; }
    else cur += ch;
  }
  if (cur) x.fillText(cur, W/2, y);

  // 頁尾
  x.fillStyle = 'rgba(201,168,106,.85)';
  x.font = '300 30px "Noto Sans TC", sans-serif';
  x.fillText('頻率文明 FREQUENCY CIVILIZATION', W/2, H-150);
  x.fillStyle = 'rgba(185,182,173,.6)';
  x.font = '300 26px "Noto Sans TC", sans-serif';
  x.fillText('frequency-civilization.com', W/2, H-104);

  return c;
}

/* 在結果頁顯示卡片＋下載/分享按鈕 */
async function showRoleCard(opts, boxId, filename) {
  const box = document.getElementById(boxId);
  if (!box) return;
  box.innerHTML = '<p style="color:#9b9890;font-size:14px">正在生成你的角色卡…</p>';
  let canvas = await generateCardCanvas(opts);
  let url;
  try { url = canvas.toDataURL('image/png'); }
  catch(e) { // file:// 本機預覽時圖片會讓 canvas 受污染，改出無光塔版
    canvas = await generateCardCanvas(opts, true);
    url = canvas.toDataURL('image/png');
  }
  box.innerHTML = '';
  const img = document.createElement('img');
  img.src = url;
  img.style.cssText = 'max-width:320px;width:100%;border-radius:10px;box-shadow:0 12px 60px rgba(201,168,106,.25);margin-bottom:18px';
  box.appendChild(img);
  const row = document.createElement('div');
  row.style.cssText = 'display:flex;gap:14px;justify-content:center;flex-wrap:wrap';
  const dl = document.createElement('a');
  dl.className = 'btn'; dl.textContent = '下載角色卡';
  dl.href = url; dl.download = filename;
  row.appendChild(dl);
  if (navigator.canShare) {
    canvas.toBlob(async blob => {
      const file = new File([blob], filename, { type: 'image/png' });
      if (navigator.canShare({ files: [file] })) {
        const sh = document.createElement('button');
        sh.className = 'btn'; sh.textContent = '分享角色卡';
        sh.onclick = () => navigator.share({ files: [file], title: '我的角色卡' }).catch(()=>{});
        row.appendChild(sh);
      }
    });
  }
  box.appendChild(row);
  box.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
