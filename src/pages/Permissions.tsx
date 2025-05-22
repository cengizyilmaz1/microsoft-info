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
  Badge,
  Text,
  Grid,
  Col,
  Metric,
  Button,
  Flex,
  Select,
  SelectItem
} from '@tremor/react';
import { 
  ShieldCheckIcon, 
  KeyIcon, 
  DocumentMagnifyingGlassIcon 
} from '@heroicons/react/24/outline';

interface GraphPermission {
  Id: string;
  Value: string;
  DisplayName?: string;
  AdminConsentDisplayName?: string;
  Description?: string;
  AdminConsentDescription?: string;
  Type?: 'Application' | 'Delegated';
  IsBuiltIn?: boolean;
  RequiresAdminConsent?: boolean;
  AllowedMemberTypes?: string[];
}

export function Permissions() {
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();
  const [permissions, setPermissions] = useState<GraphPermission[]>([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPermissionsData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [appResponse, delegateResponse] = await Promise.all([
        fetch('https://raw.githubusercontent.com/merill/microsoft-info/main/_info/GraphAppRoles.json'),
        fetch('https://raw.githubusercontent.com/merill/microsoft-info/main/_info/GraphDelegateRoles.json')
      ]);

      const appRoles = await appResponse.json();
      const delegateRoles = await delegateResponse.json();

      let combinedPermissions = [
        ...appRoles.map((role: GraphPermission) => ({ ...role, Type: 'Application' as const })),
        ...delegateRoles.map((role: GraphPermission) => ({ ...role, Type: 'Delegated' as const }))
      ];

      if (isAuthenticated) {
        try {
          const graphService = GraphService.getInstance();
          const graphData = await graphService.getServicePrincipalPermissions('00000003-0000-0000-c000-000000000000');
          
          combinedPermissions = combinedPermissions.map(permission => {
            const graphPermission = permission.Type === 'Application'
              ? graphData.appRoles.find((p: any) => p.id === permission.Id)
              : graphData.oauth2PermissionScopes.find((p: any) => p.id === permission.Id);
            
            return {
              ...permission,
              ...graphPermission,
              IsBuiltIn: !!graphPermission?.isBuiltIn,
              RequiresAdminConsent: !!graphPermission?.isEnabled
            };
          });
        } catch (error) {
          console.error('Error fetching Graph permissions:', error);
        }
      }

      setPermissions(combinedPermissions);
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

  const getPermissionCategory = (value: string) => {
    const parts = value.split('.');
    return parts[0] || 'Other';
  };

  const categories = Array.from(new Set(permissions.map(p => getPermissionCategory(p.Value))));

  const filteredPermissions = permissions.filter(permission => {
    const matchesSearch = 
      permission.Value.toLowerCase().includes(search.toLowerCase()) ||
      (permission.DisplayName || permission.AdminConsentDisplayName || '').toLowerCase().includes(search.toLowerCase()) ||
      (permission.Description || permission.AdminConsentDescription || '').toLowerCase().includes(search.toLowerCase());
    
    const matchesType = typeFilter === 'all' || permission.Type === typeFilter;
    const matchesCategory = categoryFilter === 'all' || getPermissionCategory(permission.Value) === categoryFilter;

    return matchesSearch && matchesType && matchesCategory;
  });

  const stats = {
    total: permissions.length,
    application: permissions.filter(p => p.Type === 'Application').length,
    delegated: permissions.filter(p => p.Type === 'Delegated').length,
    adminConsent: permissions.filter(p => p.RequiresAdminConsent).length
  };

  return (
    <>
      <Helmet>
        <title>Microsoft Graph Permissions Explorer</title>
        <meta name="description" content="Explore and search Microsoft Graph permissions, including both application and delegated permissions with detailed information." />
        <link rel="canonical" href={window.location.href} />
      </Helmet>

      <div className="space-y-6">
        <Grid numItems={1} numItemsSm={2} numItemsLg={4} className="gap-6">
          <Card 
            decoration="top"
            decorationColor="blue"
          >
            <Flex>
              <div>
                <Text>Total Permissions</Text>
                <Metric>{stats.total}</Metric>
              </div>
              <DocumentMagnifyingGlassIcon className="h-8 w-8 text-blue-500" />
            </Flex>
          </Card>

          <Card
            decoration="top"
            decorationColor="green"
          >
            <Flex>
              <div>
                <Text>Application</Text>
                <Metric>{stats.application}</Metric>
              </div>
              <KeyIcon className="h-8 w-8 text-green-500" />
            </Flex>
          </Card>

          <Card
            decoration="top"
            decorationColor="purple"
          >
            <Flex>
              <div>
                <Text>Delegated</Text>
                <Metric>{stats.delegated}</Metric>
              </div>
              <KeyIcon className="h-8 w-8 text-purple-500" />
            </Flex>
          </Card>

          <Card
            decoration="top"
            decorationColor="orange"
          >
            <Flex>
              <div>
                <Text>Admin Consent</Text>
                <Metric>{stats.adminConsent}</Metric>
              </div>
              <ShieldCheckIcon className="h-8 w-8 text-orange-500" />
            </Flex>
          </Card>
        </Grid>

        <Card>
          <div className="space-y-4">
            <Flex>
              <Title>Microsoft Graph Permissions</Title>
              {!isAuthenticated && (
                <Button 
                  size="xs" 
                  variant="secondary"
                  icon={ShieldCheckIcon}
                  onClick={() => login()}
                >
                  Sign in for full data
                </Button>
              )}
            </Flex>

            <Grid numItems={1} numItemsSm={3} className="gap-4">
              <TextInput
                placeholder="Search permissions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search permissions"
              />

              <Select
                value={typeFilter}
                onValueChange={setTypeFilter}
                placeholder="Filter by type"
              >
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Application">Application</SelectItem>
                <SelectItem value="Delegated">Delegated</SelectItem>
              </Select>

              <Select
                value={categoryFilter}
                onValueChange={setCategoryFilter}
                placeholder="Filter by category"
              >
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </Select>
            </Grid>

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
                    <TableHeaderCell>Type</TableHeaderCell>
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
                        No permissions found matching your criteria.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPermissions.map((permission) => (
                      <TableRow 
                        key={`${permission.Type}-${permission.Id}`}
                        className="cursor-pointer hover:bg-gray-50 transition-colors duration-200"
                        onClick={() => navigate(`/permissions/${permission.Id}`)}
                      >
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                              {permission.Value}
                            </code>
                            <div className="flex gap-1 flex-wrap">
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
                          <Badge 
                            color={permission.Type === 'Application' ? 'green' : 'purple'}
                            size="sm"
                          >
                            {permission.Type}
                          </Badge>
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