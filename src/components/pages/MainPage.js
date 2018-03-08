import React, { Component } from 'react';
import { Button, Container, Row, Col } from 'reactstrap';
import ReactAudioPlayer from 'react-audio-player';
import { Navbar, NavbarBrand, Nav, NavItem } from 'reactstrap';
import { addUrlProps, UrlQueryParamTypes } from 'react-url-query';

import { readTranscriptFromTsv } from '../../util';
import FullTranscript from '../FullTranscript';
import TranscriptTopTerms from '../TranscriptTopTerms';
import TranscriptFileSelector from '../TranscriptFileSelector';
import SoundFileSelector from '../SoundFileSelector';

import './MainPage.css';

/** Configuration for URL query parameters */
const urlPropsQueryConfig = {
  tsvUrl: { type: UrlQueryParamTypes.string },
  externalAudioUrl: { type: UrlQueryParamTypes.string, queryParam: 'audioUrl' },
  startTimestamp: { type: UrlQueryParamTypes.string, queryParam: 't' }
};

class MainPage extends Component {
  state = {
    transcript: null,
    audioUrl: null,
  };

  componentWillMount() {
    const { tsvUrl, externalAudioUrl } = this.props;
    if (tsvUrl != null) {
      this.fetchTranscript(tsvUrl);
    }
    if (externalAudioUrl != null) {
      this.setState({
        audioUrl: externalAudioUrl,
      });
    }
  }

  componentDidMount() {
      const { startTimestamp } = this.props;
      if (startTimestamp != null) {
          this.handleSeekAudio(parseFloat(startTimestamp));
      }
  }

  componentWillReceiveProps(nextProps) {
    const { tsvUrl: currTsvUrl } = this.props;
    const { tsvUrl: nextTsvUrl } = nextProps;

    if (currTsvUrl !== nextTsvUrl) {
      this.fetchTranscript(nextTsvUrl);
    }
  }

  handleTsvFileChange = tsv => {
    const { onChangeTsvUrl } = this.props;

    this.setState({
      transcript: readTranscriptFromTsv(tsv),
      loadingTranscript: false,
    });

    // remove URL when setting a file
    onChangeTsvUrl(null);
  };

  fetchTranscript(transcriptUrl) {
    console.log('fetch transcript at url', transcriptUrl);
    this.setState({ loadingTranscript: true });
    fetch(transcriptUrl)
      .then(response => response.text())
      .then(tsv => {
        this.setState({
          transcript: readTranscriptFromTsv(tsv),
          loadingTranscript: false,
        });
      });
  }

  handleSoundFileChange = file => {
    const { onChangeExternalAudioUrl } = this.props;

    console.log('got sound file', file);
    // NOTE: using FileReader here breaks seeking and is heavy on memory usage
    // note we have to use audioUrl in state here instead of directly in props
    // since this file blob URL is different than a typical external URL,
    // so we don't want it populating the URL query param or the set URL field.
    this.setState({
      audioUrl: URL.createObjectURL(file),
    });
    onChangeExternalAudioUrl(null);
  };

  handleSoundUrlChange = externalAudioUrl => {
    const { onChangeExternalAudioUrl } = this.props;
    console.log('sound url is', externalAudioUrl);

    this.setState({
      audioUrl: externalAudioUrl,
    });
    onChangeExternalAudioUrl(externalAudioUrl);
  };

  /**
   * Jump to and play a particular part of the sound
   */
  handleSeekAudio = seconds => {
    if (this.audioPlayer && this.audioPlayer.audioEl) {
      console.log('seeking to', seconds);
      this.audioPlayer.audioEl.play();
      this.audioPlayer.audioEl.currentTime = seconds;
    }
  };

  handleShortRewind = () => {
    const rewindAmount = 5;
    const time = Math.max(
      0,
      this.audioPlayer.audioEl.currentTime - rewindAmount
    );
    this.handleSeekAudio(time);
  };

  handleSeekToWord = word => {
    this.handleSeekAudio(word.time);
  };

  renderFileInputs() {
    const { tsvUrl, onChangeTsvUrl, externalAudioUrl } = this.props;
    const { loadingTranscript } = this.state;

    return (
      <div className="mb-4">
        <Row>
          <Col sm="6" className="upload-box">
            <TranscriptFileSelector
              loadingTranscript={loadingTranscript}
              url={tsvUrl}
              onChangeUrl={onChangeTsvUrl}
              onChangeFile={this.handleTsvFileChange}
            />
          </Col>
          <Col sm="6" className="upload-box">
            <SoundFileSelector
              url={externalAudioUrl}
              onChangeUrl={this.handleSoundUrlChange}
              onChangeFile={this.handleSoundFileChange}
            />
          </Col>
        </Row>
      </div>
    );
  }

  renderTranscript() {
    const { transcript } = this.state;

    if (!transcript) {
      return null;
    }

    return (
      <div className="text-container mb-4">
        <h5>Full Transcript</h5>

        <FullTranscript
          transcript={transcript}
          onSelectWord={this.handleSeekToWord}
        />
      </div>
    );
  }

  renderSoundPlayer() {
    const { audioUrl } = this.state;

    return (
      <div className="sound-player-container">
        {!audioUrl && (
          <span className="text-muted">Please select a sound file.</span>
        )}
        {audioUrl && (
          <div>
            <Button
              size="sm align-top"
              className="mr-1"
              onClick={this.handleShortRewind}
            >
              Rewind 5s
            </Button>
            <ReactAudioPlayer
              src={audioUrl}
              controls
              ref={node => (this.audioPlayer = node)}
            />
          </div>
        )}
      </div>
    );
  }

  renderNav() {
    return (
      <Navbar className="main-nav" color="dark" expand="md" fixed="top">
        <Container>
          <NavbarBrand tag="span" className="mr-4">
            Transcript Explorer
          </NavbarBrand>
          <Nav navbar>
            <NavItem>{this.renderSoundPlayer()}</NavItem>
          </Nav>
        </Container>
      </Navbar>
    );
  }

  renderTopTerms() {
    const { transcript } = this.state;

    if (!transcript) {
      return null;
    }

    return (
      <div className="mb-4">
        <h5>Top Terms</h5>
        <TranscriptTopTerms
          transcript={transcript}
          onSeekTime={this.handleSeekAudio}
        />
      </div>
    );
  }

  render() {
    return (
      <div className="MainPage">
        {this.renderNav()}
        <Container>
          {this.renderFileInputs()}
          {this.renderTopTerms()}
          {this.renderTranscript()}
        </Container>
      </div>
    );
  }
}

export default addUrlProps({ urlPropsQueryConfig })(MainPage);
