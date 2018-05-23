import React, { Component } from 'react';
import * as d3 from 'd3';

import { topTermsFromTranscript, formatTime, renderWord } from '../util';

import './TranscriptTopTerms.css';

class TranscriptTopTerms extends Component {
  static defaultProps = {
    numTerms: 80,
  };
  render() {
    const { transcript, onSeekTime, numTerms } = this.props;

    if (transcript == null) {
      return null;
    }

    const filteredTopTerms = topTermsFromTranscript(transcript, true, numTerms);

    return (
      <div className="TranscriptTopTerms">
        {filteredTopTerms.map(term => (
          <TopTerm
            duration={transcript.duration}
            term={term}
            key={term.key}
            onSeekTime={onSeekTime}
          />
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
                <b>{renderWord(word)}</b>
                {' ' + word.concordance.after.join(' ')}
              </span>
            </span>
          );
        })}
      </div>
    );
  }

  renderTimePlot() {
    const { term, duration } = this.props;
    const scale = d3
      .scaleLinear()
      .domain([0, duration])
      .range([0, 100])
      .clamp(true);
    return (
      <div className="term-timeplot">
        {term.values.map((word, i) => {
          const style = { left: `${scale(word.time)}%` };
          return <div key={i} className="term-timeplot-point" style={style} />;
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
        <span className="term-string">{renderWord(term.values[0])}</span>
        <span className="term-freq">{term.values.length}</span>
        {this.renderTimePlot()}
        {this.renderTimestamps()}
      </span>
    );
  }
}

export default TranscriptTopTerms;
