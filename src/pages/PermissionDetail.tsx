import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../contexts/AuthContext';
import { GraphService } from '../services/GraphService';
import { 
  Card, 
  Title, 
  Text, 
  Button, 
  Badge,
  Grid,
  Col,
  Metric,
  List,
  ListItem,
  Divider
} from '@tremor/react';

interface GraphPermission {
  Id: string;
  Value: string;
  DisplayName?: string;
  AdminConsentDisplayName?: string;
  Description?: string;
  AdminConsentDescription?: string;
  Type?: string;
  Origin?: string;
  IsBuiltIn?: boolean;
  RequiresAdminConsent?: boolean;
  AllowedMemberTypes?: string[];
  IsEnabled?: boolean;
  Notes?: string;
}

export function PermissionDetail() {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [permission, setPermission] = useState<GraphPermission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPermissionDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch static data
        const url = type === 'app' 
          ? 'https://raw.githubusercontent.com/merill/microsoft-info/main/_info/GraphAppRoles.json'
          : 'https://raw.githubusercontent.com/merill/microsoft-info/main/_info/GraphDelegateRoles.json';

        const response = await fetch(url);
        const data = await response.json();
        let permissionData = data.find((p: GraphPermission) => p.Id === id);

        // If authenticated, fetch additional details from Graph API
        if (isAuthenticated) {
          try {
            const graphService = GraphService.getInstance();
            const graphData = await graphService.getServicePrincipalPermissions('00000003-0000-0000-c000-000000000000');
            const graphPermission = type === 'app'
              ? graphData.appRoles.find((p: any) => p.id === id)
              : graphData.oauth2PermissionScopes.find((p: any) => p.id === id);

            if (graphPermission) {
              permissionData = {
                ...permissionData,
                ...graphPermission,
                Type: type === 'app' ? 'Application' : 'Delegated',
                Origin: 'Microsoft Graph'
              };
            }
          } catch (error) {
            console.error('Error fetching live permission details:', error);
          }
        }

        setPermission(permissionData || null);
      } catch (error) {
        console.error('Error fetching permission details:', error);
        setError('Failed to load permission details');
      } finally {
        setLoading(false);
      }
    };

    fetchPermissionDetails();
  }, [type, id, isAuthenticated]);

  if (loading) {
    return (
      <Card>
        <div className="text-center">
          <Title>Loading permission details...</Title>
        </div>
      </Card>
    );
  }

  if (error || !permission) {
    return (
      <Card>
        <div className="text-center">
          <Title>{error || 'Permission not found'}</Title>
          <Button className="mt-4" onClick={() => navigate('/permissions')}>
            Back to Permissions
          </Button>
        </div>
      </Card>
    );
  }

  const getPermissionCategory = (value: string) => {
    const parts = value.split('.');
    return parts[0] || 'Other';
  };

  return (
    <>
      <Helmet>
        <title>{`${permission.Value} - Microsoft Graph Permission Details`}</title>
        <meta 
          name="description" 
          content={`Detailed information about the Microsoft Graph ${type} permission: ${permission.Value}`} 
        />
        <link rel="canonical" href={window.location.href} />
      </Helmet>

      <div className="space-y-6">
        <Card>
          <Button size="xs" onClick={() => navigate('/permissions')}>
            ← Back to Permissions
          </Button>
          
          <div className="mt-4">
            <div className="flex items-center gap-2">
              <Title>{permission.Value}</Title>
              <Badge color="blue">{getPermissionCategory(permission.Value)}</Badge>
            </div>
            
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge color="gray">{permission.Type}</Badge>
              {permission.IsBuiltIn && <Badge color="green">Built-in</Badge>}
              {permission.RequiresAdminConsent && <Badge color="red">Requires Admin Consent</Badge>}
              {permission.IsEnabled && <Badge color="green">Enabled</Badge>}
            </div>

            <Divider />

            <Grid numItems={1} numItemsSm={2} className="gap-6 mt-6">
              <Card>
                <Text className="font-medium">Display Name</Text>
                <Text className="mt-2">
                  {permission.DisplayName || permission.AdminConsentDisplayName}
                </Text>
              </Card>

              <Card>
                <Text className="font-medium">Permission ID</Text>
                <Text className="mt-2 font-mono text-sm">
                  {permission.Id}
                </Text>
              </Card>
            </Grid>

            <Card className="mt-6">
              <Text className="font-medium">Description</Text>
              <Text className="mt-2">
                {permission.Description || permission.AdminConsentDescription}
              </Text>
            </Card>

            {permission.AllowedMemberTypes && permission.AllowedMemberTypes.length > 0 && (
              <Card className="mt-6">
                <Text className="font-medium">Allowed Member Types</Text>
                <List className="mt-2">
                  {permission.AllowedMemberTypes.map((type) => (
                    <ListItem key={type}>
                      <Badge color="gray">{type}</Badge>
                    </ListItem>
                  ))}
                </List>
              </Card>
            )}

            {permission.Notes && (
              <Card className="mt-6">
                <Text className="font-medium">Additional Notes</Text>
                <Text className="mt-2">{permission.Notes}</Text>
              </Card>
            )}
          </div>
        </Card>
      </div>
    </>
  );
}