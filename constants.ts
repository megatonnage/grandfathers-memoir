import { Chapter } from './types';

export const MOCK_CHAPTERS: Chapter[] = [
  {
    id: 'ch1',
    title: 'The Silver River',
    year: '1954',
    contentVi: `Cha tôi luôn nói rằng dòng sông Thu Bồn không bao giờ ngủ. Vào những đêm trăng tròn, mặt nước lấp lánh như hàng ngàn mảnh bạc vỡ vụn.

Chúng tôi thả lưới lúc rạng đông, khi sương mù còn giăng kín những rặng dừa nước. Tiếng mái chèo khua nước là âm thanh duy nhất phá vỡ sự tĩnh lặng của buổi sớm.

Cái lạnh của nước sông mơn trớn bàn chân trần, nhắc nhở chúng tôi về cội nguồn và sự sống.`,
    contentEn: `My father always said the Thu Bon River never sleeps. On full moon nights, the water sparkles like thousands of shattered silver pieces.

We cast our nets at dawn, when fog still blanketed the water coconuts. The sound of oars striking water was the only sound breaking the morning's silence.

The chill of the river water caressed our bare feet, reminding us of our roots and of life itself.`,
    image: 'https://picsum.photos/seed/river/1200/800',
    imageCaption: 'Archived photograph from the 1978 fishing season, colorized and enhanced.',
    annotations: [
      {
        id: 'a1',
        author: 'Auntie Linh',
        content: '"Mặt nước lấp lánh" — I remember this! Ba used to tell us to be quiet so we wouldn\'t wake the silver scales. He believed the fish were sleeping stars.',
        timestamp: 'Yesterday, 4:12 PM',
        era: 'past',
        targetId: 'p1',
        replies: [
          {
            id: 'a1-r1',
            author: 'Minh (Grandson)',
            content: 'That\'s beautiful. I\'m trying to translate "sleeping stars" back into the speculative verse for the archive. Does "Ngôi sao ngủ quên" feel right?',
            timestamp: '2h ago',
            era: 'present'
          }
        ]
      }
    ]
  },
  {
    id: 'ch2',
    title: 'The Delta Does Not Forget',
    year: '1962',
    contentVi: `Trong những ngày khói lửa ấy, đức tin không chỉ là lời cầu nguyện. Nó là hơi thở, là nhịp đập của trái tim rỉ máu giữa lòng Hà Nội.

Cha tôi thường kể về những buổi đọc kinh âm thầm trong hầm trú ẩn, nơi tiếng chuông nhà thờ bị át đi bởi tiếng gầm của đại bác, nhưng tâm hồn con người vẫn kiên định như ngọn nến trước gió.`,
    contentEn: `In those days of smoke and fire, faith was more than just a prayer. It was the breath, the very heartbeat of a bleeding soul in the center of Hanoi.

My father often spoke of the silent prayers in bunkers, where the church bells were drowned by the roar of cannons, yet the human spirit remained as steady as a candle in the wind.`,
    image: 'https://picsum.photos/seed/hanoi/1200/800',
    imageCaption: 'A vintage wooden rosary, a silent witness to the era.',
    annotations: []
  }
];
