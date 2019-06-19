/**
 * Container for the standard Topcoder header.
 */

import actions from 'actions/topcoder_header';
import TopcoderHeader from 'components/Header';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

export default connect(
  state => ({
    ...state.topcoderHeader,
    profile: {
      ...state.auth.profile,
      roles: state.auth && state.auth.user ? state.auth.user.roles : undefined,
    },
  }),
  dispatch => bindActionCreators(actions.topcoderHeader, dispatch),
)(TopcoderHeader);
