/**
 * Reducer for state.challengeListing.
 */

import _ from 'lodash';
import actions from 'actions/challenge-listing';
import { handleActions } from 'redux-actions';
import { redux } from 'topcoder-react-utils';
import { updateQuery } from 'utils/url';
import moment from 'moment';
import {
  logger,
  errors,
  challenge as challengeUtils,
  actions as actionsUtils,
} from 'topcoder-react-lib';

import filterPanel from './filter-panel';
import sidebar, { factory as sidebarFactory } from './sidebar';

const { fireErrorMessage } = errors;
const { filter: Filter } = challengeUtils;

/** TODO: Inspect if the 2 actions bellow can be removed?
 * They do  duplicate what is done in `getActiveChallengesDone` but fetch all challenges
 * which was refactored in listing-improve
 */
function onGetAllActiveChallengesInit(state, { payload }) {
  return { ...state, loadingActiveChallengesUUID: payload };
}
function onGetAllActiveChallengesDone(state, { error, payload }) {
  if (error) {
    logger.error(payload);
    return state;
  }
  const { uuid, challenges: loaded } = payload;
  if (uuid !== state.loadingActiveChallengesUUID) return state;
  /* Once all active challenges are fetched from the API, we remove from the
   * store any active challenges stored there previously, and also any
   * challenges with IDs matching any challenges loaded now as active. */
  const ids = new Set();
  loaded.forEach(item => ids.add(item.id));
  const challenges = state.challenges
    .filter(item => item.status !== 'Active' && !ids.has(item.id))
    .concat(loaded);

  return {
    ...state,
    challenges,
    lastUpdateOfActiveChallenges: Date.now(),
    loadingActiveChallengesUUID: '',
  };
}

function onGetAllUserChallengesInit(state, { payload }) {
  return { ...state, loadingActiveChallengesUUID: payload };
}
function onGetAllUserChallengesDone(state, { error, payload }) {
  if (error) {
    logger.error(payload);
    return state;
  }
  const { challenges } = payload || [];

  return {
    ...state,
    challenges,
    lastUpdateOfActiveChallenges: Date.now(),
    loadingActiveChallengesUUID: '',
  };
}

/**
 * Called when 1st page of ative challenges is loaded from `/challenges` api
 * @param {*} state
 * @param {*} param1
 */
function onGetActiveChallengesDone(state, { error, payload }) {
  if (error) {
    logger.error(payload);
    return state;
  }
  const { uuid, challenges: loaded } = payload;
  if (uuid !== state.loadingActiveChallengesUUID) return state;

  /* Once all active challenges are fetched from the API, we remove from the
   * store any active challenges stored there previously, and also any
   * challenges with IDs matching any challenges loaded now as active. */
  const ids = new Set();
  loaded.forEach(item => ids.add(item.id));

  /* Fetching 0 page of active challenges also drops any active challenges
   * loaded to the state before. */
  const filter = state.lastRequestedPageOfActiveChallenges
    ? item => !ids.has(item.id)
    : item => !ids.has(item.id) && item.status !== 'Active';

  const challenges = state.challenges
    .filter(filter)
    .concat(loaded);

  return {
    ...state,
    challenges,
    lastUpdateOfActiveChallenges: Date.now(),
    loadingActiveChallengesUUID: '',
    meta: payload.meta,
  };
}

/**
 * Called when loading of 1st page of active challenges is started
 * @param {*} state
 * @param {*} param1
 */
function onGetActiveChallengesInit(state, { payload }) {
  return {
    ...state,
    loadingActiveChallengesUUID: payload.uuid,
    lastRequestedPageOfActiveChallenges: payload.page,
  };
}
function onGetRestActiveChallengesInit(state, { payload }) {
  return {
    ...state,
    loadingRestActiveChallengesUUID: payload.uuid,
  };
}

/**
 * Called when all challenges are loaded
 * @param {*} state
 * @param {*} param1
 */
function onGetRestActiveChallengesDone(state, { error, payload }) {
  if (error) {
    logger.error(payload);
    return state;
  }
  const { uuid, challenges: loaded } = payload;
  if (uuid !== state.loadingRestActiveChallengesUUID) return state;

  /* Once all active challenges are fetched from the API, we remove from the
   * store any active challenges stored there previously, and also any
   * challenges with IDs matching any challenges loaded now as active. */
  const ids = new Set();
  loaded.forEach(item => ids.add(item.id));

  /* Fetching 0 page of active challenges also drops any active challenges
   * loaded to the state before. */
  const filter = item => !ids.has(item.id);

  const challenges = state.challenges
    .filter(filter)
    .concat(loaded);

  return {
    ...state,
    challenges,
    allActiveChallengesLoaded: true,
    lastUpdateOfActiveChallenges: Date.now(),
    lastRequestedPageOfActiveChallenges: -1,
    loadingRestActiveChallengesUUID: '',
  };
}

/**
 * Before get all recommended challenges
 * @param {Object} state current state
 * @param {Object} param1 payload info
 */
function onGetAllRecommendedChallengesInit(state, { payload }) {
  return { ...state, loadingRecommendedChallengesUUID: payload };
}

/**
 * Get all recommended challenges
 * @param {Object} state current state
 * @param {Object} param1 payload info
 */
function onGetAllRecommendedChallengesDone(state, { error, payload }) {
  if (error) {
    logger.error(payload);
    return state;
  }
  const { uuid, challenges, tag } = payload;
  if (uuid !== state.loadingRecommendedChallengesUUID) return state;
  const { recommendedChallenges } = state;
  recommendedChallenges[tag] = {
    challenges,
    lastUpdateOfActiveChallenges: Date.now(),
  };
  return {
    ...state,
    recommendedChallenges,
    loadingRecommendedChallengesTechnologies: tag,
    loadingRecommendedChallengesUUID: '',
  };
}

/**
 * On register done
 * @param {Object} state current state
 * @param {Object} param1 payload info
 */
function onRegisterDone(state, { error, payload }) {
  if (error) {
    return state;
  }
  const { recommendedChallenges, loadingRecommendedChallengesTechnologies } = state;
  if (!loadingRecommendedChallengesTechnologies) {
    return state;
  }

  const { challenges } = recommendedChallenges[loadingRecommendedChallengesTechnologies];
  const challenge = _.find(challenges, { id: payload.id });
  if (!challenge) {
    return state;
  }
  // add current user to registed recommended challenges
  challenge.users = payload.users;
  return {
    ...state,
    recommendedChallenges,
  };
}

/**
 * On unregister done
 * @param {Object} state current state
 * @param {Object} param1 payload info
 */
function onUnregisterDone(state, { error, payload }) {
  if (error) {
    return state;
  }
  const { recommendedChallenges, loadingRecommendedChallengesTechnologies } = state;
  if (!loadingRecommendedChallengesTechnologies) {
    return state;
  }

  const { challenges } = recommendedChallenges[loadingRecommendedChallengesTechnologies];
  const challenge = _.find(challenges, { id: payload.id });
  if (!challenge) {
    return state;
  }
  // remove current user from registed recommended challenges
  challenge.users = {};
  return {
    ...state,
    recommendedChallenges,
  };
}

/**
 * Handles CHALLENGE_LISTING/GET_CHALLENGE_SUBTRACKS_DONE action.
 * @param {Object} state
 * @param {Object} action
 * @return {Object}
 */
function onGetChallengeTypesDone(state, action) {
  if (action.error) logger.error(action.payload);
  return {
    ...state,
    challengeTypes: action.error ? [] : action.payload,
    challengeTypesMap: action.error ? {} : _.keyBy(action.payload, 'id'),
    loadingChallengeTypes: false,
  };
}

/**
 * Handles CHALLENGE_LISTING/GET_CHALLENGE_TAGS_DONE action.
 * @param {Object} state
 * @param {Object} action
 * @return {Object}
 */
function onGetChallengeTagsDone(state, action) {
  if (action.error) logger.error(action.payload);
  return {
    ...state,
    challengeTags: action.error ? [] : action.payload,
    loadingChallengeTags: false,
  };
}

function onGetPastChallengesInit(state, action) {
  const { frontFilter, page, uuid } = action.payload;
  const tracks = frontFilter && frontFilter.tracks;
  if (tracks && _.isEmpty(tracks)) {
    return {
      ...state,
      allPastChallengesLoaded: true,
      loadingPastChallengesUUID: '',
    };
  }

  return {
    ...state,
    lastRequestedPageOfPastChallenges: page,
    loadingPastChallengesUUID: uuid,
  };
}

function onGetPastChallengesDone(state, { error, payload }) {
  if (error) {
    logger.error(payload);
    return state;
  }
  const { uuid, challenges: loaded, frontFilter } = payload;
  if (uuid !== state.loadingPastChallengesUUID) return state;

  const ids = new Set();
  loaded.forEach(item => ids.add(item.id));

  /* Fetching 0 page of past challenges also drops any past challenges
   * loaded to the state before. */
  const filter = state.lastRequestedPageOfPastChallenges
    ? item => !ids.has(item.id)
    : item => !ids.has(item.id) && item.status !== 'COMPLETED' && item.status !== 'PAST';

  const challenges = state.challenges.filter(filter).concat(loaded);

  let keepPastPlaceholders = false;
  if (loaded.length) {
    const ff = Filter.getFilterFunction(frontFilter);
    keepPastPlaceholders = challenges.filter(ff).length - state.challenges.filter(ff).length < 10;
  }

  const pastSearchTimestamp = state.pastSearchTimestamp && state.pastSearchTimestamp > 0
    ? state.pastSearchTimestamp : Date.now();

  return {
    ...state,
    allPastChallengesLoaded: loaded.length === 0,
    challenges,
    keepPastPlaceholders,
    loadingPastChallengesUUID: '',
    pastSearchTimestamp,
  };
}

function onSelectCommunity(state, { payload }) {
  updateQuery({ communityId: payload || undefined });
  return {
    ...state,
    selectedCommunityId: payload,

    /* Page numbers of past/upcoming challenges depend on the filters. To keep
      * the code simple we just reset them each time a filter is modified.
      * (This community selection defines community-specific filter for
      * challenges). */
    allPastChallengesLoaded: false,
    lastRequestedPageOfPastChallenges: -1,
    pastSearchTimestamp: -1,
  };
}

/**
 * @param {Object} state
 * @param {Object} action
 * @return {Object}
 */
function onSetFilter(state, { payload }) {
  /* Validation of filter parameters: they may come from URL query, thus
   * validation is not a bad idea. As you may note, at the moment we do not
   * do it very carefuly (many params are not validated). */
  const filter = _.clone(payload);
  if (_.isPlainObject(filter.tags)) {
    filter.tags = _.values(filter.tags);
  }
  if (_.isPlainObject(filter.subtracks)) {
    filter.subtracks = _.values(filter.subtracks);
  }
  if (filter.startDate && !moment(filter.startDate).isValid()) {
    delete filter.startDate;
  }
  if (filter.endDate && !moment(filter.endDate).isValid()) {
    delete filter.endDate;
  }

  /* Update of URL and generation of the state. */
  updateQuery({ filter });
  return {
    ...state,
    filter,

    /* Page numbers of past/upcoming challenges depend on the filters. To keep
     * the code simple we just reset them each time a filter is modified. */
    allPastChallengesLoaded: false,
    lastRequestedPageOfPastChallenges: -1,
    pastSearchTimestamp: -1,
  };
}

/**
 * Handles CHALLENGE_LISTING/GET_REVIEW_OPPORTUNITIES_INIT action.
 * @param {Object} state
 * @param {Object} action Payload will be page, uuid
 * @return {Object} New state
 */
function onGetReviewOpportunitiesInit(state, { payload }) {
  return {
    ...state,
    lastRequestedPageOfReviewOpportunities: payload.page,
    loadingReviewOpportunitiesUUID: payload.uuid,
  };
}

/**
 * Handles CHALLENGE_LISTING/GET_REVIEW_OPPORTUNITIES_DONE action.
 * @param {Object} state
 * @param {Object} action Payload will be JSON from api call and UUID
 * @return {Object} New state
 */
function onGetReviewOpportunitiesDone(state, { payload, error }) {
  if (error) {
    return state;
  }

  const {
    uuid,
    loaded,
  } = payload;

  if (uuid !== state.loadingReviewOpportunitiesUUID) return state;

  const ids = new Set();
  loaded.forEach(item => ids.add(item.id));
  const reviewOpportunities = state.reviewOpportunities
    .filter(item => !ids.has(item.id))
    .concat(loaded);

  return {
    ...state,
    reviewOpportunities,
    loadingReviewOpportunitiesUUID: '',
    allReviewOpportunitiesLoaded: loaded.length === 0,
  };
}

/**
 * Inits the loading of SRMs.
 * @param {Object} state
 * @param {String} payload Operation UUID.
 * @return {Object} New state.
 */
function onGetSrmsInit(state, { payload }) {
  return {
    ...state,
    srms: {
      ...state.srms,
      loadingUuid: payload,
    },
  };
}

/**
 * Handles loaded SRMs.
 * @param {Object} state
 * @param {Object} action
 * @return {Object} New state.
 */
function onGetSrmsDone(state, { error, payload }) {
  if (error) {
    logger.error('Failed to load SRMs', payload);
    fireErrorMessage('Failed to load SRMs', '');
    return state;
  }

  const { uuid, data } = payload;
  if (state.srms.loadingUuid !== uuid) return state;
  return {
    ...state,
    srms: {
      data,
      loadingUuid: '',
      timestamp: Date.now(),
    },
  };
}

/**
 * Handles CHALLENGE_LISTING/GET_USER_CHALLENGES_INIT action
 * @param {Object} state
 * @return {Object} New state.
 */
function onGetUserChallengesInit(state) {
  return {
    ...state,
    userChallenges: [],
  };
}

/**
 * Handles CHALLENGE_LISTING/GET_USER_CHALLENGES_DONE action
 * @param {Object} state
 * @param {Object} payload
 * @return {Object} New state.
 */
function onGetUserChallengesDone(state, { payload }) {
  return {
    ...state,
    userChallenges: payload,
  };
}

/**
 * Creates a new Challenge Listing reducer with the specified initial state.
 * @param {Object} initialState Optional. Initial state.
 * @return Challenge Listing reducer.
 */
function create(initialState) {
  const a = actions.challengeListing;
  const actionChallenge = actionsUtils.challenge;
  return handleActions({
    [a.dropChallenges]: state => ({
      ...state,
      allActiveChallengesLoaded: false,
      allPastChallengesLoaded: false,
      allReviewOpportunitiesLoaded: false,
      challenges: [],
      lastRequestedPageOfActiveChallenges: -1,
      lastRequestedPageOfPastChallenges: -1,
      lastRequestedPageOfReviewOpportunities: -1,
      lastUpdateOfActiveChallenges: 0,
      loadingActiveChallengesUUID: '',
      loadingRestActiveChallengesUUID: '',
      loadingPastChallengesUUID: '',
      loadingReviewOpportunitiesUUID: '',
      reviewOpportunities: [],
      meta: {
        allChallengesCount: 0,
        myChallengesCount: 0,
        ongoingChallengesCount: 0,
        openChallengesCount: 0,
        totalCount: 0,
      },
    }),

    [a.expandTag]: (state, { payload }) => ({
      ...state,
      expandedTags: [...state.expandedTags, payload],
    }),

    [a.getAllActiveChallengesInit]: onGetAllActiveChallengesInit,
    [a.getAllActiveChallengesDone]: onGetAllActiveChallengesDone,

    [a.getAllUserChallengesInit]: onGetAllUserChallengesInit,
    [a.getAllUserChallengesDone]: onGetAllUserChallengesDone,

    [a.getAllRecommendedChallengesInit]: onGetAllRecommendedChallengesInit,
    [a.getAllRecommendedChallengesDone]: onGetAllRecommendedChallengesDone,

    [actionChallenge.registerDone]: onRegisterDone,
    [actionChallenge.unregisterDone]: onUnregisterDone,

    [a.getActiveChallengesInit]: onGetActiveChallengesInit,
    [a.getActiveChallengesDone]: onGetActiveChallengesDone,

    [a.getRestActiveChallengesInit]: onGetRestActiveChallengesInit,
    [a.getRestActiveChallengesDone]: onGetRestActiveChallengesDone,

    [a.getChallengeTypesInit]: state => ({
      ...state,
      loadingChallengetypes: true,
    }),
    [a.getChallengeTypesDone]: onGetChallengeTypesDone,

    [a.getChallengeTagsInit]: state => ({
      ...state,
      loadingChallengeTags: true,
    }),
    [a.getChallengeTagsDone]: onGetChallengeTagsDone,

    [a.getPastChallengesInit]: onGetPastChallengesInit,
    [a.getPastChallengesDone]: onGetPastChallengesDone,

    [a.getReviewOpportunitiesInit]: onGetReviewOpportunitiesInit,
    [a.getReviewOpportunitiesDone]: onGetReviewOpportunitiesDone,

    [a.getSrmsInit]: onGetSrmsInit,
    [a.getSrmsDone]: onGetSrmsDone,

    [a.getUserChallengesInit]: onGetUserChallengesInit,
    [a.getUserChallengesDone]: onGetUserChallengesDone,

    [a.selectCommunity]: onSelectCommunity,

    [a.setFilter]: onSetFilter,
    [a.setSort]: (state, { payload }) => ({
      ...state,
      sorts: {
        ...state.sorts,
        [payload.bucket]: payload.sort,
      },
    }),
  }, _.defaults(_.clone(initialState) || {}, {
    allActiveChallengesLoaded: false,
    allPastChallengesLoaded: false,
    allReviewOpportunitiesLoaded: false,

    challenges: [],
    recommendedChallenges: {},
    challengeTypes: [],
    challengeTypesMap: {},
    challengeTags: [],

    expandedTags: [],

    filter: {},

    keepPastPlaceholders: false,

    lastRequestedPageOfActiveChallenges: -1,
    lastRequestedPageOfPastChallenges: -1,
    lastRequestedPageOfReviewOpportunities: -1,
    lastUpdateOfActiveChallenges: 0,

    loadingActiveChallengesUUID: '',
    loadingRecommendedChallengesUUID: '',
    loadingRestActiveChallengesUUID: '',
    loadingRecommendedChallengesTechnologies: '',
    loadingPastChallengesUUID: '',
    loadingReviewOpportunitiesUUID: '',

    loadingChallengeTypes: false,
    loadingChallengeTags: false,

    reviewOpportunities: [],

    selectedCommunityId: '',

    sorts: {},

    srms: {
      data: [],
      loadingUuid: '',
      timestamp: 0,
    },

    meta: {
      allChallengesCount: 0,
      myChallengesCount: 0,
      ongoingChallengesCount: 0,
      openChallengesCount: 0,
      totalCount: 0,
    },

    pastSearchTimestamp: -1,
  }));
}

/**
 * The factory creates the new reducer with initial state tailored to the given
 * ExpressJS HTTP request, if specified (for server-side rendering). If no HTTP
 * request is specified, it creates the default reducer.
 * @param {Object} req Optional. ExpressJS HTTP request.
 * @return {Promise} Resolves to the new reducer.
 */
export function factory(req) {
  if (req && req.url.match(/challenges(\/?$|\/?\?)/)) {
    let state = {};

    if (req.query.filter) {
      state = onSetFilter(state, { payload: req.query.filter });
    }
    state.selectedCommunityId = req.query.communityId;

    return redux.resolveReducers({
      sidebar: sidebarFactory(req),
    }).then(reducers => redux.combineReducers(create(state), { ...reducers, filterPanel }));
  }

  return redux.resolveReducers({
    sidebar: sidebarFactory(req),
  }).then(reducers => redux.combineReducers(create(), { ...reducers, filterPanel }));
}

/* Default reducer with empty initial state. */
export default redux.combineReducers(create(), { filterPanel, sidebar });
