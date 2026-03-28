export type ZenPhrase = {
  quote: string;
  author: string;
};

export const ZEN_PHRASES: ZenPhrase[] = [
  // William Blake (1757–1827)
  {
    quote: "一粒の砂に世界を見る\n一輪の野の花に天国を見る",
    author: "ウィリアム・ブレイク",
  },
  {
    quote: "喜びと悲しみは、繊細に織り合わされている",
    author: "ウィリアム・ブレイク",
  },
  {
    quote: "太陽の昇りを見るとき\n私は黄金の万軍を見る",
    author: "ウィリアム・ブレイク",
  },
  // Walt Whitman (1819–1892)
  {
    quote: "私は大きい\n私は無数のものを含んでいる",
    author: "ウォルト・ホイットマン",
  },
  {
    quote: "どんな草の葉も、星と同じ奇跡だ",
    author: "ウォルト・ホイットマン",
  },
  {
    quote: "生命そのものが美しい\nすべての音楽は生命だ",
    author: "ウォルト・ホイットマン",
  },
  // Rabindranath Tagore (1861–1941)
  {
    quote: "喜びよ、あなたの呼ぶ声に\n私の心は羽ばたく",
    author: "ラビンドラナート・タゴール",
  },
  {
    quote: "光が満ちているところへ\n私は行く",
    author: "ラビンドラナート・タゴール",
  },
  {
    quote: "信仰とは、夜明け前でも鳥が歌うことだ",
    author: "ラビンドラナート・タゴール",
  },
  // Rainer Maria Rilke (1875–1926)
  {
    quote: "美しいものは、始まりにすぎない",
    author: "ライナー・マリア・リルケ",
  },
  {
    quote: "すべての天使は\n恐ろしいほど美しい",
    author: "ライナー・マリア・リルケ",
  },
  {
    quote: "どんな感情も\n最後まで生き抜け",
    author: "ライナー・マリア・リルケ",
  },
  // Rumi (1207–1273)
  {
    quote: "あなたが求めるものは\nあなたを求めている",
    author: "ルーミー",
  },
  {
    quote: "光の中へ出よ\n光そのものになれ",
    author: "ルーミー",
  },
  {
    quote: "あなたは、宇宙が踊る音楽だ",
    author: "ルーミー",
  },
  // W.B. Yeats (1865–1939)
  {
    quote: "夢の布\n光と薄明かりで織られた",
    author: "W.B. イエイツ",
  },
  {
    quote: "どこを向いても\n美しさの名残がある",
    author: "W.B. イエイツ",
  },
  {
    quote: "生命の流れは\n愛から来ている",
    author: "W.B. イエイツ",
  },
  // Alfred Lord Tennyson (1809–1892)
  {
    quote: "求め、探し、見つけ\n屈しない",
    author: "アルフレッド・テニスン",
  },
  {
    quote: "光の中で前へ\n夜明けとともに",
    author: "アルフレッド・テニスン",
  },
  {
    quote: "古きものは変わり\n新しき光に場所を譲る",
    author: "アルフレッド・テニスン",
  },
];

export function pickRandomZenPhrase(): ZenPhrase {
  return ZEN_PHRASES[Math.floor(Math.random() * ZEN_PHRASES.length)];
}
