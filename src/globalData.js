import { tsvParseRows, mean } from 'd3';

const globalData = {
  unigramCounts: { __default: 1 },
  wordDenorm: {},
};
window.globalData = globalData;

export default globalData;

export function initializeGlobalData() {
  const { unigramCounts, wordDenorm } = globalData;

  return Promise.all([
    fetch('data/unigram_counts.tsv')
      .then(response => response.text())
      .then(fileContents => {
        tsvParseRows(fileContents, d => {
          const word = d[0];
          const count = +d[1];
          unigramCounts[word] = count;
        });

        // compute mean for a deafult value
        unigramCounts.__default = mean(Object.values(unigramCounts));
      }),

    fetch('data/word_denorm.tsv')
      .then(response => response.text())
      .then(fileContents => {
        tsvParseRows(fileContents, d => {
          const word = d[0];
          const normalized = d[1];
          wordDenorm[word] = normalized;
        });
      }),
  ]).then(() => {
    console.log('loaded global data');
  });
}
