import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../contexts/AuthContext';
import { GraphService } from '../services/GraphService';
import {
  Card,
  Table,
  TableHead,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  Title,
  TextInput,
  Tab,
  TabList,
  TabGroup,
  Badge,
  Text,
  Grid,
  Col,
  Metric,
  DonutChart,
  Button,
  Flex
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
}

export function Permissions() {
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();
  const [activeTab, setActiveTab] = useState('app');
  const [appPermissions, setAppPermissions] = useState<GraphPermission[]>([]);
  const [delegatePermissions, setDelegatePermissions] = useState<GraphPermission[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPermissionsData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch static data
      const [appRolesResponse, delegateRolesResponse] = await Promise.all([
        fetch('https://raw.githubusercontent.com/merill/microsoft-info/main/_info/GraphAppRoles.json'),
        fetch('https://raw.githubusercontent.com/merill/microsoft-info/main/_info/GraphDelegateRoles.json')
      ]);

      const staticAppRoles = await appRolesResponse.json();
      const staticDelegateRoles = await delegateRolesResponse.json();

      // If authenticated, fetch live data from Graph API
      if (isAuthenticated) {
        const graphService = GraphService.getInstance();
        try {
          const graphPermissions = await graphService.getServicePrincipalPermissions('00000003-0000-0000-c000-000000000000');
          
          // Merge static and live data
          const mergedAppRoles = staticAppRoles.map((role: GraphPermission) => ({
            ...role,
            ...graphPermissions.appRoles.find((graphRole: any) => graphRole.id === role.Id),
            Type: 'Application',
            Origin: 'Microsoft Graph'
          }));

          const mergedDelegateRoles = staticDelegateRoles.map((role: GraphPermission) => ({
            ...role,
            ...graphPermissions.oauth2PermissionScopes.find((graphRole: any) => graphRole.id === role.Id),
            Type: 'Delegated',
            Origin: 'Microsoft Graph'
          }));

          setAppPermissions(mergedAppRoles);
          setDelegatePermissions(mergedDelegateRoles);
        } catch (error) {
          console.error('Error fetching live permissions:', error);
          // Fall back to static data
          setAppPermissions(staticAppRoles.map((role: GraphPermission) => ({ ...role, Type: 'Application' })));
          setDelegatePermissions(staticDelegateRoles.map((role: GraphPermission) => ({ ...role, Type: 'Delegated' })));
        }
      } else {
        // Use static data only
        setAppPermissions(staticAppRoles.map((role: GraphPermission) => ({ ...role, Type: 'Application' })));
        setDelegatePermissions(staticDelegateRoles.map((role: GraphPermission) => ({ ...role, Type: 'Delegated' })));
      }
    } catch (error) {
      console.error('Error fetching permissions:', error);
      setError('Failed to load permissions data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissionsData();
  }, [isAuthenticated]);

  const filteredPermissions = (activeTab === 'app' ? appPermissions : delegatePermissions)
    .filter(permission => {
      const searchValue = search.toLowerCase();
      const value = permission.Value?.toLowerCase() || '';
      const displayName = (permission.DisplayName || permission.AdminConsentDisplayName || '').toLowerCase();
      const description = (permission.Description || permission.AdminConsentDescription || '').toLowerCase();
      
      return value.includes(searchValue) || 
             displayName.includes(searchValue) || 
             description.includes(searchValue);
    });

  const getPermissionCategory = (value: string) => {
    const parts = value.split('.');
    return parts[0] || 'Other';
  };

  const categoryStats = filteredPermissions.reduce((acc: Record<string, number>, permission) => {
    const category = getPermissionCategory(permission.Value);
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.entries(categoryStats).map(([category, count]) => ({
    category,
    count
  }));

  return (
    <>
      <Helmet>
        <title>Microsoft Graph Permissions - Microsoft Info</title>
        <meta name="description" content="Comprehensive view of Microsoft Graph permissions, including both application and delegated permissions with detailed information." />
        <link rel="canonical" href={window.location.href} />
      </Helmet>

      <div className="space-y-6">
        <Grid numItems={1} numItemsSm={2} numItemsLg={3} className="gap-6">
          <Card>
            <Title>Permissions Overview</Title>
            <Text className="mt-2">Distribution by category</Text>
            <DonutChart
              className="mt-4 h-40"
              data={chartData}
              category="count"
              index="category"
              valueFormatter={(value) => `${value} permissions`}
              colors={["blue", "cyan", "indigo", "violet", "fuchsia"]}
            />
          </Card>
          <Card>
            <Title>Total Permissions</Title>
            <div className="mt-4">
              <Metric>{filteredPermissions.length}</Metric>
              <Text>{activeTab === 'app' ? 'Application' : 'Delegated'} Permissions</Text>
            </div>
          </Card>
          <Card>
            <Title>Authentication Status</Title>
            <div className="mt-4">
              <Flex justifyContent="start" className="space-x-2">
                <Badge color={isAuthenticated ? "green" : "yellow"}>
                  {isAuthenticated ? "Authenticated" : "Limited Data"}
                </Badge>
                {!isAuthenticated && (
                  <Button size="xs" onClick={() => login()}>
                    Sign in for full data
                  </Button>
                )}
              </Flex>
            </div>
          </Card>
        </Grid>

        <Card>
          <div className="space-y-4">
            <Title>Microsoft Graph Permissions</Title>
            
            <TabGroup defaultValue={activeTab} onValueChange={setActiveTab}>
              <TabList>
                <Tab value="app">Application Permissions</Tab>
                <Tab value="delegate">Delegated Permissions</Tab>
              </TabList>
            </TabGroup>

            <TextInput
              placeholder="Search permissions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search permissions"
            />

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            <div className="rounded-tremor-default border border-tremor-border">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>Permission</TableHeaderCell>
                    <TableHeaderCell>Display Name</TableHeaderCell>
                    <TableHeaderCell>Description</TableHeaderCell>
                    <TableHeaderCell>Details</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center">
                        Loading permissions...
                      </TableCell>
                    </TableRow>
                  ) : filteredPermissions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center">
                        No permissions found matching your search.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPermissions.map((permission) => (
                      <TableRow 
                        key={permission.Id}
                        className="cursor-pointer hover:bg-gray-50 transition-colors duration-200"
                        onClick={() => navigate(`/permissions/${activeTab}/${permission.Id}`)}
                        role="link"
                        tabIndex={0}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            navigate(`/permissions/${activeTab}/${permission.Id}`);
                          }
                        }}
                      >
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                              {permission.Value}
                            </code>
                            <div className="flex gap-1">
                              <Badge size="xs" color="blue">
                                {getPermissionCategory(permission.Value)}
                              </Badge>
                              {permission.RequiresAdminConsent && (
                                <Badge size="xs" color="red">
                                  Admin Consent
                                </Badge>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {permission.DisplayName || permission.AdminConsentDisplayName}
                        </TableCell>
                        <TableCell className="max-w-md">
                          <div className="line-clamp-2">
                            {permission.Description || permission.AdminConsentDescription}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <Badge size="xs" color="gray">
                              {permission.Type}
                            </Badge>
                            {permission.IsBuiltIn && (
                              <Badge size="xs" color="green">
                                Built-in
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}