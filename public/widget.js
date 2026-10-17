(function() {
  const currentScript = document.currentScript || document.querySelector('script[data-site]');
  if (!currentScript) return;
  const siteSlug = currentScript.getAttribute('data-site');
  if (!siteSlug) return;

  const scriptSrc = currentScript.src;
  const scriptUrl = new URL(scriptSrc);
  const baseUrl = scriptUrl.origin;

  const button = document.createElement('div');
  button.innerHTML = `
    <button style="
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 999999;
      background: #0f172a;
      color: #ffffff;
      padding: 12px 20px;
      border-radius: 9999px;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 14px;
      font-weight: 600;
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.2);
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
    ">
      Book Appointment
    </button>
  `;

  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed;
    inset: 0;
    z-index: 1000000;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(4px);
    display: none;
    align-items: center;
    justify-content: center;
    padding: 16px;
  `;

  modal.innerHTML = `
    <div style="
      background: #ffffff;
      width: 100%;
      max-width: 480px;
      height: 85vh;
      max-height: 700px;
      border-radius: 16px;
      overflow: hidden;
      position: relative;
      box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
    ">
      <button id="dag-close-modal" style="
        position: absolute;
        top: 12px;
        right: 12px;
        z-index: 10;
        background: rgba(0,0,0,0.1);
        border: none;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        font-size: 18px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        color: #334155;
      ">&times;</button>
      <iframe src="${baseUrl}/book/${siteSlug}?embed=true" style="width: 100%; height: 100%; border: none;"></iframe>
    </div>
  `;

  document.body.appendChild(button);
  document.body.appendChild(modal);

  const btnElement = button.querySelector('button');
  const closeBtn = modal.querySelector('#dag-close-modal');

  btnElement.addEventListener('click', () => {
    modal.style.display = 'flex';
  });

  closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });
})();
