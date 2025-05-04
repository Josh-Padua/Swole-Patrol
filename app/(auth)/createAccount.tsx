import {
    View,
    Text,
    KeyboardAvoidingView,
    TextInput,
    Pressable,
    ActivityIndicator,
} from 'react-native';
import React, { useState } from 'react';
import {router} from "expo-router";
import {AntDesign} from "@expo/vector-icons";
import {auth} from "@/config/firebase";
import {createUserWithEmailAndPassword} from "firebase/auth";

const CreateAccount = () => {
    const [loading, setLoading] = useState(false);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const signUp = async () => {
        setLoading(true);

        if (!email || !password) {
            alert('Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            alert('Password should be at least 6 characters');
            return;
        }

        try {
            const response = await createUserWithEmailAndPassword(auth, email, password);
            console.log(response);
            if (response.user) {
                router.replace('/(pages)/(tabs)');
            }
        } catch (error: any) {
            console.log(error);
            alert('Sign in failed: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-gray-900">
            <Pressable onPress={() => router.push('/(auth)/login')}
                className="absolute top-12 left-5 z-10 w-10 h-10 justify-center items-center"
            >
                <AntDesign name="arrowleft" size={24} color="white" />
            </Pressable>

            <KeyboardAvoidingView className="flex-1 justify-center mx-10" behavior="padding">
                <Text className="text-4xl font-bold text-gray-300 text-center my-2 mb-5">
                    Create Account
                </Text>

                <TextInput
                    placeholder="First Name"
                    placeholderTextColor="6b7280"
                    value={firstName}
                    onChangeText={setFirstName}
                    className="w-full p-3 border border-gray-300 rounded-lg mb-4 text-base text-gray-300"
                />

                <TextInput
                    placeholder="Last Name"
                    placeholderTextColor="6b7280"
                    value={lastName}
                    onChangeText={setLastName}
                    className="w-full p-3 border border-gray-300 rounded-lg mb-4 text-base text-gray-300"
                />

                <TextInput
                    placeholder="Email Address"
                    placeholderTextColor="6b7280"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    className="w-full p-3 border border-gray-300 rounded-lg mb-4 text-base text-gray-300"
                />

                <TextInput
                    placeholder="Password"
                    placeholderTextColor="6b7280"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                    className="w-full p-3 border border-gray-300 rounded-lg mb-4 text-base text-gray-300"
                />

                <TextInput
                    placeholder="Confirm Password"
                    placeholderTextColor="6b7280"
                    secureTextEntry
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    className="w-full p-3 border border-gray-300 rounded-lg mb-4 text-base text-gray-300"
                />

                <Pressable
                    onPress={() => signUp()}
                    className="w-full bg-orange-600 p-3 rounded-lg items-center"
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text className="text-white text-base font-semibold">Create Account</Text>
                    )}
                </Pressable>
            </KeyboardAvoidingView>
        </View>
    );
};

export default CreateAccount;
