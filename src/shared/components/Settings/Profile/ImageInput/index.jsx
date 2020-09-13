/**
 * render a user icom input component.
 */
/* global document */
/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PT from 'prop-types';

import { PrimaryButton } from 'topcoder-react-ui-kit';


import DefaultPortrait from 'assets/images/ico-user-default.svg';

import Styles from './styles.scss';


export default class ImageInput extends React.Component {
  constructor(props) {
    super(props);

    this.onChangeImage = this.onChangeImage.bind(this);
    this.onUploadPhoto = this.onUploadPhoto.bind(this);

    this.state = {
      newBasicInfo: {},
    };
  }

  componentDidMount() {
    const { userTraits } = this.props;
    this.loadBasicInfoTraits(userTraits);
  }

  componentWillReceiveProps(nextProps) {
    this.loadBasicInfoTraits(nextProps.userTraits);
    const {
      profileState,
    } = this.props;
    if (profileState.deletingPhoto && !nextProps.profileState.deletingPhoto) {
      document.querySelector('#change-image-input').value = null;
    }
  }

  onChangeImage(e) {
    e.preventDefault();
    const {
      profileState,
    } = this.props;
    if (profileState.uploadingPhoto) {
      return;
    }
    const fileInput = document.querySelector('#change-image-input');
    fileInput.click();
  }

  onUploadPhoto(e) {
    e.preventDefault();
    const {
      handle,
      profileState,
      tokenV3,
      uploadPhoto,
    } = this.props;
    if (profileState.uploadingPhoto) {
      return;
    }
    const fileInput = document.querySelector('#change-image-input');
    const file = fileInput.files[0];
    uploadPhoto(handle, tokenV3, file);
  }

  /**
   * Get basic info trait
   * @param userTraits the all user traits
   */
  loadBasicInfoTraits = (userTraits) => {
    const trait = userTraits.filter(t => t.traitId === 'basic_info');
    const basicInfoTrait = trait.length === 0 ? {} : trait[0];
    const basicInfo = basicInfoTrait.traits ? basicInfoTrait.traits.data[0] : {};
    this.setState({ newBasicInfo: basicInfo });
  }

  render() {
    const {
      handle,
      profileState,
    } = this.props;

    const {
      uploadingPhoto,
      deletingPhoto,
    } = profileState;

    const { newBasicInfo } = this.state;

    return (
      <div styleName="image">
        <div styleName="edit-image">
          {
            newBasicInfo.photoURL
            && <img alt="User" src={newBasicInfo.photoURL} styleName="profile-circle" />
          }
          {
            !newBasicInfo.photoURL
            && <DefaultPortrait styleName="profile-circle" />
          }
          <div styleName="buttons">
            <p styleName="handle">
              {handle}
            </p>
            <PrimaryButton onClick={this.onChangeImage} disabled={uploadingPhoto || deletingPhoto} theme={{ button: Styles['file-upload'] }}>
              {
                uploadingPhoto && <i className="fa fa-spinner fa-spin" />
              }
              {
                !uploadingPhoto && newBasicInfo.photoURL && 'Upload a new avatar'
              }
              {
                !uploadingPhoto && !newBasicInfo.photoURL && 'Upload a new avatar'
              }
            </PrimaryButton>
            <input type="file" name="image" onChange={this.onUploadPhoto} id="change-image-input" className="hidden" />
          </div>
        </div>
      </div>
    );
  }
}

ImageInput.propTypes = {
  handle: PT.string.isRequired,
  tokenV3: PT.string.isRequired,
  userTraits: PT.array.isRequired,
  profileState: PT.shape().isRequired,
  uploadPhoto: PT.func.isRequired,
};
