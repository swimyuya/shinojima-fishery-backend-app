import { Octokit } from '@octokit/rest'

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=github',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('GitHub not connected');
  }
  return accessToken;
}

// WARNING: Never cache this client.
// Access tokens expire, so a new client must be created each time.
// Always call this function again to get a fresh client.
export async function getUncachableGitHubClient() {
  const accessToken = await getAccessToken();
  return new Octokit({ auth: accessToken });
}

export async function createRepository(name: string, description: string, isPrivate: boolean = false) {
  const octokit = await getUncachableGitHubClient();
  
  try {
    const response = await octokit.rest.repos.createForAuthenticatedUser({
      name,
      description,
      private: isPrivate,
      auto_init: true,
      gitignore_template: 'Node'
    });
    
    return {
      success: true,
      repository: response.data,
      clone_url: response.data.clone_url,
      html_url: response.data.html_url
    };
  } catch (error: any) {
    console.error('GitHub repository creation error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

export async function getAuthenticatedUser() {
  const octokit = await getUncachableGitHubClient();
  
  try {
    const response = await octokit.rest.users.getAuthenticated();
    return {
      success: true,
      user: response.data
    };
  } catch (error: any) {
    console.error('GitHub user fetch error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}