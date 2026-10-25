# Narration and ambience credits

**Narration** for every lesson video and the two narrated fact tours is synthesized offline with
[Piper TTS](https://github.com/rhasspy/piper). Two voices are used, each with a mild accent that suits its period:

| Clips | Piper voice | Settings | Voice training data |
|---|---|---|---|
| All narrated clips and tours: Clovis points, Beringia tour, early maize tour, Mayflower voyage, New England, Jamestown settlers, Virginia struggles | `en_GB-aru-medium`, speaker `01` (id 3), a male British English voice | length scale 0.65, noise 0.6–0.75, noise width 0.8; best of 8–16 takes per line, checked by speech recognition | [ARU speech corpus](https://www.liverpool.ac.uk/architecture/research/acoustics-research-unit/speech-corpus/) (University of Liverpool Acoustics Research Unit), CC BY 4.0 |

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
| Jamestown, New England (woodland birdsong) | [Wood Thrush](https://commons.wikimedia.org/wiki/File:Wood_Thrush.ogg) | G. McGrane | Public domain |
| New England | [Black-capped Chickadee 201947598](https://commons.wikimedia.org/wiki/File:Black-capped_Chickadee_201947598.wav) | *ngoomie | CC0 |
| New England | [American Crow](https://commons.wikimedia.org/wiki/File:American_Crow.ogg) | G McGrane | Public domain |
| New England (distant farmyard) | [Medium rooster crowing](https://commons.wikimedia.org/wiki/File:Medium_rooster_crowing.ogg) | alys | Public domain |

**Other ambience:** the soft breeze under Jamestown, New England, Clovis, and the two fact tours was
synthesized with ffmpeg (filtered pink noise). The Mayflower (open sea and storm), Jamestown, Virginia, and Clovis clips also keep
their own natural background sound, slowed with the picture where it is slowed, and checked to contain no voices or music.
