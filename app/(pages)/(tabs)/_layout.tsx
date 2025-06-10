import React from 'react'
import {Tabs} from "expo-router";

const TabsLayout = () => {
    return (
        <Tabs
            screenOptions={{
            headerShown: false,
                tabBarShowLabel: true,
                tabBarStyle: {
                backgroundColor: '#2D2E31',
                    position: 'absolute',
                },
                tabBarLabelStyle: {
                    color: '#FF5400',
                },
                tabBarActiveTintColor: '#FFFFFF',
                tabBarInactiveTintColor: '#FF5400',
        }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Dashboard',
                }}
            />
            <Tabs.Screen
                name="macros"
                options={{
                    title: 'Macros',
                    headerShown: false,
                }}
            />
            <Tabs.Screen
                name="workouts"
                options={{
                    title: 'Workouts',
                    headerShown: false,
                }}
            />
            <Tabs.Screen
                name="journal"
                options={{
                    title: 'Journal',
                    headerShown: false,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    headerShown: false,
                }}
            />
        </Tabs>
    )
}
export default TabsLayout
