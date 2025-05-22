import React, { useState, useEffect } from 'react';
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
  TabGroup
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
  const [activeTab, setActiveTab] = useState('app');
  const [appPermissions, setAppPermissions] = useState<GraphPermission[]>([]);
  const [delegatePermissions, setDelegatePermissions] = useState<GraphPermission[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    Promise.all([
      fetch('https://raw.githubusercontent.com/merill/microsoft-info/main/_info/GraphAppRoles.json')
        .then(response => response.json()),
      fetch('https://raw.githubusercontent.com/merill/microsoft-info/main/_info/GraphDelegateRoles.json')
        .then(response => response.json())
    ]).then(([appData, delegateData]) => {
      setAppPermissions(appData);
      setDelegatePermissions(delegateData);
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

  return (
    <Card>
      <div className="mb-4">
        <Title>Microsoft Graph Permissions</Title>
        <TabGroup className="mt-4" defaultValue={activeTab} onValueChange={setActiveTab}>
          <TabList>
            <Tab value="app">Application Permissions</Tab>
            <Tab value="delegate">Delegated Permissions</Tab>
          </TabList>
        </TabGroup>
        <TextInput
          className="mt-4"
          placeholder="Search permissions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeaderCell>Permission</TableHeaderCell>
            <TableHeaderCell>Display Name</TableHeaderCell>
            <TableHeaderCell>Description</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredPermissions.map((permission) => (
            <TableRow key={permission.Id}>
              <TableCell>{permission.Value}</TableCell>
              <TableCell>
                {permission.DisplayName || permission.AdminConsentDisplayName}
              </TableCell>
              <TableCell>
                {permission.Description || permission.AdminConsentDescription}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}