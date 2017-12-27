import React, { Component } from 'react';
import { Button, Container, Row, Col } from 'reactstrap';
import ReactAudioPlayer from 'react-audio-player';
import cx from 'classnames';
import { Navbar, NavbarBrand, Nav, NavItem } from 'reactstrap';

import { readTranscriptFromTsv } from './util';
import FullTranscript from './components/FullTranscript';
import TranscriptTopTerms from './components/TranscriptTopTerms';

import './App.css';

class App extends Component {
  state = {
    tsvFileContents: null,
    tsvFilename: null,
    transcript: null,
    soundFileUrl: null,
    soundFilename: null,
  };

  handleTsvFileChange = evt => {
    const file = evt.target.files[0];
    console.log('got tsv file', file);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.setState({
          tsvFileContents: reader.result,
          tsvFilename: file,
          transcript: readTranscriptFromTsv(reader.result),
          loadingTranscript: false,
        });
      };

      reader.readAsText(file);
    }
  };

  handleTranscriptUrlChange = () => {
    const transcriptUrl = this.transcriptUrlInput.value.trim();
    console.log('transcript url is', transcriptUrl);

    this.setState({ loadingTranscript: true });

    fetch(transcriptUrl)
      .then(response => response.text())
      .then(tsv => {
        this.setState({
          tsvFileContents: tsv,
          tsvFilename: transcriptUrl,
          transcript: readTranscriptFromTsv(tsv),
          loadingTranscript: false,
        });
      });
  };

  handleSoundFileChange = evt => {
    const file = evt.target.files[0];
    console.log('got sound file', file);
    // NOTE: using FileReader here breaks seeking and is heavy on memory usage
    this.setState({
      soundFilename: file,
      soundFileUrl: URL.createObjectURL(file),
    });
  };

  handleSoundUrlChange = () => {
    const soundUrl = this.soundUrlInput.value.trim();
    console.log('sound url is', soundUrl);

    this.setState({
      soundFilename: soundUrl,
      soundFileUrl: soundUrl,
    });
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
    const { loadingTranscript } = this.state;

    return (
      <div className="mb-4">
        <Row>
          <Col sm="6" className="upload-box">
            <h4>Select a transcript TSV</h4>
            <input type="file" onChange={this.handleTsvFileChange} />
            <div className="form-inline url-group">
              <input
                type="text"
                placeholder="https://..."
                className={cx('mr-1 form-control', {
                  disabled: loadingTranscript,
                })}
                ref={node => (this.transcriptUrlInput = node)}
              />
              <Button
                type="button"
                onClick={this.handleTranscriptUrlChange}
                className={cx({ disabled: loadingTranscript })}
              >
                {loadingTranscript ? 'Loading...' : 'Set from URL'}
              </Button>
            </div>
          </Col>
          <Col sm="6" className="upload-box">
            <h4>Select a sound file</h4>
            <input type="file" onChange={this.handleSoundFileChange} />
            <div className="form-inline url-group">
              <input
                type="text"
                placeholder="https://..."
                className="mr-1 form-control"
                ref={node => (this.soundUrlInput = node)}
              />
              <Button type="button" onClick={this.handleSoundUrlChange}>
                Set from URL
              </Button>
            </div>
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
    const { soundFileUrl } = this.state;

    return (
      <div className="sound-player-container">
        {!soundFileUrl && (
          <span className="text-muted">Please upload a sound file.</span>
        )}
        {soundFileUrl && (
          <div>
            <Button
              size="sm align-top"
              className="mr-1"
              onClick={this.handleShortRewind}
            >
              Rewind 5s
            </Button>
            <ReactAudioPlayer
              src={soundFileUrl}
              controls
              ref={node => (window.ap = this.audioPlayer = node)}
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
      <div className="App">
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

export default App;
