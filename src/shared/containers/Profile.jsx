/**
 * Connects the Redux store to the Profile display components.
 */
import _ from 'lodash';
import React from 'react';
import PT from 'prop-types';
import { connect } from 'react-redux';

import { actions } from 'topcoder-react-lib';
import Error404 from 'components/Error404';
import LoadingIndicator from 'components/LoadingIndicator';
import ProfilePage from 'components/ProfilePage';

class ProfileContainer extends React.Component {
  componentDidMount() {
    const {
      handleParam,
      loadProfile,
      meta,
    } = this.props;

    loadProfile(handleParam, _.join(_.get(meta, 'groupIds', [])));
  }

  componentWillReceiveProps(nextProps) {
    const {
      handleParam,
      profileForHandle,
      loadProfile,
      meta,
    } = nextProps;

    if (handleParam !== profileForHandle) {
      loadProfile(handleParam, _.join(_.get(meta, 'groupIds', [])));
    }
  }

  render() {
    const {
      info,
      loadingError,
    } = this.props;

    if (loadingError) {
      return <Error404 />;
    }

    if (info && info.tracks && info.tracks.length > 0) {
      const trackRankings = {
        COPILOT: 0,
        DATA_SCIENCE: 1,
        DESIGN: 2,
        DEVELOP: 3,
      };
      info.tracks.sort((track1, track2) => {
        const track1Ranking = trackRankings[track1];
        const track2Ranking = trackRankings[track2];
        return track2Ranking - track1Ranking;
      });
    }

    return info
      ? (
        <ProfilePage
          {...this.props}
        />
      ) : <LoadingIndicator />;
  }
}

ProfileContainer.defaultProps = {
  achievements: null,
  copilot: false,
  country: '',
  externalAccounts: null,
  externalLinks: null,
  info: null,
  profileForHandle: '',
  skills: null,
  stats: null,
  meta: null,
};

ProfileContainer.propTypes = {
  achievements: PT.arrayOf(PT.shape()),
  copilot: PT.bool,
  country: PT.string,
  externalAccounts: PT.shape(),
  externalLinks: PT.arrayOf(PT.shape()),
  handleParam: PT.string.isRequired,
  info: PT.shape(),
  loadingError: PT.bool.isRequired,
  loadProfile: PT.func.isRequired,
  profileForHandle: PT.string,
  skills: PT.shape(),
  stats: PT.arrayOf(PT.shape()),
  lookupData: PT.shape().isRequired,
  meta: PT.shape(),
};

const mapStateToProps = (state, ownProps) => ({
  achievements: state.profile.achievements,
  copilot: state.profile.copilot,
  country: state.profile.country,
  externalAccounts: state.profile.externalAccounts,
  externalLinks: state.profile.externalLinks,
  handleParam: ownProps.match.params.handle,
  meta: ownProps.meta,
  info: state.profile.info,
  loadingError: state.profile.loadingError,
  profileForHandle: state.profile.profileForHandle,
  skills: state.profile.skills,
  stats: state.profile.stats,
  lookupData: state.lookup,
});

function mapDispatchToProps(dispatch) {
  const a = actions.profile;
  const lookupActions = actions.lookup;
  return {
    loadProfile: (handle, groupIds) => {
      dispatch(a.clearProfile());
      dispatch(a.loadProfile(handle));
      dispatch(a.getAchievementsInit());
      dispatch(a.getExternalAccountsInit());
      dispatch(a.getExternalLinksInit());
      dispatch(a.getInfoInit());
      dispatch(a.getSkillsInit());
      dispatch(a.getStatsInit());
      dispatch(lookupActions.getCountriesInit());
      dispatch(a.getAchievementsV3Done(handle));
      dispatch(a.getExternalAccountsDone(handle));
      dispatch(a.getExternalLinksDone(handle));
      dispatch(a.getInfoDone(handle));
      dispatch(a.getSkillsDone(handle));
      dispatch(a.getStatsDone(handle, groupIds));
      dispatch(lookupActions.getCountriesDone());
    },
  };
}

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(ProfileContainer);

export default Container;
