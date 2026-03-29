export default function FontPreview() {
  const sampleJa = "静かな水面に、光が宿る。";
  const sampleEn = "In the depths of stillness, light is born.";
  const sampleNum = "瞑想時間 45分 / 第12段階";

  const fonts = [
    {
      name: "Noto Serif JP",
      label: "Noto Serif JP（明朝・和の気配）",
      style: { fontFamily: "'Noto Serif JP', serif" },
      url: "https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@300;400;500&display=swap",
    },
    {
      name: "Cormorant Garamond",
      label: "Cormorant Garamond（英語セリフ・詩的）",
      style: { fontFamily: "'Cormorant Garamond', serif" },
      url: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&display=swap",
    },
    {
      name: "Helvetica Neue",
      label: "Helvetica Neue（Appleが長年使用・中立）",
      style: { fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" },
      url: null,
    },
    {
      name: "San Francisco / System UI",
      label: "San Francisco / System UI（現Apple標準・クリーン）",
      style: {
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif",
      },
      url: null,
    },
    {
      name: "Hiragino Mincho",
      label: "ヒラギノ明朝（Mac標準・日本語明朝）",
      style: { fontFamily: "'Hiragino Mincho ProN', 'Yu Mincho', serif" },
      url: null,
    },
    {
      name: "Plus Jakarta Sans（現在）",
      label: "Plus Jakarta Sans（現在使用中）",
      style: { fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" },
      url: null,
    },
  ];

  return (
    <>
      {fonts.map((f) =>
        f.url ? <link key={f.name} rel="stylesheet" href={f.url} /> : null,
      )}
      <div
        style={{
          background: "oklch(0.14 0.04 265)",
          minHeight: "100vh",
          padding: "2rem 1.5rem",
          color: "oklch(0.9 0.015 80)",
        }}
      >
        <p
          style={{
            fontFamily: "system-ui",
            fontSize: "0.75rem",
            color: "oklch(0.5 0.02 265)",
            marginBottom: "2.5rem",
            letterSpacing: "0.05em",
          }}
        >
          フォント比較 — /fonts
        </p>

        {fonts.map((f) => (
          <div
            key={f.name}
            style={{
              marginBottom: "3rem",
              borderBottom: "1px solid oklch(0.26 0.04 265)",
              paddingBottom: "2.5rem",
            }}
          >
            <p
              style={{
                fontFamily: "system-ui",
                fontSize: "0.7rem",
                color: "oklch(0.55 0.05 78)",
                marginBottom: "1rem",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              {f.label}
            </p>
            <p
              style={{
                ...f.style,
                fontSize: "1.5rem",
                fontWeight: 300,
                marginBottom: "0.6rem",
                lineHeight: 1.7,
              }}
            >
              {sampleJa}
            </p>
            <p
              style={{
                ...f.style,
                fontSize: "1.1rem",
                fontWeight: 400,
                marginBottom: "0.6rem",
                lineHeight: 1.7,
                color: "oklch(0.75 0.012 80)",
              }}
            >
              {sampleEn}
            </p>
            <p
              style={{
                ...f.style,
                fontSize: "0.95rem",
                fontWeight: 400,
                color: "oklch(0.58 0.02 265)",
              }}
            >
              {sampleNum}
            </p>
          </div>
        ))}
      </div>
    </>
  );
}
