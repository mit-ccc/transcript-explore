import React from 'react';
import ReactHowler from 'react-howler';
import cx from 'classnames';
import { Icon } from 'react-fa';
import { scaleLinear } from 'd3';
import { formatTime } from '../../util';
// import { LoadingSpinner } from '@corticoai/cortico-react';

import './AudioPlayer.css';

// interface Props {
//   src: string | string[] | undefined;
//   playing?: boolean;
//   onPlay?: () => void;
//   onPause?: () => void;
//   onStop?: () => void;
//   onEnd?: () => void;
// }

const AUDIO_FORMATS = ['aac', 'webm', 'mp3'];

class AudioPlayer extends React.Component {
  componentWillReceiveProps(nextProps) {
    if (nextProps.playing != null) {
      this.setState({ playing: nextProps.playing });
    }
  }

  state = {
    dragging: false,
    playing: false,
    loaded: false,
    seek: undefined,
    duration: undefined,
  };

  player = null;
  raf = null;
  durationBar = null;

  componentWillUnmount() {
    if (this.raf) {
      cancelAnimationFrame(this.raf);
    }
  }

  componentDidUpdate(prevProps) {
    const { src } = this.props;
    if (src !== prevProps.src) {
      this.setState({
        loaded: false,
        seek: undefined,
        duration: undefined,
      });
    }
  }

  handleTogglePlaying = () => {
    this.setState({
      playing: !this.state.playing,
    });
  };

  handleLoaded = () => {
    this.setState({
      loaded: true,
      duration: this.player.duration(),
      seek: this.player.seek(),
    });
  };

  handleHowlerPlay = () => {
    const { onPlay } = this.props;
    this.setState({
      playing: true,
      seek: this.player.seek(),
    });
    this.updateSeek();
    if (onPlay) onPlay();
  };

  handleHowlerPause = () => {
    const { onPause } = this.props;
    if (onPause) onPause();
  };

  handleHowlerStop = () => {
    const { onStop } = this.props;
    if (onStop) onStop();
  };

  handleHowlerEnd = () => {
    const { onEnd } = this.props;
    if (this.raf) {
      cancelAnimationFrame(this.raf);
    }

    this.setState({
      playing: false,
    });

    if (onEnd) onEnd();
  };

  handleStartSeekDrag = evt => {
    this.seekByXPosition(evt.clientX);
    this.setState({
      dragging: true,
    });
    document.body.addEventListener('mousemove', this.handleSeekDragMouseMove);
    document.body.addEventListener('mouseup', this.handleStopDrag);
    document.body.addEventListener('mouseleave', this.handleStopDrag);
  };
  handleSeekDragMouseMove = evt => {
    this.seekByXPosition(evt.clientX);
  };

  handleStopDrag = evt => {
    this.seekByXPosition(evt.clientX);
    this.setState({
      dragging: false,
    });
    document.body.removeEventListener(
      'mousemove',
      this.handleSeekDragMouseMove
    );
    document.body.removeEventListener('mouseup', this.handleStopDrag);
    document.body.removeEventListener('mouseleave', this.handleStopDrag);
  };

  seekByXPosition = x => {
    const { duration = 0 } = this.state;
    const barRect = this.durationBar.getBoundingClientRect();

    const xScale = scaleLinear()
      .domain([barRect.x, barRect.x + barRect.width])
      .range([0, duration])
      .clamp(true);

    const seek = xScale(x);

    this.player.seek(seek);
    this.setState({
      seek,
    });
  };

  updateSeek = () => {
    const { playing, loaded } = this.state;

    // if we do not have a player anymore ignore this
    if (!this.player) {
      return;
    }

    if (loaded) {
      this.setState({
        seek: this.player.seek(),
      });
    }

    if (playing) {
      this.raf = requestAnimationFrame(this.updateSeek);
    }
  };

  render() {
    const { src } = this.props;
    const { playing, loaded, seek, duration, dragging } = this.state;

    if (!src) {
      return null; // note this will destroy the `this.player` ref
    }

    const timeScale = scaleLinear()
      .domain([0, duration || 0])
      .range([0, 100]);

    return (
      <div
        className={cx('AudioPlayer', {
          playing,
          loaded,
          loading: !loaded,
          dragging,
        })}
      >
        <ReactHowler
          src={src}
          playing={playing}
          onLoad={this.handleLoaded}
          onPlay={this.handleHowlerPlay}
          onPause={this.handleHowlerPause}
          onStop={this.handleHowlerStop}
          onEnd={this.handleHowlerEnd}
          format={AUDIO_FORMATS}
          ref={node => (this.player = node)}
        />
        <button className="play-pause-btn" onClick={this.handleTogglePlaying}>
          {playing ? <Icon name="pause" /> : <Icon name="play" />}
        </button>
        <div className="play-status-bar">
          <span className="seek-time">
            {!loaded && 'LOAD'}
            {seek == null ? '' : formatTime(seek)}
          </span>
          <div
            className="interaction-bar"
            onMouseDown={this.handleStartSeekDrag}
          >
            <div
              className="duration-bar"
              ref={node => (this.durationBar = node)}
            >
              <div
                className="seek-bar"
                style={{ width: `${timeScale(seek || 0)}%` }}
              />
              <span
                className="seek-control"
                style={{ left: `${timeScale(seek || 0)}%` }}
              />
            </div>
          </div>
          <span className="duration-time">
            {duration == null ? '' : formatTime(duration)}
          </span>
        </div>
      </div>
    );
  }
}

export default AudioPlayer;
