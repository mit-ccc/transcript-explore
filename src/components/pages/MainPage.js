import React, { Component } from 'react';
import { Button, Container, Row, Col } from 'reactstrap';
import ReactAudioPlayer from 'react-audio-player';
import { Navbar, NavbarBrand, Nav, NavItem } from 'reactstrap';
import { addUrlProps, UrlQueryParamTypes } from 'react-url-query';

import { readTranscriptFromTsv, readTranscriptFromJson } from '../../util';
import FullTranscript from '../FullTranscript';
import TranscriptTopTerms from '../TranscriptTopTerms';
import TranscriptFileSelector from '../TranscriptFileSelector';
import SoundFileSelector from '../SoundFileSelector';

import './MainPage.css';

/** Configuration for URL query parameters */
const urlPropsQueryConfig = {
  tsvUrl: { type: UrlQueryParamTypes.string }, // deprecated
  transcriptUrl: { type: UrlQueryParamTypes.string }, // takes precedence over tsvUrl
  externalAudioUrl: { type: UrlQueryParamTypes.string, queryParam: 'audioUrl' },
  startTimestamp: { type: UrlQueryParamTypes.number, queryParam: 't' },
};

class MainPage extends Component {
  state = {
    transcript: null,
    audioUrl: null,
  };

  componentWillMount() {
    const {
      tsvUrl,
      transcriptUrl,
      externalAudioUrl,
      onChangeUrlQueryParams,
    } = this.props;
    if (transcriptUrl != null) {
      this.fetchTranscript(transcriptUrl);
    }

    // remove deprecated url query param
    if (tsvUrl != null) {
      const changes = { tsvUrl: null };

      // rename to transcriptUrl unless we already have it, in which case just drop tsvUrl
      if (transcriptUrl == null) {
        changes.transcriptUrl = tsvUrl;
      }
      onChangeUrlQueryParams(changes);
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
      this.handleSeekAudio(startTimestamp);
    }
  }

  componentWillReceiveProps(nextProps) {
    const { transcriptUrl: currTranscriptUrl } = this.props;
    const { transcriptUrl: nextTranscriptUrl } = nextProps;

    if (currTranscriptUrl !== nextTranscriptUrl && nextTranscriptUrl) {
      this.fetchTranscript(nextTranscriptUrl);
    }
  }

  handleTranscriptFileChange = (transcriptFilename, fileContents) => {
    const { onChangeUrlQueryParams } = this.props;

    console.log('got transcriptFile', transcriptFilename);
    let transcript;
    if (/.tsv$/.test(transcriptFilename)) {
      transcript = readTranscriptFromTsv(fileContents);
    } else {
      transcript = readTranscriptFromJson(JSON.parse(fileContents));
    }
    console.log('loaded transcript', transcript);

    this.setState({
      transcript,
      loadingTranscript: false,
    });

    // remove URL when setting a file
    onChangeUrlQueryParams({ transcriptUrl: null, tsvUrl: null });
  };

  fetchTranscript(transcriptUrl) {
    console.log('fetch transcript at url', transcriptUrl);
    this.setState({ loadingTranscript: true });
    fetch(transcriptUrl)
      .then(response => response.text())
      .then(fileContents => {
        let transcript;

        if (/.tsv$/.test(transcriptUrl)) {
          transcript = readTranscriptFromTsv(fileContents);
        } else {
          transcript = readTranscriptFromJson(JSON.parse(fileContents));
        }
        this.setState({
          transcript: transcript,
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
    const {
      transcriptUrl,
      onChangeTranscriptUrl,
      externalAudioUrl,
    } = this.props;
    const { loadingTranscript } = this.state;
    console.log('RENDER transcriptUrl', transcriptUrl);

    return (
      <div className="mb-4">
        <Row>
          <Col sm="6" className="upload-box">
            <TranscriptFileSelector
              loadingTranscript={loadingTranscript}
              url={transcriptUrl}
              onChangeUrl={onChangeTranscriptUrl}
              onChangeFile={this.handleTranscriptFileChange}
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
