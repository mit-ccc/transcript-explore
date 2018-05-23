import React, { Component } from 'react';
import cx from 'classnames';
import { scaleOrdinal } from 'd3';

import { formatTime, renderWord } from '../util';

import './FullTranscript.css';

const femaleColorScale = scaleOrdinal().range([
  '#DF5144',
  '#BA3843',
  '#771734',
  '#4D0B31',
]);
const maleColorScale = scaleOrdinal().range([
  '#488AA8',
  '#2D6CA6',
  '#314DA0',
  '#1E367F',
]);

class FullTranscript extends Component {
  render() {
    const { transcript, onSelectWord } = this.props;

    if (transcript == null) {
      return null;
    }

    return (
      <div className="FullTranscript">
        {transcript.segments.map((segment, i) => (
          <TranscriptSegment
            key={i}
            segment={segment}
            onSelectWord={onSelectWord}
          />
        ))}
      </div>
    );
  }
}

class TranscriptSegment extends Component {
  render() {
    const { segment, onSelectWord } = this.props;
    const { speakerInfo } = segment;
    let color;
    if (speakerInfo) {
      color =
        speakerInfo.gender === 'M'
          ? maleColorScale(speakerInfo.id)
          : femaleColorScale(speakerInfo.id);
    }

    return (
      <div className="TranscriptSegment">
        <div className="segment-header">
          {speakerInfo && (
            <span
              className={cx('segment-speaker-avatar', {
                'male-speaker': speakerInfo.gender === 'M',
                'female-speaker': speakerInfo.gender === 'F',
              })}
              style={{ backgroundColor: color }}
            >
              S{speakerInfo.id}
            </span>
          )}
          {speakerInfo && (
            <span
              className={cx('segment-speaker', {
                'male-speaker': speakerInfo.gender === 'M',
                'female-speaker': speakerInfo.gender === 'F',
              })}
            >
              Speaker {speakerInfo.id}
            </span>
          )}
          <span className="segment-time">
            {formatTime(segment.time)}–{formatTime(segment.endTime)}
          </span>
        </div>
        {segment.words.map((word, i) => [
          <React.Fragment key={i}>
            <TranscriptWord word={word} onClick={onSelectWord} />{' '}
          </React.Fragment>,
        ])}
      </div>
    );
  }
}

class TranscriptWord extends Component {
  handleClick = () => {
    this.props.onClick(this.props.word);
  };

  render() {
    const { word } = this.props;
    return (
      <span className="TranscriptWord" onClick={this.handleClick}>
        {renderWord(word)}
      </span>
    );
  }
}

export default FullTranscript;
