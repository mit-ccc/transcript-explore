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
      this.setState({
        urlTextInput: url,
      });
    }
  }

  componentWillReceiveProps(nextProps) {
    const { url: currUrl } = this.props;
    const { url: nextUrl } = nextProps;

    if (currUrl !== nextUrl) {
      this.setState({ urlTextInput: nextUrl || '' });
    }
  }

  handleTranscriptFileChange = evt => {
    const { onChangeFile } = this.props;

    const file = evt.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        onChangeFile(file.name, reader.result);
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

    onChangeUrl(transcriptUrl);
    evt.preventDefault();
  };

  render() {
    const { loadingTranscript } = this.props;
    const { urlTextInput } = this.state;

    return (
      <div className="TranscriptFileSelector">
        <h4>Select a transcript TSV or JSON</h4>
        <input type="file" onChange={this.handleTranscriptFileChange} />
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
