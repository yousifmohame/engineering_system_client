// src/components/Stamp/stampTemplateـqrcode.js أو مسار الملف لديك

export const STAMP_TEMPLATE_QR = `
<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 900 410" preserveAspectRatio="xMidYMid meet">
  <defs>
    <style>
      :root {
        --blue: #1d3d75;
      }
      .blue-fill {
        fill: var(--blue);
      }
    </style>
  </defs>

  <image
    href="{{QR_DATA_URL}}"
    x="540"
    y="55"
    width="300"
    height="300"
    preserveAspectRatio="xMidYMid meet"
  />
</svg>
`;