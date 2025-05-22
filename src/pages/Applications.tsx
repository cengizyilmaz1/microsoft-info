import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Table,
  TableHead,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  Title,
  TextInput
} from '@tremor/react';

interface MicrosoftApp {
  AppId: string;
  AppDisplayName: string;
  AppOwnerOrganizationId: string;
  Source: string;
}

export function Applications() {
  const navigate = useNavigate();
  const [apps, setApps] = useState<MicrosoftApp[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('https://raw.githubusercontent.com/merill/microsoft-info/main/_info/MicrosoftApps.json')
      .then(response => response.json())
      .then(data => setApps(data));
  }, []);

  const filteredApps = apps.filter(app => 
    app.AppDisplayName.toLowerCase().includes(search.toLowerCase()) ||
    app.AppId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Card>
      <div className="mb-4">
        <Title>Microsoft First Party Applications</Title>
        <TextInput
          className="mt-2"
          placeholder="Search applications..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeaderCell>Application Name</TableHeaderCell>
            <TableHeaderCell>Application ID</TableHeaderCell>
            <TableHeaderCell>Source</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredApps.map((app) => (
            <TableRow 
              key={app.AppId}
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => navigate(`/applications/${app.AppId}`)}
            >
              <TableCell>{app.AppDisplayName}</TableCell>
              <TableCell>{app.AppId}</TableCell>
              <TableCell>{app.Source}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}