import { Client } from "@microsoft/microsoft-graph-client";
import { AuthCodeMSALBrowserAuthenticationProvider } from "@microsoft/microsoft-graph-client/authProviders/authCodeMsalBrowser";
import { PublicClientApplication, AccountInfo } from "@azure/msal-browser";
import { msalConfig } from "./graphConfig";

export class GraphService {
  private static instance: GraphService;
  private msalInstance: PublicClientApplication;
  private graphClient: Client | null = null;

  private constructor() {
    this.msalInstance = new PublicClientApplication(msalConfig);
  }

  public static getInstance(): GraphService {
    if (!GraphService.instance) {
      GraphService.instance = new GraphService();
    }
    return GraphService.instance;
  }

  public async initializeGraphClient(account: AccountInfo) {
    const authProvider = new AuthCodeMSALBrowserAuthenticationProvider(
      this.msalInstance,
      {
        account: account,
        scopes: ["Application.Read.All"],
        interactionType: "popup"
      }
    );

    this.graphClient = Client.initWithMiddleware({
      authProvider: authProvider
    });
  }

  public async getApplicationPermissions(appId: string) {
    if (!this.graphClient) {
      throw new Error("Graph client not initialized");
    }

    try {
      const response = await this.graphClient
        .api(`/applications`)
        .filter(`appId eq '${appId}'`)
        .select("id,appId,displayName,requiredResourceAccess")
        .get();

      return response.value[0]?.requiredResourceAccess || [];
    } catch (error) {
      console.error("Error fetching application permissions:", error);
      throw error;
    }
  }

  public async getServicePrincipalPermissions(appId: string) {
    if (!this.graphClient) {
      throw new Error("Graph client not initialized");
    }

    try {
      const response = await this.graphClient
        .api(`/servicePrincipals`)
        .filter(`appId eq '${appId}'`)
        .select("id,appId,displayName,appRoles,oauth2PermissionScopes")
        .get();

      return {
        appRoles: response.value[0]?.appRoles || [],
        oauth2PermissionScopes: response.value[0]?.oauth2PermissionScopes || []
      };
    } catch (error) {
      console.error("Error fetching service principal permissions:", error);
      throw error;
    }
  }
}