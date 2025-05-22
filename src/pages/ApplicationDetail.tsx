import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Title, Text, Button } from '@tremor/react';

interface MicrosoftApp {
  AppId: string;
  AppDisplayName: string;
  AppOwnerOrganizationId: string;
  Source: string;
}

export function ApplicationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [app, setApp] = useState<MicrosoftApp | null>(null);

  useEffect(() => {
    fetch('https://raw.githubusercontent.com/merill/microsoft-info/main/_info/MicrosoftApps.json')
      .then(response => response.json())
      .then(data => {
        const foundApp = data.find((a: MicrosoftApp) => a.AppId === id);
        setApp(foundApp || null);
      });
  }, [id]);

  if (!app) {
    return (
      <Card>
        <div className="text-center">
          <Title>Application not found</Title>
          <Button className="mt-4" onClick={() => navigate('/applications')}>
            Back to Applications
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <Button size="xs" onClick={() => navigate('/applications')}>
          ← Back to Applications
        </Button>
        <div className="mt-4">
          <Title>{app.AppDisplayName}</Title>
          <div className="mt-6 space-y-4">
            <div>
              <Text className="font-medium">Application ID</Text>
              <Text className="mt-1">{app.AppId}</Text>
            </div>
            {app.AppOwnerOrganizationId && (
              <div>
                <Text className="font-medium">Owner Organization ID</Text>
                <Text className="mt-1">{app.AppOwnerOrganizationId}</Text>
              </div>
            )}
            <div>
              <Text className="font-medium">Source</Text>
              <Text className="mt-1">{app.Source}</Text>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}