import React from 'react';
import { Card, Title, Text } from '@tremor/react';
import { Helmet } from 'react-helmet-async';

export function Home() {
  return (
    <>
      <Helmet>
        <title>Microsoft Info - First Party Apps & Graph Permissions</title>
        <meta name="description" content="A comprehensive repository of Microsoft first-party applications and Graph permissions, updated daily through automation." />
      </Helmet>
      
      <div className="space-y-6">
        <div className="max-w-4xl mx-auto text-center">
          <Title>Microsoft First Party App Names & Graph Permissions</Title>
          <Text className="mt-4">
            A comprehensive repository of Microsoft first-party applications and Graph permissions,
            updated daily through automation.
          </Text>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <Title>First Party Apps</Title>
            <Text className="mt-2">
              Access the complete list of Microsoft first-party applications, including app IDs
              and display names, sourced directly from Microsoft Graph API and official documentation.
            </Text>
          </Card>

          <Card>
            <Title>Graph Permissions</Title>
            <Text className="mt-2">
              Explore both application and delegated permissions available in Microsoft Graph,
              with detailed descriptions and consent requirements.
            </Text>
          </Card>
        </div>
      </div>
    </>
  );
}