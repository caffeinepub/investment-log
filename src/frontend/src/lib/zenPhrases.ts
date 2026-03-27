export type ZenPhrase = {
  kanji: string;
  reading: string;
  description: string;
};

export const ZEN_PHRASES: ZenPhrase[] = [
  {
    kanji: "本地風光",
    reading: "ほんちふうこう",
    description: "もともとここにある景色。ずっとここにあった",
  },
  {
    kanji: "廓然無聖",
    reading: "かくぜんむしょう",
    description: "広々と、何もない。それが全部",
  },
  {
    kanji: "如如不動",
    reading: "にょにょふどう",
    description: "何が来ても、ここは揺れない",
  },
  {
    kanji: "竹影掃階塵不動",
    reading: "ちくえいかいをはらえどちりうごかず",
    description: "通り過ぎるものは通り過ぎる。ここは静か",
  },
  {
    kanji: "渓声山色",
    reading: "けいせいさんしょく",
    description: "川の音も、山の姿も。そのままでいい",
  },
  {
    kanji: "雲無心出岫",
    reading: "くもこころなくしゅつしゅう",
    description: "何も考えなくていい。ただ、出てきた",
  },
  {
    kanji: "白雲自去来",
    reading: "はくうんじきょらい",
    description: "来るものは来る。去るものは去る",
  },
  {
    kanji: "行雲流水",
    reading: "こううんりゅうすい",
    description: "流れに逆らわない。それだけでいい",
  },
  {
    kanji: "雨過天青",
    reading: "あめすぎてそらあおし",
    description: "雨が過ぎた。空が青くなった",
  },
  {
    kanji: "清風明月",
    reading: "せいふうめいげつ",
    description: "風が澄んでいる。月が明るい",
  },
  {
    kanji: "月在青天水在瓶",
    reading: "つきはせいてん、みずはかめに",
    description: "月は月の場所に。水は水の場所に",
  },
  {
    kanji: "山川草木悉有仏性",
    reading: "さんせんそうもくことごとくぶっしょうあり",
    description: "山も川も、草も木も。あなたも",
  },
  {
    kanji: "閑雲野鶴",
    reading: "かんうんやかく",
    description: "縛られていない。ただ、そこにいる",
  },
  {
    kanji: "春花秋月",
    reading: "しゅんかしゅうげつ",
    description: "春は花、秋は月。それだけでいい",
  },
  {
    kanji: "夕陽無限好",
    reading: "せきようかぎりなくよし",
    description: "夕陽は、いつも限りなく美しい",
  },
  {
    kanji: "松風水声",
    reading: "しょうふうすいせい",
    description: "松の風と、水の音だけがある",
  },
  {
    kanji: "桃花一枝春",
    reading: "とうかいっしはる",
    description: "一枝の桃の花に、春がある",
  },
  {
    kanji: "春水満四澤",
    reading: "しゅんすいしたくにみつ",
    description: "春の水が、どこにでも満ちている",
  },
  {
    kanji: "春風駘蕩",
    reading: "しゅんぷうたいとう",
    description: "春風が、ゆったりと吹いている",
  },
  {
    kanji: "水月道場",
    reading: "すいげつどうじょう",
    description: "水に映る月のように、確かにある",
  },
  {
    kanji: "水善利万物",
    reading: "みずはよくばんぶつをり",
    description: "水は、すべてを潤して、争わない",
  },
];

export function pickRandomZenPhrase(): ZenPhrase {
  return ZEN_PHRASES[Math.floor(Math.random() * ZEN_PHRASES.length)];
}
