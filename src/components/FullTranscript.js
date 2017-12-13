import React, { Component } from 'react';

import './FullTranscript.css';

function leftPad(num) {
  if (num < 10) {
    return `0${num}`;
  }

  return `${num}`;
}

function formatTime(time) {
  const hours = Math.floor(time / (60 * 60));
  const minutes = Math.floor((time % (60 * 60)) / 60);
  const seconds = Math.floor(time % 60);

  const parts = [minutes, seconds];
  if (hours > 0) {
    parts.unshift(hours);
  }

  return parts.map(leftPad).join(':');
}

class FullTranscript extends Component {
  state = {
    tsvFileContents: null,
    tsvFilename: null,
    transcript: null,
    soundFileContents: null,
    soundFilename: null,
  };

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
