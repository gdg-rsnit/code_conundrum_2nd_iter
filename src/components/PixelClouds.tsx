const PixelTerrain = () => (
  <div className="absolute bottom-0 left-0 right-0 h-[20%] overflow-hidden">
    {/* Back layer - darkest, tallest */}
    <svg
      className="absolute bottom-0 left-0 w-[110%] animate-cloud-back"
      height="100%"
      viewBox="0 0 1920 200"
      shapeRendering="crispEdges"
      preserveAspectRatio="none"
    >
      <polygon
        fill="#3B0764"
        opacity={0.7}
        points="0,200 0,120 32,112 64,104 96,112 128,96 160,88 192,96 224,104 256,88 288,80 320,88 352,96 384,80 416,72 448,80 480,88 512,96 544,80 576,72 608,64 640,72 672,80 704,88 736,72 768,64 800,72 832,88 864,96 896,80 928,72 960,64 992,72 1024,80 1056,88 1088,72 1120,80 1152,96 1184,88 1216,72 1248,64 1280,72 1312,80 1344,96 1376,88 1408,80 1440,72 1472,80 1504,96 1536,88 1568,80 1600,72 1632,80 1664,96 1696,104 1728,88 1760,80 1792,88 1824,96 1856,104 1888,96 1920,88 1920,200"
      />
    </svg>
    {/* Mid layer */}
    <svg
      className="absolute bottom-0 left-0 w-[110%] animate-cloud-mid"
      height="100%"
      viewBox="0 0 1920 200"
      shapeRendering="crispEdges"
      preserveAspectRatio="none"
    >
      <polygon
        fill="#6B21A8"
        opacity={0.75}
        points="0,200 0,152 48,144 96,136 144,144 192,128 240,136 288,128 336,120 384,128 432,136 480,128 528,120 576,112 624,120 672,128 720,136 768,128 816,120 864,112 912,120 960,128 1008,136 1056,128 1104,120 1152,128 1200,136 1248,128 1296,120 1344,112 1392,120 1440,128 1488,136 1536,128 1584,120 1632,128 1680,136 1728,128 1776,120 1824,128 1872,136 1920,128 1920,200"
      />
    </svg>
    {/* Front layer - brightest, shortest */}
    <svg
      className="absolute bottom-0 left-0 w-[110%] animate-cloud-front"
      height="100%"
      viewBox="0 0 1920 200"
      shapeRendering="crispEdges"
      preserveAspectRatio="none"
    >
      <polygon
        fill="#9B30FF"
        opacity={0.6}
        points="0,200 0,168 64,160 128,168 192,160 256,152 320,160 384,168 448,160 512,152 576,160 640,168 704,160 768,152 832,160 896,168 960,160 1024,152 1088,160 1152,168 1216,160 1280,152 1344,160 1408,168 1472,160 1536,152 1600,160 1664,168 1728,160 1792,168 1856,160 1920,168 1920,200"
      />
    </svg>
  </div>
);

export default PixelTerrain;
