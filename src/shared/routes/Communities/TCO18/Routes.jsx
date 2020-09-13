/**
 * Routing of TCO18 Community.
 */

import ContentfulRoute from 'components/Contentful/Route';
import Error404 from 'components/Error404';
import Header from 'containers/tc-communities/Header';
import PT from 'prop-types';
import React from 'react';
import { Route, Switch } from 'react-router-dom';
import Profile from 'routes/Profile';
import ProfileStats from 'routes/ProfileStats';

import headerTheme from 'components/tc-communities/communities/tco/themes/header.scss';

export default function TCO18({ base, meta }) {
  return (
    <Route
      component={({ match }) => (
        <div>
          <Header
            baseUrl={base}
            pageId={match.params.pageId || 'home'}
            theme={headerTheme}
          />
          <Switch>
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
            <ContentfulRoute
              baseUrl={base}
              error404={<Error404 />}
              id="5MK8iGUoAy7CTwGsJ7QtIE"
            />
            <Route
              component={Error404}
              path={`${base}/:any`}
            />
          </Switch>
        </div>
      )}
      path={`${base}/:pageId?`}
    />
  );
}

TCO18.defaultProps = {
  base: '',
};

TCO18.propTypes = {
  base: PT.string,
  meta: PT.shape().isRequired,
};
