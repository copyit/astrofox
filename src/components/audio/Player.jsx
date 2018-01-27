import React from 'react';
import propTypes from 'prop-types';
import classNames from 'classnames';

import AudioWaveform from 'components/audio/AudioWaveform';
import Oscilloscope from 'components/audio/Oscilloscope';
import { events } from 'core/Global';
import { formatTime } from 'utils/format';
import RangeInput from 'components/inputs/RangeInput';
import Icon from 'components/interface/Icon';

import iconSoundBars from 'svg/icons/sound-bars.svg';
import iconSoundWaves from 'svg/icons/sound-waves.svg';
import iconRepeat from 'svg/icons/cycle.svg';
import iconPlay from 'svg/icons/play.svg';
import iconStop from 'svg/icons/stop.svg';
import iconPause from 'svg/icons/pause.svg';
import iconVolume1 from 'svg/icons/volume.svg';
import iconVolume2 from 'svg/icons/volume2.svg';
import iconVolume3 from 'svg/icons/volume3.svg';
import iconVolume4 from 'svg/icons/volume4.svg';

const PROGRESS_MAX = 1000;

export default class Player extends React.PureComponent {
    constructor(props, context) {
        super(props);

        this.state = {
            playing: false,
            looping: false,
            progressPosition: 0,
            duration: 0,
            showWaveform: true,
            showOsc: false
        };

        this.app = context.app;
    }

    componentDidMount() {
        const player = this.app.player;

        player.on('load', () => {
            this.setState({ duration: player.getDuration() });

            if (this.waveform) {
                this.waveform.renderBars(this.app.player.getAudio());
            }
        });

        player.on('tick', () => {
            if (player.isPlaying() && !this.progressControl.isBuffering()) {
                let pos = player.getPosition();

                this.setState({ progressPosition: pos });

                if (this.waveform) {
                    this.waveform.position = pos;
                    this.waveform.draw(pos);
                }
            }
        });

        player.on('play', () => {
            this.setState({ playing: true });
        });

        player.on('pause', () => {
            this.setState({ playing: false });
        });

        player.on('stop', () => {
            this.setState({ progressPosition: 0 });

            if (this.waveform) {
                this.waveform.position = 0;
                this.waveform.seek = 0;
                this.waveform.draw();
            }
        });

        player.on('seek', () => {
            let pos = player.getPosition();

            this.setState({
                progressPosition: pos
            });

            if (this.waveform) {
                this.waveform.position = pos;
                this.waveform.seek = pos;
                this.waveform.draw();
            }
        });

        events.on('render', data => {
            if (this.spectrum) {
                this.spectrum.draw(data);
            }

            if (this.oscilloscope) {
                this.oscilloscope.draw(data);
            }
        });
    }

    onPlayButtonClick = () => {
        this.app.player.play();
    };

    onStopButtonClick = () =>  {
        this.app.player.stop();
    };

    onLoopButtonClick = () =>  {
        this.setState(prevState => {
            this.app.player.setLoop(!prevState.looping);

            return { looping: !prevState.looping };
        });
    };

    onWaveformClick = (val) => {
        this.app.player.seek(val);
    };

    onWaveformButtonClick = () =>  {
        this.setState(prevState => ({ showWaveform: !prevState.showWaveform }));
    };

    onOscButtonClick = () =>  {
        this.setState(prevState => ({ showOsc: !prevState.showOsc }));
    };

    onVolumeChange = (value) =>  {
        this.app.player.setVolume(value);
    };

    onProgressChange = (value) =>  {
        this.app.player.seek(value);
    };

    onProgressInput = (value) => {
        this.setState({ progressPosition: value });
    };

    render() {
        let osc,
            playing = this.app.player.isPlaying(),
            { duration, progressPosition, looping, showWaveform, showOsc } = this.state;

        if (showOsc) {
            osc = <Oscilloscope ref={e => this.oscilloscope = e} />;
        }

        return (
            <div className={classNames({ 'display-none': !this.props.visible })}>
                <AudioWaveform
                    ref={e => this.waveform = e}
                    visible={showWaveform && duration}
                    onClick={this.onWaveformClick}
                />
                <div className="player">
                    <div className="buttons">
                        <PlayButton playing={playing} onClick={this.onPlayButtonClick} />
                        <StopButton onClick={this.onStopButtonClick} />
                    </div>
                    <VolumeControl onChange={this.onVolumeChange} />
                    <ProgressControl
                        ref={e => this.progressControl = e}
                        value={progressPosition * PROGRESS_MAX}
                        onChange={this.onProgressChange}
                        onInput={this.onProgressInput}
                        readOnly={!duration}
                    />
                    <TimeInfo
                        currentTime={duration * progressPosition}
                        totalTime={duration}
                    />
                    <ToggleButton
                        icon={iconSoundBars}
                        title="Waveform"
                        active={showWaveform}
                        onClick={this.onWaveformButtonClick}
                    />
                    <ToggleButton
                        icon={iconSoundWaves}
                        title="Oscilloscope"
                        active={showOsc}
                        onClick={this.onOscButtonClick}
                    />
                    <ToggleButton
                        icon={iconRepeat}
                        title="Repeat"
                        active={looping}
                        onClick={this.onLoopButtonClick}
                    />
                </div>
                {osc}
            </div>
        );
    }
}

Player.defaultProps = {
    visible: true
};

Player.contextTypes = {
    app: propTypes.object
};

class VolumeControl extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            value: 100,
            mute: false
        };
    }

    onChange = (name, value) => {
        this.props.onChange(value / 100);

        this.setState({ value: value, mute: false });
    };

    onClick = () =>  {
        this.setState((prevState, props) => {
            props.onChange(prevState.mute ? prevState.value / 100 : 0);

            return { mute: !prevState.mute };
        });
    };

    render() {
        let icon,
            { value, mute } = this.state;

        if (value < 10 || mute) {
            icon = iconVolume4;
        }
        else if (value < 25) {
            icon = iconVolume3;
        }
        else if (value < 75) {
            icon = iconVolume2;
        }
        else {
            icon = iconVolume1;
        }

        return (
            <div className="volume">
                <div className="speaker" onClick={this.onClick}>
                    <Icon className="icon" glyph={icon} />
                </div>
                <div className="slider">
                    <RangeInput
                        name="volume"
                        min={0}
                        max={100}
                        value={mute ? 0 : value}
                        onChange={this.onChange}
                    />
                </div>
            </div>
        );
    }
}

class ProgressControl extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            value: 0
        };
    }

    componentWillReceiveProps(props) {
        if (!this.isBuffering())
        {
            this.setState({ value: props.value });
        }
    }

    onChange = (name, val) => {
        this.setState({ value: val }, () => {
            this.props.onChange(val / PROGRESS_MAX);
        });
    };

    onInput = (name, val) => {
        this.setState({ value: val }, () => {
            this.props.onInput(val / PROGRESS_MAX);
        });
    };

    isBuffering() {
        return this.progressInput.isBuffering();
    }

    render() {
        return (
            <div className="progress">
                <RangeInput
                    ref={e => this.progressInput = e}
                    name="progress"
                    min="0"
                    max={PROGRESS_MAX}
                    value={this.state.value}
                    buffered={true}
                    onChange={this.onChange}
                    onInput={this.onInput}
                    readOnly={this.props.readOnly}
                />
            </div>
        );
    }
}

const PlayButton = (props) => {
    const classes = {
        'button': true,
        'play-button': !props.playing,
        'pause-button': props.playing
    };

    return (
        <div className={classNames(classes)} onClick={props.onClick}>
            <Icon className="icon" glyph={props.playing ? iconPause : iconPlay} title={props.title} />
        </div>
    );
};

const StopButton = (props) => {
    return (
        <div className="button stop-button" onClick={props.onClick}>
            <Icon className="icon" glyph={iconStop} title={props.title} />
        </div>
    );
};

const ToggleButton = (props) => {
    return (
        <div className={classNames('toggle-button', {'toggle-button-on': props.active })} onClick={props.onClick}>
            <Icon className="icon" glyph={props.icon} title={props.title} width={20} height={20} />
        </div>
    );
};

const TimeInfo = (props) => {
    return (
        <div className="time-info">
            <span className="time-part current-time">{formatTime(props.currentTime)}</span>
            <span className="time-part split" />
            <span className="time-part total-time">{formatTime(props.totalTime)}</span>
        </div>
    );
};