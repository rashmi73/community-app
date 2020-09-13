/**
 * Routing of Blockchain Community.
 */

/* TODO: This assembly of custom challenge listing page should be split out into
 * a separate component. But, it is good enough for now. */
import BsicHackathon from 'components/tc-communities/communities/blockchain/BsicHackathon';
import ChallengeListingTopBanner from
  'components/tc-communities/communities/blockchain/ChallengeListing/TopBanner';
import ChallengeListingRegisterToSee from
  'components/tc-communities/communities/blockchain/ChallengeListing/RegisterToSee';
import ChallengeDetails from 'routes/ChallengeDetails';
import ChallengeListing from 'routes/Communities/ChallengeListing';
import ContentfulRoute from 'components/Contentful/Route';
import Error404 from 'components/Error404';
import Footer from 'components/tc-communities/Footer2';
import Header from 'containers/tc-communities/Header';
import Home from 'containers/tc-communities/blockchain/Home';
import Learn from 'containers/tc-communities/blockchain/Learn';
import PT from 'prop-types';
import React from 'react';
import Submission from 'routes/Submission';
import SubmissionManagement from 'routes/SubmissionManagement';
import Profile from 'routes/Profile';
import ProfileStats from 'routes/ProfileStats';
import Settings from 'routes/Settings';
import TermsDetail from 'routes/TermsDetail';
import { Route, Switch } from 'react-router-dom';
import { ThemeProvider } from 'react-css-super-themr';
import { config, MetaTags } from 'topcoder-react-utils';

import primaryButtonStyle from 'components/buttons/outline/round/open-sans/green-uppercase.scss';
import secondaryButtonStyle from 'components/buttons/outline/round/open-sans/blue-uppercase.scss';

import socialImage from 'assets/images/communities/blockchain/social.jpg';

import Leaderboard from '../Leaderboard';

export default function Blockchain({ base, member, meta }) {
  return (
    <Route
      component={({ match }) => (
        <ThemeProvider theme={{
          PrimaryButton: primaryButtonStyle,
          SecondaryButton: secondaryButtonStyle,
        }}
        >
          <div>
            <MetaTags
              description="Learn about and build the next great decentralized application (DApp) on Ethereum platform"
              image={socialImage}
              siteName="Topcoder Blockchain Community"
              title="Topcoder Blockchain Community"
              url={config.URL.COMMUNITIES.BLOCKCHAIN}
            />
            <Header
              baseUrl={base}
              hideJoinNow
              pageId={match.params.pageId || 'home'}
            />
            <Switch>
              <Route
                component={BsicHackathon}
                exact
                path={`${base}/bsic-hackathon`}
              />
              <Route
                component={BsicHackathon}
                exact
                path={`${base}/bsic-incubator`}
              />
              <Route
                component={() => (
                  <div>
                    <ChallengeListingTopBanner />
                    { member ? (
                      ChallengeListing({
                        challengesUrl: `${base}/challenges`,
                        meta,
                        listingOnly: true,
                        newChallengeDetails: true,
                      })
                    ) : <ChallengeListingRegisterToSee /> }
                  </div>
                )}
                exact
                path={`${base}/challenges`}
              />
              <Route
                component={routeProps => ChallengeDetails({
                  ...routeProps,
                  challengesUrl: `${base}/challenges`,
                  communityId: meta.communityId,
                })}
                exact
                path={`${base}/challenges/:challengeId([\\w]{8}-[\\w]{4}-[\\w]{4}-[\\w]{4}-[\\w]{12}|\\d{5,8})`}
              />
              <Route
                component={routeProps => Submission({
                  ...routeProps,
                  challengesUrl: `${base}/challenges`,
                })}
                exact
                path={`${base}/challenges/:challengeId([\\w]{8}-[\\w]{4}-[\\w]{4}-[\\w]{4}-[\\w]{12}|\\d{5,8})/submit`}
              />
              <Route
                component={TermsDetail}
                exact
                path={`${base}/challenges/terms/detail/:termId`}
              />
              <Route
                component={routeProps => SubmissionManagement({
                  ...routeProps,
                  challengesUrl: `${base}/challenges`,
                })}
                exact
                path={`${base}/challenges/:challengeId([\\w]{8}-[\\w]{4}-[\\w]{4}-[\\w]{4}-[\\w]{12}|\\d{5,8})/my-submissions`}
              />
              <Route
                component={() => <Leaderboard meta={meta} />}
                exact
                path={`${base}/leaderboard`}
              />
              <Route
                render={props => <Profile {...props} meta={meta} />}
                exact
                path={`${base}/members/:handle([\\w\\-\\[\\].{}]{2,15})`}
              />
              <Route
                render={props => <ProfileStats {...props} meta={meta} />}
                exact
                path={`${base}/members/:handle([\\w\\-\\[\\].{}]{2,15})/details`}
              />
              <Route
                component={() => <Settings base={`${base}/settings`} />}
                path={`${base}/settings`}
              />
              <Route
                component={() => <Learn baseUrl={base} />}
                exact
                path={`${base}/learn`}
              />
              <Route
                component={Home}
                exact
                path={`${base}/home`}
              />
              <Route
                component={Error404}
                path={`${base}/:any`}
              />
              <Route
                component={Home}
                exact
                path={`${base || '/'}`}
              />
              <ContentfulRoute
                baseUrl={base}
                id="2QScQYvwnuS8eCIkoue4qI"
              />
            </Switch>
            <Footer />
          </div>
        </ThemeProvider>
      )}
      path={`${base}/:pageId?`}
    />
  );
}

Blockchain.defaultProps = {
  base: '',
};

Blockchain.propTypes = {
  base: PT.string,
  member: PT.bool.isRequired,
  meta: PT.shape().isRequired,
};
