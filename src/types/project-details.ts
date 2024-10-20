// needs to be fixed on the db side

export type TeamMember = {
  fid: number;
  object: 'user';
  pfp_url: string | null;
  profile: {
    bio: {
      text: string;
    };
  };
  username: string;
  power_badge: boolean;
  display_name: string;
  active_status: 'inactive' | 'active';
  verifications: string[];
  follower_count: number;
  custody_address: string;
  following_count: number;
  verified_addresses: {
    eth_addresses: string[];
    sol_addresses: string[];
  };
};
