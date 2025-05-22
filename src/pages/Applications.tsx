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
  Select,
  SelectItem,
  Badge,
  Text,
  Grid,
  Col,
  Metric,
  BarChart
} from '@tremor/react';

interface MicrosoftApp {
  AppId: string;
  AppDisplayName: string;
  AppOwnerOrganizationId: string;
  Source: string;
}

interface SourceStats {
  source: string;
  count: number;
}

export function Applications() {
  const navigate = useNavigate();
  const [apps, setApps] = useState<MicrosoftApp[]>([]);
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [sourceStats, setSourceStats] = useState<SourceStats[]>([]);

  useEffect(() => {
    setIsLoading(true);
    fetch('https://raw.githubusercontent.com/merill/microsoft-info/main/_info/MicrosoftApps.json')
      .then(response => response.json())
      .then(data => {
        setApps(data);
        // Calculate source statistics
        const stats = Object.entries(
          data.reduce((acc: Record<string, number>, app: MicrosoftApp) => {
            acc[app.Source] = (acc[app.Source] || 0) + 1;
            return acc;
          }, {})
        ).map(([source, count]) => ({ source, count: count as number }));
        setSourceStats(stats);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error fetching applications:', error);
        setIsLoading(false);
      });
  }, []);

  const filteredApps = apps.filter(app => {
    const matchesSearch = 
      app.AppDisplayName.toLowerCase().includes(search.toLowerCase()) ||
      app.AppId.toLowerCase().includes(search.toLowerCase());
    const matchesSource = sourceFilter === 'all' || app.Source === sourceFilter;
    return matchesSearch && matchesSource;
  });

  const sources = [...new Set(apps.map(app => app.Source))];

  return (
    <>
      <Helmet>
        <title>Microsoft First Party Applications - Microsoft Info</title>
        <meta name="description" content="Browse and search Microsoft first-party applications, including app IDs and display names." />
      </Helmet>

      <div className="space-y-6">
        <Grid numItems={1} numItemsSm={2} numItemsLg={3} className="gap-6">
          <Col numColSpan={1} numColSpanLg={3}>
            <Card>
              <Title>Applications Overview</Title>
              <Text className="mt-2">Distribution of applications by source</Text>
              <BarChart
                className="mt-4 h-40"
                data={sourceStats}
                index="source"
                categories={["count"]}
                colors={["blue"]}
                showLegend={false}
                valueFormatter={(value) => value.toString()}
              />
            </Card>
          </Col>
          {sourceStats.map(stat => (
            <Card key={stat.source}>
              <Text>{stat.source}</Text>
              <Metric>{stat.count} Applications</Metric>
            </Card>
          ))}
        </Grid>

        <Card>
          <div className="space-y-4">
            <Title>Microsoft First Party Applications</Title>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextInput
                placeholder="Search applications..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search applications"
              />
              <Select
                value={sourceFilter}
                onValueChange={setSourceFilter}
                aria-label="Filter by source"
              >
                <SelectItem value="all">All Sources</SelectItem>
                {sources.map(source => (
                  <SelectItem key={source} value={source}>
                    {source}
                  </SelectItem>
                ))}
              </Select>
            </div>

            <div className="rounded-tremor-default border border-tremor-border">
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
                        <TableCell>
                          <div className="flex flex-col">
                            <span>{app.AppDisplayName}</span>
                            {app.AppOwnerOrganizationId && (
                              <Badge size="xs" color="gray">
                                {app.AppOwnerOrganizationId}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                            {app.AppId}
                          </code>
                        </TableCell>
                        <TableCell>
                          <Badge color="blue">
                            {app.Source}
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