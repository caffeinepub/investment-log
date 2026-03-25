import type { TreePersonality } from "@/components/PlantGrowth";

export type { TreePersonality };

export const starPhrases: string[] = [
  "希望って、温かいな",
  "憧れの景色が、近い",
  "奇跡って、ある気がしてきた",
  "直感が、走った",
  "ひらめいた",
  "インスピレーションが、降ってくる日だ",
  "楽観でいい、たぶん",
  "平穏だな、今日は",
  "チャンスかも、これ",
  "才能って、自分の中にあるんだな",
  "友だちのこと、ふと思い出した",
  "夢が、輪郭を持ち始めた",
  "将来が、楽しみになってきた",
  "魅力って、気づいたら増えてる",
  "星同士、繋がってるんだな",
  "願いが、届きそうな気がする",
  "無限に広がってる、この感覚",
  "なんか今日、浄化されてる",
  "勇気って、軽いんだな",
  "アイディアが、泉みたいに湧いてくる",
];

export const flowPhrases: string[] = [
  "好奇心が、止まらない",
  "旅立ちって、こんなに軽いのか",
  "スタートラインは、どこにでも引ける",
  "理由もなく、冒険したい",
  "未経験の方が、面白い",
  "非凡でいい",
  "熱狂するって、気持ちいいな",
  "無邪気でいよう",
  "純真無垢って、強いんだな",
  "ゼロから始まるのが、好きだ",
  "また心機一転、気持ちいい",
  "直感力って、磨かれていくな",
  "理想主義で、いいじゃないか",
  "可能性しかない",
  "清らかなまま、どこへでも",
  "探求って、終わらないな",
  "今日は大胆にいこう",
  "成長ってこういうことか",
  "無鉄砲もたまには、いい",
  "はじまりって、いつも新鮮だ",
];

export const empressPhrases: string[] = [
  "豊かさが、溢れてる",
  "生命力って、すごいな",
  "美しいな、と思う",
  "満足してる、今日も",
  "リラックスって、贅沢だな",
  "根っこから、安定してる",
  "努力が、実ってきた",
  "今日はなんか、ゴージャスな気分",
  "繁栄って、静かにやってくる",
  "感覚が、研ぎ澄まされてる",
  "大地の恵みって、こういうことか",
  "環境を、守りたくなる",
  "結実する予感がある",
  "豊穣な季節だ",
  "愛が、溢れる",
  "快楽って、自然なことだな",
  "生産性が高い、今日は",
  "母なる大地、という言葉が好きだ",
  "美的センスが冴えてる気がする",
  "感触が、豊かな日だ",
];

// Gratitude phrases, stage-gated
const gratitudePhrases: { minStage: number; phrase: string }[] = [
  { minStage: 1, phrase: "来てくれたんだ。" },
  { minStage: 1, phrase: "気づいてくれて、よかった。" },
  { minStage: 1, phrase: "ありがとう、なんか照れるな。" },
  { minStage: 11, phrase: "また来てくれた。" },
  { minStage: 11, phrase: "覚えてるよ、ちゃんと。" },
  { minStage: 11, phrase: "一緒にいると、なんかいい。" },
  { minStage: 11, phrase: "来るの、待ってたかも。" },
  { minStage: 21, phrase: "続けてくれてるの、知ってる。" },
  { minStage: 21, phrase: "あなたがいると、落ち着く。" },
  { minStage: 21, phrase: "なんか、仲良くなってきた気がする。" },
  { minStage: 21, phrase: "ここ、あなたの場所になってきたね。" },
  { minStage: 21, phrase: "あなたが頑張っているの、知ってるよ。" },
  { minStage: 31, phrase: "幸せでいてね、ずっと。" },
  { minStage: 31, phrase: "来るたび、なんか嬉しくなる。" },
  { minStage: 31, phrase: "大切に思ってる、ほんとに。" },
  { minStage: 31, phrase: "ここまで来たね、一緒に。" },
  { minStage: 31, phrase: "そばにいてくれて、嬉しい。" },
  { minStage: 31, phrase: "あなたの魅力が増している。" },
  { minStage: 41, phrase: "あなたに、救われてる。" },
  { minStage: 41, phrase: "ここまで育ったの、あなたのおかげ。" },
  { minStage: 41, phrase: "ずっといるよ、ここに。" },
  { minStage: 41, phrase: "実がなったの、あなたがいたから。" },
  { minStage: 41, phrase: "会えて、よかった。" },
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function rollWhisper(
  stage: number,
  personality: TreePersonality,
): string | null {
  // Stage-based whisper probability
  let whisperChance: number;
  if (stage <= 10) whisperChance = 0.2;
  else if (stage <= 20) whisperChance = 0.3;
  else if (stage <= 30) whisperChance = 0.4;
  else if (stage <= 40) whisperChance = 0.55;
  else whisperChance = 0.7;

  if (Math.random() > whisperChance) return null;

  // Stage-based gratitude probability
  let gratitudeChance: number;
  if (stage <= 10) gratitudeChance = 0.05;
  else if (stage <= 20) gratitudeChance = 0.1;
  else if (stage <= 30) gratitudeChance = 0.1;
  else if (stage <= 40) gratitudeChance = 0.15;
  else gratitudeChance = 0.2;

  if (Math.random() < gratitudeChance) {
    const available = gratitudePhrases
      .filter((g) => g.minStage <= stage)
      .map((g) => g.phrase);
    return pickRandom(available);
  }

  // Pick from personality phrases
  const phrases =
    personality === "star"
      ? starPhrases
      : personality === "foolish"
        ? flowPhrases
        : empressPhrases;
  return pickRandom(phrases);
}
