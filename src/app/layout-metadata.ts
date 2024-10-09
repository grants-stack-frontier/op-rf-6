import type { Metadata } from 'next';

const title = 'Retro Funding 6: Voting';
const description = 'Voting is now live for Retro Funding 6: OP Stack';
const url = 'http://round6.optimism.io/';

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    type: 'website',
    url,
    title,
    description,
    siteName: title,
    images: [{ url: url + '/og.png' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@site',
    creator: '@creator',
    images: url + '/og.png',
  },
};
