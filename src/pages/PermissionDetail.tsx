import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Title, Text, Button } from '@tremor/react';

interface GraphPermission {
  Id: string;
  Value: string;
  DisplayName?: string;
  AdminConsentDisplayName?: string;
  Description?: string;
  AdminConsentDescription?: string;
}

export function PermissionDetail() {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const [permission, setPermission] = useState<GraphPermission | null>(null);

  useEffect(() => {
    const url = type === 'app' 
      ? 'https://raw.githubusercontent.com/merill/microsoft-info/main/_info/GraphAppRoles.json'
      : 'https://raw.githubusercontent.com/merill/microsoft-info/main/_info/GraphDelegateRoles.json';

    fetch(url)
      .then(response => response.json())
      .then(data => {
        const foundPermission = data.find((p: GraphPermission) => p.Id === id);
        setPermission(foundPermission || null);
      });
  }, [type, id]);

  if (!permission) {
    return (
      <Card>
        <div className="text-center">
          <Title>Permission not found</Title>
          <Button className="mt-4" onClick={() => navigate('/permissions')}>
            Back to Permissions
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <Button size="xs" onClick={() => navigate('/permissions')}>
          ← Back to Permissions
        </Button>
        <div className="mt-4">
          <Title>{permission.Value}</Title>
          <div className="mt-6 space-y-4">
            <div>
              <Text className="font-medium">Permission ID</Text>
              <Text className="mt-1">{permission.Id}</Text>
            </div>
            <div>
              <Text className="font-medium">Display Name</Text>
              <Text className="mt-1">
                {permission.DisplayName || permission.AdminConsentDisplayName}
              </Text>
            </div>
            <div>
              <Text className="font-medium">Description</Text>
              <Text className="mt-1">
                {permission.Description || permission.AdminConsentDescription}
              </Text>
            </div>
            <div>
              <Text className="font-medium">Type</Text>
              <Text className="mt-1 capitalize">{type} Permission</Text>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}