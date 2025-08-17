import { NhostClient } from '@nhost/react';

export const nhost = new NhostClient({
  subdomain: import.meta.env.VITE_NHOST_SUBDOMAIN || 'your-nhost-subdomain',
  region: import.meta.env.VITE_NHOST_REGION || 'your-region',
});