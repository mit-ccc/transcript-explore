import React, { Component } from 'react';

import { formatTime } from '../util';

import './FullTranscript.css';

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
    return (
      <div className="TranscriptSegment">
        <span className="segment-time">
          {formatTime(segment.time)}–{formatTime(segment.endTime)}
        </span>
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
        {word.string}
      </span>
    );
  }
}

export default FullTranscript;
