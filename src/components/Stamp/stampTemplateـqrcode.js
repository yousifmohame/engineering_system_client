export const STAMP_TEMPLATE_QR = `
<svg xmlns="http://www.w3.org/2000/svg" width="900" height="410" viewBox="0 0 900 410">
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

  <!-- ✅ QR Code فقط (بدون باركود) -->
  <image
    href="{{QR_DATA_URL}}"
    x="680"
    y="60"
    width="160"
    height="160"
    preserveAspectRatio="xMidYMid meet"
  />
</svg>
`;