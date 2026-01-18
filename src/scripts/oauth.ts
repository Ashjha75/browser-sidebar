// Helper utilities for performing OAuth inside a Chrome extension
// Uses chrome.identity.launchWebAuthFlow to open the provider URL and capture the final redirect URL.

export function launchOAuth(authUrl: string, interactive = true): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!chrome || !chrome.identity || !chrome.identity.launchWebAuthFlow) {
      reject(new Error('chrome.identity.launchWebAuthFlow is not available'));
      return;
    }

    chrome.identity.launchWebAuthFlow({ url: authUrl, interactive }, (redirectUrl) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message || 'launchWebAuthFlow failed'));
        return;
      }

      if (!redirectUrl) {
        reject(new Error('No redirect URL returned by launchWebAuthFlow'));
        return;
      }

      resolve(redirectUrl);
    });
  });
}

// Sign in flow for Supabase (or any provider) that returns the final redirected-to URL.
// Caller is responsible for exchanging the returned URL with their auth client if needed.
export async function signInWithSupabaseOAuth(supabaseClient: any, provider = 'google') {
  // Get the extension redirect URL (must be registered with provider)
  const redirectTo = chrome.identity.getRedirectURL();

  // Initiate OAuth on Supabase (returns an auth URL to open)
  const { data, error } = await supabaseClient.auth.signInWithOAuth({
    provider,
    options: { redirectTo }
  });

  if (error) throw error;
  if (!data || !data.url) throw new Error('No auth URL returned from signInWithOAuth');

  // Open the auth URL via chrome.identity.launchWebAuthFlow and return final redirect URL
  const responseUrl = await launchOAuth(data.url, true);
  return responseUrl;
}

export default { launchOAuth, signInWithSupabaseOAuth };
