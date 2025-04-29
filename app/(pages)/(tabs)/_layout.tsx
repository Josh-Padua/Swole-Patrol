import {View, Text} from 'react-native'
import React from 'react'
import {Tabs} from "expo-router";

const TabsLayout = () => {
    return (
        <Tabs
            options={{
            headerShown: false,
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
                name="profile"
                options={{
                    title: 'Profile',
                    headerShown: false,
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: 'Settings',
                    headerShown: false,
                }}
            />
        </Tabs>
    )
}
export default TabsLayout
