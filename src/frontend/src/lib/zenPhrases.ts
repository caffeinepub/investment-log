export type ZenPhrase = {
  quote: string;
  author: string;
  quoteEn: string;
  authorEn: string;
};

export const ZEN_PHRASES: ZenPhrase[] = [
  // William Blake (1757–1827)
  {
    quote: "一粒の砂に世界を見る\n一輪の野の花に天国を見る",
    author: "ウィリアム・ブレイク",
    quoteEn: "To see a World in a Grain of Sand\nAnd a Heaven in a Wild Flower",
    authorEn: "William Blake",
  },
  {
    quote: "喜びと悲しみは、繊細に織り合わされている",
    author: "ウィリアム・ブレイク",
    quoteEn: "Joy and woe are woven fine",
    authorEn: "William Blake",
  },
  {
    quote: "太陽の昇りを見るとき\n私は黄金の万軍を見る",
    author: "ウィリアム・ブレイク",
    quoteEn: "When I look at the sun\nI see a golden host of angels",
    authorEn: "William Blake",
  },
  // Walt Whitman (1819–1892)
  {
    quote: "私は大きい\n私は無数のものを含んでいる",
    author: "ウォルト・ホイットマン",
    quoteEn: "I am large, I contain multitudes",
    authorEn: "Walt Whitman",
  },
  {
    quote: "どんな草の葉も、星と同じ奇跡だ",
    author: "ウォルト・ホイットマン",
    quoteEn: "Every blade of grass is a miracle\nas great as the stars",
    authorEn: "Walt Whitman",
  },
  {
    quote: "生命そのものが美しい\nすべての音楽は生命だ",
    author: "ウォルト・ホイットマン",
    quoteEn: "Life itself is beautiful\nAll music is life",
    authorEn: "Walt Whitman",
  },
  // Rabindranath Tagore (1861–1941)
  {
    quote: "喜びよ、あなたの呼ぶ声に\n私の心は羽ばたく",
    author: "ラビンドラナート・タゴール",
    quoteEn: "Joy, your voice calls out\nand my heart takes flight",
    authorEn: "Rabindranath Tagore",
  },
  {
    quote: "光が満ちているところへ\n私は行く",
    author: "ラビンドラナート・タゴール",
    quoteEn: "Where the light is full\nthere I go",
    authorEn: "Rabindranath Tagore",
  },
  {
    quote: "信仰とは、夜明け前でも鳥が歌うことだ",
    author: "ラビンドラナート・タゴール",
    quoteEn: "Faith is the bird that sings\nwhen the dawn is still dark",
    authorEn: "Rabindranath Tagore",
  },
  // Rainer Maria Rilke (1875–1926)
  {
    quote: "美しいものは、始まりにすぎない",
    author: "ライナー・マリア・リルケ",
    quoteEn: "Everything beautiful\nis only the beginning",
    authorEn: "Rainer Maria Rilke",
  },
  {
    quote: "すべての天使は\n恐ろしいほど美しい",
    author: "ライナー・マリア・リルケ",
    quoteEn: "Every angel is terrifying\nand beautiful",
    authorEn: "Rainer Maria Rilke",
  },
  {
    quote: "どんな感情も\n最後まで生き抜け",
    author: "ライナー・マリア・リルケ",
    quoteEn: "Let everything happen to you\nBeauty and terror",
    authorEn: "Rainer Maria Rilke",
  },
  // Rumi (1207–1273)
  {
    quote: "あなたが求めるものは\nあなたを求めている",
    author: "ルーミー",
    quoteEn: "What you seek\nis seeking you",
    authorEn: "Rumi",
  },
  {
    quote: "光の中へ出よ\n光そのものになれ",
    author: "ルーミー",
    quoteEn: "Step into the open air\nBecome the light itself",
    authorEn: "Rumi",
  },
  {
    quote: "あなたは、宇宙が踊る音楽だ",
    author: "ルーミー",
    quoteEn: "You are the music\nof the universe dancing",
    authorEn: "Rumi",
  },
  // W.B. Yeats (1865–1939)
  {
    quote: "夢の布\n光と薄明かりで織られた",
    author: "W.B. イエイツ",
    quoteEn: "A cloth of dreams\nwoven of light and dim light",
    authorEn: "W.B. Yeats",
  },
  {
    quote: "どこを向いても\n美しさの名残がある",
    author: "W.B. イエイツ",
    quoteEn: "Everywhere I turn\nthere is beauty remaining",
    authorEn: "W.B. Yeats",
  },
  {
    quote: "生命の流れは\n愛から来ている",
    author: "W.B. イエイツ",
    quoteEn: "The stream of life\ncomes from love",
    authorEn: "W.B. Yeats",
  },
  // Alfred Lord Tennyson (1809–1892)
  {
    quote: "求め、探し、見つけ\n屈しない",
    author: "アルフレッド・テニスン",
    quoteEn: "To seek, to strive, to find\nand not to yield",
    authorEn: "Alfred Lord Tennyson",
  },
  {
    quote: "光の中で前へ\n夜明けとともに",
    author: "アルフレッド・テニスン",
    quoteEn: "Forward into light\nwith the breaking dawn",
    authorEn: "Alfred Lord Tennyson",
  },
  {
    quote: "古きものは変わり\n新しき光に場所を譲る",
    author: "アルフレッド・テニスン",
    quoteEn: "Old things give place\nto new light",
    authorEn: "Alfred Lord Tennyson",
  },
];

export function pickRandomZenPhrase(): ZenPhrase {
  return ZEN_PHRASES[Math.floor(Math.random() * ZEN_PHRASES.length)];
}
