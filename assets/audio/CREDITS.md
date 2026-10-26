# Narration and ambience credits

**Narration** for every lesson video and the two narrated fact tours is synthesized offline with
[Piper TTS](https://github.com/rhasspy/piper). Two voices are used, each with a mild accent that suits its period:

| Clips | Piper voice | Settings | Voice training data |
|---|---|---|---|
| All narrated clips and tours: Clovis points, Beringia tour, early maize tour, Mayflower voyage, New England, Jamestown settlers, Virginia struggles, Founders of Virginia | `en_GB-aru-medium`, speaker `01` (id 3), a male British English voice | length scale 0.65, noise 0.6–0.75, noise width 0.8; best of 8–16 takes per line, checked by speech recognition | [ARU speech corpus](https://www.liverpool.ac.uk/architecture/research/acoustics-research-unit/speech-corpus/) (University of Liverpool Acoustics Research Unit), CC BY 4.0 |

One narrator voices every clip and tour, set about 10% faster than the first narration (`en_US-lessac-high`, length scale 1.08).
Earlier voices: before v2.1 the English-colony clips used `en_GB-cori-high` (public domain) and the ancient-peoples clips used
`en_US-ryan-high` ([RyanSpeech](https://www.kaggle.com/datasets/roholazandie/ryanspeech), CC BY-NC-SA 4.0); neither is used in the current files.
Every script is read only from that video's captions and Key Facts. The ancient-peoples clips use the same plain narrator
voice and no imitation of any Native accent.
Mixed at about -16 LUFS; ambience sits about 17 dB lower. There is no music.

**Ambience** (all public domain or CC0, from Wikimedia Commons):

| Used in | Recording | Author | License |
|---|---|---|---|
| Mayflower voyage (surf at Cape Cod) | [Ocean Waves on a Tropical Beach](https://commons.wikimedia.org/wiki/File:Ocean_Waves_on_a_Tropical_Beach.ogg) | Jarrod Stanley | CC0 |
| Mayflower voyage (gulls) | [XC707075 - European Herring Gull - Larus argentatus](https://commons.wikimedia.org/wiki/File:XC707075_-_European_Herring_Gull_-_Larus_argentatus.mp3) | Sonothèque ADVL | CC0 |
| Mayflower voyage (storm at sea; below-deck cabin) | Natural sound of the storm shot itself. Under the prayer shot it is low-passed so the sea is heard through the hull, with a soft synthesized wind, and it is ducked under the voice | (part of the clip) | (part of the clip) |
| Mayflower voyage (Plymouth quay, 1620 departure) | The same surf recording, softened and low-passed into water lapping against the stone quay, with a synthesized harbour breeze and the gull recording above | (as above) | CC0 |
| Mayflower voyage (Compact cabin, at anchor) | The calm-sea sound of the open-sea shot, low-passed so it is heard through the hull, with a faint synthesized wind, ducked under the voice | (part of the clip) | (part of the clip) |
| Jamestown, Founders of Virginia, New England (woodland birdsong) | [Wood Thrush](https://commons.wikimedia.org/wiki/File:Wood_Thrush.ogg) | G. McGrane | Public domain |
| New England | [Black-capped Chickadee 201947598](https://commons.wikimedia.org/wiki/File:Black-capped_Chickadee_201947598.wav) | *ngoomie | CC0 |
| New England | [American Crow](https://commons.wikimedia.org/wiki/File:American_Crow.ogg) | G McGrane | Public domain |
| New England (distant farmyard) | [Medium rooster crowing](https://commons.wikimedia.org/wiki/File:Medium_rooster_crowing.ogg) | alys | Public domain |
| Jamestown, Founders of Virginia (James River bank, low-passed) | [Forest lawn creek](https://commons.wikimedia.org/wiki/File:Forest_lawn_creek.ogg) | Dsw4 | Public domain |
| Jamestown (riverbank at the fort) | [On a pebble beach](https://commons.wikimedia.org/wiki/File:On_a_pebble_beach.ogg) | earthcalling | Public domain |
| Jamestown (gulls at the river) | [XC707075 - European Herring Gull - Larus argentatus](https://commons.wikimedia.org/wiki/File:XC707075_-_European_Herring_Gull_-_Larus_argentatus.mp3) | Sonothèque ADVL | CC0 |
| Jamestown, Founders of Virginia (Chesapeake shore, softened) | [Ocean Waves on a Tropical Beach](https://commons.wikimedia.org/wiki/File:Ocean_Waves_on_a_Tropical_Beach.ogg) | Jarrod Stanley | CC0 |
| Founders of Virginia (winter wind, low-passed), Clovis points (open plains wind, low-passed) | [Howling wind](https://commons.wikimedia.org/wiki/File:Howling_wind.ogg) | Tvabutzku1234 | CC0 |

**Other ambience:** the soft breeze under Jamestown, Founders of Virginia, New England, Clovis, and the two fact tours was
synthesized with ffmpeg (filtered pink noise). The Mayflower (open sea and storm), Virginia, and Founders of Virginia (two shots) clips also keep
their own natural background sound, slowed with the picture where it is slowed, and checked to contain no voices or music.
