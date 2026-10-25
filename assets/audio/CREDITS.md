# Narration and ambience credits

**Narration** for every lesson video and the two narrated fact tours is synthesized offline with
[Piper TTS](https://github.com/rhasspy/piper). Two voices are used, each with a mild accent that suits its period:

| Clips | Piper voice | Settings | Voice training data |
|---|---|---|---|
| Mayflower voyage, New England, Jamestown settlers, Virginia struggles (English colonists) | `en_GB-cori-high` (British English) | length scale 0.79, noise 0.6–0.667, noise width 0.8 | LibriVox recordings, public domain |
| Clovis points, Beringia tour, early maize tour (ancient peoples) | `en_US-ryan-high` (American English) | length scale 0.85, noise 0.667, noise width 0.8 | [RyanSpeech](https://www.kaggle.com/datasets/roholazandie/ryanspeech), CC BY-NC-SA 4.0 (used non-commercially) |

The length scales differ because the two voices speak at different natural rates. Both are set about 8–10% faster than
the first narration (`en_US-lessac-high`, length scale 1.08). Every script is read only from that video's captions and Key
Facts. The ancient-peoples clips deliberately use a neutral American narrator and no imitation of any Native accent.
Mixed at about -16 LUFS; ambience sits about 17 dB lower. There is no music.

**Ambience** (all public domain or CC0, from Wikimedia Commons):

| Used in | Recording | Author | License |
|---|---|---|---|
| Mayflower voyage (surf at Cape Cod) | [Ocean Waves on a Tropical Beach](https://commons.wikimedia.org/wiki/File:Ocean_Waves_on_a_Tropical_Beach.ogg) | Jarrod Stanley | CC0 |
| Mayflower voyage (gulls) | [XC707075 - European Herring Gull - Larus argentatus](https://commons.wikimedia.org/wiki/File:XC707075_-_European_Herring_Gull_-_Larus_argentatus.mp3) | Sonothèque ADVL | CC0 |
| Jamestown, New England (woodland birdsong) | [Wood Thrush](https://commons.wikimedia.org/wiki/File:Wood_Thrush.ogg) | G. McGrane | Public domain |
| New England | [Black-capped Chickadee 201947598](https://commons.wikimedia.org/wiki/File:Black-capped_Chickadee_201947598.wav) | *ngoomie | CC0 |
| New England | [American Crow](https://commons.wikimedia.org/wiki/File:American_Crow.ogg) | G McGrane | Public domain |
| New England (distant farmyard) | [Medium rooster crowing](https://commons.wikimedia.org/wiki/File:Medium_rooster_crowing.ogg) | alys | Public domain |

**Other ambience:** the soft breeze under Jamestown, New England, Clovis, and the two fact tours was
synthesized with ffmpeg (filtered pink noise). The Mayflower (open sea), Jamestown, Virginia, and Clovis clips also keep
their own natural background sound, slowed with the picture and checked to contain no voices or music.
