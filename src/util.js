import * as d3 from 'd3';
import stopwords from './stopwords.json';

/**
 * Converts a TSV file with word, start time, end time into segments
 * and words.
 */
export function readTranscriptFromTsv(tsv) {
  // create a map of stopwords for O(1) lookups
  const stopwordMap = d3
    .nest()
    .key(d => d)
    .rollup(() => true)
    .object(stopwords.map(d => d.toLowerCase()));

  const words = d3.tsvParseRows(tsv, (d, i) => ({
    string: d[0],
    time: +d[1],
    endTime: +d[2],
    stopword: stopwordMap[d[0].toLowerCase()] != null,
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

export function leftPad(num) {
  if (num < 10) {
    return `0${num}`;
  }

  return `${num}`;
}

export function formatTime(time) {
  const hours = Math.floor(time / (60 * 60));
  const minutes = Math.floor((time % (60 * 60)) / 60);
  const seconds = Math.floor(time % 60);

  const parts = [minutes, seconds];
  if (hours > 0) {
    parts.unshift(hours);
  }

  return parts.map(leftPad).join(':');
}

/**
 * Takes a transcript and produces the top terms with links to all occurrences
 */
export function topTermsFromTranscript(transcript) {
  const terms = d3
    .nest()
    .key(d => d.string)
    .entries(transcript.words)
    .sort((a, b) => b.values.length - a.values.length);

  terms.forEach(term => {
    term.stopword = term.values[0].stopword;
  });

  return terms;
}
