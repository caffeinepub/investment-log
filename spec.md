# Meditation Log

## Current State
MeditationLog.tsx handles record saving, tree growth state, and UI. PlantGrowth.tsx renders the SVG tree for Star/Flow/Empress personalities across 50 stages. No whisper/phrase system exists yet.

## Requested Changes (Diff)

### Add
- **Tree whisper system**: After saving a record, roll probability based on current stage to display a random phrase (独り言) from the active personality
- **Gratitude phrases**: Shared across all personalities, stage-gated, displayed within whisper probability at lower rate
- **WhisperBubble component**: Subtle UI overlay near the tree showing the phrase, fades in/out

### Modify
- MeditationLog.tsx: trigger whisper check after successful record save

### Remove
- Nothing

## Implementation Plan

### Whisper probability by stage
- Stage 1-10: 20%
- Stage 11-20: 30%
- Stage 21-30: 40%
- Stage 31-40: 55%
- Stage 41-50: 70%

### Gratitude phrase probability within whisper rolls
- Stage 1-10: 5%
- Stage 11-20: 10%
- Stage 21-30: 10%
- Stage 31-40: 15%
- Stage 41-50: 20%

### Star phrases (20)
「希望って、温かいな」「憧れの景色が、近い」「奇跡って、ある気がしてきた」「直感が、走った」「ひらめいた」「インスピレーションが、降ってくる日だ」「楽観でいい、たぶん」「平穏だな、今日は」「チャンスかも、これ」「才能って、自分の中にあるんだな」「友だちのこと、ふと思い出した」「夢が、輪郭を持ち始めた」「将来が、楽しみになってきた」「魅力って、気づいたら増えてる」「星同士、繋がってるんだな」「願いが、届きそうな気がする」「無限に広がってる、この感覚」「なんか今日、浄化されてる」「勇気って、軽いんだな」「アイディアが、泉みたいに湧いてくる」

### Flow phrases (20)
「好奇心が、止まらない」「旅立ちって、こんなに軽いのか」「スタートラインは、どこにでも引ける」「理由もなく、冒険したい」「未経験の方が、面白い」「非凡でいい」「熱狂するって、気持ちいいな」「無邪気でいよう」「純真無垢って、強いんだな」「ゼロから始まるのが、好きだ」「また心機一転、気持ちいい」「直感力って、磨かれていくな」「理想主義で、いいじゃないか」「可能性しかない」「清らかなまま、どこへでも」「探求って、終わらないな」「今日は大胆にいこう」「成長ってこういうことか」「無鉄砲もたまには、いい」「はじまりって、いつも新鮮だ」

### Empress phrases (20)
「豊かさが、溢れてる」「生命力って、すごいな」「美しいな、と思う」「満足してる、今日も」「リラックスって、贅沢だな」「根っこから、安定してる」「努力が、実ってきた」「今日はなんか、ゴージャスな気分」「繁栄って、静かにやってくる」「感覚が、研ぎ澄まされてる」「大地の恵みって、こういうことか」「環境を、守りたくなる」「結実する予感がある」「豊穣な季節だ」「愛が、溢れる」「快楽って、自然なことだな」「生産性が高い、今日は」「母なる大地、という言葉が好きだ」「美的センスが冴えてる気がする」「感触が、豊かな日だ」

### Gratitude phrases by stage unlock
- Stage 1-10 available: 「来てくれたんだ。」「気づいてくれて、よかった。」「ありがとう、なんか照れるな。」
- Stage 11-20 adds: 「また来てくれた。」「覚えてるよ、ちゃんと。」「一緒にいると、なんかいい。」「来るの、待ってたかも。」
- Stage 21-30 adds: 「続けてくれてるの、知ってる。」「あなたがいると、落ち着く。」「なんか、仲良くなってきた気がする。」「ここ、あなたの場所になってきたね。」「あなたが頑張っているの、知ってるよ。」
- Stage 31-40 adds: 「幸せでいてね、ずっと。」「来るたび、なんか嬉しくなる。」「大切に思ってる、ほんとに。」「ここまで来たね、一緒に。」「そばにいてくれて、嬉しい。」「あなたの魅力が増している。」
- Stage 41-50 adds: 「あなたに、救われてる。」「ここまで育ったの、あなたのおかげ。」「ずっといるよ、ここに。」「実がなったの、あなたがいたから。」「会えて、よかった。」

### WhisperBubble UI
- Appears near the tree after record save
- Soft fade-in/out animation (~3 seconds visible)
- Small, unobtrusive text in a subtle rounded bubble
- Calm typography, fits the app's aesthetic
- Does not block interaction
