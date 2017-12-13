import * as d3 from 'd3';

/**
 * Converts a TSV file with word, start time, end time into segments
 * and words.
 */
export function readTranscriptFromTsv(tsv) {
  const words = d3.tsvParseRows(tsv, (d, i) => ({
    string: d[0],
    time: +d[1],
    endTime: +d[2],
  }));

  const segments = discoverSegmentsFromWords(words);

  const transcript = { words, segments };
  console.log('Read transcript', transcript);
  return transcript;
}

/**
 * Looks for gaps in end times of words to compute where segments should be split
 */
function discoverSegmentsFromWords(words) {
  const segments = [];
  let currSegment = {
    words: [words[0]],
    time: words[0].time,
    endTime: words[0].endTime,
  };

  // amount of seconds before a new segment is defined
  const segmentThreshold = 1.5;

  for (let i = 1; i < words.length; ++i) {
    const word = words[i];
    const lastWord = words[i - 1];
    if (word.endTime - lastWord.endTime > segmentThreshold) {
      // end current segment
      segments.push(currSegment);
      currSegment = {
        words: [],
        time: word.time,
      };
    }

    // add to segment
    currSegment.words.push(word);
    currSegment.endTime = word.endTime;
  }

  segments.push(currSegment);

  return segments;
}
