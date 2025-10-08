import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChangePassword } from './ChangePassword';
import { PersonalDetails } from './PersonalDetails';
import { ProfilePicture } from './ProfilePicture';

export function AccountCentre() {
  return (
    <Card className="glass-card border-0">
      <CardHeader>
        <CardTitle className="text-2xl">Account Centre</CardTitle>
        <CardDescription>Manage your account settings and preferences</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Personal Details</TabsTrigger>
            <TabsTrigger value="picture">Profile Picture</TabsTrigger>
            <TabsTrigger value="password">Password</TabsTrigger>
          </TabsList>
          <TabsContent value="details" className="mt-6">
            <PersonalDetails />
          </TabsContent>
          <TabsContent value="picture" className="mt-6">
            <ProfilePicture />
          </TabsContent>
          <TabsContent value="password" className="mt-6">
            <ChangePassword />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
