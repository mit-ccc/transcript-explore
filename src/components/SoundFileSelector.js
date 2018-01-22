import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'reactstrap';

// import './SoundFileSelector.css';

class SoundFileSelector extends Component {
  static propTypes = {
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
      console.log('initializing sound url state to', url);
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

  handleSoundFileChange = evt => {
    const { onChangeFile } = this.props;
    const file = evt.target.files[0];
    console.log('got sound file', file);

    onChangeFile(file);
  };

  handleTextInputChange = evt => {
    this.setState({ urlTextInput: evt.target.value });
  };

  handleSetUrlChange = evt => {
    const { onChangeUrl } = this.props;
    const { urlTextInput: audioUrl } = this.state;

    console.log('audio url is', audioUrl);
    onChangeUrl(audioUrl);
    evt.preventDefault();
  };

  render() {
    const { urlTextInput } = this.state;

    return (
      <div className="SoundFileSelector">
        <h4>Select a sound file</h4>
        <input type="file" onChange={this.handleSoundFileChange} />
        <div className="form-inline url-group">
          <form onSubmit={this.handleSetUrlChange}>
            <input
              type="text"
              placeholder="https://..."
              className="mr-1 form-control"
              value={urlTextInput}
              onChange={this.handleTextInputChange}
            />
            <Button type="button" onClick={this.handleSetUrlChange}>
              Set from URL
            </Button>
          </form>
        </div>
      </div>
    );
  }
}

export default SoundFileSelector;
