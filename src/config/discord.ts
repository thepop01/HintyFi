export const DISCORD_CONFIG = {
  CLIENT_ID: import.meta.env.VITE_DISCORD_CLIENT_ID,
  REDIRECT_URI: import.meta.env.VITE_DISCORD_REDIRECT_URI,
  SCOPE: 'identify email',
  RESPONSE_TYPE: 'token', // Implicit Grant
};

export const getDiscordAuthUrl = () => {
  const params = new URLSearchParams({
    client_id: DISCORD_CONFIG.CLIENT_ID,
    redirect_uri: DISCORD_CONFIG.REDIRECT_URI,
    response_type: DISCORD_CONFIG.RESPONSE_TYPE,
    scope: DISCORD_CONFIG.SCOPE,
  });
  return `https://discord.com/api/oauth2/authorize?${params.toString()}`;
};
