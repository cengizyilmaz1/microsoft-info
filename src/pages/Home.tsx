import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Title, Text, Grid, Col, Metric, Icon } from '@tremor/react';
import { Helmet } from 'react-helmet-async';
import { 
  DocumentMagnifyingGlassIcon, 
  KeyIcon, 
  ArrowPathIcon,
  ShieldCheckIcon 
} from '@heroicons/react/24/outline';

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

        <Grid numItems={1} numItemsSm={2} numItemsLg={4} className="gap-6">
          <Card 
            className="hover:shadow-lg transition-shadow duration-200"
            decoration="top"
            decorationColor="blue"
          >
            <div className="flex items-center justify-between">
              <div>
                <Text>Total Applications</Text>
                <Metric>200+</Metric>
              </div>
              <Icon icon={DocumentMagnifyingGlassIcon} color="blue" size="xl" />
            </div>
          </Card>

          <Card 
            className="hover:shadow-lg transition-shadow duration-200"
            decoration="top"
            decorationColor="green"
          >
            <div className="flex items-center justify-between">
              <div>
                <Text>Graph Permissions</Text>
                <Metric>500+</Metric>
              </div>
              <Icon icon={KeyIcon} color="green" size="xl" />
            </div>
          </Card>

          <Card 
            className="hover:shadow-lg transition-shadow duration-200"
            decoration="top"
            decorationColor="orange"
          >
            <div className="flex items-center justify-between">
              <div>
                <Text>Daily Updates</Text>
                <Metric>24/7</Metric>
              </div>
              <Icon icon={ArrowPathIcon} color="orange" size="xl" />
            </div>
          </Card>

          <Card 
            className="hover:shadow-lg transition-shadow duration-200"
            decoration="top"
            decorationColor="purple"
          >
            <div className="flex items-center justify-between">
              <div>
                <Text>Security Features</Text>
                <Metric>100%</Metric>
              </div>
              <Icon icon={ShieldCheckIcon} color="purple" size="xl" />
            </div>
          </Card>
        </Grid>

        <Grid numItems={1} numItemsSm={2} className="gap-6">
          <Link to="/applications">
            <Card 
              className="hover:shadow-lg transition-shadow duration-200 cursor-pointer h-full"
              decoration="left"
              decorationColor="blue"
            >
              <div className="flex items-center space-x-4">
                <Icon icon={DocumentMagnifyingGlassIcon} color="blue" size="xl" />
                <div>
                  <Title>First Party Apps</Title>
                  <Text className="mt-2">
                    Browse the complete list of Microsoft first-party applications, 
                    including app IDs and display names.
                  </Text>
                </div>
              </div>
            </Card>
          </Link>

          <Link to="/permissions">
            <Card 
              className="hover:shadow-lg transition-shadow duration-200 cursor-pointer h-full"
              decoration="left"
              decorationColor="green"
            >
              <div className="flex items-center space-x-4">
                <Icon icon={KeyIcon} color="green" size="xl" />
                <div>
                  <Title>Graph Permissions</Title>
                  <Text className="mt-2">
                    Explore Microsoft Graph permissions with detailed information about
                    scopes and requirements.
                  </Text>
                </div>
              </div>
            </Card>
          </Link>
        </Grid>

        <Card className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
          <div className="text-center">
            <Title className="text-white">Stay Updated</Title>
            <Text className="mt-2 text-white">
              Our data is automatically updated daily to ensure you always have access to the latest information.
            </Text>
          </div>
        </Card>
      </div>
    </>
  );
}