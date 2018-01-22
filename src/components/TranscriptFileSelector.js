import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'reactstrap';
import cx from 'classnames';

// import './TranscriptFileSelector.css';

class TranscriptFileSelector extends Component {
  static propTypes = {
    loadingTranscript: PropTypes.bool,
    url: PropTypes.string,
    onChangeUrl: PropTypes.func,
    onChangeFile: PropTypes.func,
  };
  state = {
    urlTextInput: '',
  };

  componentWillMount() {
    const { url } = this.props;
    if (url != null) {
      console.log('initializing tsv url state to', url);
      this.setState({
        urlTextInput: url,
      });
    }
  }

  componentWillReceiveProps(nextProps) {
    const { url: currUrl } = this.props;
    const { url: nextUrl } = nextProps;

    if (currUrl !== nextUrl) {
      console.log('received new URL to set state to', nextUrl, 'was', currUrl);
      this.setState({ urlTextInput: nextUrl || '' });
    }
  }

  handleTsvFileChange = evt => {
    const { onChangeFile } = this.props;

    const file = evt.target.files[0];
    console.log('got tsv file', file);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        onChangeFile(reader.result);
      };

      reader.readAsText(file);
    }
  };

  handleTextInputChange = evt => {
    this.setState({ urlTextInput: evt.target.value });
  };

  handleSetUrlChange = evt => {
    const { onChangeUrl } = this.props;
    const { urlTextInput: transcriptUrl } = this.state;

    console.log('transcript url is', transcriptUrl);
    onChangeUrl(transcriptUrl);
    evt.preventDefault();
  };

  render() {
    const { loadingTranscript } = this.props;
    const { urlTextInput } = this.state;

    return (
      <div className="TranscriptFileSelector">
        <h4>Select a transcript TSV</h4>
        <input type="file" onChange={this.handleTsvFileChange} />
        <div className="form-inline url-group">
          <form onSubmit={this.handleSetUrlChange}>
            <input
              type="text"
              placeholder="https://..."
              className={cx('mr-1 form-control', {
                disabled: loadingTranscript,
              })}
              value={urlTextInput}
              onChange={this.handleTextInputChange}
            />
            <Button
              type="button"
              onClick={this.handleSetUrlChange}
              className={cx({ disabled: loadingTranscript })}
            >
              {loadingTranscript ? 'Loading...' : 'Set from URL'}
            </Button>
          </form>
        </div>
      </div>
    );
  }
}

export default TranscriptFileSelector;
