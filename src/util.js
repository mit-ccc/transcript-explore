import * as d3 from 'd3';
import stopwords from './stopwords.json';

// create a map of stopwords for O(1) lookups
const stopwordMap = d3
  .nest()
  .key(d => d)
  .rollup(() => true)
  .object(stopwords.map(d => d.toLowerCase()));

/**
 * Convert words from TSV format "word\tstart\tend" to normalized JSON format
 */
function normalizeWordsFromTsv(tsv) {
  const words = d3.tsvParseRows(tsv, (d, i) => ({
    string: d[0],
    time: +d[1],
    endTime: +d[2],
    stopword: stopwordMap[d[0].toLowerCase()] != null,
  }));

  return words;
}

/**
 * Convert words from JSON format [word, start, end] to normalized JSON format
 */
function normalizeWordsFromJson(json) {
  const words = json.words.map(word => ({
    string: word[0],
    time: word[1],
    endTime: word[2],
    stopWord: stopwordMap[word[0].toLowerCase()] != null,
  }));
  return words;
}

/**
 * Given a list of normalized words, process the rest of the transcript segments
 * and other metadata.
 */
function processTranscript(words) {
  addConcordance(words);

  const segments = discoverSegmentsFromWords(words);

  const transcript = {
    words,
    segments,
    duration: words[words.length - 1].endTime,
  };

  return transcript;
}

/**
 * Converts a TSV file with word, start time, end time into segments
 * and words.
 */
export function readTranscriptFromTsv(tsv) {
  return processTranscript(normalizeWordsFromTsv(tsv));
}

/**
 * Converts a transcript JSON file to the expected transcript format.
 */
export function readTranscriptFromJson(json) {
  return processTranscript(normalizeWordsFromJson(json));
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

/**
 * Given a list of words, create concordance previews around each
 */
function addConcordance(words) {
  const numWords = 5; // before and after
  const numBefore = numWords;
  const numAfter = numWords;

  words.forEach((word, i) => {
    let beforeWordIndex = Math.max(0, i - numBefore);
    let afterWordIndex = Math.min(i + 1, words.length - 1);
    let beforeWords = [];
    let afterWords = [];

    while (beforeWordIndex < i) {
      beforeWords.push(words[beforeWordIndex].string);
      beforeWordIndex += 1;
    }

    while (
      afterWordIndex > i &&
      afterWordIndex <= Math.min(i + numAfter, words.length - 1)
    ) {
      afterWords.push(words[afterWordIndex].string);
      afterWordIndex += 1;
    }

    word.concordance = {
      before: beforeWords,
      after: afterWords,
      string: [...beforeWords, word.string, ...afterWords].join(' '),
    };
  });

  return words;
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

  // don't leftpad biggest number
  return parts.map((d, i) => (i > 0 ? leftPad(d) : d)).join(':');
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
