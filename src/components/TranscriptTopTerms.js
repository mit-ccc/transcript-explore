import React, { Component } from 'react';

import { topTermsFromTranscript, formatTime } from '../util';

import './TranscriptTopTerms.css';

class TranscriptTopTerms extends Component {
  render() {
    const { transcript, onSeekTime } = this.props;

    if (transcript == null) {
      return null;
    }

    const topTerms = topTermsFromTranscript(transcript);
    console.log('got top terms', topTerms);
    const filteredTopTerms = topTerms.filter(d => !d.stopword).slice(0, 80);

    return (
      <div className="TranscriptTopTerms">
        {filteredTopTerms.map(term => (
          <TopTerm term={term} key={term.key} onSeekTime={onSeekTime} />
        ))}
      </div>
    );
  }
}

class TopTerm extends Component {
  state = {
    timesVisible: false,
  };

  handleMouseEnter = () => {
    this.setState({
      timesVisible: true,
    });
  };

  handleMouseLeave = () => {
    this.setState({
      timesVisible: false,
    });
  };

  renderTimestamps() {
    const { term, onSeekTime } = this.props;
    const { timesVisible } = this.state;

    if (!timesVisible) {
      return null;
    }

    return (
      <div className="term-timestamps">
        {term.values.map((word, i) => {
          const time = formatTime(word.time);
          return (
            <span
              key={i}
              className="term-timestamp"
              onClick={() => onSeekTime(word.time)}
            >
              <span className="timestamp-time">{time}</span>
              <span className="timestamp-preview">
                {word.concordance.before.join(' ') + ' '}
                <b>{word.string}</b>
                {' ' + word.concordance.after.join(' ')}
              </span>
            </span>
          );
        })}
      </div>
    );
  }

  render() {
    const { term } = this.props;

    return (
      <span
        className="TopTerm"
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
      >
        <span className="term-string">{term.key}</span>
        <span className="term-freq">{term.values.length}</span>
        {this.renderTimestamps()}
      </span>
    );
  }
}

export default TranscriptTopTerms;
