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
  Metric,
  Button,
  Flex,
  Select,
  SelectItem,
  Tab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels
} from '@tremor/react';
import { 
  ShieldCheckIcon, 
  KeyIcon, 
  DocumentMagnifyingGlassIcon,
  FolderIcon,
  EnvelopeIcon,
  UsersIcon,
  CalendarIcon,
  ChatBubbleLeftIcon,
  DocumentIcon,
  DevicePhoneMobileIcon,
  CogIcon
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

// Define permission categories with their icons and descriptions
const permissionCategories = {
  'directory': {
    icon: UsersIcon,
    title: 'Directory',
    description: 'Permissions related to Azure AD directory management',
    color: 'blue'
  },
  'user': {
    icon: UsersIcon,
    title: 'User',
    description: 'User profile and management permissions',
    color: 'green'
  },
  'mail': {
    icon: EnvelopeIcon,
    title: 'Mail',
    description: 'Email and message management permissions',
    color: 'purple'
  },
  'files': {
    icon: FolderIcon,
    title: 'Files',
    description: 'File and storage related permissions',
    color: 'yellow'
  },
  'calendar': {
    icon: CalendarIcon,
    title: 'Calendar',
    description: 'Calendar and event management permissions',
    color: 'orange'
  },
  'chat': {
    icon: ChatBubbleLeftIcon,
    title: 'Chat & Teams',
    description: 'Teams and chat related permissions',
    color: 'indigo'
  },
  'sites': {
    icon: DocumentIcon,
    title: 'Sites & SharePoint',
    description: 'SharePoint and sites related permissions',
    color: 'red'
  },
  'device': {
    icon: DevicePhoneMobileIcon,
    title: 'Device',
    description: 'Device management permissions',
    color: 'cyan'
  },
  'application': {
    icon: CogIcon,
    title: 'Application',
    description: 'Application management permissions',
    color: 'pink'
  },
  'other': {
    icon: DocumentMagnifyingGlassIcon,
    title: 'Other',
    description: 'Other miscellaneous permissions',
    color: 'gray'
  }
};

export function Permissions() {
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();
  const [permissions, setPermissions] = useState<GraphPermission[]>([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
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

  const getPermissionCategory = (value: string): string => {
    const lowerValue = value.toLowerCase();
    if (lowerValue.includes('directory') || lowerValue.includes('organization')) return 'directory';
    if (lowerValue.includes('mail') || lowerValue.includes('message')) return 'mail';
    if (lowerValue.includes('file') || lowerValue.includes('drive')) return 'files';
    if (lowerValue.includes('user') || lowerValue.includes('profile')) return 'user';
    if (lowerValue.includes('calendar') || lowerValue.includes('event')) return 'calendar';
    if (lowerValue.includes('chat') || lowerValue.includes('teams')) return 'chat';
    if (lowerValue.includes('site') || lowerValue.includes('sharepoint')) return 'sites';
    if (lowerValue.includes('device') || lowerValue.includes('endpoint')) return 'device';
    if (lowerValue.includes('application') || lowerValue.includes('app')) return 'application';
    return 'other';
  };

  const filteredPermissions = permissions.filter(permission => {
    const matchesSearch = 
      permission.Value.toLowerCase().includes(search.toLowerCase()) ||
      (permission.DisplayName || permission.AdminConsentDisplayName || '').toLowerCase().includes(search.toLowerCase()) ||
      (permission.Description || permission.AdminConsentDescription || '').toLowerCase().includes(search.toLowerCase());
    
    const matchesType = typeFilter === 'all' || permission.Type === typeFilter;
    const matchesCategory = selectedCategory === 'all' || getPermissionCategory(permission.Value) === selectedCategory;

    return matchesSearch && matchesType && matchesCategory;
  });

  const categorizedPermissions = Object.keys(permissionCategories).reduce((acc, category) => {
    acc[category] = filteredPermissions.filter(p => getPermissionCategory(p.Value) === category);
    return acc;
  }, {} as Record<string, GraphPermission[]>);

  const stats = {
    total: permissions.length,
    application: permissions.filter(p => p.Type === 'Application').length,
    delegated: permissions.filter(p => p.Type === 'Delegated').length,
    adminConsent: permissions.filter(p => p.RequiresAdminConsent).length
  };

  const renderPermissionTable = (permissions: GraphPermission[]) => (
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
        {permissions.map((permission) => (
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
                {permission.RequiresAdminConsent && (
                  <Badge size="xs" color="red">
                    Admin Consent
                  </Badge>
                )}
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
        ))}
      </TableBody>
    </Table>
  );

  return (
    <>
      <Helmet>
        <title>Microsoft Graph Permissions Explorer</title>
        <meta name="description" content="Explore and search Microsoft Graph permissions by category, including both application and delegated permissions." />
      </Helmet>

      <div className="space-y-6">
        <Grid numItems={1} numItemsSm={2} numItemsLg={4} className="gap-6">
          <Card decoration="top" decorationColor="blue">
            <Flex>
              <div>
                <Text>Total Permissions</Text>
                <Metric>{stats.total}</Metric>
              </div>
              <DocumentMagnifyingGlassIcon className="h-8 w-8 text-blue-500" />
            </Flex>
          </Card>

          <Card decoration="top" decorationColor="green">
            <Flex>
              <div>
                <Text>Application</Text>
                <Metric>{stats.application}</Metric>
              </div>
              <KeyIcon className="h-8 w-8 text-green-500" />
            </Flex>
          </Card>

          <Card decoration="top" decorationColor="purple">
            <Flex>
              <div>
                <Text>Delegated</Text>
                <Metric>{stats.delegated}</Metric>
              </div>
              <KeyIcon className="h-8 w-8 text-purple-500" />
            </Flex>
          </Card>

          <Card decoration="top" decorationColor="orange">
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
                value={selectedCategory}
                onValueChange={setSelectedCategory}
                placeholder="Filter by category"
              >
                <SelectItem value="all">All Categories</SelectItem>
                {Object.entries(permissionCategories).map(([key, { title }]) => (
                  <SelectItem key={key} value={key}>{title}</SelectItem>
                ))}
              </Select>
            </Grid>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            <TabGroup>
              <TabList>
                {Object.entries(permissionCategories).map(([key, { title, icon: Icon }]) => (
                  <Tab key={key} className="flex items-center gap-2">
                    <Icon className="h-5 w-5" />
                    {title}
                    <Badge size="xs">{categorizedPermissions[key]?.length || 0}</Badge>
                  </Tab>
                ))}
              </TabList>
              <TabPanels>
                {Object.entries(permissionCategories).map(([key, { title, description }]) => (
                  <TabPanel key={key}>
                    <div className="mt-4">
                      <Title>{title}</Title>
                      <Text className="mt-2">{description}</Text>
                      <div className="mt-4">
                        {isLoading ? (
                          <div className="text-center py-4">Loading permissions...</div>
                        ) : categorizedPermissions[key]?.length === 0 ? (
                          <div className="text-center py-4">No permissions found in this category.</div>
                        ) : (
                          renderPermissionTable(categorizedPermissions[key])
                        )}
                      </div>
                    </div>
                  </TabPanel>
                ))}
              </TabPanels>
            </TabGroup>
          </div>
        </Card>
      </div>
    </>
  );
}