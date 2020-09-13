/* eslint-disable max-len */
/**
 * The Gig details component.
 */

import React from 'react';
import PT from 'prop-types';
import { isomorphy, Link, config } from 'topcoder-react-utils';
import ReactHtmlParser from 'react-html-parser';
import { getSalaryType, getCustomField } from 'utils/gigs';
import './style.scss';
import IconFacebook from 'assets/images/icon-facebook.svg';
import IconTwitter from 'assets/images/icon-twitter.svg';
import IconLinkedIn from 'assets/images/icon-linkedIn.svg';
import IconLocation from 'assets/images/icon-location.svg';
import IconMoney from 'assets/images/icon-payment.svg';
import IconDuration from 'assets/images/icon-calendar-gig.svg';
import IconHours from 'assets/images/icon-duration.svg';
import IconTimezone from 'assets/images/icon-timezone.svg';
import iconSkills from 'assets/images/icon-skills-blue.png';
import iconLabel1 from 'assets/images/l1.png';
import iconLabel2 from 'assets/images/l2.png';
import iconLabel3 from 'assets/images/l3.png';
import iconLabel4 from 'assets/images/l4.png';

// Cleanup HTML from style tags
// so it won't affect other parts of the UI
const ReactHtmlParserOptions = {
  // eslint-disable-next-line consistent-return
  transform: (node) => {
    if (node.type === 'style' && node.name === 'style') {
      return null;
    }
  },
};

export default function GigDetails(props) {
  const { job } = props;
  let shareUrl;
  if (isomorphy.isClientSide()) {
    shareUrl = encodeURIComponent(window.location.href);
  }
  let skills = getCustomField(job.custom_fields, 'Technologies Required');
  if (skills !== 'n/a') skills = skills.split(',').join(', ');

  return (
    <div styleName="container">
      {
        job.error || job.enable_job_application_form !== 1 ? (
          <div styleName="error">
            <h3>Gig does not exist.</h3>
            <div styleName="cta-buttons">
              <Link to={config.GIGS_PAGES_PATH}>VIEW OTHER GIGS</Link>
            </div>
          </div>
        ) : (
          <div styleName="wrap">
            <h2>{job.name}</h2>
            <div styleName="infos">
              <div styleName="infos-item">
                <IconLocation />
                <div styleName="infos-data">
                  Location
                  <strong>{job.country}</strong>
                </div>
              </div>
              <div styleName="infos-item">
                <IconMoney />
                <div styleName="infos-data">
                  Compensation
                  <strong>${job.min_annual_salary} - ${job.max_annual_salary} / {getSalaryType(job.salary_type)}</strong>
                </div>
              </div>
              <div styleName="infos-item">
                <IconDuration />
                <div styleName="infos-data">
                  Duration
                  <strong>{getCustomField(job.custom_fields, 'Duration')}</strong>
                </div>
              </div>
              <div styleName="infos-item">
                <IconHours />
                <div styleName="infos-data">
                  Hours
                  <strong>{getCustomField(job.custom_fields, 'Hours per week')} hours / week</strong>
                </div>
              </div>
              <div styleName="infos-item">
                <IconTimezone />
                <div styleName="infos-data">
                  Timezone
                  <strong>{getCustomField(job.custom_fields, 'Timezone')}</strong>
                </div>
              </div>
            </div>
            <div styleName="content">
              <div styleName="left">
                <h4>Skills</h4>
                <p styleName="skills"><img src={iconSkills} alt="skills-icon" /> {skills}</p>
                <h4>Description</h4>
                <p>{ReactHtmlParser(job.job_description_text, ReactHtmlParserOptions)}
                </p>
                <h4>Notes</h4>
                <div>
                  <strong>
                    * Topcoder does not provide visa sponsorship nor will we work with Staffing Agencies.
                  </strong>
                  <strong>
                    ** Topcoder and Wipro employees are not eligible for Gig work opportunities. Do not apply and send questions to <a href="mailto:support@topcoder.com">support@topcoder.com</a>.
                  </strong>
                </div>
                <div styleName="cta-buttons">
                  <a styleName="primaryBtn" href={`https://recruitcrm.io/apply/${job.slug}`} target="_blank" rel="noopener noreferrer">APPLY TO THIS JOB</a>
                  <Link to={config.GIGS_PAGES_PATH}>VIEW OTHER JOBS</Link>
                </div>
              </div>
              <div styleName="right">
                <div styleName="shareButtons">
                  Share this job on:&nbsp;&nbsp;
                  <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`} target="_blank" rel="noopener noreferrer">
                    <IconLinkedIn />
                  </a>
                  <a href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}&src=share_button`} target="_blank" rel="noopener noreferrer">
                    <IconFacebook />
                  </a>
                  <a href={`https://twitter.com/intent/tweet?url=${shareUrl}`} target="_blank" rel="noopener noreferrer">
                    <IconTwitter />
                  </a>
                </div>
                <div styleName="info-area">
                  <p>Thank you for checking out our latest gig at Topcoder. Gig work through us is simple and effective for those that would like traditional freelance work. To learn more about how Gigs work with us, go <a target="_blank" rel="noreferrer" href="https://www.topcoder.com/thrive/tracks?track=Topcoder&amp;tax=Gig%20Work">here</a>.</p>
                  <p>At Topcoder, we pride ourselves in bringing our customers the very best candidates to help fill their needs. Want to improve your chances? You can do a few things:</p>
                  <ul>
                    <li>
                      <img src={iconLabel1} alt="label 1" />
                      <div><strong>Make sure your <a target="_blank" rel="noreferrer" href="https://www.topcoder.com/settings/profile">Topcoder profile</a> says it all.</strong> Fill out your profile to the best of your ability. Your skills, your location, your devices, etc, all help you improve your chances of being selected for a gig.</div>
                    </li>
                    <li>
                      <img src={iconLabel2} alt="label 2" />
                      <div><strong>Subscribe to our <a target="_blank" rel="noreferrer" href="https://www.topcoder.com/community/taas">Gig notifications email</a>.</strong> We’ll send you a weekly update on gigs available so you don’t miss a beat.</div>
                    </li>
                    <li>
                      <img src={iconLabel3} alt="label 3" />
                      <div><strong>Let us know you’re here!</strong> Check in on our <a target="_blank" rel="noreferrer" href="https://apps.topcoder.com/forums/">Gig Work forum</a> and tell us you’re looking for a gig. It’s great visibility for the Gig team.</div>
                    </li>
                    <li>
                      <img src={iconLabel4} alt="label 4" />
                      <div><strong>Check out our <a target="_blank" rel="noreferrer" href="https://www.topcoder.com/challenges">Topcoder challenges</a> and participate.</strong> Challenges showing your technology skills make you a “qualified” candidate so we know you’re good. The proof is in the pudding!</div>
                    </li>
                  </ul>
                </div>
                <div styleName="support">If you have any questions or doubts, don’t hesitate  to email <a href="mailto:support@topcoder.com">support@topcoder.com</a>.</div>
              </div>
            </div>
          </div>
        )
      }
    </div>
  );
}

GigDetails.propTypes = {
  job: PT.shape().isRequired,
};
