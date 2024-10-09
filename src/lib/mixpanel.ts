'use client';
import mixpanel from 'mixpanel-browser';

// eslint-disable-next-line import/no-named-as-default-member
mixpanel.init(process.env.NEXT_PUBLIC_MIXPANEL_API!, {
  debug: true,
  track_pageview: true,
  persistence: 'localStorage',
});

export default mixpanel;
