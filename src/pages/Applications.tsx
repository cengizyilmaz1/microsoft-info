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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetch('https://raw.githubusercontent.com/merill/microsoft-info/main/_info/MicrosoftApps.json')
      .then(response => response.json())
      .then(data => {
        setApps(data);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error fetching applications:', error);
        setIsLoading(false);
      });
  }, []);

  const filteredApps = apps.filter(app => 
    app.AppDisplayName.toLowerCase().includes(search.toLowerCase()) ||
    app.AppId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Helmet>
        <title>Microsoft First Party Applications - Microsoft Info</title>
        <meta name="description" content="Browse and search Microsoft first-party applications, including app IDs and display names." />
      </Helmet>

      <Card>
        <div className="mb-4">
          <Title>Microsoft First Party Applications</Title>
          <TextInput
            className="mt-2"
            placeholder="Search applications..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search applications"
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
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center">
                  Loading applications...
                </TableCell>
              </TableRow>
            ) : filteredApps.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center">
                  No applications found matching your search.
                </TableCell>
              </TableRow>
            ) : (
              filteredApps.map((app) => (
                <TableRow 
                  key={app.AppId}
                  className="cursor-pointer hover:bg-gray-50 transition-colors duration-200"
                  onClick={() => navigate(`/applications/${app.AppId}`)}
                  role="link"
                  tabIndex={0}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      navigate(`/applications/${app.AppId}`);
                    }
                  }}
                >
                  <TableCell>{app.AppDisplayName}</TableCell>
                  <TableCell>{app.AppId}</TableCell>
                  <TableCell>{app.Source}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}