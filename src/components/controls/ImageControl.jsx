import React from 'react';
import classNames from 'classnames';

import DisplayControl from 'components/controls/DisplayControl';
import { Control, Option } from 'components/controls/Control';

import NumberInput from 'components/inputs/NumberInput';
import ImageInput from 'components/inputs/ImageInput';
import RangeInput from 'components/inputs/RangeInput';
import Icon from 'components/interface/Icon';

import iconLink from 'svg/icons/link.svg';
import BLANK_IMAGE from 'images/data/blank.gif';

export class ImageControl extends React.Component {
    constructor(props) {
        super(props);

        this.image = document.createElement('img');
    }

    onChange = (name, value) => {
        let obj = {},
            { src, fixed, onChange } = this.props,
            image = this.imageInput.getImage(),
            ratio = image.naturalWidth / image.naturalHeight;

        if (name === 'src') {
            this.image = image;

            // Reset values
            if (value === BLANK_IMAGE) {
                obj.width = 0;
                obj.height = 0;
                obj.x = 0;
                obj.y = 0;
                obj.rotation = 0;
                obj.opacity = 0;
            }

            // Load new image
            if (value !== src) {
                obj.width = image.naturalWidth;
                obj.height = image.naturalHeight;
                obj.opacity = 1.0;
            }
        }
        else if (name === 'width') {
            if (fixed) {
                obj.height = Math.round(value * (1 / ratio)) || 0;
            }
        }
        else if (name === 'height') {
            if (fixed) {
                obj.width = Math.round(value * ratio);
            }
        }

        if (onChange) {
            onChange(name, value, obj);
        }
    };

    onLinkClick = () => {
        this.onChange('fixed', !this.props.fixed);
    };

    render() {
        let {
                active, stageWidth, stageHeight, display, onReactorChange,
                fixed, src, width, height, x, y, rotation, opacity
            } = this.props,
            image = this.image,
            readOnly = !(image && image.src && image.src !== BLANK_IMAGE),
            imageWidth = readOnly ? 0 : image.naturalWidth,
            imageHeight = readOnly ? 0 : image.naturalHeight,
            maxWidth = imageWidth * 2,
            maxHeight = imageHeight * 2,
            xMax = readOnly ? 0 : (imageWidth > stageWidth) ? imageWidth : stageWidth,
            yMax = readOnly ? 0 : (imageHeight > stageHeight) ? imageHeight : stageHeight,
            linkClasses = {
                'input-link': true,
                'input-link-on': fixed
            },
            linkIcon = <Icon key={0} className={classNames(linkClasses)} glyph={iconLink} onClick={this.onLinkClick} />;

        return (
            <Control label="IMAGE" active={active} display={display}>
                <Option label="Image">
                    <ImageInput
                        name="src"
                        ref={e => this.imageInput = e}
                        value={src}
                        onChange={this.onChange}
                    />
                </Option>
                <Option label={['Width', linkIcon]}>
                    <NumberInput
                        name="width"
                        width={40}
                        min={0}
                        max={maxWidth}
                        value={width}
                        readOnly={readOnly}
                        onChange={this.onChange}
                    />
                    <RangeInput
                        name="width"
                        min={0}
                        max={maxWidth}
                        value={width}
                        readOnly={readOnly}
                        onChange={this.onChange}
                    />
                </Option>
                <Option label={['Height', linkIcon]}>
                    <NumberInput
                        name="height"
                        width={40}
                        min={0}
                        max={maxHeight}
                        value={height}
                        readOnly={readOnly}
                        onChange={this.onChange}
                    />
                    <RangeInput
                        name="height"
                        min={0}
                        max={maxHeight}
                        value={height}
                        readOnly={readOnly}
                        onChange={this.onChange}
                    />
                </Option>
                <Option label="X">
                    <NumberInput
                        name="x"
                        width={40}
                        min={-xMax}
                        max={xMax}
                        value={x}
                        readOnly={readOnly}
                        onChange={this.onChange}
                    />
                    <RangeInput
                        name="x"
                        min={-xMax}
                        max={xMax}
                        value={x}
                        readOnly={readOnly}
                        onChange={this.onChange}
                    />
                </Option>
                <Option label="Y">
                    <NumberInput
                        name="y"
                        width={40}
                        min={-yMax}
                        max={yMax}
                        value={y}
                        readOnly={readOnly}
                        onChange={this.onChange}
                    />
                    <RangeInput
                        name="y"
                        min={-yMax}
                        max={yMax}
                        value={y}
                        readOnly={readOnly}
                        onChange={this.onChange}
                    />
                </Option>
                <Option label="Rotation">
                    <NumberInput
                        name="rotation"
                        width={40}
                        min={0}
                        max={360}
                        value={rotation}
                        readOnly={readOnly}
                        onChange={this.onChange}
                    />
                    <RangeInput
                        name="rotation"
                        min={0}
                        max={360}
                        value={rotation}
                        readOnly={readOnly}
                        onChange={this.onChange}
                    />
                </Option>
                <Option
                    label="Opacity"
                    reactorName="opacity"
                    onReactorChange={onReactorChange}>
                    <NumberInput
                        name="opacity"
                        width={40}
                        min={0}
                        max={1.0}
                        step={0.01}
                        value={readOnly ? 0 : opacity}
                        readOnly={readOnly}
                        onChange={this.onChange}
                    />
                    <RangeInput
                        name="opacity"
                        min={0}
                        max={1.0}
                        step={0.01}
                        value={readOnly ? 0 : opacity}
                        readOnly={readOnly}
                        onChange={this.onChange}
                    />
                </Option>
            </Control>
        );
    }
}

export default DisplayControl(ImageControl);