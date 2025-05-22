import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
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
  DonutChart
} from '@tremor/react';

interface GraphPermission {
  Id: string;
  Value: string;
  DisplayName?: string;
  AdminConsentDisplayName?: string;
  Description?: string;
  AdminConsentDescription?: string;
}

export function Permissions() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('app');
  const [appPermissions, setAppPermissions] = useState<GraphPermission[]>([]);
  const [delegatePermissions, setDelegatePermissions] = useState<GraphPermission[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      fetch('https://raw.githubusercontent.com/merill/microsoft-info/main/_info/GraphAppRoles.json')
        .then(response => response.json()),
      fetch('https://raw.githubusercontent.com/merill/microsoft-info/main/_info/GraphDelegateRoles.json')
        .then(response => response.json())
    ]).then(([appData, delegateData]) => {
      setAppPermissions(appData);
      setDelegatePermissions(delegateData);
      setIsLoading(false);
    }).catch(error => {
      console.error('Error fetching permissions:', error);
      setIsLoading(false);
    });
  }, []);

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

  // Calculate permission categories
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
        <meta name="description" content="Browse and search Microsoft Graph permissions, including application and delegated permissions." />
      </Helmet>

      <div className="space-y-6">
        <Grid numItems={1} numItemsSm={2} className="gap-6">
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

            <div className="rounded-tremor-default border border-tremor-border">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>Permission</TableHeaderCell>
                    <TableHeaderCell>Display Name</TableHeaderCell>
                    <TableHeaderCell>Description</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center">
                        Loading permissions...
                      </TableCell>
                    </TableRow>
                  ) : filteredPermissions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center">
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
                            <Badge size="xs" color="blue">
                              {getPermissionCategory(permission.Value)}
                            </Badge>
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